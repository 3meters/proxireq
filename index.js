/**
 * Proxibase request client
 */

var _ = require("lodash")
var util = require("util")
var request = require("request")
var superagent = require("superagent")
var extend = _.extend

// Basic Logger
var log = function(o, depth) {
  console.log(util.inspect(o, {depth: depth || 4, colors: true}))
}


// Module global privates
var _serviceUri = 'https://localhost:20678'
var _config = {
  serviceUri: _serviceUri,
  json: true,
  headers: {
    "Content-type": "application/json"
  }

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


// Get or Set the service uri
client.serviceUri = function(uri) {
  if (_.isString(uri)) _serviceUri = uri
  return _serviceUri
}


// Get or set the module config options
client.config = function(ops) {
  if (_.isObject(ops)) _config = ops
  if (_.isString(ops.serviceUri)) client.serviceUri(ops.serviceUri)
  return _config
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
    return this
  },


  // Delete
  del: function(path) {
    this._options.method = 'del'
    if (path) this._options.path = path
    return this
  },


  // Incrementally build up the request query object
  query: function(obj) {
    this._options.query = extend(this._options.query, obj)
    return this
  },


  // Build up request path, adding slashes as needed
  path: function(pathPart) {
    var sep = (pathPart[0] === '/') ? '' : '/'
    this._options.path += sep + pathPart
    return this
  },


  // Data to post in the body
  send: function(body) {
    this._options.body = body
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


  // Build and execute the request
  endOld: function(cb) {
    if (!_.isFunction(cb)) return new Error('end expects a callback function')

    var _options = this._options

    // Start with the _config options
    var options = _.clone(_config)
    delete options.serviceUri

    // Add in selected props from _options
    options = extend(options, {
      url: _serviceUri + _options.path,
      method: _options.method,
      query: _options.query,
    })

    // Merge in additional request-specific options
    options = extend(options, _options.requestOptions)

    // Debug request options if needed
    if (_options.debug) log({debugRequest: options})

    return request(options, cb)
  },

  // Build and execute the request
  end: function(cb) {
    if (!_.isFunction(cb)) return new Error('end expects a callback function')

    var _ops = this._options
    _ops.url = _serviceUri + _ops.path

    // Debug request options if needed
    if (_ops.debug) log({debugRequestOptions: _ops})

    superagent[_ops.method](_ops.url)
      // .query(_ops.query)
      // .send(_ops.send)
      .end(function(err, res) {
        if (err) return cb(err)
        cb(err, res, res.body)
      })

  }
}

// Prune cruft
delete methods.options
delete methods.endOld


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
