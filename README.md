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
