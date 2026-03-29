const API_BASE_URL = (process.env.API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '');
const API_NINJAS_URL = process.env.API_NINJAS_URL || 'https://api.api-ninjas.com/v1/randomimage';
const API_NINJAS_KEY = process.env.API_NINJAS_KEY;
const SEED_PASSWORD = process.env.SEED_PASSWORD || 'EcoPulse123!';
const POSTS_PER_USER = Number(process.env.SEED_POSTS || 2);
const SEED_TAG = process.env.SEED_TAG || new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 12);

if (!API_NINJAS_KEY) {
  console.error('Missing API_NINJAS_KEY. Set it in your environment before running.');
  process.exit(1);
}

const users = [
  { name: 'Avery Parks', neighborhood_tag: 'Oakland' },
  { name: 'Jordan Vale', neighborhood_tag: 'Oakland' },
  { name: 'Morgan Reed', neighborhood_tag: 'Oakland' },
  { name: 'Casey Blake', neighborhood_tag: 'Rochester Hills County' },
  { name: 'Riley Hart', neighborhood_tag: 'Rochester Hills County' },
  { name: 'Taylor Quinn', neighborhood_tag: 'Rochester Hills County' }
];

const captions = [
  'Logged a neighborhood cleanup and shared the impact.',
  'Swapped a car trip for a bike ride today.',
  'Joined a community tree care day and met new neighbors.',
  'Did a home energy check and updated some habits.',
  'Helped organize a local green meetup.'
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const slugify = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '.')
  .replace(/^\.+|\.+$/g, '')
  .slice(0, 32);

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const message = data.error || data.message || response.statusText;
    const err = new Error(message);
    err.status = response.status;
    err.body = data;
    throw err;
  }

  return data;
};

const fetchRandomImageDataUrl = async () => {
  const response = await fetch(API_NINJAS_URL, {
    headers: { 'X-Api-Key': API_NINJAS_KEY }
  });

  if (!response.ok) {
    throw new Error(`Random image failed: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:${contentType};base64,${base64}`;
};

const registerOrLogin = async (user) => {
  const email = `${slugify(user.name)}+${SEED_TAG}@example.com`;
  try {
    return await requestJson(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: user.name,
        email,
        password: SEED_PASSWORD,
        neighborhood_tag: user.neighborhood_tag,
        country: 'United States'
      })
    });
  } catch (error) {
    if (error.status === 400 && /exists|already/i.test(error.message)) {
      return await requestJson(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password: SEED_PASSWORD
        })
      });
    }
    throw error;
  }
};

const createPosts = async (token, user) => {
  if (!POSTS_PER_USER) return;
  for (let i = 0; i < POSTS_PER_USER; i += 1) {
    const imageUrl = await fetchRandomImageDataUrl();
    const caption = captions[(i + user.name.length) % captions.length];
    const content = `${caption} (${user.neighborhood_tag})`;

    await requestJson(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        content,
        image_url: imageUrl
      })
    });

    await sleep(300);
  }
};

const run = async () => {
  console.log(`Seeding ${users.length} users at ${API_BASE_URL}`);
  console.log(`Seed tag: ${SEED_TAG}`);
  console.log(`Posts per user: ${POSTS_PER_USER}`);

  for (const user of users) {
    try {
      const auth = await registerOrLogin(user);
      await createPosts(auth.token, user);
      console.log(`Seeded ${user.name} (${user.neighborhood_tag})`);
    } catch (error) {
      console.error(`Failed to seed ${user.name}:`, error.message);
    }
  }

  console.log('Done.');
  console.log(`Password for all seeded users: ${SEED_PASSWORD}`);
};

run().catch((error) => {
  console.error('Seed script failed:', error.message);
  process.exit(1);
});
