/**
 * Proxireq tests
 */

var assert = require("assert")
// var assert = require("better-assert")
// var assert = require("chai").assert

var _ = require("lodash")
var tipe = require("tipe")
var util = require("util")
var serviceUri = require('./config.json').serviceUri

// Logger
var log = function(o, depth) {
  console.log(util.inspect(o, {hidden: true, depth: depth || 4, colors: true}))
}

var proxireq = require("../")

var methods = {
  path: true,
  query: true,
  options: true,
  formData: true,
  log: true,
  get: true,
  post: true,
  del: true,
  inspect: true,
  end: true,
}


describe('Proxireq', function() {

  it('can get and set its serviceUri', function() {
    assert(_.isFunction(proxireq.serviceUri))
    assert(_.isString(proxireq.serviceUri()))
    assert(serviceUri === proxireq.serviceUri(serviceUri))
  })

  it('should return a proxireq.Client instance', function() {

    assert(_.isFunction(proxireq))
    var client = proxireq()

    assert(_.isObject(client))
    assert(client instanceof proxireq.Client)

    for (var key in client) {
      assert(key !== '_options', key)     // _options is non-enumerable
    }
    assert(_.isObject(client._options))   // _options exists
  })

  it('should have all its methods', function() {
    var client = proxireq()
    for (var method in methods) {
      assert(_.isFunction(client[method]), method)
    }
  })

  it('should not have any extra methods', function() {
    var client = proxireq()
    _.functions(client).forEach(function(fnName) {
      assert(methods[fnName], fnName)
    })
  })

  it('should work', function(done) {
    var client = proxireq().get().end(function(err, res, body) {
      assert(!err, err)
      assert(res)
      assert(body)
      done()
    })
  })

})

