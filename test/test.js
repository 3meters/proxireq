/**
 * Proxireq tests
 *
 *   Tests rely on serviceUri property to a working proxibase server in ./config.json
 */


// Dependencies
var util = require("util")
var _ = require("lodash")
var tipe = require("tipe")
var serviceUri = require('./config.json').serviceUri
var assert = require("assert")
var seed = String(Math.floor(Math.random() * 10000))

// Logger
var log = function(o, depth) {
  console.log(util.inspect(o, {hidden: true, depth: depth || 4, colors: true}))
}


// Test subject
var preq = require("../")


// Public methods
var methods = {
  get: true,
  post: true,
  del: true,
  path: true,
  query: true,
  send: true,
  debug: true,
  end: true,
}


// Mocha tests
describe('Proxireq', function() {

  it('can get and set its serviceUri', function() {
    assert(_.isFunction(preq.serviceUri))
    assert(_.isString(preq.serviceUri()))
    assert(serviceUri === preq.serviceUri(serviceUri))
  })


  it('should return a proxireq.Client instance', function() {

    assert(_.isFunction(preq))
    var client = preq()

    assert(_.isObject(client))
    assert(client instanceof preq.Client)

    for (var key in client) {
      assert(key !== '_options', key)     // _options is non-enumerable
    }
    assert(_.isObject(client._options))   // _options exists
  })


  it('should have all its methods', function() {
    var client = preq()
    for (var method in methods) {
      assert(_.isFunction(client[method]), method)
    }
  })


  it('should not have any extra methods', function() {
    var client = preq()
    _.functions(client).forEach(function(fnName) {
      assert(methods[fnName], fnName)
    })
  })


  it('gets', function(done) {
    preq().get("/").debug().end(function(err, res, body) {
      log(err)
      assert(!err)
      assert(res)
      assert(body)
      assert(body.name)
      done()
    })
  })


  it('gets with autoinstancing', function(done) {
    preq.get('/data').end(function(err, res, body) {
      assert(!err, err)
      assert(res)
      assert(body)
      assert(body.data && body.data.users)
      done()
    })
  })

  it('creates users', function(done) {
    preq.post('/user/create').send({
      data: {
        name: 'fake user ' + seed,
        email: 'fake' + seed + '@3meters.com',
        password: 'password',
      },
      secret: 'larissa',
      installId: 'preqTest',
    }).debug().end(function(err, res, body) {
      assert(!err)
      assert(body)
      log(body)
      done()
    })
  })
})
