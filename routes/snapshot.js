const Joi = require('joi')
const GROUP_NAME = 'snapshot';

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
      description: '列出所有正在执行的任务',
      validate: {
        query: {
          size: Joi.number().integer().min(1).default(50)
            .description('每页的条目数'),
          page: Joi.number().integer().min(1).default(1)
            .description('页码数')
        }
      }
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
      description: '列出所有正在执行的任务',
      validate: {
        query: {
          size: Joi.number().integer().min(1).default(50)
            .description('每页的条目数'),
          page: Joi.number().integer().min(1).default(1)
            .description('页码数')
        }
      }
    }
  }
]