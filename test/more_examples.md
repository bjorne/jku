# More examples

These examples are not really relevant to the README but still make sense to test.

## Handling EPIPE

    $ cat foo.json
    { "foo": 1, "bar": "a" }
    { "foo": 2, "bar": "b" }

    $ cat foo.json | jku -s ',' -t '[_.foo, _.bar]' | head -n1
    1,a


