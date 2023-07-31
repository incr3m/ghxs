const clients = require('./clients.json');

const [, clientKey, ...rest] = process.argv.slice(2);

// npx handpick --target=devDependencies --manager=yarn

const cfg = clients[clientKey];
if (!cfg) throw new Error('Key not found');

console.log('>>cdk/index::', 'cfg', cfg); //TRACE
const { _profile, ...config } = cfg;
console.log('>>cdk/index::', '_profile', _profile); //TRACE
delete cfg['_profile'];
console.log('>>cdk/index::', '_profile', JSON.stringify(config)); //TRACE

// eslint-disable-next-line no-undef
cd('../../cdk-backend');

await $`yarn build`;

const cdkArgs = rest.join(' ') || `deploy ${clientKey} --outputs-file ./cdk-outputs.json`;

// APPDATA: process.env.APPDATA,
process.env.AWS_PROFILE = _profile;
process.env.EMB_CONFIG = JSON.stringify(config);

await $`yarn cdk ${cdkArgs.split(' ')}`;
