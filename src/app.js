import express from 'express';
import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';
import passport from './auth.js';
import { i18n } from './i18n.js';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import { csrfProtect, attachCsrfToken } from './middleware/csrf-protect.js';
import { initSockets } from './sockets.js';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.routes.js';
import feedRoutes from './routes/feed.routes.js';
import friendsRoutes from './routes/friends.routes.js';
import spacesRoutes from './routes/spaces.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const io = new Server(server);
initSockets(io);

const SQLiteStoreSession = SQLiteStore(session);

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(
  session({
    store: new SQLiteStoreSession({ db: 'sessions.db', dir: path.join(__dirname, '../prisma') }),
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(i18n);
app.use(csrfProtect);
app.use(attachCsrfToken);
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.url = req.originalUrl.split('?')[0];
  next();
});

app.use('/', authRoutes);
app.use('/feed', feedRoutes);
app.use('/friends', friendsRoutes);
app.use('/spaces', spacesRoutes);
app.use('/uploads', uploadsRoutes);

app.get('/', (req, res) => res.render('index'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));