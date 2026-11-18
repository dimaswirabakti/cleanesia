import 'dart:io';
import 'dart:isolate';
import 'dart:math';
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:image/image.dart' as img;
import 'package:tflite_flutter/tflite_flutter.dart';

import '../../models/report.dart';

/// Satu kotak hasil deteksi. Koordinat dalam piksel foto asli
/// (setelah orientasi EXIF diterapkan), dari kiri-atas (x1, y1)
/// sampai kanan-bawah (x2, y2).
class KotakDeteksi {
  final WasteType jenis;
  final double skor;
  final double x1, y1, x2, y2;

  const KotakDeteksi(this.jenis, this.skor, this.x1, this.y1, this.x2, this.y2);
}

/// Hasil deteksi satu foto.
///
/// [prob], [terdeteksi], dan [pakaiStub] sengaja dibuat sama dengan
/// HasilKlasifikasi lama supaya layar laporan tidak banyak berubah.
class HasilDeteksi {
  /// Skor tertinggi per jenis sampah (0 kalau tidak ada kotak jenis itu).
  final Map<WasteType, double> prob;

  /// Jenis sampah yang punya minimal satu kotak.
  final Set<WasteType> terdeteksi;

  /// True kalau model gagal dimuat (misalnya di Simulator).
  final bool pakaiStub;

  final List<KotakDeteksi> kotak;
  final int lebarFoto;
  final int tinggiFoto;

  /// Luas gabungan semua kotak dibagi luas foto (0 sampai 1).
  final double tutupan;

  /// Saran keparahan dari [tutupan]. Null kalau tidak ada sampah terdeteksi.
  final Severity? saranKeparahan;

  /// Lama proses (pra-proses + model + pasca-proses) dalam milidetik.
  final int durasiMs;

  HasilDeteksi({
    required this.prob,
    required this.terdeteksi,
    required this.pakaiStub,
    this.kotak = const [],
    this.lebarFoto = 0,
    this.tinggiFoto = 0,
    this.tutupan = 0.0,
    this.saranKeparahan,
    this.durasiMs = 0,
  });
}

class DetectorService {
  /// Model FP32 (9,6 MB). Versi INT8 tidak dipakai karena gagal
  /// dijalankan oleh mesin TFLite di Android ("Input tensor lacks data").
  static const _modelPath = 'assets/model/model_deteksi_fp32.tflite';

  /// Ukuran input model (piksel), sesuai imgsz saat training dan ekspor.
  static const _ukuran = 960;

  /// Jumlah calon kotak yang dikeluarkan model untuk input 960x960.
  static const _jumlahCalon = 18900;

  /// Kotak dengan skor di bawah ini dibuang (default Ultralytics).
  static const _batasSkor = 0.25;

  /// Dua kotak sejenis yang tumpang tindih lebih dari ini dianggap
  /// objek yang sama (default Ultralytics).
  static const _batasIou = 0.7;

  static const _maksKotak = 300;

  /// Batas tutupan untuk saran keparahan: < 2% sangat rendah,
  /// 2-5% rendah, 5-15% sedang, 15-30% tinggi, >= 30% sangat tinggi.
  /// Angka SEMENTARA, akan dikalibrasi.
  static const _batasKeparahan = [0.02, 0.05, 0.15, 0.30];

  /// Urutan kelas model. Harus sama dengan data.yaml saat training.
  static const _urutan = [
    WasteType.plastik,
    WasteType.styrofoam,
    WasteType.logam,
    WasteType.kaca,
    WasteType.jaring,
  ];

  Interpreter? _interp;
  bool _stub = false;
  Future<void>? _siap;

  /// Memuat model. Aman dipanggil berkali-kali, model hanya dimuat sekali.
  Future<void> init() => _siap ??= _muat();

  Future<void> _muat() async {
    try {
      _interp = await Interpreter.fromAsset(
        _modelPath,
        options: InterpreterOptions()..threads = 4,
      );
      _stub = false;
    } catch (e) {
      debugPrint('[Deteksi] gagal memuat model: $e');
      // Simulator / model gagal dimuat
      _stub = true;
    }
  }

