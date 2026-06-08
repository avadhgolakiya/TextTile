import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../core/constants/app_colors.dart';

/// Network image with disk + memory caching, rounded corners, loading shimmer,
/// and error fallback.
///
/// Replaces bare [Image.network] with [CachedNetworkImage] so images persist
/// across navigations and scroll restores without re-downloading.
class AppNetworkImage extends StatelessWidget {
  const AppNetworkImage({
    super.key,
    required this.url,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.aspectRatio,
    this.expand = false,
  });

  final String url;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final double? aspectRatio;

  /// When true (and [aspectRatio] is null), fills the parent with [fit].
  final bool expand;

  @override
  Widget build(BuildContext context) {
    final image = CachedNetworkImage(
      imageUrl: url,
      fit: fit,
      // Limit decode size to 2× display width to save GPU memory.
      memCacheWidth: 600,
      placeholder: (context, url) => Container(
        color: AppColors.peach,
        alignment: Alignment.center,
        child: const SizedBox(
          width: 22,
          height: 22,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: AppColors.maroon,
          ),
        ),
      ),
      errorWidget: (_, __, ___) => Container(
        color: AppColors.peach,
        alignment: Alignment.center,
        child: const Icon(
          Icons.image_not_supported_outlined,
          color: AppColors.textSecondary,
        ),
      ),
    );

    Widget w = borderRadius != null
        ? ClipRRect(borderRadius: borderRadius!, child: image)
        : image;

    if (aspectRatio != null) {
      w = AspectRatio(aspectRatio: aspectRatio!, child: w);
    } else if (expand) {
      w = SizedBox.expand(child: w);
    }
    return w;
  }
}
