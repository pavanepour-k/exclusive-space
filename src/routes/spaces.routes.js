import { Router } from 'express';
import { prisma } from '../db.js';
import { authRequired } from '../middleware/authRequired.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import sanitizeHtml from 'sanitize-html';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const audioStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/audio'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const imageStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/images'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const audioUpload = multer({
  storage: audioStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) cb(null, true);
    else cb(null, false);
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(null, false);
  },
});

router.get('/:id', authRequired, async (req, res) => {
  const spaceId = req.params.id;
  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    include: { messages: { include: { sender: true } }, photos: true },
  });
  if (!space || ![space.userAId, space.userBId].includes(req.user.id))
    return res.redirect('/friends');
  res.render('space', { space });
});

router.post('/:id/message', authRequired, async (req, res) => {
  const spaceId = req.params.id;
  const text = sanitizeHtml(req.body.text);
  await prisma.message.create({
    data: { spaceId, senderId: req.user.id, type: 'text', text },
  });
  res.redirect(`/spaces/${spaceId}`);
});

router.post('/:id/audio', authRequired, audioUpload.single('audio'), async (req, res) => {
  if (!req.file) return res.redirect(`/spaces/${req.params.id}`);
  const spaceId = req.params.id;
  await prisma.message.create({
    data: {
      spaceId,
      senderId: req.user.id,
      type: 'audio',
      audioUrl: `/uploads/audio/${req.file.filename}`,
    },
  });
  res.redirect(`/spaces/${spaceId}`);
});

router.post('/:id/photo', authRequired, imageUpload.single('photo'), async (req, res) => {
  const spaceId = req.params.id;
  if (req.file) {
    const caption = sanitizeHtml(req.body.caption || '');
    await prisma.photo.create({
      data: {
        spaceId,
        uploaderId: req.user.id,
        url: `/uploads/images/${req.file.filename}`,
        caption,
      },
    });
  }
  res.redirect(`/spaces/${spaceId}`);
});

export default router;