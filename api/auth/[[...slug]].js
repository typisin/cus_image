import googleCallback from '../../src/api_handlers/auth/google/callback.js';
import googleStart from '../../src/api_handlers/auth/google/start.js';
import login from '../../src/api_handlers/auth/login.js';
import logout from '../../src/api_handlers/auth/logout.js';
import profile from '../../src/api_handlers/auth/profile.js';
import register from '../../src/api_handlers/auth/register.js';

export default async function handler(req, res) {
  let { slug } = req.query;
  if (!slug) slug = req.query['[...slug]'];
  if (!slug) slug = req.query['[[...slug]]'];

  const parts = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const path = parts.join('/');

  if (path === 'google/callback') return googleCallback(req, res);
  if (path === 'google/start') return googleStart(req, res);
  if (path === 'login') return login(req, res);
  if (path === 'logout') return logout(req, res);
  if (path === 'profile') return profile(req, res);
  if (path === 'register') return register(req, res);

  res.status(404).json({ error: 'Not Found' });
}