  void dispose() {
    try {
      _interp?.close();
    } catch (_) {
      // interpreter sudah ditutup, abaikan
    }
  }

  Future<HasilDeteksi> deteksi(File file) async {
    await init();
    if (_stub || _interp == null) return _hasilStub();

    final jam = Stopwatch()..start();
    final bytes = await file.readAsBytes();

    // Cara cepat: decoder bawaan HP. Kalau gagal, pakai cara lama (Dart murni).
    _PraProses? pre;
    try {
      pre = await _praProsesCepat(bytes);
    } catch (e) {
      debugPrint('[Deteksi] pra-proses cepat gagal, pakai cara lama: $e');
    }
    pre ??= await Isolate.run(() => _praProses(bytes));
    if (pre == null) return _hasilStub();
    final msPra = jam.elapsedMilliseconds;

    final keluaran = Float32List(9 * _jumlahCalon);
    try {
      _interp!.run(pre.input, keluaran.buffer);
    } catch (e) {
      debugPrint('[Deteksi] model gagal dijalankan: $e');
      return _hasilStub();
    }
    final msModel = jam.elapsedMilliseconds - msPra;

    final kotak = _pascaProses(keluaran, pre);

    final prob = {for (final t in _urutan) t: 0.0};
    for (final k in kotak) {
      if (k.skor > prob[k.jenis]!) prob[k.jenis] = k.skor;
    }
    final tutupan = _hitungTutupan(kotak, pre.w0, pre.h0);

    jam.stop();
    debugPrint(
      '[Deteksi] pra=${msPra}ms jalan=${msModel}ms '
          'total=${jam.elapsedMilliseconds}ms kotak=${kotak.length} '
          'tutupan=${(tutupan * 100).toStringAsFixed(1)}%',
    );

    return HasilDeteksi(
      prob: prob,
      terdeteksi: kotak.map((k) => k.jenis).toSet(),
      pakaiStub: false,
      kotak: kotak,
      lebarFoto: pre.w0,
      tinggiFoto: pre.h0,
      tutupan: tutupan,
      saranKeparahan: kotak.isEmpty ? null : _keparahan(tutupan),
      durasiMs: jam.elapsedMilliseconds,
    );
  }

  /// Output model berbentuk [9][18900]:
  /// baris 0-3 = cx, cy, w, h (0..1 relatif terhadap input 960x960),
  /// baris 4-8 = skor 5 kelas (0..1).
  List<KotakDeteksi> _pascaProses(Float32List o, _PraProses pre) {
    const n = _jumlahCalon;
    const s = _ukuran;

    // 1. Ambil calon kotak yang skornya cukup tinggi.
    final calon = <_Calon>[];
    for (var i = 0; i < n; i++) {
      var kelas = 0;
      var skor = o[4 * n + i];
      for (var k = 1; k < 5; k++) {
        final v = o[(4 + k) * n + i];
        if (v > skor) {
          skor = v;
          kelas = k;
        }
      }
      if (skor < _batasSkor) continue;

      final cx = o[i] * s;
      final cy = o[n + i] * s;
      final w = o[2 * n + i] * s;
      final h = o[3 * n + i] * s;
      calon.add(_Calon(kelas, skor, cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2));
    }

    // 2. NMS: dari skor tertinggi, buang kotak sejenis yang tumpang tindih.
    calon.sort((a, b) => b.skor.compareTo(a.skor));
    final dipilih = <_Calon>[];
    for (final c in calon) {
      if (dipilih.length >= _maksKotak) break;
      var tumpang = false;
      for (final d in dipilih) {
        if (d.kelas == c.kelas && _iou(c, d) > _batasIou) {
          tumpang = true;
          break;
        }
      }
      if (!tumpang) dipilih.add(c);
    }

    // 3. Kembalikan koordinat dari ruang 960x960 ke ukuran foto asli.
    double keX(double v) => _jepit((v - pre.kiri) / pre.r, 0.0, pre.w0.toDouble());
    double keY(double v) => _jepit((v - pre.atas) / pre.r, 0.0, pre.h0.toDouble());

    return dipilih
        .map(
          (c) => KotakDeteksi(
        _urutan[c.kelas],
        c.skor,
        keX(c.x1),
        keY(c.y1),
        keX(c.x2),
        keY(c.y2),
      ),
    )
        .toList();
  }

