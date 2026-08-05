import 'package:flutter/material.dart';
import 'package:feridhoo_tours_app/theme/app_theme.dart';
import 'package:feridhoo_tours_app/widgets/voyage_card.dart';
import 'package:feridhoo_tours_app/screens/select_seats_screen.dart';

class BoatResultsScreen extends StatefulWidget {
  final String from;
  final String to;
  final String date;
  final int guestsCount;

  const BoatResultsScreen({
    super.key,
    required this.from,
    required this.to,
    required this.date,
    required this.guestsCount,
  });

  @override
  State<BoatResultsScreen> createState() => _BoatResultsScreenState();
}

class _BoatResultsScreenState extends State<BoatResultsScreen> {
  int _activeDateIndex = 2; // Default to Oct 24

  final List<Map<String, String>> _datesList = [
    {'day': 'Oct 22', 'price': '\$45'},
    {'day': 'Oct 23', 'price': '\$52'},
    {'day': 'Oct 24', 'price': '\$45'},
    {'day': 'Oct 25', 'price': '\$48'},
    {'day': 'Oct 26', 'price': '\$45'},
    {'day': 'Oct 27', 'price': '\$55'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${widget.from} to ${widget.to}',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Text(
              '${widget.date} • ${widget.guestsCount} Adult',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.onSurfaceVariant.withOpacity(0.7),
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ],
        ),
        backgroundColor: AppTheme.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.primary),
          onPressed: () => Navigator.pop(context),
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 20),
            child: Icon(Icons.sailing, color: AppTheme.primary),
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Date Scroller
            Container(
              color: AppTheme.surface,
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: List.generate(_datesList.length, (index) {
                    bool isActive = _activeDateIndex == index;
                    var dateData = _datesList[index];
                    return GestureDetector(
                      onTap: () => setState(() => _activeDateIndex = index),
                      child: Container(
                        margin: const EdgeInsets.only(right: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        decoration: BoxDecoration(
                          color: isActive ? AppTheme.primary : AppTheme.surfaceContainerLow,
                          borderRadius: BorderRadius.circular(16),
                          border: isActive
                              ? null
                              : Border.all(
                                  color: AppTheme.outlineVariant.withOpacity(0.1),
                                ),
                          boxShadow: isActive
                              ? [
                                  BoxShadow(
                                    color: AppTheme.primary.withOpacity(0.2),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ]
                              : null,
                        ),
                        child: Column(
                          children: [
                            Text(
                              dateData['day']!,
                              style: TextStyle(
                                color: isActive ? Colors.white : AppTheme.onSurfaceVariant,
                                fontWeight: FontWeight.bold,
                                fontSize: 10,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              dateData['price']!,
                              style: TextStyle(
                                color: isActive ? Colors.white : AppTheme.onSurface,
                                fontWeight: FontWeight.w900,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ),
            
            // Search Results Count
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Text(
                '6 Boats Available'.toUpperCase(),
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: AppTheme.onSurfaceVariant.withOpacity(0.6),
                      fontSize: 12,
                      letterSpacing: 2.0,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ),
            
            // Voyage Card List
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  // Ocean Express
                  VoyageCard(
                    vesselName: 'Ocean Express',
                    providerName: 'Speedboat • 42 Seats',
                    departureTime: '10:30',
                    departurePort: 'Male Jetty',
                    arrivalTime: '12:00',
                    arrivalPort: 'Feridhoo',
                    duration: '1h 30m',
                    price: '\$45.00',
                    tag: 'Fastest',
                    onSelect: () => _navigateToSeatSelection(context),
                  ),
                  const SizedBox(height: 24),
                  
                  // Horizon Travels
                  VoyageCard(
                    vesselName: 'Ocean Voyager IV',
                    providerName: 'Horizon Travels',
                    departureTime: '14:00',
                    departurePort: 'Male Jetty',
                    arrivalTime: '16:15',
                    arrivalPort: 'Feridhoo',
                    duration: '2h 15m',
                    price: '\$52.00',
                    imageUrl:
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuB8j3s6618lHM7Jefjuu9-kQqM7oCsRo57ARqVWxR8yQdU_uVvA8JHkHu_16nxCEzOjJJlySuxgId12GNwQuQ7SzGX-Nf0zKmKC4FTogWNQMgdt1FPzoq9sMdZ5p0RTYhnLax34pKgp-owUSUbPqSJOce5btt3JoRLUgRkgeBW4qoNvwmlD63aJnL3p6aaM6vFpKxfDK2sjmrp6H1GAOZJ-xPSXarwm5gJTy3qdKpVxeoQG3ICWUmLFBf8mY9yvEYbYSksF_Qd0hg',
                    amenities: const [Icons.wifi, Icons.ac_unit],
                    onSelect: () => _navigateToSeatSelection(context),
                  ),
                  const SizedBox(height: 24),
                  
                  // Local Ferry
                  VoyageCard(
                    vesselName: 'Local Ferry',
                    providerName: 'Public Transport • 6h 00m',
                    departureTime: '07:00',
                    departurePort: 'Male Jetty',
                    arrivalTime: '13:00',
                    arrivalPort: 'Feridhoo',
                    duration: '6h 00m',
                    price: '\$10.00',
                    tag: 'Cheapest',
                    onSelect: () => _navigateToSeatSelection(context),
                  ),
                  const SizedBox(height: 120), // spacer
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _navigateToSeatSelection(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const SelectSeatsScreen(),
      ),
    );
  }
}
