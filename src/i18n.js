import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const translations = {};
const dir = path.resolve(__dirname, '..', 'i18n');
for (const file of fs.readdirSync(dir)) {
  if (file.endsWith('.json')) {
    const lang = path.basename(file, '.json');
    translations[lang] = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  }
}

export function i18n(req, res, next) {
  let lang = req.session.lang || req.acceptsLanguages('ja', 'en') || 'en';
  if (req.query.lang && translations[req.query.lang]) {
    lang = req.query.lang;
    req.session.lang = lang;
  }
  res.locals.t = (key) => translations[lang]?.[key] || key;
  res.locals.lang = lang;
  next();
}