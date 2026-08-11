import 'package:flutter/material.dart';
import '../../core/theme.dart';

class ReportDoneScreen extends StatelessWidget {
  const ReportDoneScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 96,
                height: 96,
                decoration: const BoxDecoration(
                  color: AppColors.success,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: Colors.white, size: 52),
              ),
              const SizedBox(height: AppSpacing.lg),
              const Text('Laporan Terkirim!', style: AppText.display),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Laporan kamu berhasil dikirim. Data akan tersinkronisasi '
                'secara otomatis saat terhubung ke internet.',
                textAlign: TextAlign.center,
                style: AppText.body.copyWith(color: AppColors.ink600),
              ),
              const SizedBox(height: AppSpacing.xl),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.brand700,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppSpacing.radius),
                    ),
                    textStyle: AppText.section.copyWith(fontSize: 16),
                  ),
                  onPressed: () =>
                      Navigator.popUntil(context, (r) => r.isFirst),
                  child: const Text('Kembali ke Beranda'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
