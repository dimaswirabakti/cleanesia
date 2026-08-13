import 'package:flutter/material.dart';

/// Token warna dari design system Cleanesia
class AppColors {
  // brand
  static const brand50 = Color(0xFFE6FBF9);
  static const brand100 = Color(0xFFC7F5F1);
  static const brand500 = Color(0xFF00CDBE);
  static const brand600 = Color(0xFF00B4A7);
  static const brand700 = Color(0xFF00897F);
  static const brand900 = Color(0xFF04554F);

  // netral & status
  static const ink900 = Color(0xFF0C2C2A);
  static const ink600 = Color(0xFF4C625F);
  static const line = Color(0xFFE2ECEB);
  static const success = Color(0xFF12A150);
  static const warning = Color(0xFFC77700);
  static const danger = Color(0xFFD93A3F);

  static const bg = Colors.white;

  /// warna tingkat keparahan heatmap
  static const severity = <int, Color>{
    1: Color(0xFF12A150), // sangat rendah
    2: Color(0xFF6C8C28), // rendah
    3: Color(0xFFC77700), // sedang
    4: Color(0xFFD0581F), // tinggi
    5: Color(0xFFD93A3F), // sangat tinggi
  };
  static const unmonitored = Color(0xFF9AA8A5); // abu-abu belum terpantau
}

/// skala tipografi font (Poppins)
class AppText {
  static const _f = 'Poppins';
  static const display = TextStyle(
    fontFamily: _f,
    fontSize: 28,
    fontWeight: FontWeight.w600,
    color: AppColors.ink900,
    height: 1.2,
  );
  static const title = TextStyle(
    fontFamily: _f,
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.ink900,
  );
  static const section = TextStyle(
    fontFamily: _f,
    fontSize: 15,
    fontWeight: FontWeight.w600,
    color: AppColors.ink900,
  );
  static const body = TextStyle(
    fontFamily: _f,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.ink900,
    height: 1.5,
  );
  static const caption = TextStyle(
    fontFamily: _f,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.ink600,
  );
  static const number = TextStyle(
    fontFamily: _f,
    fontSize: 28,
    fontWeight: FontWeight.w600,
    color: AppColors.ink900,
    fontFeatures: [FontFeature.tabularFigures()],
  );
}

/// jarak & radius konsisten
class AppSpacing {
  static const xs = 4.0, sm = 8.0, md = 16.0, lg = 24.0, xl = 32.0;
  static const radius = 6.0;
}
