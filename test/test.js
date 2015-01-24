/**
 * Proxireq tests
 *
 *   Tests rely on serviceUri property to a working proxibase server in ./config.json
 */


// Dependencies
var util = require("util")
var _ = require("lodash")
var assert = require("assert")


// Config
var testConfig = require('./config.json')


// Inspect
function inspect(o, depth) {
  return util.inspect(o, {hidden: true, depth: depth || 4, colors: true})
}


// Logger
var log = function(o, depth) {
  console.log(inspect(o, depth))
}


// For creating test documents with some randomness
var seed = String(Math.floor(Math.random() * 10000))


// Response checker that throws an error including the response body
function ok(res) {
  if (!res.ok) return new Error(inspect(res.body))
  return true
}


// Test subject
var preq = require("../")


// Public methods
var methods = {
  get: true,
  post: true,
  del: true,
  delete: true,
  remove: true,
  path: true,
  query: true,
  sign: true,
  body: true,
  send: true,
  options: true,
  debug: true,
  end: true,
  endSa: true,
}


// Mocha tests
describe('Proxireq', function() {

  // used for multiple tests
  var user
  var cred


  it('has a default config', function() {
    assert(_.isObject(preq.config()))
    assert(_.isString(preq.config().serviceUri))
  })

  it('can be configured', function() {
    preq = preq.config(testConfig)
    var config = preq.config()
    for (var key in testConfig) {
      assert(config[key] === testConfig[key], key)
    }
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
    preq().get("/").end(function(err, res, body) {
      assert(!err)
      assert(ok(res))
      assert(body)
      assert(body.name)
      done()
    })
  })

  it('gets with autoinstancing', function(done) {
    preq.get('/data').end(function(err, res, body) {
      assert(!err)
      assert(ok(res))
      assert(body.data && body.data.users)
      done()
    })
  })

  it('posts', function(done) {
    preq.post('/user/create').body({
      data: {
        name: 'fake user ' + seed,
        email: 'fake' + seed + '@3meters.com',
        password: 'password123',
        secret: 'larissa',
        installId: 'preqTest',
      },
    }).end(function(err, res, body) {
      assert(!err)
      assert(ok(res))
      user = body.user
      cred = body.credentials
      done()
    })
  })

  it('gets authenticated', function(done) {
    preq.query(cred)
      .path('data/users')
      .path(user._id)
      .end(function(err, res, body) {
        assert(!err)
        assert(ok(res))
        assert(body.data)
        assert(body.data.email)  // private field unless user is authenticated
        done()
      })
  })

  it('removes', function(done) {
    var req = preq()
    req.query(cred)
    req.del().path('data/users').path(user._id).end(function(err, res) {
      assert(!err)
      assert(ok(res))
      preq.post('/find/users/' + user._id).end(function(err, res, body) {
        assert(!err)
        assert(ok(res))
        assert(body)
        assert(body.data === null)
        done()
      })
    })
  })

  it('returns errors properly', function(done) {
    preq.get('/data/invalidname/').end(function(err, res, body) {
      assert(!err)
      assert.throws(ok(res))
      assert(res.statusCode === 404)
      assert(res.status === 404)  // alias
      assert(body)
      assert(body.error)
      done()
    })
  })

  it('passes through request options', function(done) {
    preq.get('/data/users')
      .options({timeout: 1})  // should cause request to return an error
      .end(function(err, res, body) {
        assert(err)
        done()
      })
  })
})
