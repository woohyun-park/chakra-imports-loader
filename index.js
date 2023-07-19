const matcher = require("./matcher");

function replaceImportStatementsFromString(str, matcher) {
  if (typeof str !== "string") return;
  const imports = getImportsFromString(str);
  const chakraImports = imports["@chakra-ui/react"];
  const newImportStatement = getNewImportStatement(chakraImports, matcher);

  const toReplaceRegex = /import\s*{[^}]+}\s*from\s*'@chakra-ui\/react';/g;
  const toReplace = str.match(toReplaceRegex);

  return str.replace(toReplace, newImportStatement);
}

function getImportsFromString(str) {
  const importRegex = /import\s*{([\w\s,]+)}\s*from\s*'([^']+)';/g;

  let match;
  const imports = {};

  while ((match = importRegex.exec(str))) {
    const [, importedItems, module] = match;
    const items = importedItems.split(",").map((item) => item.trim());
    imports[module] = items;
  }
  return imports;
}

function getNewImportStatement(imports, matcher) {
  let result = "";

  [...imports].forEach((target) => {
    if (!target) return;
    const newPath = matcher[target.split(" ")[0]];
    const newImport = `import { ${target} } from '@chakra-ui/${newPath}';\n`;
    result += newImport;
  });
  return result;
}

module.exports = function chakraImportsLoader(content) {
  if (!content || typeof content !== "string") return content;
  return replaceImportStatementsFromString(content, matcher);
};
