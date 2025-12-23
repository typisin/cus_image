import consume from '../../src/api_handlers/credits/consume.js';
import index from '../../src/api_handlers/credits/index.js';

export default async function handler(req, res) {
  let { slug } = req.query;
  if (!slug) slug = req.query['[...slug]'];
  if (!slug) slug = req.query['[[...slug]]'];

  const parts = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const path = parts.join('/');

  if (path === 'consume') return consume(req, res);
  if (path === '') return index(req, res);

  res.status(404).json({ error: 'Not Found' });
}