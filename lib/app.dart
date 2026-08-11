import 'package:flutter/material.dart';
import 'core/theme.dart';
import 'features/shell/main_shell.dart';
import 'features/report/report_photo_screen.dart';
import 'features/report/report_detail_screen.dart';
import 'features/report/report_done_screen.dart';
import 'features/landing/landing_screen.dart';

class CleanesiaApp extends StatelessWidget {
  const CleanesiaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cleanesia',
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Poppins',
        scaffoldBackgroundColor: AppColors.bg,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.brand600,
          primary: AppColors.brand700,
          surface: AppColors.bg,
        ),
        dividerColor: AppColors.line,
        textTheme: const TextTheme(
          displayLarge: AppText.display,
          titleLarge: AppText.title,
          titleMedium: AppText.section,
          bodyMedium: AppText.body,
          bodySmall: AppText.caption,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.bg,
          foregroundColor: AppColors.ink900,
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: false,
          titleTextStyle: AppText.title,
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (_) => const LandingScreen(),
        '/home': (_) => const MainShell(),
        '/report/photo': (_) => const ReportPhotoScreen(),
        '/report/detail': (_) => const ReportDetailScreen(),
        '/report/done': (_) => const ReportDoneScreen(),
      },
    );
  }
}
