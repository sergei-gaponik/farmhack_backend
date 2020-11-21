require('dotenv').config()

process.global = {
  maxDistanceFromHub: 80
}

const express = require('express')
const bodyParser = require('body-parser')
const { MongoClient } = require("mongodb")
const apiRouter = require('./api/router')
const EventEmitter = require('events')
const path = require("path")

const app = express()
const port = process.env.PORT || 8080

app.use('/assets', express.static(path.join(__dirname, 'assets/public')))
app.use('/*', bodyParser.urlencoded({ extended: true }))
app.use('/*', bodyParser.json())
app.use('/*', bodyParser.text())

app.use('/api', apiRouter)

const DBClient = new EventEmitter()
const DBOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true  
}

DBClient.on('connect', () => {

  MongoClient.connect(process.env.MONGODB_HOST, DBOptions).then(client => {

		process.mongoClient = {
			db: client.db(process.env.MONGODB_SCHEMA),
			reconnect: () => DBClient.emit('connect')
		}
		
		if(process.argv.includes("-d")){

      const debugPath = process.argv[process.argv.indexOf("-d") + 1]
      
			require(debugPath).test()
		}
		else{
      
      app.listen(port, () => console.log(`Server listening on port ${port}...`))
		}
  })
})

DBClient.emit('connect')
