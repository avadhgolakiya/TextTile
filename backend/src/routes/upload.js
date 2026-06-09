import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getFirebaseAdmin } from '../lib/firebase.js';
import { authMiddleware } from '../lib/auth.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const admin = getFirebaseAdmin();
    if (admin) {
      const bucketNameEnv = process.env.FIREBASE_STORAGE_BUCKET;
      let bucket;
      if (bucketNameEnv) {
        bucket = admin.storage().bucket(bucketNameEnv);
      } else {
        const b1 = 'texttile-253c7.firebasestorage.app';
        const b2 = 'texttile-253c7.appspot.com';
        try {
          const [exists1] = await admin.storage().bucket(b1).exists();
          bucket = exists1 ? admin.storage().bucket(b1) : admin.storage().bucket(b2);
        } catch {
          bucket = admin.storage().bucket(b2);
        }
      }

      try {
        const token = crypto.randomUUID();
        const uniqueName = `uploads/${Date.now()}_${crypto.randomUUID()}_${file.originalname}`;
        const blob = bucket.file(uniqueName);

        await blob.save(file.buffer, {
          metadata: {
            contentType: file.mimetype,
            metadata: {
              firebaseStorageDownloadTokens: token,
            },
          },
        });

        const encodedPath = encodeURIComponent(uniqueName);
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;

        return res.json({ imageUrl: publicUrl });
      } catch (err) {
        console.warn('[Upload] Firebase storage upload failed or not enabled, falling back to local server storage:', err.message);
      }
    }

    // LOCAL SERVER FALLBACK
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}_${crypto.randomUUID()}${ext}`;
    const uploadDir = path.resolve('../frontend/public/uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    // Return the relative URL (Next.js serves the public folder at the root '/')
    return res.json({ imageUrl: `/uploads/${filename}` });
  } catch (e) {
    console.error('[Upload] Error:', e);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
