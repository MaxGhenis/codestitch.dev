export default async function handler(req, res) {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const { endpoint } = req.query;
  
    // Allow CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS'); // Allow GET and OPTIONS requests
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    // Handle preflight request (OPTIONS)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint parameter' });
    }
  
    try {
      const response = await fetch(`https://api.github.com/${endpoint}`, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      });
  
      const data = await response.json();
  
      return res.status(response.status).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'GitHub API request failed' });
    }
  }