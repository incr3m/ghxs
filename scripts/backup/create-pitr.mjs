import { pitrBackup } from './create-pitr-backup.js';
import { listAppsyncTables } from './fetch-appsync-tables.js';

const refDate = new Date('2022-10-03');

//emb-mbDev : 4z2bbl35sjexfmjimqumrkjzey
const API_ID = '4z2bbl35sjexfmjimqumrkjzey';
const SKIP_TABLES = ['AuditLog'];

const tableNames = await listAppsyncTables(API_ID);
console.log('>>backup/create-bak::', 'res', tableNames.length); //TRACE

for (const tableName of tableNames) {
  const shouldSkip = SKIP_TABLES.some(tbl => tableName.startsWith(`${tbl}-`));
  if (shouldSkip) {
    console.log('>>backup/create-bak::', 'skipping ', tableName); //TRACE
    continue;
  }
  await pitrBackup(tableName, refDate);
}
