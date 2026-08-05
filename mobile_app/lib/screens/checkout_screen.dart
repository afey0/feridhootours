import 'package:flutter/material.dart';
import 'package:feridhoo_tours_app/theme/app_theme.dart';
import 'package:feridhoo_tours_app/screens/main_navigation.dart';

class CheckoutScreen extends StatefulWidget {
  final List<String> selectedSeats;
  final double baseFare;
  final double addonsFare;

  const CheckoutScreen({
    super.key,
    required this.selectedSeats,
    required this.baseFare,
    required this.addonsFare,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  int _paymentMethod = 0; // 0 for Credit card, 1 for Digital Wallet
  
  double get _tax => (widget.baseFare + widget.addonsFare) * 0.06;
  double get _total => widget.baseFare + widget.addonsFare + _tax;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Checkout',
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
            // Progress Indicator
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildProgressStep(1, 'Details', true),
                  _buildProgressLine(),
                  _buildProgressStep(2, 'Payment', true),
                  _buildProgressLine(),
                  _buildProgressStep(3, 'Confirm', false),
                ],
              ),
            ),
            const SizedBox(height: 32),
            
            // Trip Summary Bento Card
            Text(
              'Trip Summary',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
            const SizedBox(height: 12),
            Container(
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
                children: [
                  Container(
                    height: 120,
                    width: double.infinity,
                    decoration: const BoxDecoration(
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(24),
                        topRight: Radius.circular(24),
                      ),
                      image: DecorationImage(
                        image: NetworkImage(
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuAURapTwM4AHN718u6TrbGdtMuvrtWiuiroNxpJC2iOR8k1h3ahjnyiR038guGvhbkf_54aPI1x1sREnLFHFEIfd0W732dBPP9cB7aup9zSE3eGYpXg2Wd8rcNpeUtFPgkfneizgIjT40f1rqyWyIDbKObUu7-Pb9dsFVOALG5NJ8P8xihNhFgVXj1rxcSMVTfWjpgMnXPsibqmKQZGpVnyeD55lTsHM6kWXZ-2-2mzbSMrT37SPRnvpPBgaMGsXQBFCJqyEoEqcw',
                        ),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Speedboat Charter',
                                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                        color: AppTheme.secondary,
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                                Text(
                                  'Male\' to Feridhoo Island',
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Departure',
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                                const Text(
                                  'Mon, 24 Oct • 10:30 AM',
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  'Passengers',
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                                const Text(
                                  '2 Adults',
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Divider(color: AppTheme.surfaceContainerLow),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Seat Selection',
                              style: TextStyle(color: AppTheme.onSurfaceVariant),
                            ),
                            Text(
                              widget.selectedSeats.join(', '),
                              style: const TextStyle(
                                color: AppTheme.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            
            // Payment Methods
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Payment Method',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                ),
                Row(
                  children: [
                    Icon(
                      Icons.lock,
                      size: 14,
                      color: AppTheme.primary.withOpacity(0.6),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'SECURE',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: AppTheme.primary,
                          ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            
            // Card selector
            _buildPaymentMethodOption(
              index: 0,
              icon: Icons.credit_card,
              title: 'Credit/Debit card',
              subtitle: 'Visa, Mastercard, AMEX',
            ),
            if (_paymentMethod == 0) ...[
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: AppTheme.surfaceContainerLowest,
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(20),
                    bottomRight: Radius.circular(20),
                  ),
                ),
                child: Column(
                  children: [
                    _buildCardField(
                      label: 'Card Number',
                      hint: '0000 0000 0000 0000',
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: _buildCardField(
                            label: 'Expiry Date',
                            hint: 'MM/YY',
                          ),
                        ),
                        const SizedBox(width: 20),
                        Expanded(
                          child: _buildCardField(
                            label: 'CVV',
                            hint: '***',
                            obscureText: true,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 12),
            _buildPaymentMethodOption(
              index: 1,
              icon: Icons.account_balance_wallet,
              title: 'Digital Wallet',
              subtitle: 'Apple Pay, Google Pay',
            ),
            const SizedBox(height: 32),
            
            // Price Breakdown
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerLow.withOpacity(0.5),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Payment Details'.toUpperCase(),
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                        ),
                  ),
                  const SizedBox(height: 16),
                  _buildFareRow('Base Fare', '\$${widget.baseFare.toStringAsFixed(2)}'),
                  const SizedBox(height: 12),
                  _buildFareRow('Add-ons Fees', '\$${widget.addonsFare.toStringAsFixed(2)}'),
                  const SizedBox(height: 12),
                  _buildFareRow('Service Tax & Fees (6%)', '\$${_tax.toStringAsFixed(2)}'),
                  const SizedBox(height: 16),
                  const Divider(color: AppTheme.surfaceContainerHighest),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total Amount',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      Text(
                        '\$${_total.toStringAsFixed(2)}',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              color: AppTheme.primary,
                              fontWeight: FontWeight.w900,
                            ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            // Compliance text
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.verified_user,
                  size: 14,
                  color: AppTheme.onSurfaceVariant.withOpacity(0.5),
                ),
                const SizedBox(width: 4),
                Text(
                  'PCI DSS COMPLIANT',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        fontSize: 8,
                        color: AppTheme.onSurfaceVariant.withOpacity(0.5),
                      ),
                ),
                const SizedBox(width: 16),
                Icon(
                  Icons.lock_outline,
                  size: 14,
                  color: AppTheme.onSurfaceVariant.withOpacity(0.5),
                ),
                const SizedBox(width: 4),
                Text(
                  '256-BIT SSL ENCRYPTION',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        fontSize: 8,
                        color: AppTheme.onSurfaceVariant.withOpacity(0.5),
                      ),
                ),
              ],
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
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  // show a success snackbar or dialog, then navigate back to root and switch tab to Trips!
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Payment Successful! Ticket Generated.'),
                      backgroundColor: AppTheme.primary,
                    ),
                  );
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const MainNavigationScreen(initialIndex: 1),
                    ),
                    (route) => false,
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(9999),
                  ),
                  elevation: 0,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Purchase • \$${_total.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.chevron_right),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressStep(int stepNum, String title, bool isCompleted) {
    return Row(
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: isCompleted ? AppTheme.primaryContainer : AppTheme.surfaceContainerHighest,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              stepNum.toString(),
              style: TextStyle(
                color: isCompleted ? Colors.white : AppTheme.onSurfaceVariant,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(
            color: isCompleted ? AppTheme.onSurface : AppTheme.onSurfaceVariant.withOpacity(0.5),
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildProgressLine() {
    return Container(
      width: 24,
      height: 1,
      margin: const EdgeInsets.symmetric(horizontal: 8),
      color: AppTheme.outlineVariant.withOpacity(0.3),
    );
  }

  Widget _buildPaymentMethodOption({
    required int index,
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    bool isSelected = _paymentMethod == index;
    return GestureDetector(
      onTap: () => setState(() => _paymentMethod = index),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryContainer.withOpacity(0.05) : AppTheme.surfaceContainerLow,
          borderRadius: isSelected && index == 0
              ? const BorderRadius.only(
                  topLeft: Radius.circular(20),
                  topRight: Radius.circular(20),
                )
              : BorderRadius.circular(20),
          border: isSelected
              ? Border.all(color: AppTheme.primaryContainer, width: 2)
              : null,
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.primaryContainer : AppTheme.surfaceContainerHighest,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: isSelected ? Colors.white : AppTheme.onSurfaceVariant,
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? AppTheme.primaryContainer : AppTheme.outlineVariant,
                  width: 2,
                ),
              ),
              child: isSelected
                  ? Center(
                      child: Container(
                        width: 10,
                        height: 10,
                        decoration: const BoxDecoration(
                          color: AppTheme.primaryContainer,
                          shape: BoxShape.circle,
                        ),
                      ),
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCardField({
    required String label,
    required String hint,
    bool obscureText = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                color: AppTheme.onSurfaceVariant.withOpacity(0.6),
              ),
        ),
        const SizedBox(height: 4),
        TextField(
          obscureText: obscureText,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              color: AppTheme.onSurfaceVariant.withOpacity(0.3),
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

  Widget _buildFareRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppTheme.onSurfaceVariant),
        ),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
