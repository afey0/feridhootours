import 'package:flutter/material.dart';
import 'package:feridhoo_tours_app/widgets/glass_bottom_nav.dart';
import 'package:feridhoo_tours_app/screens/search_screen.dart';
import 'package:feridhoo_tours_app/screens/my_trips_screen.dart';
import 'package:feridhoo_tours_app/screens/inbox_screen.dart';
import 'package:feridhoo_tours_app/screens/account_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  final int initialIndex;

  const MainNavigationScreen({
    super.key,
    this.initialIndex = 0,
  });

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  late int _currentIndex;

  final List<Widget> _screens = const [
    SearchScreen(),
    MyTripsScreen(),
    InboxScreen(),
    AccountScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true, // Crucial for glass bottom nav backdrop blur
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: GlassBottomNav(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}
