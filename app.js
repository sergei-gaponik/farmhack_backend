require('dotenv').config()
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const https = require("https")
const http = require('http')
const fs = require("fs")
const user = require("./util/user")
const { MongoClient } = require("mongodb")
const cookieSession = require("cookie-session")
const updateSettings = require('./util/updateSettings')

const routes = {
	feed: require('./routes/router_feed'),
	api: require('./routes/router_api'),
	root: require('./routes/router_root'),
	webhook: require('./routes/router_webhook')
}

const app = express()
const port = process.env.PORT || 8080

app.use('/webhook/*', bodyParser.raw({type: '*/*'}))
app.use('/*', bodyParser.urlencoded({ extended: true }))
app.use('/*', bodyParser.json())
app.use('/*', bodyParser.text())

app.use(cookieSession({ name: 'session', keys: [process.env.SESSION_KEY_1, process.env.SESSION_KEY_2] }))

app.use('/assets', express.static(path.join(__dirname, 'assets/public')))
app.use('/api', routes.api)
app.use('/feed', routes.feed)
app.use('/webhook', routes.webhook)
app.use('/', routes.root)

const DBClient = new EventEmitter()
const DBOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true  
}

DBClient.on('connect', () => {

  MongoClient.connect(process.env.MONGODB_HOST, DBOptions).then(client => {

		process.mongoClient = {
			db: client.db(process.env.MONGODB_NAME),
			reconnect: () => DBClient.emit('connect')
		}
		
		if(process.argv.includes("-d")){

			const debugPath = process.argv[process.argv.indexOf("-d") + 1]
			logger.new("app", "Debug...", 10)

			require(debugPath).test()
		}
		else{

			if(port == 443){

				const sslOptions = {
					key: fs.readFileSync(process.env.HTTPS_KEY),
					cert: fs.readFileSync(process.env.HTTPS_CERT)
				}
	
				const sslApp = https.createServer(sslOptions, app)
				
				sslApp.listen(port, () => logger.new("app", `Server listening on port ${port}...`, 10))
	
				http.createServer((req, res) => {
					res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
					res.end()
				}).listen(80)
			}
			else{
				app.listen(port, () => logger.new("app", `Server listening on port ${port}...`, 10))
			}
		}
  })
})

DBClient.emit('connect')
