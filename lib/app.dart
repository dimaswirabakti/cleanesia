import 'package:flutter/material.dart';
import 'features/home/home_map_screen.dart';
import 'features/report/report_photo_screen.dart';
import 'features/report/report_detail_screen.dart';
import 'features/report/report_done_screen.dart';

class CleanesiaApp extends StatelessWidget {
  const CleanesiaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cleanesia',
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF17BEBB), // teal Cleanesia
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
        '/': (_) => const HomeMapScreen(),
        '/report/photo': (_) => const ReportPhotoScreen(),
        '/report/detail': (_) => const ReportDetailScreen(),
        '/report/done': (_) => const ReportDoneScreen(),
      },
    );
  }
}
