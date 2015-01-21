/**
 * Proxibase request client
 */

var _ = require("lodash")
var inspect = require("util").inspect
var async = require("async")
var request = require("request")

// Basic Logger
var log = function(o, depth) {
  console.log(inspect(o, {depth: depth || 4, colors: true}))
}


// Module global privates
var _serviceUri = 'https://localhost:20678'
var _config = {
  serviceUri: _serviceUri,
  json: true,
}


// Get or Set the service uri
function serviceUri(uri) {
  if (_.isString(uri)) _serviceUri = uri
  return _serviceUri
}


// Get or set the module config options
function config(ops) {
  if (_.isObject(ops)) {
    _config = ops
  }
  if (_.isString(config.serviceUri)) serviceUri(config.serviceUri)
  return _config
}



// Return a client instance
function client(options) {
  return new Client(options)
}


// Constructor
function Client(options) {

  if (!(options && _.isPlainObject(options))) options = {}

  var defaults = {
    method: 'get',
    path: '',
    query: {},
    headers: {},
  }

  // Create a hidden _options property
  Object.defineProperty(this, '_options', {
    enumerable: false,
    value: _.extend(defaults, options)
  })

  return this
}


var methods = {

  // Incrementally build up the request query object
  query: function(obj) {
    this._options.query = _.merge(this._options.query, obj)
    return this
  },


  // Build up request path, adding slashes as needed
  path: function(pathPart) {
    var sep = (pathPart[0] === '/') ? '' : '/'
    this._options.path += sep + pathPart
    return this
  },


  // Get
  get: function(path) {
    this._options.method = 'get'
    if (path) this._options.path = path
    return this
  },


  // Post
  post: function(path) {
    this._options.method = 'post'
    if (path) this._options.path = 'path'
    return this
  },


  // Delete
  del: function(path) {
    this._options.method = 'del'
    if (path) this._options.path = path
    return this
  },


  // Incrementally attach form data
  formData: function(formData) {
    this._options.formData = this._options.formData || {}
    this._options.formData = _.extend(this._options.formData, formData)
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
  log: function() {
    this._options.log = true
    return this
  },


  // Build the request and return it without executing
  inspect: function() {
    return build(this._options)
  },


  // Build and execute the request
  end: function(cb) {
    if (!_.isFunction(cb)) return new Error('end expects a callback function')

    // Build the service request options
    var ops = build(this._options)

    if (this._options.log) log(ops)
    return request(ops, cb)
  },
}


// Build options for a service request
function build(_ops) {

  // Start with the _config options
  var ops = _.clone(_config)
  delete ops.serviceUri

  // Add in selected props from _options
  var ops = _.extend(ops, {
    url: _serviceUri + _ops.path,
    method: _ops.method,
    query: _ops.query,
  })

  // Merge in additional request-specific options
  ops = _.extend(ops, _ops.requestOptions)

  return ops

}


// Bootstrap the module
function init() {

  // Generate the client's contructors from methods
  Client.prototype = _.extend(Client.prototype, methods)

  // Generate the short-cut methods on the module itself.
  // These create a new client instance on the fly and
  // execute the specified method.
  for (var name in methods) {
    client[name] = function() {
      var cl = new Client()
      return cl[name].apply(null, arguments)
    }
  }
}


// Execute init on require
init()

log({client: client})


// Exports
module.exports = client
module.exports.Client = Client
module.exports.serviceUri = serviceUri
module.exports.config = config
