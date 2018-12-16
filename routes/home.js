module.exports = {
  method: 'GET',
  path: '/',
  handler () {
    return {
      status: 1,
      massage: '请查询API文档获取详细信息'
    }
  }
}