const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const { download } = require('../libs/fetch');
const config = require('./config');

const LINE_SEP = `
`;

async function main() {
  // eslint-disable-next-line no-undef
  const authGroupsPath = path.join(__dirname, '../../apps/main/public/auth-groups.json');
  await download(`${config.devUrl}/auth-groups.json`, authGroupsPath);

  const authGroups = JSON.parse(fs.readFileSync(authGroupsPath), 'utf8');
  const modules = {};

  for (const perm of authGroups) {
    const [moduleName, ...resources] = perm.split('.');

    if (resources.length > 1) {
      const op = resources.pop();
      const resource = resources.join('.');
      console.log('>>cdk/pull-dev-auth-groups::', 'op,resources', op, resource); //TRACE

      const keyPath = [moduleName, resource];
      const ops = _.get(modules, keyPath, []);

      ops.push(op);

      _.set(modules, keyPath, ops);
    } else {
      continue;
    }
  }
  console.log('>>cdk/pull-dev-auth-groups::', 'modules', modules); //TRACE

  const moduleTypes = [];

  for (const moduleName in modules) {
    let rsc = '';
    for (const resourceName in modules[moduleName]) {
      const ops = modules[moduleName][resourceName].map(v => `'${v}'`).join(' | ');
      rsc += `${LINE_SEP}    '${resourceName}': ${ops}`;
    }
    moduleTypes.push(`${LINE_SEP}'${moduleName}': {${rsc}${LINE_SEP}}`);
  }

  const text = `// AUTO-GENERATED FILE: don't modify. run "yarn pull-auth-groups" to update
export type TPermModules = {${moduleTypes.join(',')}}`;

  fs.writeFileSync(
    // eslint-disable-next-line no-undef
    path.join(__dirname, '../../apps/main/src/interface/permission.interface.ts'),
    text,
  );
}

main();
