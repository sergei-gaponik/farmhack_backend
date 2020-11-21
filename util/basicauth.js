const { atob, btoa } = require('./base64')

module.exports.basicAuthDecode = authHeader => {
  try{
    return btoa(authHeader.split(" ")[1]).split(":")
  }
  catch(e){
    return null
  }
}

module.exports.basicAuthEncode = (username, password) => {
  if(username && password){
    try{
      return "Basic " + atob(`${username}:${password}`)
    }
    catch(e){
      return null
    }
  }
  else{
    return null
  }
}