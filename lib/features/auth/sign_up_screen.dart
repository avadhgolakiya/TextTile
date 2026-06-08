import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'auth_exception.dart' show AppAuthException;
import '../../core/constants/app_colors.dart';
import 'auth_controller.dart';
import 'auth_validators.dart';
import 'widgets/auth_text_field.dart';
import 'widgets/google_sign_in_button.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key, required this.auth});

  final AuthController auth;

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _business = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  var _loading = false;
  var _googleLoading = false;
  var _obscurePassword = true;
  var _obscureConfirm = true;

  late AnimationController _bgCtrl;
  late AnimationController _cardCtrl;
  late Animation<double> _cardFade;
  late Animation<Offset> _cardSlide;

  @override
  void initState() {
    super.initState();
    _bgCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    )..repeat(reverse: true);

    _cardCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _cardFade =
        CurvedAnimation(parent: _cardCtrl, curve: Curves.easeOut);
    _cardSlide = Tween<Offset>(
      begin: const Offset(0, 0.12),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _cardCtrl, curve: Curves.easeOut));
    _cardCtrl.forward();
  }

  @override
  void dispose() {
    _bgCtrl.dispose();
    _cardCtrl.dispose();
    _business.dispose();
    _email.dispose();
    _phone.dispose();
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _loading = true);
    try {
      await widget.auth.signUp(
        businessName: _business.text,
        email: _email.text.trim(),
        phone: _phone.text.trim().isEmpty ? null : _phone.text.trim(),
        password: _password.text,
      );
      if (mounted) Navigator.of(context).pop();
    } on AppAuthException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Something went wrong. Try again.')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _signInWithGoogle() async {
    setState(() => _googleLoading = true);
    try {
      await widget.auth.signInWithGoogle();
      if (mounted) Navigator.of(context).pop();
    } on AppAuthException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Google Sign-In failed. Try again.')),
        );
      }
    } finally {
      if (mounted) setState(() => _googleLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final pad = size.width >= 600 ? 48.0 : 28.0;
    final top = MediaQuery.paddingOf(context).top;

    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // ── Animated gradient background ─────────────────────────────────
          AnimatedBuilder(
            animation: _bgCtrl,
            builder: (_, __) {
              final t = _bgCtrl.value;
              return Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment(-1 + t * 0.4, -1),
                    end: Alignment(1 - t * 0.4, 1),
                    colors: const [
                      AppColors.maroonDeep,
                      AppColors.maroon,
                      Color(0xFF8B1A2A),
                      AppColors.maroonDark,
                    ],
                    stops: const [0.0, 0.35, 0.65, 1.0],
                  ),
                ),
              );
            },
          ),

          // ── Decorative circles ───────────────────────────────────────────
          Positioned(
            top: -60,
            right: -90,
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.gold.withValues(alpha: 0.07),
              ),
            ),
          ),

          // ── Back + Brand header ──────────────────────────────────────────
          Positioned(
            top: top + 14,
            left: 16,
            right: pad,
            child: Row(
              children: [
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.arrow_back_ios_new_rounded,
                      color: AppColors.white, size: 20),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.glass,
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '✦  SWASTIK FASHION  ✦',
                      style: GoogleFonts.poppins(
                        fontSize: 10,
                        letterSpacing: 2.5,
                        color: AppColors.gold.withValues(alpha: 0.85),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'Create account',
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 26,
                        fontWeight: FontWeight.w700,
                        color: AppColors.white,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // ── Frosted glass card ────────────────────────────────────────────
          Align(
            alignment: Alignment.bottomCenter,
            child: FadeTransition(
              opacity: _cardFade,
              child: SlideTransition(
                position: _cardSlide,
                child: ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(40)),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
                    child: Container(
                      constraints: const BoxConstraints(maxWidth: 520),
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: AppColors.white.withValues(alpha: 0.96),
                        borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(40)),
                        border: Border.all(
                          color: AppColors.white.withValues(alpha: 0.5),
                        ),
                      ),
                      child: SingleChildScrollView(
                        padding: EdgeInsets.fromLTRB(pad, 28, pad, 40),
                        child: Form(
                          key: _formKey,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              // Drag handle
                              Center(
                                child: Container(
                                  width: 40,
                                  height: 4,
                                  margin: const EdgeInsets.only(bottom: 20),
                                  decoration: BoxDecoration(
                                    color: AppColors.divider,
                                    borderRadius: BorderRadius.circular(99),
                                  ),
                                ),
                              ),

                              // Subtitle
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 14, vertical: 10),
                                decoration: BoxDecoration(
                                  color: AppColors.goldPale,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                      color: AppColors.gold
                                          .withValues(alpha: 0.3)),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.verified_user_outlined,
                                        size: 18, color: AppColors.goldMuted),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        'Wholesale buyers only. You can browse after signing up.',
                                        style: GoogleFonts.poppins(
                                          fontSize: 13,
                                          color: AppColors.goldMuted,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 22),
                              AuthTextField(
                                label: 'Business name',
                                hint: 'Swastik Fashion',
                                controller: _business,
                                textInputAction: TextInputAction.next,
                                validator: AuthValidators.businessName,
                              ),
                              const SizedBox(height: 16),
                              AuthTextField(
                                label: 'Email',
                                hint: 'you@business.com',
                                controller: _email,
                                keyboardType: TextInputType.emailAddress,
                                textInputAction: TextInputAction.next,
                                autocorrect: false,
                                validator: AuthValidators.email,
                              ),
                              const SizedBox(height: 16),
                              AuthTextField(
                                label: 'Phone (optional)',
                                hint: '+91 98765 43210',
                                controller: _phone,
                                keyboardType: TextInputType.phone,
                                textInputAction: TextInputAction.next,
                                validator: AuthValidators.phoneOptional,
                              ),
                              const SizedBox(height: 16),
                              AuthTextField(
                                label: 'Password',
                                hint: 'At least 8 characters',
                                controller: _password,
                                obscureText: _obscurePassword,
                                textInputAction: TextInputAction.next,
                                autocorrect: false,
                                validator: AuthValidators.password,
                                onPasswordVisibilityToggle: () => setState(
                                    () => _obscurePassword = !_obscurePassword),
                              ),
                              const SizedBox(height: 16),
                              AuthTextField(
                                label: 'Confirm password',
                                hint: 'Repeat password',
                                controller: _confirm,
                                obscureText: _obscureConfirm,
                                textInputAction: TextInputAction.done,
                                autocorrect: false,
                                validator: (v) =>
                                    AuthValidators.confirmPassword(
                                        _password.text, v),
                                onPasswordVisibilityToggle: () => setState(
                                    () => _obscureConfirm = !_obscureConfirm),
                                onFieldSubmitted: (_) {
                                  if (!_loading) _submit();
                                },
                              ),
                              const SizedBox(height: 28),

                              _GradientButton(
                                label: 'Create account',
                                loading: _loading,
                                onTap: _loading ? null : _submit,
                              ),

                              const SizedBox(height: 22),
                              _OrDivider(),
                              const SizedBox(height: 18),

                              GoogleSignInButton(
                                loading: _googleLoading,
                                onPressed: (_loading || _googleLoading)
                                    ? null
                                    : _signInWithGoogle,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Gradient CTA button ───────────────────────────────────────────────────────
class _GradientButton extends StatelessWidget {
  const _GradientButton({
    required this.label,
    required this.loading,
    this.onTap,
  });

  final String label;
  final bool loading;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 56,
        decoration: BoxDecoration(
          gradient: loading
              ? const LinearGradient(
                  colors: [Color(0xFF9E9E9E), Color(0xFF757575)])
              : AppColors.maroonGradient,
          borderRadius: BorderRadius.circular(18),
          boxShadow: loading
              ? []
              : [
                  BoxShadow(
                    color: AppColors.maroon.withValues(alpha: 0.4),
                    blurRadius: 18,
                    offset: const Offset(0, 8),
                  ),
                ],
        ),
        alignment: Alignment.center,
        child: loading
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                    strokeWidth: 2.5, color: AppColors.white),
              )
            : Text(
                label,
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.white,
                ),
              ),
      ),
    );
  }
}

class _OrDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider()),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'OR',
            style: GoogleFonts.poppins(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.textHint,
              letterSpacing: 1.5,
            ),
          ),
        ),
        const Expanded(child: Divider()),
      ],
    );
  }
}
