// List Sites
import fetch from 'node-fetch';
export const listSites = async (req, res) => {
  console.log('SItes need: ', req.webflowAccessToken);
  try {
    const response = await fetch(`https://api.webflow.com/v2/sites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${req.webflowAccessToken}`
      },
      credentials: 'include'
    });
    const data = await response.json();
    // const data = await req.webflow.sites.list();
    res.json(data); // Respond with Site Data
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).send('Failed to fetch sites');
  }
};
