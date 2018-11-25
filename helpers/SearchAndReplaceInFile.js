const fs = require("fs");

module.exports = function searchAndReplaceInFile(regexToFind, replacement, fileName, tmpFileName) {

  let fileContent = fs.readFileSync(fileName, "utf8")

  fileContent = fileContent.toString().replace(regexToFind, replacement);

  fs.writeFileSync(tmpFileName, fileContent)
}
