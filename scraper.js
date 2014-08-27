require( "shelljs/global" );
var request = require( "request" );
request = request.defaults({ jar: true });
var _ = require("lodash");
var cheerio = require( "cheerio" );
var qs = require('querystring');
var fs = require( 'fs' );
var async = require( "async" );

var URL_ROOT = "http://www.devlink.net";

var agenda = JSON.parse(fs.readFileSync( "./data/agenda.json", "utf-8"));

var detailPages = [];

_.each( agenda, function ( day ) {
	_.each( day.times, function ( time ) {
		detailPages.push( _.pluck( time.activities, "detail_page"))
	});
});

try {
	fs.mkdirSync( "./details" );
} catch (e) {

}

detailPages = _(detailPages).flatten().compact().value();
detailUrls = _.map(detailPages, function ( id ) {
	var url = URL_ROOT + "/abstract/summary/" + id;
	return function( callback ) {
		console.log( "Requesting " + url );
		request( url, function ( err, response, data ) {
			fs.writeFile( './details/' + id + '.html', data, 'utf-8', function ( err ) {
				callback( null );
			});
		});
	}
});

async.parallelLimit( detailUrls, 4, function ( err, result ) {
	console.log( "Done" );
});