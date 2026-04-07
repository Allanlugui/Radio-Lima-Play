import https from 'https';
import fs from 'fs';

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function run() {
  console.log('Downloading 192x192 PNG...');
  await download('https://placehold.co/192x192/f97316/ffffff/png?text=LP', 'public/pwa-192x192.png');
  console.log('Downloading 512x512 PNG...');
  await download('https://placehold.co/512x512/f97316/ffffff/png?text=Lima+Play', 'public/pwa-512x512.png');
  console.log('Icons downloaded successfully');
}
run();
