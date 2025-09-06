import { Router } from 'express';
import { prisma } from '../db.js';
import sanitizeHtml from 'sanitize-html';
import { authRequired } from '../middleware/authRequired.js';

const router = Router();

router.get('/', authRequired, async (req, res) => {
  const posts = await prisma.post.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' },
  });
  res.render('dashboard', { posts });
});

router.post('/', authRequired, async (req, res) => {
  const content = sanitizeHtml(req.body.content);
  await prisma.post.create({ data: { authorId: req.user.id, content } });
  res.redirect('/feed');
});

export default router;