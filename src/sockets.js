import sanitizeHtml from 'sanitize-html';
import { prisma } from './db.js';

export function initSockets(io) {
  io.on('connection', (socket) => {
    socket.on('join-space', ({ spaceId }) => {
      socket.join(spaceId);
    });

    socket.on('text-message', async ({ spaceId, senderId, text }) => {
      const clean = sanitizeHtml(text);
      const msg = await prisma.message.create({
        data: { spaceId, senderId, type: 'text', text: clean },
        include: { sender: true },
      });
      io.to(spaceId).emit('new-message', msg);
    });

    socket.on('audio-message', async ({ spaceId, senderId, audioUrl }) => {
      const msg = await prisma.message.create({
        data: { spaceId, senderId, type: 'audio', audioUrl },
        include: { sender: true },
      });
      io.to(spaceId).emit('new-message', msg);
    });
  });
}