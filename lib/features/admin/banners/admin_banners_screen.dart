import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/services/image_upload_service.dart';
import '../../catalog/banner_repository.dart';

/// Admin — manage the home-screen banner slider images.
class AdminBannersScreen extends StatefulWidget {
  const AdminBannersScreen({super.key});

  @override
  State<AdminBannersScreen> createState() => _AdminBannersScreenState();
}

class _AdminBannersScreenState extends State<AdminBannersScreen> {
  final _repo = BannerRepository();
  late Future<List<Map<String, dynamic>>> _future;

  @override
  void initState() {
    super.initState();
    _future = _repo.fetchAllAdmin();
  }

  void _refresh() {
    setState(() {
      _future = _repo.fetchAllAdmin();
    });
  }

  // ── Add banner bottom sheet ───────────────────────────────────────────────

  void _showAddSheet() {
    final urlCtrl = TextEditingController();
    bool loading = false;
    bool uploading = false;
    String previewUrl = '';

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(builder: (ctx, setModal) {
          // ── Pick image helper (inside the sheet) ─────────────────────
          Future<void> pickImage(ImageSource source) async {
            setModal(() => uploading = true);
            final messenger = ScaffoldMessenger.of(context);
            try {
              final url = await ImageUploadService.pickAndUpload(
                bucket: 'banner-image',
                source: source,
              );
              if (url != null) {
                setModal(() {
                  previewUrl = url;
                  urlCtrl.text = url;
                  uploading = false;
                });
              } else {
                setModal(() => uploading = false);
              }
            } catch (e) {
              setModal(() => uploading = false);
              messenger.showSnackBar(SnackBar(
                content: Text('Upload failed: $e'),
                backgroundColor: Colors.red,
              ));
            }
          }

          // ── Add banner helper ────────────────────────────────────────
          Future<void> addBanner() async {
            final url = urlCtrl.text.trim();
            if (url.isEmpty) {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Text('Please pick an image or enter a URL'),
                backgroundColor: Colors.orange,
              ));
              return;
            }
            setModal(() => loading = true);
            final nav = Navigator.of(ctx);
            final messenger = ScaffoldMessenger.of(context);
            try {
              await _repo.add(url);
              if (mounted) {
                nav.pop();
                _refresh();
                messenger.showSnackBar(SnackBar(
                  content: Row(children: [
                    const Icon(Icons.check_circle, color: Colors.white, size: 18),
                    const SizedBox(width: 10),
                    Text('Banner added!', style: GoogleFonts.poppins()),
                  ]),
                  backgroundColor: Colors.green.shade700,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ));
              }
            } catch (e) {
              setModal(() => loading = false);
              if (mounted) {
                messenger.showSnackBar(SnackBar(
                  content: Text('Error: $e'),
                  backgroundColor: Colors.red,
                ));
              }
            }
          }

          return Padding(
            padding: EdgeInsets.only(
                bottom: MediaQuery.viewInsetsOf(ctx).bottom),
            child: Container(
              decoration: const BoxDecoration(
                color: AppColors.white,
                borderRadius:
                    BorderRadius.vertical(top: Radius.circular(28)),
              ),
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Handle
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  Text('Add Banner Image',
                      style: GoogleFonts.playfairDisplay(
                          fontSize: 20, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 16),

                  // ── Image preview ────────────────────────────────────
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      width: double.infinity,
                      height: 150,
                      color: AppColors.peach,
                      child: uploading
                          ? const Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  CircularProgressIndicator(
                                      color: AppColors.maroon,
                                      strokeWidth: 2),
                                  SizedBox(height: 10),
                                  Text('Uploading…',
                                      style: TextStyle(
                                          color: AppColors.textSecondary,
                                          fontSize: 13)),
                                ],
                              ),
                            )
                          : previewUrl.isNotEmpty
                              ? Image.network(
                                  previewUrl,
                                  fit: BoxFit.cover,
                                  width: double.infinity,
                                  height: 150,
                                  errorBuilder: (_, __, ___) => const Center(
                                    child: Icon(
                                        Icons.broken_image_outlined,
                                        size: 40,
                                        color: AppColors.textSecondary),
                                  ),
                                )
                              : const Center(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.image_outlined,
                                          size: 42,
                                          color: AppColors.textSecondary),
                                      SizedBox(height: 8),
                                      Text('No image selected',
                                          style: TextStyle(
                                              color: AppColors.textSecondary,
                                              fontSize: 13)),
                                    ],
                                  ),
                                ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // ── Pick buttons ─────────────────────────────────────
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: uploading || loading
                              ? null
                              : () => pickImage(ImageSource.gallery),
                          icon: const Icon(Icons.photo_library_outlined,
                              color: AppColors.maroon, size: 18),
                          label: Text('Gallery',
                              style: GoogleFonts.poppins(
                                  color: AppColors.maroon,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.maroon),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                            padding:
                                const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: uploading || loading
                              ? null
                              : () => pickImage(ImageSource.camera),
                          icon: const Icon(Icons.camera_alt_outlined,
                              color: AppColors.maroon, size: 18),
                          label: Text('Camera',
                              style: GoogleFonts.poppins(
                                  color: AppColors.maroon,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.maroon),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                            padding:
                                const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // ── URL fallback ──────────────────────────────────────
                  TextField(
                    controller: urlCtrl,
                    keyboardType: TextInputType.url,
                    onChanged: (v) => setModal(() => previewUrl = v.trim()),
                    decoration: InputDecoration(
                      hintText: 'Or paste image URL manually',
                      prefixIcon: const Icon(Icons.link_rounded,
                          color: AppColors.textSecondary, size: 20),
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14)),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(
                            color: AppColors.maroon, width: 2),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // ── Add button ────────────────────────────────────────
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: FilledButton.icon(
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.maroon,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: (loading || uploading) ? null : addBanner,
                      icon: (loading || uploading)
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white))
                          : const Icon(
                              Icons.add_photo_alternate_outlined,
                              color: Colors.white),
                      label: Text(
                        loading
                            ? 'Adding…'
                            : uploading
                                ? 'Uploading…'
                                : 'Add Banner',
                        style: GoogleFonts.poppins(
                            fontWeight: FontWeight.w600,
                            color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        });
      },
    );
  }

  // ── Delete confirmation ───────────────────────────────────────────────────

  void _delete(Map<String, dynamic> banner) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Remove banner?',
            style: GoogleFonts.playfairDisplay(fontWeight: FontWeight.w700)),
        content: Text(
          'This banner will be removed from the home screen slider.',
          style: GoogleFonts.poppins(fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: GoogleFonts.poppins()),
          ),
          FilledButton(
            style:
                FilledButton.styleFrom(backgroundColor: Colors.red.shade700),
            onPressed: () async {
              Navigator.pop(ctx);
              final messenger = ScaffoldMessenger.of(context);
              try {
                await _repo.delete(banner['id'] as String);
                if (mounted) {
                  _refresh();
                  messenger.showSnackBar(SnackBar(
                    content: Text('Banner removed', style: GoogleFonts.poppins()),
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ));
                }
              } catch (e) {
                if (mounted) {
                  messenger.showSnackBar(SnackBar(
                    content: Text('Error: $e'),
                    backgroundColor: Colors.red,
                  ));
                }
              }
            },
            child: Text('Remove', style: GoogleFonts.poppins()),
          ),
        ],
      ),
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cream,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.maroon,
        onPressed: _showAddSheet,
        icon: const Icon(Icons.add_photo_alternate_outlined,
            color: AppColors.white),
        label: Text('Add Banner',
            style: GoogleFonts.poppins(
                color: AppColors.white, fontWeight: FontWeight.w600)),
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline,
                      size: 48, color: AppColors.textSecondary),
                  const SizedBox(height: 12),
                  Text('Failed to load banners',
                      style:
                          GoogleFonts.poppins(color: AppColors.textSecondary)),
                  TextButton(
                      onPressed: _refresh,
                      child: Text('Retry',
                          style: GoogleFonts.poppins(
                              color: AppColors.maroon))),
                ],
              ),
            );
          }

          final banners = snap.data ?? [];

          if (banners.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.image_outlined,
                      size: 64,
                      color: AppColors.textSecondary.withValues(alpha: 0.5)),
                  const SizedBox(height: 16),
                  Text('No banners yet.',
                      style: GoogleFonts.playfairDisplay(
                          fontSize: 20, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Text('Tap + to add the first banner image.',
                      style: GoogleFonts.poppins(
                          color: AppColors.textSecondary)),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
            itemCount: banners.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, i) => _BannerTile(
                banner: banners[i], onDelete: () => _delete(banners[i])),
          );
        },
      ),
    );
  }
}

