/**
 * Proxibase request client
 */

var _ = require("lodash")
var util = require("util")
var request = require("request")
var extend = _.extend

// Basic Logger
var log = function(o) {
  console.log(util.inspect(o, {depth: 12, colors: true}))
}


// Return a client instance
function client() {
  return new Client()
}


// Constructor
function Client() {
  // Create a hidden _options property
  Object.defineProperty(this, '_options', {
    enumerable: false,
    value: {
      method: 'get',
      path: '',
      query: {},
      headers: {},
    }
  })
}


// Make exendable
client.Client = Client


// Module config options
var _config = {
  serviceUri: '127.0.0.1',
  json: true,
}


// Get or set module config
client.config = function(ops) {

  // set and return the configurated module
  // e.g. var request = require('proxireq').config({serviceUri: <uri>})
  if (ops) {
    if (_.isString(ops)) _config.serviceUri = ops
    if (_.isObject(ops)) _config = _.extend(_config, ops)
    return client
  }

  // return the config options
  else return _config
}


//
// Client instance methods
//
var methods = {

  // Get
  get: function(path) {
    this._options.method = 'get'
    if (path) this._options.path = path
    return this
  },


  // Post
  post: function(path) {
    this._options.method = 'post'
    if (path) this._options.path = path
    if (!this._options.body) this._options.body = {}
    return this
  },


  // Delete
  del: function(path) {
    this._options.method = 'delete'
    if (path) this._options.path = path
    return this
  },


  // Incrementally build up the request query object
  query: function(obj) {
    this._options.query = extend(this._options.query, obj)
    return this
  },


  // Set the path
  path: function(path) {
    this._options.path = path
    return this
  },


  // Build up request path, adding slashes as needed
  pathAdd: function(pathPart) {
    if (!pathPart) return this
    var sep = (pathPart[0] === '/') ? '' : '/'
    this._options.path = this._options.path || ''
    this._options.path += sep + pathPart
    return this
  },


  // Data to post in the body
  body: function(data) {
    this._options.body = data
    return this
  },


  // Set other arbitrary request options
  options: function(options) {

    if (_.isObject(options)) {

      // Ignore options that have other setters
      delete options.url
      delete options.uri
      for (var key in options) {
        if (this[key]) delete options[key]
      }

      this._options.requestOptions = options
    }
    return this
  },


  // Log request options before executing
  debug: function() {
    this._options.debug = true
    return this
  },


  // Build and execute the request using Mikael's request
  end: function(cb) {
    if (!_.isFunction(cb)) return new Error('end expects a callback function')

    var _options = this._options

    // Start with the _config options
    var options = _.clone(_config)
    delete options.serviceUri

    // Merge in additional request-specific options
    options = extend(options, _options.requestOptions)

    if (_options.path.length && _options.path[0] !== '/') {
      _options.path = '/' + _options.path
    }

    // Add in selected props from _options
    options = extend(options, {
      url: _config.serviceUri + _options.path,
      method: _options.method,
      qs: _options.query,
    })
    if (_options.body) options.body = _options.body

    // Debug request options if needed
    if (_options.debug) log({proxireq: options})

    // Add a little response suger
    request(options, function(err, res, body) {
      if (err) return cb(err)
      res.status = res.statusCode
      if (body && res.status >= 200 && res.status < 400) res.ok = true
      else res.ok = false
      cb(err, res, body)
    })
  },
}


// Aliases
methods.sign = methods.query
methods.delete = methods.del
methods.remove = methods.del
methods.send = methods.body


// Generate the methods that will be inherited by each client instance
Client.prototype = extend(Client.prototype, methods)


// Generate methods on the module itself that will create a new client
// instnace on the fly and apply arguments to it
Object.keys(Client.prototype).forEach(function(method) {
  client[method] = function() {
    var cl = client()
    return cl[method].apply(cl, arguments)
  }
})


module.exports = client
