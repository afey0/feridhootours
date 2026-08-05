import 'package:flutter/material.dart';
import 'package:feridhoo_tours_app/theme/app_theme.dart';
import 'package:feridhoo_tours_app/screens/guest_details_screen.dart';

class SelectSeatsScreen extends StatefulWidget {
  const SelectSeatsScreen({super.key});

  @override
  State<SelectSeatsScreen> createState() => _SelectSeatsScreenState();
}

class _SelectSeatsScreenState extends State<SelectSeatsScreen> {
  final Set<String> _selectedSeats = {'2B'};
  final Set<String> _occupiedSeats = {'1A', '2C', '5C'};
  final Set<String> _premiumSeats = {'3A', '3B', '3C'};

  double get _totalPrice {
    double total = 0;
    for (var seat in _selectedSeats) {
      if (_premiumSeats.contains(seat)) {
        total += 350.00;
      } else {
        total += 150.00;
      }
    }
    return total;
  }

  void _toggleSeat(String seatCode) {
    if (_occupiedSeats.contains(seatCode)) return;
    
    setState(() {
      if (_selectedSeats.contains(seatCode)) {
        _selectedSeats.remove(seatCode);
      } else {
        // limit to 2 seats for demonstration
        if (_selectedSeats.length >= 2) {
          _selectedSeats.remove(_selectedSeats.first);
        }
        _selectedSeats.add(seatCode);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Select Seat',
          style: TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontWeight: FontWeight.bold,
            color: AppTheme.primary,
          ),
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
        padding: const EdgeInsets.only(left: 24, right: 24, top: 16, bottom: 160),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Trip #MT204'.toUpperCase(),
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: AppTheme.secondary,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              'Male\' City to Feridhoo Island. Choose your preferred deck position.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppTheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 32),
            
            // Legend Bento Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 2.4,
              children: [
                _buildLegendCard(
                  color: AppTheme.primaryContainer,
                  label: 'Selected',
                  title: 'Your Choice',
                  icon: Icons.event_seat,
                  iconColor: Colors.white,
                ),
                _buildLegendCard(
                  color: Colors.white,
                  label: 'Available',
                  title: 'MVR 150.00',
                  icon: Icons.event_seat,
                  iconColor: AppTheme.onSurfaceVariant,
                  border: Border.all(
                    color: AppTheme.outlineVariant.withOpacity(0.3),
                  ),
                ),
                _buildLegendCard(
                  color: AppTheme.surfaceContainerHighest.withOpacity(0.5),
                  label: 'Occupied',
                  title: 'Reserved',
                  icon: Icons.event_seat,
                  iconColor: AppTheme.onSurfaceVariant.withOpacity(0.4),
                ),
                _buildLegendCard(
                  color: AppTheme.secondaryContainer,
                  label: 'Premium',
                  title: 'MVR 350.00',
                  icon: Icons.star,
                  iconColor: AppTheme.secondary,
                ),
              ],
            ),
            const SizedBox(height: 32),
            
            // Boat Seating Map Shell
            Container(
              padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(48),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 32,
                    offset: const Offset(0, 16),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Boat Hull Decorative Bow
                  Column(
                    children: [
                      Icon(
                        Icons.sailing,
                        size: 48,
                        color: AppTheme.secondary.withOpacity(0.3),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Forward Bow'.toUpperCase(),
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: AppTheme.secondary,
                              letterSpacing: 2.0,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 40),
                  
                  // Seating grid: 5 rows, 4 columns (col 1, col 2, aisle, col 3)
                  Column(
                    children: List.generate(5, (rowIndex) {
                      int rowNum = rowIndex + 1;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _buildSeatButton(rowNum, 'A'),
                            const SizedBox(width: 16),
                            _buildSeatButton(rowNum, 'B'),
                            const SizedBox(width: 32), // Aisle
                            _buildSeatButton(rowNum, 'C'),
                          ],
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Aft Stern / Engine'.toUpperCase(),
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: AppTheme.secondary.withOpacity(0.3),
                          letterSpacing: 2.0,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            // Local Tip Box
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.secondaryContainer.withOpacity(0.3),
                borderRadius: BorderRadius.circular(24),
                border: const Border(
                  left: BorderSide(color: AppTheme.secondary, width: 4),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.lightbulb, color: AppTheme.secondary),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Local Tip',
                          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                color: AppTheme.onSecondaryContainer,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'The bow (front) seats provide the best breeze, but can be slightly more bumpy in high tide.',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppTheme.onSecondaryContainer.withOpacity(0.9),
                              ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      
      // Sticky footer
      bottomSheet: Container(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 20,
          bottom: 24 + MediaQuery.of(context).padding.bottom,
        ),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.9),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(32),
            topRight: Radius.circular(32),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 24,
              offset: const Offset(0, -8),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _selectedSeats.isEmpty
                      ? 'Select Seat'
                      : 'Seat ${_selectedSeats.join(", ")} Selected'.toUpperCase(),
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        fontSize: 9,
                        letterSpacing: 1.0,
                      ),
                ),
                const SizedBox(height: 2),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      'MVR ${_totalPrice.toStringAsFixed(2)}',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.w900,
                            color: AppTheme.onSurface,
                          ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '/ person',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ],
            ),
            ElevatedButton(
              onPressed: _selectedSeats.isEmpty
                  ? null
                  : () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => GuestDetailsScreen(
                            selectedSeats: _selectedSeats.toList(),
                            totalPrice: _totalPrice,
                          ),
                        ),
                      );
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                disabledBackgroundColor: AppTheme.surfaceContainerHighest,
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 18),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(9999),
                ),
                elevation: 0,
              ),
              child: const Text(
                'Next',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLegendCard({
    required Color color,
    required String label,
    required String title,
    required IconData icon,
    required Color iconColor,
    BoxBorder? border,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: border == null ? color : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: border,
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: border != null ? AppTheme.surfaceContainerLow : color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: iconColor, size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  label.toUpperCase(),
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        fontSize: 8,
                        letterSpacing: 0.5,
                      ),
                ),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: border != null ? AppTheme.onSurface : Colors.black87,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSeatButton(int row, String col) {
    String seatCode = '$row$col';
    bool isOccupied = _occupiedSeats.contains(seatCode);
    bool isSelected = _selectedSeats.contains(seatCode);
    bool isPremium = _premiumSeats.contains(seatCode);

    Color bg;
    Border? border;
    Color iconColor;

    if (isOccupied) {
      bg = AppTheme.surfaceContainerHighest.withOpacity(0.5);
      iconColor = AppTheme.onSurfaceVariant.withOpacity(0.3);
    } else if (isSelected) {
      bg = AppTheme.primaryContainer;
      iconColor = Colors.white;
    } else if (isPremium) {
      bg = AppTheme.secondary;
      iconColor = Colors.white;
    } else {
      bg = Colors.white;
      border = Border.all(color: AppTheme.outlineVariant.withOpacity(0.3));
      iconColor = AppTheme.primary;
    }

    return GestureDetector(
      onTap: () => _toggleSeat(seatCode),
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(12),
          border: border,
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppTheme.primaryContainer.withOpacity(0.4),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Icon(
          isPremium && !isSelected && !isOccupied ? Icons.star : Icons.event_seat,
          color: iconColor,
          size: 20,
        ),
      ),
    );
  }
}
