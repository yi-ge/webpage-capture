module.exports = {
  apps : [{
    name: "webpage-capture",
    script: "./app.js",
    mode: "cluster",
    instances: 4
  }]
}