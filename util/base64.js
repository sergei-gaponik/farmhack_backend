
module.exports.btoa = data => Buffer.from(data, 'base64').toString('ascii')
module.exports.atob = data => Buffer.from(data).toString('base64')