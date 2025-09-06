import csurf from 'csurf';

export const csrfProtect = csurf();

export function attachCsrfToken(req, res, next) {
  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();
}