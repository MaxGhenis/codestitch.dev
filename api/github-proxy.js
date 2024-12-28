export default async function handler(req, res) {
    const GH_TOKEN = process.env.GH_TOKEN;
    const { endpoint } = req.query;
  
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint parameter' });
    }
  
    const response = await fetch(`https://api.github.com/${endpoint}`, {
      headers: {
        Authorization: `token ${GH_TOKEN}`,
      },
    });
  
    const data = await response.json();
  
    res.status(response.status).json(data);
  }