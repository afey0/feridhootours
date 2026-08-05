import 'package:flutter/material.dart';
import 'package:feridhoo_tours_app/theme/app_theme.dart';

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key});

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  String _activeFilter = 'All';

  final List<String> _filters = ['All', 'Bookings', 'Offers', 'Tips'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Inbox',
          style: TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontWeight: FontWeight.bold,
            color: AppTheme.primary,
          ),
        ),
        backgroundColor: AppTheme.surface,
        elevation: 0,
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: AppTheme.outline),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.more_vert, color: AppTheme.outline),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 24, right: 24, top: 16, bottom: 120),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Stay updated with your latest boat transfers and island adventures.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppTheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 24),
            
            // Filter Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _filters.map((filter) {
                  bool isActive = _activeFilter == filter;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(filter),
                      selected: isActive,
                      onSelected: (val) {
                        if (val) setState(() => _activeFilter = filter);
                      },
                      selectedColor: AppTheme.primaryContainer,
                      labelStyle: TextStyle(
                        color: isActive ? Colors.white : AppTheme.onSurfaceVariant,
                        fontWeight: FontWeight.bold,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      elevation: 0,
                      pressElevation: 0,
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 24),
            
            // Message List
            Column(
              children: [
                // Booking Confirmed (Unread)
                _buildMessageCard(
                  context,
                  title: 'Booking Confirmed',
                  time: '2 min ago',
                  heading: 'Your trip to Feridhoo is ready!',
                  body: 'Captain Ahmed has confirmed your departure for tomorrow at 09:00 AM from Malé Jetty 1.',
                  icon: Icons.task_alt,
                  iconBgColor: AppTheme.primaryContainer.withOpacity(0.2),
                  iconColor: AppTheme.primary,
                  isUnread: true,
                  borderLeftColor: AppTheme.primary,
                  actions: [
                    TextButton(
                      onPressed: () {},
                      child: const Text('View Ticket', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                    ),
                    TextButton(
                      onPressed: () {},
                      child: const Text('Contact Captain', style: TextStyle(color: AppTheme.onSurfaceVariant, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Flash Sale Offer
                _buildMessageCard(
                  context,
                  title: 'Flash Sale',
                  time: '2 hours ago',
                  heading: 'Sunset Cruise 40% Off',
                  body: 'Book a private sunset cruise for this weekend and save big. Offer ends at midnight!',
                  icon: Icons.local_offer,
                  iconBgColor: AppTheme.secondaryContainer.withOpacity(0.3),
                  iconColor: AppTheme.secondary,
                ),
                const SizedBox(height: 16),
                
                // Travel Tip
                _buildMessageCard(
                  context,
                  title: 'Travel Tip',
                  time: 'Yesterday',
                  heading: 'What to pack for Feridhoo',
                  body: 'Local islands have a modest dress code. Read our guide on packing effectively for your stay.',
                  icon: Icons.lightbulb,
                  iconBgColor: Colors.grey[200]!,
                  iconColor: Colors.grey[600]!,
                ),
                const SizedBox(height: 16),
                
                // Important Notice / Warning
                _buildMessageCard(
                  context,
                  title: 'Schedule Update',
                  time: 'Feb 14',
                  heading: 'Weather Advisory: Feb 16',
                  body: 'Due to rough seas, the 2:00 PM transfer on Friday might be delayed. We will keep you posted.',
                  icon: Icons.warning,
                  iconBgColor: AppTheme.errorContainer,
                  iconColor: AppTheme.error,
                  borderLeftColor: AppTheme.error,
                ),
                const SizedBox(height: 16),
                
                // Past promotion / reward
                Opacity(
                  opacity: 0.6,
                  child: _buildMessageCard(
                    context,
                    title: 'Rewards',
                    time: 'Feb 12',
                    heading: "You've earned 500 Waves!",
                    body: 'Thanks for your recent trip. Your loyalty points have been added to your account.',
                    icon: Icons.celebration,
                    iconBgColor: AppTheme.secondaryContainer.withOpacity(0.3),
                    iconColor: AppTheme.secondary,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageCard(
    BuildContext context, {
    required String title,
    required String time,
    required String heading,
    required String body,
    required IconData icon,
    required Color iconBgColor,
    required Color iconColor,
    bool isUnread = false,
    Color? borderLeftColor,
    List<Widget>? actions,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
        border: borderLeftColor != null
            ? Border(
                left: BorderSide(color: borderLeftColor, width: 4),
              )
            : null,
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: iconBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        title.toUpperCase(),
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: iconColor,
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.0,
                            ),
                      ),
                      Text(
                        time,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontSize: 10,
                            ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    heading,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    body,
                    style: TextStyle(
                      color: AppTheme.onSurfaceVariant.withOpacity(0.8),
                      fontSize: 13,
                      height: 1.4,
                    ),
                  ),
                  if (actions != null) ...[
                    const SizedBox(height: 12),
                    Row(
                      children: actions,
                    ),
                  ],
                ],
              ),
            ),
            if (isUnread) ...[
              const SizedBox(width: 8),
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppTheme.primary,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
