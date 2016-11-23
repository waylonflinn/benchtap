var Benchmark = require('benchmark'),
	createResult = require('tape/lib/results'),
	createDefaultStream = require('tape/lib/default_stream');

var results = createResult();
var stream = results.createStream();
stream.pipe(createDefaultStream());
function write(s) { results._stream.queue(s) };

var canEmitExit = typeof process !== 'undefined' && process
	&& typeof process.on === 'function' && process.browser !== true

if(canEmitExit){
	process.on('exit', function (code) {
		// let the process exit cleanly.
		if (code !== 0) return;

		results.close();
		process.exit(code); //  || harness._exitCode
	});
} else {
	results.once('done', function () { results.close() });
}

/* Run benchmarks with tap output, compatible with testling and browserify
 */
function Benchtap(verbose){
	this.suite = new Benchmark.Suite();
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
	/*
	if(!harness.running){
		harness.running = true;
		printHeader();
	}*/
	results.count += this.suite.length;

	this.suite.run({ 'async': true});
}

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
