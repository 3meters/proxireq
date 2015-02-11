Client request library for proxibase service.

See instructions in config

Requests methods can be chained.  Although is is a wapper around the request
module, it's API is closer to a trimmed down version of the super-agent module.
The request is not executed until the end() method is called.

Usage:

    var preq = require('proxireq')

    var req = preq()  // or preq.<method>()  -- instanciates the request

    req.get.path('/data/users/').debug().query({foo: bar}).end(callback)

    function callback(err, res, body) {
      if (err) console.error(err)
      if (res.ok) console.log(body) // status code between 200 and 399
    }


