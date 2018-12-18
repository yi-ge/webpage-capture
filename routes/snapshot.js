const Joi = require('joi')
const redis = require('../lib/redis')
const q = require('../lib/kue')
const axios = require('axios')
const uuid = require('uuid/v4')
const { kueAuthConfig, kueApiConfig, kueServerConfig } = require('../config')

const $request = axios.create({
  baseURL: `http://${kueServerConfig.host}:${kueServerConfig.port}${kueApiConfig.path}/`,
  auth: {
    username: kueAuthConfig.username,
    password: kueAuthConfig.password
  }
})

const GROUP_NAME = 'snapshot';

module.exports = [
  {
    method: 'GET',
    path: `/${GROUP_NAME}/stats`,
    async handler () {

      try{
        const kueStats = await $request.get('/stats')

        return {
          status: 1,
          result: {
            kueStats: kueStats.data
          }
        }
      } catch (err) {
        return {
          status: 0,
          message: err
        }
      }
    },
    config: {
      tags: ['api', GROUP_NAME],
      description: '获取系统总状态'
    }
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/list`,
    async handler (request) {
      const application = await redis.client.hgetAsync('token', request.query.token)

      if (!application)
        return {
          status: 3,
          massage: 'token校检失败'
        }

      // 返回所有任务id

      return {
        status: 1,
        result: {
          list: await redis.client.zrangeAsync('z_' + application, request.query.page - 1, request.query.page - 1 + request.query.size)
        }
      }
    },
    config: {
      tags: ['api', GROUP_NAME],
      description: '列出所有任务的ID',
      validate: {
        query: {
          token: Joi.string().required().description('Token'),
          size: Joi.number().integer().min(1).default(20)
            .description('每页的条目数'),
          page: Joi.number().integer().min(1).default(1)
            .description('页码数')
        }
      }
    }
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/create`,
    async handler (request) {
      try {
        const application = await redis.client.hgetAsync('token', request.query.token)

        if (!application)
          return {
            status: 3,
            massage: 'token校检失败'
          }

        const urls = request.payload.urls
        const proxy = request.payload.proxy

        const datas = []

        for (const n in urls) {
          datas.push(urls[n])
          datas.push('')
        }

        const id = (await redis.client.incrAsync('ids_' + application)).toString()

        await redis.client.hmsetAsync('t_' + application + '_' + id, datas)

        await redis.client.zaddAsync('z_' + application, id, id)

        urls.map(url => {
          var job = q.create('t_' + application + '_' + id, {
            application,
            id,
            url,
            proxy
          }).save((err) => {
            if (!err) console.log('id:', job.id, '已压入');
          })
        })

        q.create('snapshot', {
          key: 't_' + application + '_' + id
        }).save((err) => {
          if (err) console.log(err);
        })

        return {
          status: 1,
          result: {
            id
          }
        }
      } catch (err) {
        console.log(err)
      }
    },
    config: {
      tags: ['api', GROUP_NAME],
      description: '创建新任务',
      validate: {
        payload: {
          urls: Joi.array().items(Joi.string().required().description('URL链接')),
          proxy: Joi.array().items(Joi.string().description('代理地址')),
        },
        query: {
          token: Joi.string().required().description('Token')
        }
      }
    }
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/detail`,
    async handler (request) {
      const id = request.query.id
      const application = await redis.client.hgetAsync('token', request.query.token)

      if (!application)
        return {
          status: 3,
          massage: 'token校检失败'
        }

      const task = {
        total: redis.client.hlenAsync('t_' + application + '_' + id),
        active: $request.get(`/jobs/${'t_' + application + '_' + id}/active/stats`),
        inactive: $request.get(`/jobs/${'t_' + application + '_' + id}/inactive/stats`),
        failed: $request.get(`/jobs/${'t_' + application + '_' + id}/failed/stats`),
        complete: $request.get(`/jobs/${'t_' + application + '_' + id}/complete/stats`),
        delayed: $request.get(`/jobs/${'t_' + application + '_' + id}/delayed/stats`)
      }

      try {
        const result = await Promise.all(Object.values(task))

        return {
          status: 1,
          result: {
            total: result[0],
            active: result[1].data.count,
            inactive: result[2].data.count,
            failed: result[3].data.count,
            complete: result[4].data.count,
            delayed: result[5].data.count,
          }
        }
      } catch (err) {
        console.log(err)
        return {
          status: 1,
          message: err
        }
      }
    },
    config: {
      tags: ['api', GROUP_NAME],
      description: '根据任务ID获取任务详情',
      validate: {
        query: {
          token: Joi.string().required().description('Token'),
          id: Joi.string().required().description('任务ID')
        }
      }
    }
  },
  {
    method: 'GET',
    path: `/${GROUP_NAME}/urls`,
    async handler (request) {
      const id = request.query.id
      const application = await redis.client.hgetAsync('token', request.query.token)

      if (!application)
        return {
          status: 3,
          massage: 'token校检失败'
        }

      return {
        status: 1,
        result: {
          list: await redis.client.hgetallAsync('t_' + application + '_' + id)
        }
      }
    },
    config: {
      tags: ['api', GROUP_NAME],
      description: '根据任务ID获取地址列表',
      validate: {
        query: {
          token: Joi.string().required().description('Token'),
          id: Joi.string().required().description('任务ID')
        }
      }
    }
  }
]