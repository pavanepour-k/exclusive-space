import { Router } from 'express';
import { prisma } from '../db.js';
import { authRequired } from '../middleware/authRequired.js';
import sanitizeHtml from 'sanitize-html';

const router = Router();

router.get('/', authRequired, async (req, res) => {
  const requests = await prisma.friendship.findMany({
    where: { OR: [{ requesterId: req.user.id }, { addresseeId: req.user.id }] },
    include: { requester: true, addressee: true },
  });
  res.render('friends', { requests, users: [] });
});

router.post('/search', authRequired, async (req, res) => {
  const q = sanitizeHtml(req.body.q || '');
  const users = await prisma.user.findMany({
    where: { username: { contains: q }, NOT: { id: req.user.id } },
  });
  const requests = await prisma.friendship.findMany({
    where: { OR: [{ requesterId: req.user.id }, { addresseeId: req.user.id }] },
  });
  res.render('friends', { users, requests });
});

router.post('/request/:id', authRequired, async (req, res) => {
  const toId = req.params.id;
  try {
    await prisma.friendship.create({
      data: { requesterId: req.user.id, addresseeId: toId, status: 'pending' },
    });
  } catch (e) {}
  res.redirect('/friends');
});

router.post('/accept/:id', authRequired, async (req, res) => {
  const id = req.params.id;
  const fr = await prisma.friendship.update({
    where: { id },
    data: { status: 'accepted' },
  });
  await prisma.space.create({
    data: { userAId: fr.requesterId, userBId: fr.addresseeId },
  });
  res.redirect('/friends');
});

export default router;