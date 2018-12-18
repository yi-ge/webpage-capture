const Joi = require('joi')
const {
  application
} = require('../config')
const redis = require('../lib/redis')
const uuid = require('uuid/v4')

const GROUP_NAME = 'application';

module.exports = [{
    method: 'GET',
    path: `/${GROUP_NAME}/list`,
    async handler (request) {
      if (request.headers.supersecret !== application.supersecret)
        return {
          status: 403,
          message: '超级密码不正确'
        }
      
      const datas = await redis.client.hgetallAsync('application')
      const list = []

      if (datas)
        for (n in datas) {
          list.push(JSON.parse(datas[n]))
        }

      return {
        status: 1,
        result: {
          list,
          total: list.length
        }
      }
    },
    config: {
      tags: ['api', GROUP_NAME],
      description: '列出所有 Application',
      validate: {
        headers: Joi.object({
          // 'supersecret': Joi.string().required().valid(application.supersecret).description('超级密码'),
          'supersecret': Joi.string().required().description('超级密码'),
        }).unknown()
      }
    }
  },
  {
    method: 'POST',
    path: `/${GROUP_NAME}/edit`,
    async handler (request) {
      if (request.headers.supersecret !== application.supersecret)
        return {
          status: 403,
          message: '超级密码不正确'
        }

      const lists = request.payload

      // lists.map(async list => { // 这里是async，不能用map
      //   if (!list.id) {
      //     list.id = '' + await redis.client.incrAsync('ids')
      //     list.token = uuid().replace(/-/g, '')
      //   }
      //   return list
      // })

      for (const n in lists) {
        if (!lists[n].id) {
          lists[n].id = (await redis.client.incrAsync('ids')).toString()
          lists[n].token = uuid().replace(/-/g, '')
        }
      }

      const datas = []
      const tokens = []

      for (const n in lists) {
        datas.push('id_' + lists[n].id) // int to string
        datas.push(JSON.stringify(lists[n]))
        tokens.push(lists[n].token)
        tokens.push(lists[n].id)
      }

      const task = [
        redis.client.hmsetAsync('application', datas),
        redis.client.hmsetAsync('token', tokens),
      ]

      return {
        status: 1,
        massage: (await Promise.all(task)).join(','),
        result: {
          list: lists
        }
      }
    },
    config: {
      tags: ['api', GROUP_NAME],
      description: '添加/编辑 Application',
      validate: {
        headers: Joi.object({
          'supersecret': Joi.string().required().description('超级密码'),
        }).unknown(),
        payload: Joi.array().items(
          Joi.object().keys({
            id: Joi.string().description('编辑传，添加不传'),
            name: Joi.string().required().description('Application 名称'),
            token: Joi.string().description('编辑传，添加不传')
          }),
        )
      }
    }
  },
  {
    method: 'DELETE',
    path: `/${GROUP_NAME}/del`,
    async handler (request) {
      if (request.headers.supersecret !== application.supersecret)
        return {
          status: 403,
          message: '超级密码不正确'
        }

      const tokenResult = await redis.client.hget('application', 'id_' + request.payload.id)

      const token = JSON.parse(tokenResult).token

      if (!token)
        return {
          status: 2,
          massage: '找不到相应的应用信息'
        }

      const task = [
        redis.client.hdelAsync('application', 'id_' + request.payload.id),
        redis.client.hdelAsync('token', token)
      ]

      return {
        status: 1,
        result: await Promise.all(task)
      }
    },
    config: {
      tags: ['api', GROUP_NAME],
      description: '添加/编辑 Application',
      validate: {
        headers: Joi.object({
          'supersecret': Joi.string().required().description('超级密码'),
        }).unknown(),
        payload: {
          id: Joi.string().required().description('要删除的id')
        }
      }
    }
  }
]