# Jku

Jku is a command-line tool to filter and/or modify a JSON stream. It
is heavily inspired by [jq](http://stedolan.github.com/jq/).

    $ jku
    Filter and modify a JSON stream
    Usage: jku [-p] [-s <SEP>] [-f <FILTER>] [-t <TRANSFORM>]
    
    Options:
      -f, --filter     An expression to filter by               [string]
      -t, --transform  Transform expression                     [string]
      -p, --pretty     Pretty-print resulting JSON              [boolean]  [default: false]
      -s, --separator  The separator with which to join arrays  [string]  [default: "\t"]
    
    Please supply a filter and/or a transform.

## Installation

    $ npm install -g jku

## Example Usage

    $ cat foo.json
    { "foo": 1, "bar": "a" }
    { "foo": 2, "bar": "b" }
    { "foo": 3 }

    $ cat foo.json | jku -f '_.bar' -t '_.foo'
    1
    2

The above filters for rows which have a truthy `bar` value and outputs
the value of the `foo` key.

## Filtering and Transforming Expressions

Expressions are evaluated as Javascript code, with `_` representing the current JSON object.

### Filtering

By specifying a filter expression, jku will only emit JSON objects
where the expression is truthy.

### Transforming

Based on the type of the value generated from transform expression,
jku will output to different formats:

**Scalar** values, e.g. String, Number, will return the string
  representation of the value.

    $ echo '{ "foo" : 1 }' | jku -t '_.foo'
    1

    $ echo '{ "foo" : "bar" }' | jku -t '_.foo'
    bar


**Array** value will join the elements of the array with a tab. The
  separator can be configured by supplying the `-s` option.

    $ echo '{ "foo" : [1,2,3] }' | jku -t '_.foo'
    1	2	3

**Object** value will output the JSON representation of the object.
  Pretty-printing can be enabled by supplying the `-p` option.

    $ echo '{ "foo" : "bar" }' | jku -t '{ baz: _.foo }'
    {"baz":"bar"}

## More examples

### Filter by number of keys

    $ echo '{ "foo": 1, "bar": 2, "baz": 3 }' | jku -p -f 'Object.keys(_).length > 2'
    {
      "foo": 1,
      "bar": 2,
      "baz": 3
    }

### Generate CSV

    $ cat foo.json
    { "foo": 1, "bar": "a" }
    { "foo": 2, "bar": "b" }
    { "foo": 3 }

    $ cat foo.json | jku -s ',' -t '[_.foo, _.bar]'
    1,a
    2,b
    3,

### Convert timestamps to human readable

The following outputs new JSON documents with the timestamp replaced
by a human readable string and the count represented in hexadecimal
form. This is an example of how arbitrary Javascript functions can be
used in expressions.

    $ cat foo.json
    { "timestamp": 1372068657151, "count": 17 }
    { "timestamp": 1372068659841, "count": 136 }
    { "timestamp": 1372068668142, "count": 255 }

    $ cat foo.json | jku -t '_.timestamp = new Date(_.timestamp), _.count = _.count.toString(16), _'
    {"timestamp":"2013-06-24T10:10:57.151Z","count":"11"}
    {"timestamp":"2013-06-24T10:10:59.841Z","count":"88"}
    {"timestamp":"2013-06-24T10:11:08.142Z","count":"ff"}


## Contribute

Some things I would really like to see:

* Multi-line JSON support. I guess a streaming JSON parser would be useful.
* CoffeeScript syntax support

In any case, make sure to run the test examples with `make test`. All
examples in this README are runnable, so simply add an example to
include it in the test suite.
