// source: https://www.codeshiftcommunity.com/docs/import-manipulation/

// eslint-disable-next-line no-undef
module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const source = j(fileInfo.source);
  let changed = false;

  const muiIconsImportDeclaration = source
    .find(j.ImportDeclaration) // Find all nodes that match a type of `ImportDeclaration`
    .filter(path => path.node.source.value.startsWith('@mui/icons-material/')); // Filter imports by source equal to the target ie "react"

  const importSpecifiers = [];
  const importLength = muiIconsImportDeclaration.length;

  muiIconsImportDeclaration.forEach(
    (
      muiIconImport, // Iterate over react imports
      index,
    ) => {
      const muiImportName = muiIconImport.node.source.value.replace(
        '@mui/icons-material/',
        '',
      );
      const aliasName = muiIconImport.node.specifiers[0].local.name;
      console.log('>>codemod/mui-icons::', 'replacing > ', muiImportName, aliasName); //TRACE

      const importSpecifier = j.importSpecifier(
        j.identifier(muiImportName),
        j.identifier(aliasName),
      );

      importSpecifiers.push(importSpecifier);

      console.log(
        '>>codemod/mui-icons::',
        'importSpecifiers',
        importSpecifiers,
        importLength,
        index,
      ); //TRACE

      changed = true;
      if (importLength - 1 === index) {
        // Replace the existing node with a new one
        return j(muiIconImport).replaceWith(
          // Build a new import declaration node based on the existing one
          j.importDeclaration(
            importSpecifiers,
            // muiIconImport.node.specifiers, // copy over the existing import specificers
            j.stringLiteral('@mui/icons-material'), // Replace the source with our new source
          ),
        );
      } else {
        j(muiIconImport).remove();
      }
    },
  );

  if (changed) return source.toSource();
};
