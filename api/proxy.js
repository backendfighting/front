export default async function handler(req, res) {
  const query = Object.assign({}, req.query);
  const path = query.path;
  delete query.path;
  const qs = new URLSearchParams(query).toString();
  const target = 'http://3.39.10.53:8080/api/' + path + (qs ? '?' + qs : '');
  const headers = {};
  ['content-type', 'authorization', 'accept'].forEach(function (k) {
    if (req.headers[k]) headers[k] = req.headers[k];
  });
  const init = { method: req.method, headers: headers };
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body !== undefined) {
    init.body = (typeof req.body === 'string' || Buffer.isBuffer(req.body)) ? req.body : JSON.stringify(req.body);
  }
  try {
    const upstream = await fetch(target, init);
    const text = await upstream.text();
    res.status(upstream.status);
    const ct = upstream.headers.get('content-type');
    if (ct) res.setHeader('content-type', ct);
    res.send(text);
  } catch (e) {
    res.status(502).json({ message: 'proxy error' });
  }
}
