require( "shelljs/global" );
var request = require( "request" );
request = request.defaults({ jar: true });
var _ = require("lodash");
var cheerio = require( "cheerio" );
var qs = require('querystring');
var fs = require( 'fs' );
var async = require( "async" );

var URL_ROOT = "http://www.devlink.net";

request( URL_ROOT + "/sponsors", function ( err, response, data ) {
	var parsed = JSON.parse( data );
	var formatted = JSON.stringify( parsed, null, "\t" );
	fs.writeFileSync( "./data/sponsors.json", formatted, "utf-8");
});

request( URL_ROOT + "/api/agenda", function ( err, response, data ) {
	var parsed = JSON.parse( data );
	var formatted = JSON.stringify( parsed, null, "\t" );
	fs.writeFileSync( "./data/agenda.json", formatted, "utf-8");
});