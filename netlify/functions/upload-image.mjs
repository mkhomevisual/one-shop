/**
 * POST /.netlify/functions/upload-image
 * Body: { filename: string, data: string (base64, no prefix) }
 * Commits a single image to the GitHub repo under img/uploads/.
 * Returns: { ok: true, path: "/img/uploads/filename.jpg" }
 */

const OWNER  = process.env.GITHUB_OWNER;
const REPO   = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN  = process.env.GITHUB_TOKEN;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function gh(path, opts = {}) {
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    ...opts,
    headers: {
      Authorization: `token ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent':   'one-shop-cms',
      ...(opts.headers || {}),
    },
  });
}

function sanitize(name) {
  return (name || 'upload')
    .replace(/[^\w\-.]/g, '_')
    .replace(/^\./, '_') || 'upload';
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };

  if (!TOKEN || !OWNER || !REPO) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ ok: false, error: 'Chybí env proměnné (GITHUB_TOKEN / OWNER / REPO)' }) };
  }

  try {
    const { filename, data } = JSON.parse(event.body || '{}');
    if (!filename || !data) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ ok: false, error: 'Chybí filename nebo data' }) };
    }

    const fname    = sanitize(filename);
    const filePath = `img/uploads/${fname}`;

    // Check if file exists — need existing SHA to overwrite
    let sha;
    const check = await gh(`/contents/${filePath}?ref=${BRANCH}`);
    if (check.ok) {
      sha = (await check.json()).sha;
    }

    // Commit the file
    const body = { message: `Upload letak: ${fname}`, content: data, branch: BRANCH };
    if (sha) body.sha = sha;

    const res = await gh(`/contents/${filePath}`, { method: 'PUT', body: JSON.stringify(body) });
    if (!res.ok) {
      const e = await res.json();
      throw new Error(e.message || `GitHub API ${res.status}`);
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, path: `/${filePath}` }) };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
