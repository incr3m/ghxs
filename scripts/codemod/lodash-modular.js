// source: https://www.codeshiftcommunity.com/docs/import-manipulation/

// eslint-disable-next-line no-undef
module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const source = j(fileInfo.source);

  let changed = false;

  const muiIconsImportDeclaration = source
    .find(j.ImportDeclaration)
    .filter(path => path.node.source.value === 'lodash');

  muiIconsImportDeclaration.forEach(
    (
      muiIconImport, // Iterate over react imports
      index,
    ) => {
      muiIconImport.node.specifiers.forEach(importSrc => {
        const newImport = j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier(importSrc.local.name))],
          j.stringLiteral(`lodash/${importSrc.imported.name}`),
        );
        j(muiIconImport).insertAfter(newImport);
      });

      changed = true;

      j(muiIconImport).remove();
    },
  );

  if (changed) return source.toSource();
};
