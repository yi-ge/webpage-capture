const inert = require('inert')
const vision = require('vision')
const pack = require('../package')
const hapiSwagger = require('hapi-swagger')

const swaggerOptions = {
  info: {
    title: 'Webpage Capture API Documentation',
    version: pack.version
  },
  // 定义接口以 tags 属性定义为分组
  grouping: 'tags',
  tags: [
    {
      name: 'snapshot',
      description: '网页快照'
    },
    {
      name: 'application',
      description: '应用管理'
    }
  ]
}

module.exports = [
  inert,
  vision,
  {
    plugin: hapiSwagger,
    options: swaggerOptions
  }
]