  static double _iou(_Calon a, _Calon b) {
    final lebar = min(a.x2, b.x2) - max(a.x1, b.x1);
    final tinggi = min(a.y2, b.y2) - max(a.y1, b.y1);
    if (lebar <= 0 || tinggi <= 0) return 0.0;
    final irisan = lebar * tinggi;
    final gabungan =
        (a.x2 - a.x1) * (a.y2 - a.y1) + (b.x2 - b.x1) * (b.y2 - b.y1) - irisan;
    return gabungan <= 0 ? 0.0 : irisan / gabungan;
  }

  /// Luas gabungan kotak dibagi luas foto. Kotak yang saling menimpa
  /// tidak dihitung dua kali, karena foto dibagi menjadi grid kecil
  /// dan setiap sel hanya ditandai sekali.
  static double _hitungTutupan(List<KotakDeteksi> kotak, int w, int h) {
    if (kotak.isEmpty || w == 0 || h == 0) return 0.0;
    const g = 200;
    final kolom = w >= h ? g : max(1, (g * w / h).round());
    final baris = h > w ? g : max(1, (g * h / w).round());
    final grid = Uint8List(kolom * baris);

    for (final k in kotak) {
      final c1 = _jepitInt((k.x1 / w * kolom).floor(), 0, kolom);
      final c2 = _jepitInt((k.x2 / w * kolom).ceil(), 0, kolom);
      final r1 = _jepitInt((k.y1 / h * baris).floor(), 0, baris);
      final r2 = _jepitInt((k.y2 / h * baris).ceil(), 0, baris);
      for (var r = r1; r < r2; r++) {
        for (var c = c1; c < c2; c++) {
          grid[r * kolom + c] = 1;
        }
      }
    }

    var terisi = 0;
    for (final v in grid) {
      terisi += v;
    }
    return terisi / grid.length;
  }

  static Severity _keparahan(double tutupan) {
    if (tutupan < _batasKeparahan[0]) return Severity.sangatRendah;
    if (tutupan < _batasKeparahan[1]) return Severity.rendah;
    if (tutupan < _batasKeparahan[2]) return Severity.sedang;
    if (tutupan < _batasKeparahan[3]) return Severity.tinggi;
    return Severity.sangatTinggi;
  }

  HasilDeteksi _hasilStub() {
    final rnd = Random();
    final prob = {for (final k in _urutan) k: rnd.nextDouble()};
    final det = prob.entries
        .where((e) => e.value > 0.6)
        .map((e) => e.key)
        .toSet();
    if (det.isEmpty) det.add(WasteType.plastik);
    return HasilDeteksi(prob: prob, terdeteksi: det, pakaiStub: true);
  }
}

double _jepit(double v, double lo, double hi) => v < lo ? lo : (v > hi ? hi : v);

int _jepitInt(int v, int lo, int hi) => v < lo ? lo : (v > hi ? hi : v);

class _Calon {
  final int kelas;
  final double skor;
  final double x1, y1, x2, y2;

  _Calon(this.kelas, this.skor, this.x1, this.y1, this.x2, this.y2);
}

class _PraProses {
  /// Input model 1x3x960x960 float32, dalam bentuk byte mentah.
  final Uint8List input;

  /// Skala dari foto asli ke ruang 960x960.
  final double r;

  /// Lebar padding kiri dan atas di ruang 960x960.
  final int kiri;
  final int atas;

  /// Ukuran foto asli setelah orientasi EXIF diterapkan.
  final int w0;
  final int h0;

  _PraProses(this.input, this.r, this.kiri, this.atas, this.w0, this.h0);
}

