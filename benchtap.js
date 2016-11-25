var Benchmark = require('benchmark'),
	tape = require('tape');

// adapted from tape/lib/test.js
var getTestArgs = function (name_, opts_, setup_, test_) {
	var name = '(anonymous)';
	var opts = {};
	var setup;
	var test;

	for (var i = 0; i < arguments.length; i++) {
		var arg = arguments[i];
		var t = typeof arg;
		if (t === 'string') {
			name = arg;
		}
		else if (t === 'object') {
			opts = arg || opts;
		}
		else if (t === 'function') {
			if(setup == null) setup = arg;
			else test = arg;
		}
	}
	return { name: name, opts: opts, setup: setup, test: test };
};


// the percentage deviation to consider statistically significant
SIGNIFICANT_ERROR = .3;

var SI_PREFIXES = ["", "k", "M", "G", "T", "P", "E"];

function getOpsString(flops){

	// what tier
	var tier = Math.log10(flops) / 3 | 0;
	var prefix = SI_PREFIXES[tier];
	var scale = Math.pow(10, tier * 3);

	var scaled = flops / scale;

	// Benchmark.formatNumber(adjusted.toFixed(3)) + ' ' + prefix + 'Flops/sec '

	return scaled.toFixed(3) + ' ' + prefix + '/sec';
}

module.exports = function(name_, opts_, setup_, test_){

	var args = getTestArgs(name_, opts_, setup_, test_);

	var setup = args.setup;
	var test = args.test;
	var verbosity = args.opts.verbose;
	var operations = args.opts.operations;

	tape(args.name, function(t){
		t.plan(1);

		var self = this;

		var b = new Benchmark(name, test)
			.on('start', setup)
			.on('cycle', function(event) {
			})
			.on('complete', function(event) {
				var benchmark = this;
				if(benchmark.error){
					t.fail(benchmark.error);
				} else {

					var pm = '\xb1',
						mu = '\xb5'
						size = benchmark.stats.sample.length;


					var info = ': n = ' + size +
						', ' + mu + " = " + (benchmark.stats.mean * 1000).toFixed(0) + 'ms';

					// number of operations specified?
					if(operations){
						// yes, calculate and display flops
						var flops = benchmark.hz * operations;
						opsString = getOpsString(flops);
						info += ', ops = ' + opsString;
					}

					info += ' ' + pm + benchmark.stats.rme.toFixed(2) + '% ';

					t.pass(info);

					// flagged to run verbose?
					if(verbosity){
						// show concise graphical representation
						var graphical = benchmark.stats.sample.map(function(s){
							var error = (s - benchmark.stats.mean);
							var threshold = SIGNIFICANT_ERROR*benchmark.stats.mean;
							if(error < -threshold){
								return ".";
							} else if(error > threshold){
								return "*"
							}

							return "-";
						}).join('');
						t.comment(graphical);
					}

					// higher verbosity level?
					if(verbosity && verbosity > 1){
						t.comment('[' + benchmark.stats.sample + ']');
					}
				}
			});

			b.run({"async" : true});
	});
};
