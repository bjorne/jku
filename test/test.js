var readmePath = __dirname + '/../README.md';
var sandboxPath = './test/sandbox';
var codeExampleRe = /    \$ (.|\n)+?\n\n/mg;
var bannedCommandRe = /npm install/;

var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');
var diff = require('diff');

var colors = {
    'pass': 90
  , 'fail': 31
  , 'bright pass': 92
  , 'bright fail': 91
  , 'bright yellow': 93
  , 'pending': 36
  , 'suite': 0
  , 'error title': 0
  , 'error message': 31
  , 'error stack': 90
  , 'checkmark': 32
  , 'fast': 90
  , 'medium': 33
  , 'slow': 31
  , 'green': 32
  , 'light': 90
  , 'diff gutter': 90
  , 'diff added': 42
  , 'diff removed': 41
};

var color = function(type, str) {
  // if (!exports.useColors) return str;
  return '\u001b[' + colors[type] + 'm' + str + '\u001b[0m';
};

/**
 * Stolen from mocha
 * Return a character diff for `err`.
 */
function errorDiff(err, type, escape) {
  var diffRes = diff['diff' + type](err.actual, err.expected);
  var errCount = 0;
  return diffRes.map(function(str){
    if (escape) {
      str.value = str.value
        .replace(/\t/g, '<tab>')
        .replace(/\r/g, '<CR>')
        .replace(/\n/g, '<LF>\n');
    }
    if (str.added) return colorLines('diff added', str.value);
    if (str.removed) return colorLines('diff removed', str.value);
    console.log('str', str);
    if (!str.added && !str.removed) {
      errCount++;
    }
    return str.value;
  }).join('');
}

/**
 * Stolen from mocha
 * Color lines for `str`, using the color `name`.
 */
function colorLines(name, str) {
  return str.split('\n').map(function(str){
    return color(name, str);
  }).join('\n');
}

var run = function(example, done) {
  if (example.match(bannedCommandRe)) {
    return done();
  }

  var cmdMatch = example.match(/\W*\$ (.+)\n((?:.|\n)+)\n/mi);
  if (!cmdMatch) {
    console.log('Warning: Failed to parse command: ' + example.split('\n')[0]);
    return done();
  }

  var cmd = cmdMatch[1].replace('jku', '../../bin/jku');
  var res = cmdMatch[2].replace(/(^|\n)\W{4}/g, '$1');

  // fixture
  var fixtureMatch;
  if (fixtureMatch = cmd.match(/cat (.+\.json)$/)) {
    fs.writeFileSync(fixtureMatch[1], res);
    return done();
  }

  exec(cmd, function(err, stdout, stderr) {
    var totalOutput = stderr + stdout;
    if (err !== null) {
      console.log(color('error message', '✖ Example failed: '), color('bright fail', cmd));
      console.log(err.toString());
      done(null, 'fail');
    } else if (totalOutput !== res) {
      console.log(color('error message', '✖ Example failed: '), color('bright fail', cmd));
      var error = { actual: totalOutput, expected: res };
      console.log(error);
      console.log(errorDiff(error, 'Chars', false));
      done(null, 'fail');
    } else {
      console.log(color('green', '✓ Example passed: '), color('bright pass', cmd));
      done(null, 'pass');
    }
  });
};

var readme = fs.readFileSync(readmePath, 'utf8');
var examples = readme.match(codeExampleRe);
process.chdir(sandboxPath);
async.mapSeries(examples, run, function(err, res) {
  var failed = res.reduce(function(count, ex) { return (ex == 'fail' ? ++count : count); }, 0);
  var passed = res.reduce(function(count, ex) { return (ex == 'pass' ? ++count : count); }, 0);
  console.log(failed + ' failed examples, ' + passed + ' passed examples, ' + (passed+failed) + ' examples in total.');
});
