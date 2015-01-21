

function foo() {
  return 'foo'
}

function bar() {
  return 'bar'
}

foo['bar'] = bar
foo['inspect'] = bar
console.log(foo())
console.log(foo.bar())
console.log(foo.inspect())

// var preq = require('./')
