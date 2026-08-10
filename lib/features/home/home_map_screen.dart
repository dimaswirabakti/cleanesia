import 'package:flutter/material.dart';

class HomeMapScreen extends StatelessWidget {
  const HomeMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cleanesia')),
      body: const Center(child: Text('Peta panas.. diisi di Fase 5 cuy')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, '/report/photo'),
        icon: const Icon(Icons.camera_alt),
        label: const Text('Laporkan Sampah'),
      ),
    );
  }
}
