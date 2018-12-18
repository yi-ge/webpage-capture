const { proxyIP } = require('../config')

module.exports = () => {
  return proxyIP.get()
}
