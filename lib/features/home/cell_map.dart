import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../core/constants.dart';
import '../../core/geo.dart';
import '../../core/theme.dart';
import '../../models/report.dart';
import 'package:geolocator/geolocator.dart';

class CellAgg {
  final int severity;
  final DateTime latestAt;
  final Set<WasteType> types;
  CellAgg(this.severity, this.latestAt, this.types);
}

Map<String, CellAgg> aggregateCells(List<QueryDocumentSnapshot> docs) {
  final cells = <String, CellAgg>{};
  for (final d in docs) {
    final m = d.data() as Map<String, dynamic>;
    final id = m['cellId'] as String?;
    final ts = m['latestReportAt'];
    if (id == null || ts is! Timestamp) continue;
    cells[id] = CellAgg(
      (m['latestSeverity'] as num?)?.toInt() ?? 3,
      ts.toDate(),
      ((m['types'] as List?) ?? const [])
          .map((e) => WasteType.values.byName(e as String))
          .toSet(),
    );
  }
  return cells;
}

double _freshOpacity(int ageDays) {
  final t = (ageDays / kStaleThresholdDays).clamp(0.0, 1.0);
  return 0.70 - 0.45 * t;
}

List<Polygon> cellPolygons(Map<String, CellAgg> cells) {
  final now = DateTime.now();
  final out = <Polygon>[];
  cells.forEach((id, agg) {
    final b = cellBounds(id);
    final ageDays = now.difference(agg.latestAt).inDays;
    final fill = ageDays > kStaleThresholdDays
        ? AppColors.unmonitored.withValues(alpha: 0.35)
        : (AppColors.severity[agg.severity] ?? AppColors.severity[3]!)
              .withValues(alpha: _freshOpacity(ageDays));
    out.add(
      Polygon(
        points: [
          LatLng(b.latLo, b.lngLo),
          LatLng(b.latHi, b.lngLo),
          LatLng(b.latHi, b.lngHi),
          LatLng(b.latLo, b.lngHi),
        ],
        color: fill,
        borderColor: Colors.black26,
        borderStrokeWidth: 0.5,
      ),
    );
  });
  return out;
}

/// titik tengah Indonesia untuk tampilan awal nasional
const _pusatNasional = LatLng(-2.5, 118.0);
const _zoomNasional = 3.5;

/// lokasi cadangan
const _pusatCadangan = LatLng(-8.025, 110.332);

class CellMap extends StatefulWidget {
  final bool interactive;
  final void Function(Map<String, CellAgg> cells, LatLng p)? onTapCell;
  final bool ikutiLokasi;
  final bool tampilNasional;

  /// Animasi intro: mulai dari peta nasional, diam sejenak, lalu zoom
  /// perlahan ke lokasi pengguna dan berhenti di [zoomAkhir].
  final bool introAnimasi;
  final double zoomAkhir;
  final Duration jedaIntro;
  final Duration durasiIntro;

  const CellMap({
    super.key,
    this.interactive = true,
    this.onTapCell,
    this.ikutiLokasi = false,
    this.tampilNasional = false,
    this.introAnimasi = false,
    this.zoomAkhir = 12.5,
    this.jedaIntro = const Duration(seconds: 2),
    this.durasiIntro = const Duration(milliseconds: 4500),
  });

  @override
  State<CellMap> createState() => _CellMapState();
}

class _CellMapState extends State<CellMap> with TickerProviderStateMixin {
  final _mapController = MapController();
  LatLng? _lokasi;
  AnimationController? _introController;

  @override
  void initState() {
    super.initState();
    if (widget.introAnimasi) {
      _mainkanIntro();
    } else if (widget.ikutiLokasi) {
      _muatLokasi();
    }
  }

  @override
  void dispose() {
    _introController?.dispose();
    super.dispose();
  }

  Future<void> _muatLokasi() async {
    var izin = await Geolocator.checkPermission();
    if (izin == LocationPermission.denied) {
      izin = await Geolocator.requestPermission();
    }
    if (izin == LocationPermission.denied ||
        izin == LocationPermission.deniedForever) {
      return;
    }
    try {
      final pos = await Geolocator.getCurrentPosition();
      if (!mounted) return;
      setState(() => _lokasi = LatLng(pos.latitude, pos.longitude));
      _mapController.move(_lokasi!, 16);
    } catch (_) {}
  }

