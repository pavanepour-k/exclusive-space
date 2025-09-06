import { Router } from 'express';
import { prisma } from '../db.js';
import { authRequired } from '../middleware/authRequired.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.post('/photo/:id/delete', authRequired, async (req, res) => {
  const photo = await prisma.photo.findUnique({ where: { id: req.params.id } });
  if (photo && photo.uploaderId === req.user.id) {
    await prisma.photo.delete({ where: { id: photo.id } });
    const filePath = path.join(__dirname, '../../', photo.url);
    fs.unlink(filePath, () => {});
  }
  res.redirect('back');
});

export default router;