import { Router } from 'express';
import passport from '../auth.js';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';

const router = Router();

router.get('/register', (req, res) => res.render('register'));
router.post('/register', async (req, res) => {
  const { username, displayName, email, password } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { username, displayName, email, passwordHash } });
    res.redirect('/login');
  } catch (e) {
    res.redirect('/register');
  }
});

router.get('/login', (req, res) => res.render('login'));
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/feed',
    failureRedirect: '/login',
  })
);

router.get('/logout', (req, res, next) => {
  req.logout(() => {
    res.redirect('/');
  });
});

export default router;