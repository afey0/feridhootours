import 'package:flutter/material.dart';
import 'package:feridhoo_tours_app/theme/app_theme.dart';
import 'package:feridhoo_tours_app/screens/boat_results_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  bool _isRoundTrip = true;
  String _fromLocation = "Malé (Velana Intl)";
  String _toLocation = "Feridhoo Island";
  String _departureDate = "24 Oct 2023";
  String _returnDate = "31 Oct 2023";
  int _guests = 2;
  String _promoCode = "";

  void _swapLocations() {
    setState(() {
      String temp = _fromLocation;
      _fromLocation = _toLocation;
      _toLocation = temp;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Feridhoo Tours',
          style: TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontWeight: FontWeight.bold,
            color: AppTheme.primary,
          ),
        ),
        backgroundColor: AppTheme.surface,
        elevation: 0,
        centerTitle: false,
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
            // Hero Banner Section
            Stack(
              children: [
                Container(
                  height: 320,
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(32),
                      bottomRight: Radius.circular(32),
                    ),
                    image: DecorationImage(
                      image: NetworkImage(
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuCDJ07XwD8l6efSnguKzJW2pcDX8R0cGgAyjGudCwELM2zNNVNtOp82S4ECLaX3YJ2ueHRLjugPQ4qgBclgXHNJAw_wjTN1PD1Jj_wGRSwyYfllkucXIwfXDbhGSQjOHtf8cMFkb2yGnWXAXo3jM2BzygmYfBOtb8R6qGzR5OeQzdxmfJXWx_JJoKv3DK2rsxPPj5uOGMnhjwexsOWERJFItrXjV0eI_-y-7gxxP8kGuR_gz_F7qm2Ft-sk2sWXX0uBoi_ZKMAUBg',
                      ),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                Container(
                  height: 320,
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(32),
                      bottomRight: Radius.circular(32),
                    ),
                    gradient: LinearGradient(
                      colors: [Colors.black.withOpacity(0.7), Colors.transparent],
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 40,
                  left: 24,
                  right: 24,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryContainer,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'LIMITED OFFER',
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Escape to the\nAzure Horizon',
                        style: Theme.of(context).textTheme.displayLarge?.copyWith(
                              color: Colors.white,
                              fontSize: 32,
                              height: 1.1,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Discover the hidden gems of the Ari Atoll with our premium private charters and inter-island transfers.',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.white.withOpacity(0.9),
                            ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            
            // Search Module Form (Overlaps the bottom of the banner)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerLowest,
                  borderRadius: BorderRadius.circular(32),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 32,
                      offset: const Offset(0, 16),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Tabs
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainerLow,
                        borderRadius: BorderRadius.circular(9999),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _buildTabButton('Round-trip', _isRoundTrip, () {
                            setState(() => _isRoundTrip = true);
                          }),
                          _buildTabButton('One-way', !_isRoundTrip, () {
                            setState(() => _isRoundTrip = false);
                          }),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    
                    // Location inputs
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        Column(
                          children: [
                            _buildInputField(
                              label: 'FROM',
                              value: _fromLocation,
                              icon: Icons.location_on,
                              onChanged: (val) => setState(() => _fromLocation = val),
                            ),
                            const SizedBox(height: 24),
                            _buildInputField(
                              label: 'TO',
                              value: _toLocation,
                              icon: Icons.sailing,
                              onChanged: (val) => setState(() => _toLocation = val),
                            ),
                          ],
                        ),
                        Align(
                          alignment: Alignment.centerRight,
                          child: Padding(
                            padding: const EdgeInsets.only(right: 12),
                            child: InkWell(
                              onTap: _swapLocations,
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.06),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                  border: Border.all(
                                    color: AppTheme.outlineVariant.withOpacity(0.2),
                                  ),
                                ),
                                child: const Icon(
                                  Icons.swap_vert,
                                  color: AppTheme.primary,
                                  size: 20,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    
                    // Dates
                    Row(
                      children: [
                        Expanded(
                          child: _buildInputField(
                            label: 'DEPARTURE',
                            value: _departureDate,
                            icon: Icons.calendar_today,
                            onChanged: (val) => setState(() => _departureDate = val),
                          ),
                        ),
                        if (_isRoundTrip) ...[
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildInputField(
                              label: 'RETURN',
                              value: _returnDate,
                              icon: Icons.calendar_today,
                              onChanged: (val) => setState(() => _returnDate = val),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 24),
                    
                    // Guests & Promo
                    _buildInputField(
                      label: 'GUESTS & CLASS',
                      value: '$_guests Adults, Premium Economy',
                      icon: Icons.group,
                      onChanged: (val) {},
                    ),
                    const SizedBox(height: 24),
                    _buildInputField(
                      label: 'PROMO CODE',
                      value: _promoCode,
                      icon: Icons.sell,
                      placeholder: 'Optional',
                      onChanged: (val) => setState(() => _promoCode = val),
                    ),
                    const SizedBox(height: 32),
                    
                    // Search Button
                    SizedBox(
                      width: double.infinity,
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(9999),
                          gradient: const LinearGradient(
                            colors: [AppTheme.primary, AppTheme.primaryContainer],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.primaryContainer.withOpacity(0.3),
                              blurRadius: 16,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => BoatResultsScreen(
                                  from: _fromLocation,
                                  to: _toLocation,
                                  date: _departureDate,
                                  guestsCount: _guests,
                                ),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(vertical: 18),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(9999),
                            ),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Search Trips',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              SizedBox(width: 8),
                              Icon(Icons.arrow_forward, size: 18),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            // Featured Popular Routes (Asymmetric Design)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Popular Routes',
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.w900,
                                ),
                          ),
                          Text(
                            'Most frequented paths this season',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                      TextButton(
                        onPressed: () {},
                        child: const Text(
                          'View all',
                          style: TextStyle(
                            color: AppTheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Asymmetric layout cards
                  SizedBox(
                    height: 280,
                    child: Row(
                      children: [
                        // Left large card
                        Expanded(
                          flex: 3,
                          child: _buildRouteCard(
                            title: 'Malé to Maafushi',
                            subtitle: 'From \$25 per person',
                            imageUrl:
                                'https://lh3.googleusercontent.com/aida-public/AB6AXuCy6TsqPptnEhyZbTjkqDq1XyVLhsx36Sqhatuzp5QNVBHaD0hpS3GDFxjqoef2mIvOKTJpNAQjYL7EEONTwCG524xpINxlsCwglZwZcxLn7_e0tyflMRlMHngjb9LRBjm1Juwv7Tp4M4dZrZCWTrCqivdBD2dphTNccw6OnPBsqjTQB2LX3dgaO4S3Wf_dpgJwmKj-GU5yNlN0AAWgmEtlE8PsOn86nKzdBDJC-BpEO3Xcw2ReMalamVXc0znP8zIe2lRIhysMTw',
                          ),
                        ),
                        const SizedBox(width: 16),
                        // Right two smaller stacked cards
                        Expanded(
                          flex: 2,
                          child: Column(
                            children: [
                              Expanded(
                                child: _buildRouteCard(
                                  title: 'Local Transfers',
                                  imageUrl:
                                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBoi8RK2IUUtckD7y8zW1OpNq4ci2c6B1T_vQ2BUX7FFaD7osB8iG3T4iX0wBh0oxsQY1aCgxEjGq7zkTT8M-VrvLsj_Mw0NTtW0EALKw_TLTz_97vpIYaaQmPjQ2kou-9C3tzgBloxy87wj9S9-9Us1mG3b6zsAMwiv3G9edtR705FAlvsdigv_QvuiEV7FuX76oq_XgvvBmc2-JLb745g2L6dVFzMlOzDOnFlgmo-jn4OeJGjmFcHbi0Fsyg-fv6epYLOaOoEQA',
                                ),
                              ),
                              const SizedBox(height: 16),
                              Expanded(
                                child: _buildRouteCard(
                                  title: 'Private Island Hopping',
                                  imageUrl:
                                      'https://lh3.googleusercontent.com/aida-public/AB6AXuDc-BDc2HDhT6X9y-R_d5AiUuMQQfUIUmWBZsGBLHO3QC_o2ew0m1irqcMB0ijOhWmc2nZUs_pN4_lTaoNo0x9P2C0kDYG1v0PiG175kn3ov9PIQytAKf9WSWmYP-iPywUpLzk9MpQuOYOiHEMbd-6pEp68zCDViKTUH5rLxSe2f4JpbH4f1HB7hNlBlDryDfOfU7aZgcKZhTXEJF2fZCrPm35p-QrewuHR0UV7f6t0XlZUChiIx4ZsbH-jGB4EgeeB1ZFUx4E1Mg',
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 120), // Spacing for glass bottom nav
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabButton(String title, bool isActive, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          color: isActive ? AppTheme.primaryContainer : Colors.transparent,
          borderRadius: BorderRadius.circular(9999),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: AppTheme.primaryContainer.withOpacity(0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Text(
          title,
          style: TextStyle(
            color: isActive ? Colors.white : AppTheme.onSurfaceVariant,
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildInputField({
    required String label,
    required String value,
    required IconData icon,
    String? placeholder,
    required ValueChanged<String> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: AppTheme.onSurfaceVariant.withOpacity(0.6),
                fontSize: 10,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
              ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: AppTheme.outlineVariant.withOpacity(0.3),
                width: 2.0,
              ),
            ),
          ),
          child: Row(
            children: [
              Icon(
                icon,
                color: AppTheme.secondary,
                size: 20,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: TextEditingController(text: value),
                  onChanged: onChanged,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                  decoration: InputDecoration(
                    hintText: placeholder,
                    hintStyle: TextStyle(
                      color: AppTheme.onSurfaceVariant.withOpacity(0.4),
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 8),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRouteCard({
    required String title,
    String? subtitle,
    required String imageUrl,
  }) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              imageUrl,
              fit: BoxFit.cover,
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.black.withOpacity(0.8), Colors.transparent],
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                ),
              ),
            ),
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
