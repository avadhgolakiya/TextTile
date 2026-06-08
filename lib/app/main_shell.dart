import 'package:flutter/material.dart';
import '../cart/cart_store.dart';
import '../core/constants/app_colors.dart';
import '../features/admin/admin_shell.dart';
import '../features/auth/auth_controller.dart';
import '../features/cart/cart_screen.dart';
import '../features/catalog/collection_screen.dart';
import '../features/home/home_screen.dart';
import '../features/orders/orders_screen.dart';
import '../features/profile/profile_screen.dart';
import '../widgets/app_bottom_nav.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key, required this.auth, required this.cart});

  final AuthController auth;
  final CartStore cart;

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _index = 0;

  bool get _isAdmin => widget.auth.user?.isAdmin == true;

  void _onTabChanged(int i) {
    setState(() => _index = i);
  }

  void _openCart(BuildContext context) {
    Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => CartScreen(user: widget.auth.user),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.paddingOf(context).top;

    return Scaffold(
      backgroundColor: AppColors.cream,
      body: Stack(
        children: [
          // ── Main pages ──────────────────────────────────────────────────
          IndexedStack(
            index: _index,
            children: [
              // 0 — Today's Drop / Home
              // Cache handles data freshness — no forced rebuild needed
              const HomeScreen(),

              // 1 — Collection
              const CollectionScreen(),

              // 2 — Orders
              const OrdersScreen(),

              // 3 — Profile
              ProfileScreen(auth: widget.auth, cart: widget.cart),

              // 4 — Admin (only rendered when user is admin)
              if (_isAdmin) const AdminShell(),
            ],
          ),

          // ── Cart FAB — top-right (hidden on Admin tab) ──────────────────
          if (_index != 4 || !_isAdmin)
            Positioned(
              top: topPad + 10,
              right: 16,
              child: ListenableBuilder(
                listenable: widget.cart,
                builder: (context, _) {
                  final qty = widget.cart.totalQuantity;
                  return Material(
                    color: AppColors.maroon,
                    shape: const CircleBorder(),
                    elevation: 4,
                    shadowColor: AppColors.maroon.withValues(alpha: 0.4),
                    child: InkWell(
                      customBorder: const CircleBorder(),
                      onTap: () => _openCart(context),
                      child: SizedBox(
                        width: 46,
                        height: 46,
                        child: Stack(
                          clipBehavior: Clip.none,
                          alignment: Alignment.center,
                          children: [
                            const Icon(Icons.shopping_bag_outlined,
                                color: AppColors.white, size: 22),
                            if (qty > 0)
                              Positioned(
                                top: 4,
                                right: 4,
                                child: Container(
                                  width: 16,
                                  height: 16,
                                  decoration: const BoxDecoration(
                                    color: AppColors.gold,
                                    shape: BoxShape.circle,
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    qty > 99 ? '99+' : '$qty',
                                    style: const TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.white,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
      bottomNavigationBar: AppBottomNav(
        currentIndex: _index,
        onChanged: _onTabChanged,
        showAdmin: _isAdmin,
      ),
    );
  }
}
