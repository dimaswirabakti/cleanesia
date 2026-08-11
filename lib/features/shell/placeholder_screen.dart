import 'package:flutter/material.dart';
import '../../core/theme.dart';

class PlaceholderScreen extends StatelessWidget {
  final String judul;
  const PlaceholderScreen({super.key, required this.judul});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(judul)),
    body: Center(child: Text('$judul — segera hadir', style: AppText.body)),
  );
}
