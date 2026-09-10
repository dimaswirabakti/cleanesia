import 'dart:convert';
import 'dart:io';

import 'package:cleanesia/core/geo.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final fixture =
      jsonDecode(File('shared/geo-fixtures.json').readAsStringSync())
          as Map<String, dynamic>;

  group('computeCellId — paritas dengan fixture emas', () {
    for (final c in fixture['computeCellId'] as List) {
      final lat = (c['lat'] as num).toDouble();
      final lng = (c['lng'] as num).toDouble();
      final expected = c['cellId'] as String;
      test('($lat, $lng) -> $expected', () {
        expect(computeCellId(lat, lng), expected);
      });
    }
  });

  group('cellBounds — nilai akurat', () {
    for (final b in fixture['cellBounds'] as List) {
      final id = b['cellId'] as String;
      test('bounds $id', () {
        final r = cellBounds(id);
        expect(r.latLo, closeTo((b['latLo'] as num).toDouble(), 1e-9));
        expect(r.latHi, closeTo((b['latHi'] as num).toDouble(), 1e-9));
        expect(r.lngLo, closeTo((b['lngLo'] as num).toDouble(), 1e-9));
        expect(r.lngHi, closeTo((b['lngHi'] as num).toDouble(), 1e-9));
      });
    }
  });
}
