const { execSync } = require('child_process');

async function main() {
  execSync('yarn --cwd scripts/upload-auth-permissions install', {
    stdio: 'inherit',
  });
  execSync('node scripts/upload-auth-permissions', {
    stdio: 'inherit',
  });
}

main()
  .then(() => {
    console.log('DONE POSTPUSH..');
    process.exit(0);
  })
  .catch(err => {
    console.log('ERROR: ', err);
    process.exit(1);
  });
