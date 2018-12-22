const { proxyIP } = require('../config')

module.exports = (getProxyIP) => {
  return proxyIP.get(getProxyIP)
}
