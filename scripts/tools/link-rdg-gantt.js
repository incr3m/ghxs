/* eslint-disable no-undef */
const fs = require('fs-extra');
const path = require('path');

(async function () {
  const embraceComponentsPath = path.join(__dirname, '..', '..', 'src/components');
  const rdgGantPath = path.join(__dirname, '..', '..', '..', 'rdg-gantt/src/components');

  const sourcePath = path.join(rdgGantPath, 'RdgGantt');
  const targetPath = path.join(embraceComponentsPath, 'RdgGantt');

  console.log(
    '>>tools/link-rdg-gantt::',
    'embraceComponentsPath',
    sourcePath,
    targetPath,
  ); //TRACE

  if (fs.existsSync(targetPath)) {
    const isCorrect =
      fs.lstatSync(sourcePath).isSymbolicLink() &&
      fs.realpathSync(sourcePath) === targetPath;
    if (isCorrect) console.log(`Skipping '${sourcePath}' since it is already linked`);
    else throw new Error(`'${targetPath}' is already linked to another directory`);
  }

  fs.moveSync(sourcePath, targetPath);
  fs.symlinkSync(targetPath, sourcePath, 'junction');
  console.log(`Linked ${sourcePath} <==> ${targetPath}`);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
