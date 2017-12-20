// Node.js core dependencies
const path = require('path')

// Please leave here even though it looks unused - this enables Node.js metrics to be pushed to Hosted Graphite
require(path.join(__dirname, '/app/utils/metrics')).metrics()

// NPM dependencies
const express = require('express')
const nunjucks = require('nunjucks')
const httpsAgent = require('https').globalAgent
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const clientSession = require('client-sessions')
const logger = require('winston')
const loggingMiddleware = require('morgan')
const argv = require('minimist')(process.argv.slice(2))
const flash = require('connect-flash')
const staticify = require('staticify')(path.join(__dirname, 'public'))

// Custom dependencies
const router = require(path.join(__dirname, '/app/routes'))
const noCache = require(path.join(__dirname, '/app/utils/no_cache'))
const customCertificate = require(path.join(__dirname, '/app/utils/custom_certificate'))
const proxy = require(path.join(__dirname, '/app/utils/proxy'))
const auth = require(path.join(__dirname, '/app/services/auth_service'))
const middlwareUtils = require(path.join(__dirname, '/app/utils/middleware'))
const errorHandler = require(path.join(__dirname, '/app/middleware/error_handler'))
const nunjucksFilters = require('./app/utils/nunjucks-filters')
const cookieConfig = require('./config/cookie')

// Global constants
const port = (process.env.PORT || 3000)
const unconfiguredApp = express()
const {NODE_ENV} = process.env
const CSS_PATH = staticify.getVersionedPath('/stylesheets/application.css')
const JAVASCRIPT_PATH = staticify.getVersionedPath('/js/application.js')

function warnIfAnalyticsNotSet () {
  if (typeof process.env.ANALYTICS_TRACKING_ID === 'undefined') {
    logger.warn('Google Analytics Tracking ID [ANALYTICS_TRACKING_ID] is not set')
  }
}

function initialiseGlobalMiddleware (app) {
  app.use(cookieParser())
  logger.stream = {
    write: function (message) {
      logger.info(message)
    }
  }
  if (!process.env.DISABLE_REQUEST_LOGGING === 'true') {
    app.use(/\/((?!public|favicon.ico).)*/, loggingMiddleware(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - total time :response-time ms'))
  }
  app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')))
  app.use(staticify.middleware)

  app.use(function (req, res, next) {
    res.locals.asset_path = '/public/'
    res.locals.routes = router.paths
    if (typeof process.env.ANALYTICS_TRACKING_ID === 'undefined') {
      res.locals.analyticsTrackingId = '' // to not break the app
    } else {
      res.locals.analyticsTrackingId = process.env.ANALYTICS_TRACKING_ID
    }
    noCache(res)
    next()
  })

  app.use(middlwareUtils.excludingPaths(['/healthcheck'], function (req, res, next) {
    // flash requires sessions which also excludes healthcheck endpoint (see below)
    res.locals.flash = req.flash()
    next()
  }))

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
}

function initialiseProxy (app) {
  app.enable('trust proxy')
  proxy.use()
}

function initialiseTemplateEngine (app) {
  // Configure nunjucks
  // see https://mozilla.github.io/nunjucks/api.html#configure
  const nunjucksEnvironment = nunjucks.configure([
    path.join(__dirname, '/govuk_modules/govuk_template/views/layouts'),
    path.join(__dirname, '/app/views')
  ], {
    express: app, // the express app that nunjucks should install to
    autoescape: true, // controls if output with dangerous characters are escaped automatically
    throwOnUndefined: false, // throw errors when outputting a null/undefined value
    trimBlocks: true, // automatically remove trailing newlines from a block/tag
    lstripBlocks: true, // automatically remove leading whitespace from a block/tag
    watch: NODE_ENV !== 'production', // reload templates when they are changed (server-side). To use watch, make sure optional dependency chokidar is installed
    noCache: NODE_ENV !== 'production' // never use a cache and recompile templates each time (server-side)
  })

  // Set view engine
  app.set('view engine', 'njk')

  // Version static assets on production for better caching
  // if it's not production we want to re-evaluate the assets on each file change
  nunjucksEnvironment.addGlobal('css_path', NODE_ENV === 'production' ? CSS_PATH : staticify.getVersionedPath('/stylesheets/application.css'))
  nunjucksEnvironment.addGlobal('js_path', NODE_ENV === 'production' ? JAVASCRIPT_PATH : staticify.getVersionedPath('/js/application.js'))

  // Load custom Nunjucks filters
  for (let name in nunjucksFilters) {
    let filter = nunjucksFilters[name]
    nunjucksEnvironment.addFilter(name, filter)
  }
}

function initialisePublic (app) {
  app.use('/public', express.static(path.join(__dirname, '/public')))
  app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit')))
  app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_template/assets')))
}

function initialiseRoutes (app) {
  router.bind(app)
}

function initialiseTLS () {
  if (process.env.DISABLE_INTERNAL_HTTPS !== 'true') {
    customCertificate.addCertsToAgent(httpsAgent)
  } else {
    logger.warn('DISABLE_INTERNAL_HTTPS is set.')
  }
}

function initialiseAuth (app) {
  auth.initialise(app)
}

function initialiseCookies (app) {
  app.use(middlwareUtils.excludingPaths(['/healthcheck'], clientSession(cookieConfig.session)))
  app.use(middlwareUtils.excludingPaths(['/healthcheck'], clientSession(cookieConfig.gatewayAccount)))
  app.use(middlwareUtils.excludingPaths(['/healthcheck'], clientSession(cookieConfig.registration)))
}

function initialiseErrorHandling (app) {
  app.use(errorHandler)
}

function listen () {
  const app = initialise()
  app.listen(port)
  logger.log('Listening on port ' + port)
}

/**
 * Configures app
 * @return app
 */
function initialise () {
  const app = unconfiguredApp
  app.disable('x-powered-by')
  app.use(flash())
  initialiseTLS(app)
  initialiseProxy(app)

  initialiseCookies(app)
  initialiseAuth(app)
  initialiseGlobalMiddleware(app)
  initialiseTemplateEngine(app)
  initialiseRoutes(app)
  initialisePublic(app)
  initialiseErrorHandling(app)

  warnIfAnalyticsNotSet()

  return app
}

/**
 * Starts app after ensuring DB is up
 */
function start () {
  listen()
}

// immediately invoke start if -i flag set. Allows script to be run by task runner
if (argv.i) {
  start()
}

module.exports = {
  start: start,
  getApp: initialise,
  staticify: staticify
}
