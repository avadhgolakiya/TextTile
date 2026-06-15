import fetch from 'node-fetch';
const urls = [
  "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=900&q=80",
  "https://res.cloudinary.com/demo/image/upload/sample.jpg"
];
async function check() {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log('CORS OK for', url, 'Headers:', res.headers.get('access-control-allow-origin'));
    } catch (e) {
      console.error('CORS FAILED for', url, e.message);
    }
  }
}
check();
