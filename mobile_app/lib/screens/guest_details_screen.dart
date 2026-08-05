import 'package:flutter/material.dart';
import 'package:feridhoo_tours_app/theme/app_theme.dart';
import 'package:feridhoo_tours_app/screens/checkout_screen.dart';

class GuestDetailsScreen extends StatefulWidget {
  final List<String> selectedSeats;
  final double totalPrice;

  const GuestDetailsScreen({
    super.key,
    required this.selectedSeats,
    required this.totalPrice,
  });

  @override
  State<GuestDetailsScreen> createState() => _GuestDetailsScreenState();
}

class _GuestDetailsScreenState extends State<GuestDetailsScreen> {
  String _givenName = "";
  String _surname = "";
  String _nationality = "Maldives";
  String _gender = "Male";
  String _email = "";
  String _phone = "";
  
  bool _hasExtraBaggage = false;
  bool _hasMeal = false;

  double get _finalPrice {
    double total = widget.totalPrice;
    if (_hasExtraBaggage) total += 15.00;
    if (_hasMeal) total += 8.00;
    return total;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Guest Details',
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
            // Current Selection Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 20,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Male\' to Feridhoo',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.secondaryContainer,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'EXPRESS BOAT',
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                color: AppTheme.onSecondaryContainer,
                                fontWeight: FontWeight.bold,
                                fontSize: 9,
                              ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          image: const DecorationImage(
                            image: NetworkImage(
                              'https://lh3.googleusercontent.com/aida-public/AB6AXuCtxIsPrRYpAWRw9uUq6D6OqOZ35UH0pVwoFcGOcTD9D-6PHz9Oa0fycDWd3-2c2rSl9K3_Ipj97S8Eq-IDTCX5Y2yUZ8EcRgIOQE-g_gii8vR2anDhzB5Mr5igHw0wRIbpW55n3i9nSqHKls4PZa4jem80Lob8upYqNpqJOZ5hojbNi65pDbWKbuYyMGwlPS7GoVEhvEK-F5gSxHxYaXKxpk_PA8MuyuneJOrt7GDIeoYIcbHocICNPJuakk5WsCXYkvU7Hhy4IA',
                            ),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Ocean Voyager IV',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            Text(
                              'Departure: 24 Oct 2023 • 10:30 AM',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            Text(
                              'Seats Selected: ${widget.selectedSeats.join(", ")}',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: AppTheme.primary,
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            
            // Section 1: Guest Information
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: const BoxDecoration(
                    color: AppTheme.primaryContainer,
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text(
                      '1',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Guest Information',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerLow,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildTextForm(
                    label: 'Given Name (As per Passport)',
                    hint: 'e.g. John',
                    onChanged: (val) => setState(() => _givenName = val),
                  ),
                  const SizedBox(height: 24),
                  _buildTextForm(
                    label: 'Surname',
                    hint: 'e.g. Doe',
                    onChanged: (val) => setState(() => _surname = val),
                  ),
                  const SizedBox(height: 24),
                  _buildDropdownField(
                    label: 'Nationality',
                    value: _nationality,
                    items: ['Maldives', 'United Kingdom', 'United States', 'Germany'],
                    onChanged: (val) => setState(() => _nationality = val!),
                  ),
                  const SizedBox(height: 24),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Gender'.toUpperCase(),
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: AppTheme.secondary,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Row(
                            children: [
                              Radio<String>(
                                value: 'Male',
                                groupValue: _gender,
                                activeColor: AppTheme.primary,
                                onChanged: (val) => setState(() => _gender = val!),
                              ),
                              const Text('Male'),
                            ],
                          ),
                          const SizedBox(width: 24),
                          Row(
                            children: [
                              Radio<String>(
                                value: 'Female',
                                groupValue: _gender,
                                activeColor: AppTheme.primary,
                                onChanged: (val) => setState(() => _gender = val!),
                              ),
                              const Text('Female'),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
            
            // Section 2: Contact Details
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: const BoxDecoration(
                    color: AppTheme.secondary,
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text(
                      '2',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Contact Details',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.5),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                children: [
                  _buildTextForm(
                    label: 'Email Address',
                    hint: 'john.doe@example.com',
                    keyboardType: TextInputType.emailAddress,
                    onChanged: (val) => setState(() => _email = val),
                  ),
                  const SizedBox(height: 24),
                  _buildPhoneField(
                    label: 'Mobile Number',
                    hint: '777 0000',
                    onChanged: (val) => setState(() => _phone = val),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
            
            // Section 3: Add-ons
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: const BoxDecoration(
                    color: AppTheme.surfaceContainerHighest,
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text(
                      '3',
                      style: TextStyle(
                        color: AppTheme.onSurface,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Enhance Your Voyage',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            // Baggage Bento Card
            Container(
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerLow,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Stack(
                alignment: Alignment.centerRight,
                children: [
                  Opacity(
                    opacity: 0.15,
                    child: Image.network(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuC3GDwF5IJi0p4BwNJ7Oh8UX14iafHx3H0dMsRauPnlUHxaeEdGTOuagBxac-AIGRhe2QYQGpVbFonrO9RgTyHwpfBHbQ3P4FBXmGalZMXg7d5pxDJEIzRrsy8ALCJb_BQGXXBBoA0360wx102WsDve_BYc2rjl0ynVtbsFFZ7iphd4flC7_83tjoipxceBPefQzgFvQ-3JvJ44PQPMKNhaVdbDw2UeBFG54wuansALlSwAIbtBCEjw5shCJ-rQpBN6kqJYG9gNbA',
                      width: 160,
                      height: 160,
                      fit: BoxFit.cover,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.luggage, color: AppTheme.primary, size: 36),
                              const SizedBox(height: 8),
                              Text(
                                'Additional Baggage',
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Add up to 40kg of extra luggage.',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton(
                                onPressed: () {
                                  setState(() => _hasExtraBaggage = !_hasExtraBaggage);
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: _hasExtraBaggage ? AppTheme.primaryContainer : AppTheme.primary,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                ),
                                child: Text(_hasExtraBaggage ? 'Added (\$15.00)' : 'Add from \$15.00'),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 140), // spacer for overlay image
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            
            // Meal Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.restaurant, color: AppTheme.secondary, size: 28),
                        const SizedBox(height: 8),
                        Text(
                          'Island Bites',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        Text(
                          'Pre-book tropical meal & refreshments.',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: Icon(
                      _hasMeal ? Icons.check_circle : Icons.add_circle,
                      color: AppTheme.primary,
                      size: 32,
                    ),
                    onPressed: () {
                      setState(() => _hasMeal = !_hasMeal);
                    },
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
                  'TOTAL PRICE',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: AppTheme.secondary,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                ),
                const SizedBox(height: 2),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      '\$${_finalPrice.toStringAsFixed(2)}',
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
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => CheckoutScreen(
                      selectedSeats: widget.selectedSeats,
                      baseFare: widget.totalPrice,
                      addonsFare: _finalPrice - widget.totalPrice,
                    ),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 18),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(9999),
                ),
                elevation: 0,
              ),
              child: const Row(
                children: [
                  Text(
                    'Continue',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(width: 8),
                  Icon(Icons.chevron_right),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextForm({
    required String label,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
    required ValueChanged<String> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: AppTheme.secondary,
                fontWeight: FontWeight.bold,
                fontSize: 9,
                letterSpacing: 1.0,
              ),
        ),
        const SizedBox(height: 4),
        TextField(
          keyboardType: keyboardType,
          onChanged: onChanged,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              color: AppTheme.onSurfaceVariant.withOpacity(0.4),
            ),
            enabledBorder: UnderlineInputBorder(
              borderSide: BorderSide(
                color: AppTheme.outlineVariant.withOpacity(0.2),
              ),
            ),
            focusedBorder: const UnderlineInputBorder(
              borderSide: BorderSide(
                color: AppTheme.primary,
                width: 2,
              ),
            ),
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(vertical: 8),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdownField({
    required String label,
    required String value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: AppTheme.secondary,
                fontWeight: FontWeight.bold,
                fontSize: 9,
                letterSpacing: 1.0,
              ),
        ),
        const SizedBox(height: 4),
        DropdownButtonFormField<String>(
          value: value,
          onChanged: onChanged,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: AppTheme.onSurface,
              ),
          decoration: InputDecoration(
            enabledBorder: UnderlineInputBorder(
              borderSide: BorderSide(
                color: AppTheme.outlineVariant.withOpacity(0.2),
              ),
            ),
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(vertical: 4),
          ),
          items: items.map((val) {
            return DropdownMenuItem<String>(
              value: val,
              child: Text(val),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildPhoneField({
    required String label,
    required String hint,
    required ValueChanged<String> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: AppTheme.secondary,
                fontWeight: FontWeight.bold,
                fontSize: 9,
                letterSpacing: 1.0,
              ),
        ),
        const SizedBox(height: 4),
        Row(
          children: [
            Text(
              '+960',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppTheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                keyboardType: TextInputType.phone,
                onChanged: onChanged,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                decoration: InputDecoration(
                  hintText: hint,
                  hintStyle: TextStyle(
                    color: AppTheme.onSurfaceVariant.withOpacity(0.4),
                  ),
                  enabledBorder: UnderlineInputBorder(
                    borderSide: BorderSide(
                      color: AppTheme.outlineVariant.withOpacity(0.2),
                    ),
                  ),
                  focusedBorder: const UnderlineInputBorder(
                    borderSide: BorderSide(
                      color: AppTheme.primary,
                      width: 2,
                    ),
                  ),
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(vertical: 8),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
