import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getFirebaseAdmin } from '../lib/firebase.js';
import { authMiddleware } from '../lib/auth.js';
import { uploadBuffer } from '../lib/cloudinary.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                         process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name_here';

    if (hasCloudinary) {
      try {
        const result = await uploadBuffer(file.buffer, file.originalname);
        return res.json({ imageUrl: result.secure_url });
      } catch (err) {
        console.warn('[Upload] Cloudinary upload failed, falling back to local server storage:', err.message);
      }
    } else {
      console.warn('[Upload] Cloudinary is not configured (missing CLOUDINARY_CLOUD_NAME), falling back to local server storage.');
    }

    // LOCAL SERVER FALLBACK
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}_${crypto.randomUUID()}${ext}`;
    const uploadDir = path.resolve('./uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    // Return root-relative URL for cleaner local path resolution
    const imageUrl = `/uploads/${filename}`;

    return res.json({ imageUrl });
  } catch (e) {
    console.error('[Upload] Error:', e);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
