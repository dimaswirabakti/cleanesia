import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  void _pelajari(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Tentang Cleanesia', style: AppText.title),
            SizedBox(height: AppSpacing.sm),
            Text(
              'Cleanesia memetakan sebaran sampah laut dari laporan warga pesisir. '
              'Foto sampah diklasifikasi langsung di ponsel dengan AI, lalu digabung '
              'menjadi peta kepadatan untuk membantu prioritas pembersihan pantai.',
              style: AppText.body,
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        body: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset('assets/images/landing_bg.jpeg', fit: BoxFit.cover),
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black54, Colors.black87],
                  stops: [0.3, 0.65, 1.0],
                ),
              ),
            ),
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: Column(
                  children: [
                    const Spacer(flex: 5),
                    Image.asset('assets/images/logo-vertical.png', width: 190),
                    // uncomment kalau logo hanya lambang tanpa tulisan "Cleanesia"
                    // Text('Cleanesia', style: AppText.display.copyWith(color: AppColors.brand500)),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      'Aplikasi Pemetaan Sebaran Sampah Laut\nBerbasis AI dan Laporan Warga',
                      textAlign: TextAlign.center,
                      style: AppText.body.copyWith(
                        color: Colors.white.withValues(alpha: 0.85),
                      ),
                    ),
                    const Spacer(flex: 4),
                    const Divider(color: Colors.white24, height: 1),
                    const SizedBox(height: AppSpacing.lg),
                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: FilledButton(
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.brand500,
                          foregroundColor: Colors.white,
                          shape: const StadiumBorder(),
                          textStyle: AppText.section.copyWith(fontSize: 16),
                        ),
                        onPressed: () =>
                            Navigator.pushReplacementNamed(context, '/home'),
                        child: const Text('Mulai Sekarang'),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.brand500,
                          side: const BorderSide(
                            color: AppColors.brand500,
                            width: 1.5,
                          ),
                          shape: const StadiumBorder(),
                          textStyle: AppText.section.copyWith(fontSize: 16),
                        ),
                        onPressed: () => _pelajari(context),
                        child: const Text('Pelajari Lebih Lanjut'),
                      ),
                    ),
                    const Spacer(flex: 1),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
