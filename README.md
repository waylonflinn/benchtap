# benchtap

Simple, accurate benchmarking in a browser with tap output and in interface based on tape

# usage

## code

```javascript
var benchtap = require('benchtap');

var name = "square";
var setup = function(){ this.a = Math.random() };
var test = function(){ this.a * this.a };
var ops = 1; // number of operations performed in `test`

benchtap(name, {"operations" : ops}, setup, test);
```

## command line

put all your benchmarks in a `benchmark` folder, then run:

```shell
browserify benchmark/*.js | testling -x $npm_config_browser
```

# setup

you may also need to set the default [npm browser](https://docs.npmjs.com/misc/config#browser)

## osx
```
npm config set browser open
```
## linux
```
npm config set browser xdg-open
```

## windows
```
npm config set browser start
```
