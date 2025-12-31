import fbCovers from '../../src/api_handlers/feishu/fb-covers.js';
import media from '../../src/api_handlers/feishu/media.js';

export default async function handler(req, res) {
  let { slug } = req.query;
  if (!slug) slug = req.query['[...slug]'];
  if (!slug) slug = req.query['[[...slug]]'];
  
  const parts = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const path = parts.join('/');

  if (path === 'fb-covers') return fbCovers(req, res);
  if (path === 'media') return media(req, res);

  res.status(404).json({ error: 'Not Found' });
}
