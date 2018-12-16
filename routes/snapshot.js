const Joi = require('joi')
const redis = require('../lib/redis')
const q = require('../lib/kue')

const GROUP_NAME = 'snapshot';

module.exports = [{
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
    method: 'POST',
    path: `/${GROUP_NAME}/add`,
    handler(request, h) {

      // redis.rpushAsync('snapshot', {})

      const urls = request.payload

      urls.map(url => {
        var job = q.create('snapshot', {
          url
        }).save(function (err) {
          if (!err) console.log(job.id);
        }).on('complete', function (result){
          console.log('Job completed with data: ', result);
        })
      })

      return {
        status: 1,
        result: 'ok'
      }
    },
    config: {
      tags: ['api', GROUP_NAME],
      description: '列出所有正在执行的任务',
      validate: {
        payload: Joi.array().items(Joi.string().required().description('URL链接'))
      }
    }
  }
]