/**
 * Proxibase request client
 */

var _ = require("lodash")
var util = require("util")
var request = require("request")
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
  if (_.isObject(ops)) {
    _config = ops
  }
  if (_.isString(ops.serviceUri)) client.serviceUri(ops.serviceUri)
  return _config
}


//
// Client instance methods
//


// Incrementally build up the request query object
Client.prototype.query = function(obj) {
  this._options.query = extend(this._options.query, obj)
  return this
}


// Build up request path, adding slashes as needed
Client.prototype.path = function(pathPart) {
  var sep = (pathPart[0] === '/') ? '' : '/'
  this._options.path += sep + pathPart
  return this
}


// Get
Client.prototype.get = function(path) {
  this._options.method = 'get'
  if (path) this._options.path = path
  return this
}


// Post
Client.prototype.post = function(path) {
  this._options.method = 'post'
  if (path) this._options.path = 'path'
  return this
}


// Delete
Client.prototype.del = function(path) {
  this._options.method = 'del'
  if (path) this._options.path = path
  return this
}


// Incrementally attach form data
Client.prototype.formData = function(formData) {
  this._options.formData = this._options.formData || {}
  this._options.formData = extend(this._options.formData, formData)
  return this
}


// Set other arbitrary request options
Client.prototype.options = function(options) {

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
}


// Log request options before executing
Client.prototype.debug = function() {
  this._options.debug = true
  return this
}


// Build and execute the request
Client.prototype.end = function(cb) {
  if (!_.isFunction(cb)) return new Error('end expects a callback function')

  // Build the service request options
  var ops = build(this._options)

  if (this._options.debug) log({debugRequest: ops})
  return request(ops, cb)
}


// Build options for a service request
function build(_ops) {

  // Start with the _config options
  var ops = _.clone(_config)
  delete ops.serviceUri

  // Add in selected props from _options
  ops = extend(ops, {
    url: _serviceUri + _ops.path,
    method: _ops.method,
    query: _ops.query,
  })

  // Merge in additional request-specific options
  ops = extend(ops, _ops.requestOptions)

  return ops
}



// Generate methods on the module itself that will
// create a new client instnace on the fly and apply
// arguments to it
Object.keys(Client.prototype).forEach(function(method) {
  client[method] = function() {
    var cl = client()
    return cl[method].apply(cl, arguments)
  }
})


module.exports = client
