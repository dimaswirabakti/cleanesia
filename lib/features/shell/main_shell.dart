import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../home/beranda_screen.dart';
import '../home/home_map_screen.dart';
import '../activity/aktivitas_screen.dart';
import '../profile/profil_screen.dart';

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
      const SizedBox.shrink(),
      const AktivitasScreen(),
      const ProfilScreen(),
    ];
    return Scaffold(
      body: IndexedStack(index: _i, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _i,
        onDestinationSelected: (v) {
          if (v == 2) {
            Navigator.pushNamed(context, '/report/photo');
          } else {
            setState(() => _i = v);
          }
        },
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
            icon: Icon(Icons.camera_alt_outlined),
            selectedIcon: Icon(Icons.camera_alt),
            label: 'Laporkan',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long),
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
