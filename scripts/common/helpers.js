const path = require('path');
const fs = require('fs');

function getAwsExports() {
  // eslint-disable-next-line no-undef
  const filePath = path.join(__dirname, '..', '..', 'src', 'aws-exports.js');
  const txt = fs.readFileSync(filePath, 'utf8');
  const pre = 'const awsmobile = {',
    post = '};';
  const s = txt.indexOf(pre);
  const e = txt.lastIndexOf(post);
  const inner = txt.substring(s + pre.length, e);
  if (inner.length < 1) throw new Error('failed to get aws-exports');
  const json = `{${inner}}`;
  return JSON.parse(json);
}

// eslint-disable-next-line no-undef
module.exports = {
  getAwsExports,
};
