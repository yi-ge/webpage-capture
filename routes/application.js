const Joi = require('joi')
const GROUP_NAME = 'application';

module.exports = [
  {
    method: 'GET',
    path: `/${GROUP_NAME}/list`,
    handler(request, h) {
      return {
        status: 1
      }
    },
    config: {
      tags: ['api', GROUP_NAME],
      description: '列出所有Application'
    }
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/add`,
    handler(request, h) {
      return {
        status: 1
      }
    },
    config: {
      tags: ['api', GROUP_NAME],
      description: '列出所有Application'
    }
  }
]