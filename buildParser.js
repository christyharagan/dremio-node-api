const fs = require('fs')
const path = require('path')
const jison = require('jison')
const ebnfParser = require('ebnf-parser')
const grammarFile = fs.readFileSync(path.join('.', 'src', 'sqlParser.jison'), 'utf8')
const grammar = ebnfParser.parse(grammarFile)

let parserCode = new jison.Generator(grammar).generateCommonJSModule()

fs.writeFileSync(path.join('.', 'out', 'parser.js'), parserCode, 'utf8')
