// like require-context
const fs = require('fs')
const path = require('path')

const modules = []

const files = fs.readdirSync(__dirname).filter((file) => {
  return file.match(/\.(json|js)$/)
})

files.forEach(key => {
  if (key === 'index.js') return

  const content = require(path.join(__dirname, key))

  if (Array.isArray(content)) { modules.push(...content) } else { modules.push(content) }
})

module.exports = modules