/// Pra-proses cepat memakai decoder gambar bawaan HP (dart:ui).
///
/// Hasilnya sama dengan [_praProses]: letterbox 960x960 dengan bingkai
/// abu-abu (114), nilai dibagi 255, disusun per channel (R, G, B).
/// Orientasi foto ikut diterapkan oleh decoder, sama seperti saat foto
/// ditampilkan dengan Image.file, jadi posisi kotak tetap pas.
Future<_PraProses?> _praProsesCepat(Uint8List bytes) async {
  final codec = await ui.instantiateImageCodec(bytes);
  final frame = await codec.getNextFrame();
  final foto = frame.image;

  const s = DetectorService._ukuran;
  final w0 = foto.width;
  final h0 = foto.height;
  final r = min(s / w0, s / h0);
  final nw = (w0 * r).round();
  final nh = (h0 * r).round();
  final kiri = ((s - nw) / 2 - 0.1).round();
  final atas = ((s - nh) / 2 - 0.1).round();

  final perekam = ui.PictureRecorder();
  final kanvas = ui.Canvas(perekam);
  kanvas.drawRect(
    ui.Rect.fromLTWH(0, 0, s.toDouble(), s.toDouble()),
    ui.Paint()..color = const ui.Color(0xFF727272),
  );
  kanvas.drawImageRect(
    foto,
    ui.Rect.fromLTWH(0, 0, w0.toDouble(), h0.toDouble()),
    ui.Rect.fromLTWH(
      kiri.toDouble(),
      atas.toDouble(),
      nw.toDouble(),
      nh.toDouble(),
    ),
    ui.Paint()..filterQuality = ui.FilterQuality.medium,
  );
  final gambar = perekam.endRecording();
  final hasil = await gambar.toImage(s, s);
  final data = await hasil.toByteData(format: ui.ImageByteFormat.rawRgba);

  foto.dispose();
  hasil.dispose();
  gambar.dispose();
  codec.dispose();
  if (data == null) return null;

  final rgba = data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes);
  const luas = s * s;
  final input = Float32List(3 * luas);
  for (var i = 0, j = 0; i < luas; i++, j += 4) {
    input[i] = rgba[j] / 255;
    input[luas + i] = rgba[j + 1] / 255;
    input[2 * luas + i] = rgba[j + 2] / 255;
  }

  return _PraProses(input.buffer.asUint8List(), r, kiri, atas, w0, h0);
}

/// Cara lama (Dart murni), cadangan kalau [_praProsesCepat] gagal.
/// Dijalankan di isolate terpisah.
///
/// Langkahnya sama dengan Ultralytics saat training (letterbox):
/// foto diperkecil dengan rasio tetap sampai sisi terpanjang 960 piksel,
/// sisanya diisi abu-abu (114), lalu nilai piksel dibagi 255 dan disusun
/// per channel (R semua, lalu G semua, lalu B semua).
_PraProses? _praProses(Uint8List bytes) {
  final mentah = img.decodeImage(bytes);
  if (mentah == null) return null;

  var foto = img.bakeOrientation(mentah);
  if (foto.format != img.Format.uint8 || foto.numChannels != 3) {
    foto = foto.convert(format: img.Format.uint8, numChannels: 3);
  }

  const s = DetectorService._ukuran;
  final w0 = foto.width;
  final h0 = foto.height;
  final r = min(s / w0, s / h0);
  final nw = (w0 * r).round();
  final nh = (h0 * r).round();
  final kiri = ((s - nw) / 2 - 0.1).round();
  final atas = ((s - nh) / 2 - 0.1).round();

  final kecil = img.copyResize(
    foto,
    width: nw,
    height: nh,
    interpolation: img.Interpolation.linear,
  );
  final rgb = kecil.getBytes(order: img.ChannelOrder.rgb);

  const luas = s * s;
  final input = Float32List(3 * luas)..fillRange(0, 3 * luas, 114 / 255);
  for (var y = 0; y < nh; y++) {
    final awalBaris = (y + atas) * s + kiri;
    var src = y * nw * 3;
    for (var x = 0; x < nw; x++) {
      final i = awalBaris + x;
      input[i] = rgb[src] / 255;
      input[luas + i] = rgb[src + 1] / 255;
      input[2 * luas + i] = rgb[src + 2] / 255;
      src += 3;
    }
  }

  return _PraProses(input.buffer.asUint8List(), r, kiri, atas, w0, h0);
}