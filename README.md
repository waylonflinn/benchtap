# benchtap

Simple, accurate benchmarking in a browser with tap output

# usage

## example

```
var Benchtap = require('benchtap');

var benchtap = new Benchtap();
benchtap.add(name, N, setup, test);
benchtap.run();
```

## command line

`browserify benchmark/*.js | testling -x $npm_config_browser`

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
