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

    $ cat foo.json | jku -f 'json.bar' -t 'json.foo'
    1
    2

The above filters for rows which have a truthy `bar` value and outputs
the value of the `foo` key.

## Filtering and Transforming Expressions

Expressions are evaluated as javascript code, with `_` representing the current JSON object.

### Filtering

By specifying a filter expression, jku will only emit JSON objects
where the expression is truthy.

### Transforming

Based on the type of the value generated from transform expression,
jku will output to different formats:

**Scalar** values, e.g. String, Number, will return the string
  representation of the value.

    $ echo '{ "foo" : 1 }' | jku -t 'json.foo'
    1
    $ echo '{ "foo" : "bar" }' | jku -t 'json.foo'
    bar


**Array** value will join the elements of the array with a tab. The
  separator can be configured by supplying the `-s` option.

    $ echo '{ "foo" : [1,2,3] }' | jku -t 'json.foo'
    1    2    3
    
**Object** value will output the JSON representation of the object.
  Pretty-printing can be enabled by supplying the `-p` option.

    $ echo '{ "foo" : "bar" }' | jku -t '{ baz: json.foo }'
    {"baz":"bar"}

## More examples

### Filter by number of keys

    $ echo '{ "foo": 1, "bar": 2, "baz": 3 }' | jku -p -f 'Object.keys(json).length > 2'
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

    $ cat foo.json | jku -s ',' -t '[json.foo, json.bar]'
    1,a
    2,b
    3,