// ── Banner tile ───────────────────────────────────────────────────────────────

class _BannerTile extends StatelessWidget {
  const _BannerTile({required this.banner, required this.onDelete});

  final Map<String, dynamic> banner;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final url = banner['image_url'] as String;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          // Thumbnail
          ClipRRect(
            borderRadius:
                const BorderRadius.horizontal(left: Radius.circular(18)),
            child: SizedBox(
              width: 110,
              height: 80,
              child: Image.network(
                url,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  color: AppColors.peach,
                  alignment: Alignment.center,
                  child: const Icon(Icons.broken_image_outlined,
                      color: AppColors.textSecondary),
                ),
                loadingBuilder: (_, child, progress) {
                  if (progress == null) return child;
                  return Container(
                    color: AppColors.peach,
                    alignment: Alignment.center,
                    child: const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: AppColors.maroon),
                    ),
                  );
                },
              ),
            ),
          ),
          const SizedBox(width: 12),
          // URL text
          Expanded(
            child: Text(
              url,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.poppins(
                  fontSize: 12, color: AppColors.textSecondary),
            ),
          ),
          // Delete button
          IconButton(
            icon: Icon(Icons.delete_outline, color: Colors.red.shade600),
            onPressed: onDelete,
            tooltip: 'Remove banner',
          ),
          const SizedBox(width: 4),
        ],
      ),
    );
  }
}
