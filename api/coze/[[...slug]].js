import upload from '../../src/api_handlers/coze/upload.js';
import uploadLocal from '../../src/api_handlers/coze/upload/local.js';
import uploadByPath from '../../src/api_handlers/coze/upload_by_path.js';

export default async function handler(req, res) {
  let { slug } = req.query;
  if (!slug) slug = req.query['[...slug]'];
  if (!slug) slug = req.query['[[...slug]]'];

  const parts = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const path = parts.join('/');

  if (path === 'upload') return upload(req, res);
  if (path === 'upload/local') return uploadLocal(req, res);
  if (path === 'upload_by_path') return uploadByPath(req, res);
  
  res.status(404).json({ error: 'Not Found' });
}