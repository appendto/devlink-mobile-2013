require( "shelljs/global" );
var request = require( "request" );
var _ = require("lodash");
var cheerio = require( "cheerio" );
var qs = require('querystring');
var fs = require( 'fs' );
var async = require( "async" );


var source = fs.readFileSync( "./details/530f444288e9cd0b00f906b3.html", "utf-8" );

var abstracts = {};
var speakers = {};

function parseDetails( source, done ) {
	var $ = cheerio.load( source );

	var title = $( ".headline h3" ).html();
	var summary = $( "#summary" ).html();
	var tags = $( ".blog-post-tags a" ).map( function () {
		return $( this ).html();
	}).get();

	var speaker = {
		name: $( "#speaker-name" ).html(),
		bio: $( "#speaker-bio" ).html(),
		social: $( "#social-icons a" ).map( function () {
			var $a = $( this );
			var type = $a.children( "i" ).attr("class").replace(/^icon-lg icon-/, '').replace( ' rounded-x', '');
			return {
				type: type,
				url: $a.attr( "href" )
			};
		}).get(),
		photo: $( "#speaker-name" ).prev().children( "img" ).attr( "src" )
	};

	speaker.slug = speaker.name.toLowerCase().replace( /[^A-Za-z]/g, '-' ).replace( /-+/g, '-' );

	done(null, {
		title: title,
		summary: summary,
		tags: tags,
		speaker: speaker
	});
}

function parseDetailsGenerator( id, file ) {
	return function( done ) {
		fs.readFile( file, "utf-8", function( err, data ) {
			parseDetails( data, function( err, result ) {
				result.id = id;
				abstracts[ id ] = result;
				speakers[ result.speaker.slug ] = result.speaker;
				done( null );
			});
		});
	}
}

fs.readdir( "./details", function ( err, files ) {
	var asyncList = [];
	_.each( files, function ( name ) {
		if ( !/\.html$/.test( name ) ) return;

		var id = name.replace( ".html", "" );
		var path = "./details/" + name;
		asyncList.push( parseDetailsGenerator( id, path ) );
	});

	async.parallelLimit( asyncList, 4, function ( err, done ) {
		fs.writeFileSync( "./data/abstracts.json", JSON.stringify(abstracts, null, "\t"), "utf-8" )
		fs.writeFileSync( "./data/speakers.json", JSON.stringify(speakers, null, "\t"), "utf-8" )
	});
});