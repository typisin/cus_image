import test from '../../src/api_handlers/turso/test.js';
import usage from '../../src/api_handlers/turso/usage.js';

export default async function handler(req, res) {
  let { slug } = req.query;
  if (!slug) slug = req.query['[...slug]'];
  if (!slug) slug = req.query['[[...slug]]'];

  const parts = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const path = parts.join('/');

  if (path === 'test') return test(req, res);
  if (path === 'usage') return usage(req, res);

  res.status(404).json({ error: 'Not Found' });
}