import fbCovers from '../../src/api_handlers/feishu/fb-covers.js';
import media from '../../src/api_handlers/feishu/media.js';
import pixelIdeas from '../../src/api_handlers/feishu/pixel-ideas.js';

export default async function handler(req, res) {
  let { slug } = req.query;
  if (!slug) slug = req.query['[...slug]'];
  if (!slug) slug = req.query['[[...slug]]'];
  
  const parts = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const path = parts.join('/');

  if (path === 'fb-covers') return fbCovers(req, res);
  if (path === 'media') return media(req, res);
  if (path === 'pixel-ideas') return pixelIdeas(req, res);

  res.status(404).json({ error: 'Not Found' });
}