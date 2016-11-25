var Benchmark = require('benchmark'),
	test = require('tape');

// modified from tape/lib/test.js
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

var suite = new Benchmark.Suite();

// the percentage deviation to consider statistically significant
SIGNIFICANT_ERROR = .3;

var SI_PREFIXES = ["", "k", "M", "G", "T", "P", "E"];

function getFlopsString(flops){

	// what tier
	var tier = Math.log10(flops) / 3 | 0;
	var prefix = SI_PREFIXES[tier];
	var scale = Math.pow(10, tier * 3);

	var scaled = flops / scale;

	// Benchmark.formatNumber(adjusted.toFixed(3)) + ' ' + prefix + 'Flops/sec '

	return scaled.toFixed(3) + ' ' + prefix + 'Flops/sec';
}

module.exports = function(name_, opts_, setup_, test_){

	var args = getTestArgs(name_, opts_, setup_, test_);

	var context = {};
	var setup = args.setup.bind(context);
	var test = args.test.bind(context);
	var operations = args.opts.operations;

/*
	setup.bind(context)();
	test.bind(context)();
	*/
	setup();

	test(args.name, function(t){
		t.plan(1);

		var self = this;
		var context = {};

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

					var flops = benchmark.hz * operations;
					flopsString = getFlopsString(flops);

					var info = flopsString +
						' ' + pm + benchmark.stats.rme.toFixed(2) + '% ' +
						' n = ' + size +
						' ' + mu + " = " + (benchmark.stats.mean * 1000).toFixed(0) + 'ms'

					// flagged to run verbose?
					if(self.verbose){
						// show concise graphical representation
						info += ' : ' + benchmark.stats.sample.map(function(s){
							var error = (s - benchmark.stats.mean);
							var threshold = SIGNIFICANT_ERROR*benchmark.stats.mean;
							if(error < -threshold){
								return ".";
							} else if(error > threshold){
								return "*"
							}

							return "-";
						}).join('');
					}


					t.pass("passed");
					t.comment(info);
					// higher verbosity level?
					if(self.verbose && self.verbose > 1){
						t.comment('[' + benchmark.stats.sample + ']');
					}
				}
			});

			suite.add(b);
	});
};
/*
function Benchtap(verbose){
	this.pass = 0;
	this.fail = 0;
	var self = this;
	this.suite.on('complete', function(){
		results.pass += self.pass;
		results.fail += self.fail;
	});
	this.verbose = verbose;
}

module.exports = Benchtap;


Benchtap.prototype.add = function(name, setup, test, ops){

	var self = this;

	var b = new Benchmark(name, test)
		.on('start', setup)
		.on('cycle', function(event) {
		})
		.on('complete', function(event) {
			var benchmark = this;
			if(benchmark.error){
				printError(event.currentTarget.id, benchmark.name, benchmark.error);
				self.fail++;
			} else {

				var pm = '\xb1',
					mu = '\xb5'
					size = benchmark.stats.sample.length;

				var flops = benchmark.hz * ops;
				flopsString = getFlopsString(flops);

				var info = flopsString +
					' ' + pm + benchmark.stats.rme.toFixed(2) + '% ' +
					' n = ' + size +
					' ' + mu + " = " + (benchmark.stats.mean * 1000).toFixed(0) + 'ms'

				// flagged to run verbose?
				if(self.verbose){
					// show concise graphical representation
					info += ' : ' + benchmark.stats.sample.map(function(s){
						var error = (s - benchmark.stats.mean);
						var threshold = Benchtap.SIGNIFICANT_ERROR*benchmark.stats.mean;
						if(error < -threshold){
							return ".";
						} else if(error > threshold){
							return "*"
						}

						return "-";
					}).join('');

					// higher verbosity level?
					if(self.verbose > 1){
						info += '\n# [' + benchmark.stats.sample + ']';
					}
				}

				printPass(event.currentTarget.id, benchmark.name, info);
				self.pass++;
			}
		});

	this.suite.add(b);
}


Benchtap.prototype.run = function(){
	results.count += this.suite.length;

	this.suite.run({ 'async': true});
}
*/
/*
function printHeader(){
	console.log("TAP version 13");
}

function printFooter(total, pass, fail){

	console.log("\n1.." + total);
	console.log("# tests " + total);
	console.log("# pass  " + pass);

	if(fail)
		console.log("# fail  " + fail);
	else
		console.log("\n# ok\n");
}
*/
/*
function printError(id, name, error){
	write("not ok " + id + " " + name + "\n");
	// show error
	write("  ---\n");
	write("  error: " + error + "\n");
	write("  ...\n");
}

function printPass(id, name, info){
	write("ok " + id + " " + name + "\n");
	write("# " + info + "\n");
}
*/
