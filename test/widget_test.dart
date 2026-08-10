import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:cleanesia/app.dart';

void main() {
  testWidgets('Beranda menampilkan judul & tombol laporan', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CleanesiaApp());

    // HomeMapScreen tampil
    expect(find.text('Cleanesia'), findsOneWidget);
    expect(find.text('Laporkan Sampah'), findsOneWidget);
  });
}
