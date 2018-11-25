const fs = require('fs')
const cleaner = require('clean-html')

module.exports = function cleanHtml(tmpFileName, fileName) {

    let fileContent = fs.readFileSync(tmpFileName, 'utf8')

    cleaner.clean(fileContent, (html) => {
      fs.writeFileSync(fileName, html)
    })
}
