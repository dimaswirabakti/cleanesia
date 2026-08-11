import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../home/beranda_screen.dart';
import '../home/home_map_screen.dart';
import 'placeholder_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});
  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _i = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      BerandaScreen(onLihatPeta: () => setState(() => _i = 1)),
      const HomeMapScreen(),
      const PlaceholderScreen(judul: 'Laporan'),
      const PlaceholderScreen(judul: 'Aktivitas'),
      const PlaceholderScreen(judul: 'Profil'),
    ];
    return Scaffold(
      body: IndexedStack(index: _i, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _i,
        onDestinationSelected: (v) => setState(() => _i = v),
        backgroundColor: AppColors.bg,
        indicatorColor: AppColors.brand100,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Beranda',
          ),
          NavigationDestination(
            icon: Icon(Icons.map_outlined),
            selectedIcon: Icon(Icons.map),
            label: 'Peta',
          ),
          NavigationDestination(
            icon: Icon(Icons.description_outlined),
            selectedIcon: Icon(Icons.description),
            label: 'Laporan',
          ),
          NavigationDestination(
            icon: Icon(Icons.show_chart),
            selectedIcon: Icon(Icons.show_chart),
            label: 'Aktivitas',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}
