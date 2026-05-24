const sharp = require('sharp');
const path = require('path');

const input = path.join(__dirname, 'public', 'favicon.svg');

async function convert() {
  await sharp(input).resize(48, 48).png().toFile(path.join(__dirname, 'public', 'favicon-48.png'));
  await sharp(input).resize(192, 192).png().toFile(path.join(__dirname, 'public', 'favicon-192.png'));
  console.log('Done! favicon-48.png and favicon-192.png created.');
}

convert().catch(e => console.error(e));
