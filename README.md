# Project Overview (stack & rationale)

- Server: Node.js + Express + Socket.IO for realtime chat.
- Views: EJS templates + Tailwind (CDN) → fast, lightweight, accessible UI.
- DB/ORM: SQLite + Prisma → zero external deps, migrations included.
- Auth: First-class “YouWare Identity” (local accounts). App routes require YouWare login.
- Uploads: Multer to public/uploads/{audio|photos}.
- i18n: Simple dictionaries (English/Korean) with middleware + client switcher.
- UX polish: micro-interactions, motion, and quality gates inspired by the UI/UX cheatsheet (focus states, reduced motion, responsive breakpoints).


> Why SQLite/Prisma? Local-first, ACID, quick to run; can flip to Postgres by changing schema.prisma.
> Why Express/Socket.IO? Straightforward, secure-by-default patterns with CSRF + sessions; Socket.IO fits chat nicely. Backend framework fit aligns with the reference matrix.