  /// Ambil lokasi pengguna, tahan tampilan nasional selama [jedaIntro],
  /// lalu animasikan zoom perlahan ke sana.
  Future<void> _mainkanIntro() async {
    final mulai = DateTime.now();
    LatLng tujuan = _pusatCadangan;

    try {
      var izin = await Geolocator.checkPermission();
      if (izin == LocationPermission.denied) {
        izin = await Geolocator.requestPermission();
      }
      if (izin != LocationPermission.denied &&
          izin != LocationPermission.deniedForever) {
        final pos = await Geolocator.getCurrentPosition().timeout(
          const Duration(seconds: 6),
        );
        tujuan = LatLng(pos.latitude, pos.longitude);
        if (mounted) setState(() => _lokasi = tujuan);
      }
    } catch (_) {
      // biarkan memakai lokasi cadangan
    }

    // tahan tampilan nasional minimal selama jedaIntro
    final berlalu = DateTime.now().difference(mulai);
    final sisa = widget.jedaIntro - berlalu;
    if (sisa > Duration.zero) await Future.delayed(sisa);

    if (!mounted) return;
    _animasiKe(tujuan, widget.zoomAkhir);
  }

  void _animasiKe(LatLng tujuan, double zoomAkhir) {
    final MapCamera cam;
    try {
      cam = _mapController.camera;
    } catch (_) {
      // peta belum siap, pindah langsung sebagai cadangan
      _mapController.move(tujuan, zoomAkhir);
      return;
    }

    final latT = Tween(begin: cam.center.latitude, end: tujuan.latitude);
    final lngT = Tween(begin: cam.center.longitude, end: tujuan.longitude);
    final zoomT = Tween(begin: cam.zoom, end: zoomAkhir);

    final controller = AnimationController(
      duration: widget.durasiIntro,
      vsync: this,
    );
    _introController = controller;
    final anim = CurvedAnimation(parent: controller, curve: Curves.easeInOut);

    controller.addListener(() {
      _mapController.move(
        LatLng(latT.evaluate(anim), lngT.evaluate(anim)),
        zoomT.evaluate(anim),
      );
    });
    controller.addStatusListener((s) {
      if (s == AnimationStatus.completed) {
        controller.dispose();
        if (_introController == controller) _introController = null;
      }
    });
    controller.forward();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('cells').snapshots(),
      builder: (context, snap) {
        final docs = snap.data?.docs ?? const <QueryDocumentSnapshot>[];
        final cells = aggregateCells(docs);

        LatLng center;
        double zoom;
        if (widget.tampilNasional || widget.introAnimasi) {
          center = _pusatNasional;
          zoom = _zoomNasional;
        } else if (widget.ikutiLokasi) {
          center = _lokasi ?? _pusatCadangan;
          zoom = _lokasi != null ? 16 : 5;
        } else if (cells.isNotEmpty) {
          final b = cellBounds(cells.keys.first);
          center = LatLng(b.latMid, b.lngMid);
          zoom = 15;
        } else {
          center = _pusatCadangan;
          zoom = 15;
        }

        return FlutterMap(
          mapController: _mapController,
          options: MapOptions(
            initialCenter: center,
            initialZoom: zoom,
            onTap: (widget.interactive && widget.onTapCell != null)
                ? (tp, p) => widget.onTapCell!(cells, p)
                : null,
            interactionOptions: InteractionOptions(
              flags: widget.interactive
                  ? InteractiveFlag.all
                  : InteractiveFlag.none,
            ),
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.mencarijatidiri.cleanesia',
            ),
            PolygonLayer(polygons: cellPolygons(cells)),
            if (_lokasi != null)
              MarkerLayer(
                markers: [
                  Marker(
                    point: _lokasi!,
                    width: 24,
                    height: 24,
                    child: const Icon(
                      Icons.my_location,
                      color: AppColors.brand700,
                      size: 24,
                    ),
                  ),
                ],
              ),
            if (widget.interactive)
              const RichAttributionWidget(
                attributions: [
                  TextSourceAttribution('OpenStreetMap contributors'),
                ],
              ),
          ],
        );
      },
    );
  }
}
