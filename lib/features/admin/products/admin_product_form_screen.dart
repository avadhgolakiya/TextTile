import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/services/image_upload_service.dart';
import '../../../models/product.dart';

/// Add a new product or edit an existing one.
class AdminProductFormScreen extends StatefulWidget {
  const AdminProductFormScreen({super.key, this.product, this.initialFeatured = false});

  final Product? product;
  final bool initialFeatured;

  @override
  State<AdminProductFormScreen> createState() => _AdminProductFormScreenState();
}

class _AdminProductFormScreenState extends State<AdminProductFormScreen> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _idCtrl;
  late final TextEditingController _nameCtrl;
  late final TextEditingController _subtitleCtrl;
  late final TextEditingController _priceCtrl;
  late final TextEditingController _originalPriceCtrl;
  late final TextEditingController _badgeCtrl;
  late final TextEditingController _categoryKeyCtrl;
  bool _isFeatured = false;

  // Multi-image state
  late List<String> _imageUrls;
  bool _imageUploading = false;

  bool get _isEditing => widget.product != null;

  @override
  void initState() {
    super.initState();
    final p = widget.product;
    _idCtrl = TextEditingController(text: p?.id ?? '');
    _nameCtrl = TextEditingController(text: p?.name ?? '');
    _subtitleCtrl = TextEditingController(text: p?.subtitle ?? '');
    _priceCtrl = TextEditingController(text: p != null ? '${p.price}' : '');
    _originalPriceCtrl =
        TextEditingController(text: p?.originalPrice != null ? '${p!.originalPrice}' : '');
    _badgeCtrl = TextEditingController(text: p?.badge ?? '');
    _categoryKeyCtrl = TextEditingController(text: p?.categoryKey ?? '');
    _isFeatured = widget.initialFeatured;
    // Seed image list from product (allImages handles backwards compat)
    _imageUrls = List<String>.from(p?.allImages ?? []);
  }

  @override
  void dispose() {
    for (final c in [
      _idCtrl, _nameCtrl, _subtitleCtrl, _priceCtrl,
      _originalPriceCtrl, _badgeCtrl, _categoryKeyCtrl,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  // ── Image picking ─────────────────────────────────────────────────────────

  Future<void> _pickImage(ImageSource source) async {
    setState(() => _imageUploading = true);
    try {
      final url = await ImageUploadService.pickAndUpload(
        bucket: 'product-image',
        source: source,
      );
      if (url != null && mounted) {
        setState(() => _imageUrls.add(url));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Upload failed: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _imageUploading = false);
    }
  }

  void _removeImage(int index) {
    setState(() => _imageUrls.removeAt(index));
  }

  void _save() {
    if (!_formKey.currentState!.validate()) return;

    final primaryUrl = _imageUrls.isNotEmpty ? _imageUrls.first : '';

    final product = Product(
      id: _idCtrl.text.trim(),
      name: _nameCtrl.text.trim(),
      subtitle: _subtitleCtrl.text.trim(),
      price: int.parse(_priceCtrl.text.trim()),
      originalPrice: _originalPriceCtrl.text.trim().isNotEmpty
          ? int.tryParse(_originalPriceCtrl.text.trim())
          : null,
      imageUrl: primaryUrl,
      imageUrls: List<String>.from(_imageUrls),
      badge: _badgeCtrl.text.trim().isNotEmpty ? _badgeCtrl.text.trim() : null,
      categoryKey: _categoryKeyCtrl.text.trim().isNotEmpty
          ? _categoryKeyCtrl.text.trim()
          : null,
    );

    Navigator.of(context).pop({'product': product, 'featured': _isFeatured});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cream,
      appBar: AppBar(
        backgroundColor: AppColors.maroon,
        foregroundColor: AppColors.white,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          _isEditing ? 'Edit Product' : 'New Product',
          style: GoogleFonts.playfairDisplay(
              fontWeight: FontWeight.w700, color: AppColors.white, fontSize: 20),
        ),
        actions: [
          TextButton(
            onPressed: _imageUploading ? null : _save,
            child: Text(
              'Save',
              style: GoogleFonts.poppins(
                  color: _imageUploading ? Colors.white38 : AppColors.gold,
                  fontWeight: FontWeight.w700,
                  fontSize: 15),
            ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
          children: [
            _buildField('Product Code *', _idCtrl,
                hint: 'e.g. SR-2401',
                validator: (v) => v!.trim().isEmpty ? 'Required' : null),
            _buildField('Name *', _nameCtrl,
                hint: 'e.g. Banarasi Heritage Saree',
                validator: (v) => v!.trim().isEmpty ? 'Required' : null),
            _buildField('Subtitle / Description', _subtitleCtrl,
                hint: 'Pure Silk · Zari border · 6.5m'),
            _buildField('Price (₹) *', _priceCtrl,
                hint: '4850',
                keyboard: TextInputType.number,
                validator: (v) {
                  if (v!.trim().isEmpty) return 'Required';
                  if (int.tryParse(v.trim()) == null) return 'Enter a valid number';
                  return null;
                }),
            _buildField('Original Price (₹)', _originalPriceCtrl,
                hint: '5200 (leave blank if no discount)',
                keyboard: TextInputType.number),

            // ── Image section ──────────────────────────────────────────
            _buildImageSection(),

            _buildField('Badge', _badgeCtrl,
                hint: 'e.g. New · Bestseller · Festive (optional)'),
            _buildField('Category Key', _categoryKeyCtrl,
                hint: 'banarasi / chiffon / cotton etc. (optional)'),

            const SizedBox(height: 16),
            // Featured toggle
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Today\'s Drop',
                            style: GoogleFonts.poppins(
                                fontWeight: FontWeight.w600, fontSize: 14)),
                        Text('Pin this product to the Today\'s Drop tab',
                            style: GoogleFonts.poppins(
                                color: AppColors.textSecondary, fontSize: 12)),
                      ],
                    ),
                  ),
                  Switch(
                    value: _isFeatured,
                    onChanged: (v) => setState(() => _isFeatured = v),
                    activeThumbColor: AppColors.maroon,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _imageUploading ? null : _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.maroon,
                foregroundColor: AppColors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
              ),
              child: _imageUploading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : Text(
                      _isEditing ? 'Save Changes' : 'Add Product',
                      style: GoogleFonts.poppins(
                          fontWeight: FontWeight.w700, fontSize: 16),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Image section widget ───────────────────────────────────────────────────

  Widget _buildImageSection() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Product Images',
                  style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.maroon.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${_imageUrls.length} photo${_imageUrls.length == 1 ? '' : 's'}',
                  style: GoogleFonts.poppins(
                      fontSize: 11,
                      color: AppColors.maroon,
                      fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // ── Image thumbnails + add slot ────────────────────────────
          SizedBox(
            height: 110,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                // Existing images
                ..._imageUrls.asMap().entries.map((entry) {
                  final i = entry.key;
                  final url = entry.value;
                  return Stack(
                    children: [
                      Container(
                        width: 110,
                        height: 110,
                        margin: const EdgeInsets.only(right: 10),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.network(url,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                      color: AppColors.peach,
                                      child: const Icon(
                                          Icons.broken_image_outlined,
                                          color: AppColors.textSecondary))),
                              // Primary badge
                              if (i == 0)
                                Positioned(
                                  bottom: 6,
                                  left: 6,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.maroon,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text('Main',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white,
                                            fontSize: 10,
                                            fontWeight: FontWeight.w600)),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                      // Remove button
                      Positioned(
                        top: 2,
                        right: 12,
                        child: GestureDetector(
                          onTap: () => _removeImage(i),
                          child: Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              color: Colors.red.shade600,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.close,
                                color: Colors.white, size: 14),
                          ),
                        ),
                      ),
                    ],
                  );
                }),

                // Upload spinner or add buttons
                if (_imageUploading)
                  Container(
                    width: 110,
                    height: 110,
                    decoration: BoxDecoration(
                      color: AppColors.peach,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Center(
                      child: CircularProgressIndicator(
                          color: AppColors.maroon, strokeWidth: 2),
                    ),
                  )
                else
                  _AddImageSlot(
                    onGallery: () => _pickImage(ImageSource.gallery),
                    onCamera: () => _pickImage(ImageSource.camera),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'First image is the main thumbnail. Tap × to remove. Tap + to add more.',
            style: GoogleFonts.poppins(
                fontSize: 11, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildField(
    String label,
    TextEditingController ctrl, {
    String? hint,
    TextInputType keyboard = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600, fontSize: 13)),
          const SizedBox(height: 6),
          TextFormField(
            controller: ctrl,
            keyboardType: keyboard,
            validator: validator,
            decoration: InputDecoration(
              hintText: hint,
              filled: true,
              fillColor: AppColors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: AppColors.divider),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: AppColors.divider),
              ),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Add image slot widget ─────────────────────────────────────────────────────

class _AddImageSlot extends StatelessWidget {
  const _AddImageSlot({required this.onGallery, required this.onCamera});

  final VoidCallback onGallery;
  final VoidCallback onCamera;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 110,
      height: 110,
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColors.maroon.withValues(alpha: 0.3),
          width: 1.5,
          style: BorderStyle.solid,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Gallery
              GestureDetector(
                onTap: onGallery,
                child: Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: AppColors.maroon.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.photo_library_outlined,
                      color: AppColors.maroon, size: 20),
                ),
              ),
              const SizedBox(width: 8),
              // Camera
              GestureDetector(
                onTap: onCamera,
                child: Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: AppColors.maroon.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.camera_alt_outlined,
                      color: AppColors.maroon, size: 20),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Add photo',
            style: GoogleFonts.poppins(
                fontSize: 11,
                color: AppColors.maroon,
                fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}
