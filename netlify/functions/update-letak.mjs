/**
 * POST /.netlify/functions/update-letak
 * Body: { pages: string[] }  — array of /img/uploads/... paths
 * Updates data/letak.json in the GitHub repo.
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

async function patchLetakPages(pages) {
  const filePath = 'data/letak.json';

  const getRes = await gh(`/contents/${filePath}?ref=${BRANCH}`);
  if (!getRes.ok) throw new Error('Nelze číst letak.json z GitHubu');

  const fileData = await getRes.json();
  const current  = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

  current.pages = pages;

  const putRes = await gh(`/contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `Letak: update ${pages.length} item(s)`,
      content: Buffer.from(JSON.stringify(current, null, 2)).toString('base64'),
      sha:     fileData.sha,
      branch:  BRANCH,
    }),
  });

  if (!putRes.ok) {
    const e = await putRes.json();
    throw new Error(e.message || `GitHub API ${putRes.status}`);
  }
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };

  if (!TOKEN || !OWNER || !REPO) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ ok: false, error: 'Chybí env proměnné' }) };
  }

  try {
    const { pages } = JSON.parse(event.body || '{}');
    if (!Array.isArray(pages)) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ ok: false, error: 'pages musí být pole' }) };
    }

    await patchLetakPages(pages);

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, count: pages.length }) };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
