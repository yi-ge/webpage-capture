module.exports = {
  apps: [{
    name: 'webpage-capture',
    script: './app.js',
    mode: 'cluster',
    instances: 1,
    watch: true
  }]
}
