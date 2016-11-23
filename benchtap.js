var Benchmark = require('benchmark');

/* Run benchmarks with tap output, compatible with testling and browserify
 */
function Benchtap(verbose){
	this.suite = new Benchmark.Suite();
	this.pass = 0;
	this.fail = 0;
	var self = this;
	this.suite.on('complete', function(){
		printFooter(self.suite.length, self.pass, self.fail);
	});
	this.verbose = verbose;
}

module.exports = Benchtap;

// the percentage deviation to consider statistically significant
Benchtap.SIGNIFICANT_ERROR = .3;

/*
	setup - function containing setup code
		allocate data, create data structures, etc.
	test - function containing test code
	ops - function calculating number of operations run in the test (for flops)

 */
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

Benchtap.prototype.run = function(){
	printHeader();

	this.suite.run({ 'async': true});
}

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

function printError(id, name, error){
	console.log("not ok " + id + " " + name);
	// show error
	console.log("  ---");
	console.log("  error: " + error);
	console.log("  ...");
}

function printPass(id, name, info){
	console.log("ok " + id + " " + name);
	console.log("# " + info);
}
