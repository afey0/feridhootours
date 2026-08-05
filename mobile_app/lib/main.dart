import 'package:flutter/material.dart';
import 'package:feridhoo_tours_app/theme/app_theme.dart';
import 'package:feridhoo_tours_app/screens/main_navigation.dart';

void main() {
  runApp(const FeridhooToursApp());
}

class FeridhooToursApp extends StatelessWidget {
  const FeridhooToursApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Feridhoo Tours',
      theme: AppTheme.themeData,
      home: const MainNavigationScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
