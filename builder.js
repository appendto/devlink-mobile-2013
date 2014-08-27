var fs = require( "fs" );
var _ = require( "lodash" );
var async = require( "async" );


var templateCache = {};
function loadTemplate( template ) {
	var template = fs.readFileSync( "./template/" + template + ".tmpl.html", "utf-8");
	return _.template( template );
}

function slug( title ) {
	return (title || "").toLowerCase().replace( /[^A-Za-z]/g, '-' ).replace( /-+/g, '-' );
}

function renderTemplate( templates, data ) {
	var template = templates.shift();
	if ( !templateCache[ template ] ) {
		templateCache[ template ] = loadTemplate( template );
	}

	var preparedData = _.extend({
		slug: slug,
		humanize: humanize,
		partial: function ( templates ) {
			templates = _.isArray( templates ) ? templates : [ templates ];
			return renderTemplate( templates, data );
		},
		yield: function () {
			return templates.length ? renderTemplate( templates, data ) : "";
		}
	}, data );
	return templateCache[ template ]( preparedData );
}

function outputTemplate( templates, data, filename ) {
	console.log( "Rendering " + filename );
	filename = "./build/" + filename;
	var rendered = renderTemplate( templates, data )
	fs.writeFileSync( filename, rendered, "utf-8" )
}

function buildSpeakersIndex() {
	var speakers = JSON.parse( fs.readFileSync( "./data/speakers.json", "utf-8" ) );
	var speakersAlpha = _( speakers ).values().sortBy( "name" ).value();
	var templatePath = [ "_layout", "with_layout", "speaker-index" ];
	var data = {
		page: {
			title: "Speakers"
		},
		speakers: speakersAlpha
	};

	var filename = "speakers/index.html";
	outputTemplate( templatePath, data, filename );
}

function buildSpeakers() {
	var speakers = JSON.parse( fs.readFileSync( "./data/speakers.json", "utf-8" ) );
	var abstracts = JSON.parse( fs.readFileSync( "./data/abstracts.json", "utf-8" ) );

	_.each( abstracts, function ( abstract ) {
		var speaker = slug( abstract.speaker.name );
		if ( !speakers[ speaker ].talks ) {
			speakers[ speaker ].talks = []
		}
		abstract.slug = slug( abstract.title );
		speakers[ speaker ].talks.push( abstract );
	});

	_.each( speakers, function ( speaker, key ) {
		var templatePath = [ "_layout", "with_layout", "speaker" ];
		var data = {
			page: {
				title: speaker.name
			},
			speaker: speaker
		};
		speaker.bio = speaker.bio.replace(/<3/g, '&lt;3' );
		var filename = "speakers/" + speaker.slug + ".html";
		outputTemplate( templatePath, data, filename );
	});
}

function humanize( name ) {
	var parts = name.split( " " );
	parts = _.map( parts, function ( part ) {
		return part ? part[0].toUpperCase() + part.substr(1) : "";
	});
	return parts.join( " " );
}

function buildSponsors(){
	var sponsors = JSON.parse( fs.readFileSync( "./data/sponsors.json", "utf-8" ) );
	var templatePath = [ "_layout", "with_layout", "sponsor-index" ];
	var data = {
		page: {
			title: "Sponsors"
		},
		sponsors: sponsors
	};
	var filename = "sponsors/index.html";
	outputTemplate( templatePath, data, filename );
}

function buildTalks() {
	var abstracts = JSON.parse( fs.readFileSync( "./data/abstracts.json", "utf-8" ) );
	function renderTalksIndex() {
		var templatePath = [ "_layout", "with_layout", "talk-index" ];
		var data = {
			page: {
				title: "Talks"
			},
			abstracts: abstracts
		};
		var filename = "talks/index.html";
		outputTemplate( templatePath, data, filename );
	}
	renderTalksIndex();

	_.each( abstracts, function ( abstract ) {
		var templatePath = [ "_layout", "with_layout", "talk" ];
		var data = {
			page: {
				title: abstract.title
			},
			abstract: abstract
		};
		var filename = "talks/" + slug( abstract.title ) + ".html";
		outputTemplate( templatePath, data, filename );
	});
}

function buildTags() {
	var abstracts = JSON.parse( fs.readFileSync( "./data/abstracts.json", "utf-8" ) );
	var tags = {};
	_.each( abstracts, function ( abstract ) {
		var abstract_tags = abstract.tags.map( function ( tag ) {
			if ( /,/g.test( tag ) ) {
				return tag.split( /, ?/g )
			}
			return tag;
		});
		abstract_tags = _.flatten( abstract_tags );
		_.each( abstract_tags, function ( tag ) {
			var _t = tag.toLowerCase();
			if ( !tags[_t] ) {
				tags[_t] = {
					name: humanize( _t ),
					talks: []
				};
			};
			tags[_t].talks.push( abstract );
		});
	});

	var tag_names = _.keys( tags ).sort();

	function renderTags() {
		var templatePath = [ "_layout", "with_layout", "tag-index" ];
		var data = {
			page: {
				title: "Tags"
			},
			tags: tags,
			tag_names: tag_names
		};
		var filename = "tags/index.html";
		outputTemplate( templatePath, data, filename );
	}

	renderTags();
	_.each( tag_names, function ( tagName ) {
		var _slug = slug( tagName );
		var templatePath = [ "_layout", "with_layout", "tag" ];
		var data = {
			page: {
				title: tagName
			},
			tag: tags[tagName].name,
			talks: tags[ tagName ].talks,
			abstracts: abstracts
		};
		var filename = "tags/" + _slug + ".html";
		outputTemplate( templatePath, data, filename );
	});
}

function buildAgenda() {
	var agenda = JSON.parse( fs.readFileSync( "./data/agenda.json", "utf-8" ) );
	var abstracts = JSON.parse( fs.readFileSync( "./data/abstracts.json", "utf-8" ) );
	_.each( agenda, function ( day ) {
		var dayName = day.day.split( ' : ').shift();
		
		_.each( day.times, function ( time ) {
			_.each( time.activities, function ( activity ) {
				activity.slug = slug(activity.title);
			});
		});

		var templatePath = [ "_layout", "with_layout", "agenda" ];
		var data = {
			page: {
				title: "Agenda"
			},
			dayName: dayName,
			day: day,
			abstracts: abstracts
		};
		var filename = "agendas/" + dayName.toLowerCase() + ".html";
		outputTemplate( templatePath, data, filename );
	});
}

function makeDir( path ) {
	return function ( next ) {
		fs.mkdir( path, function () {
			next()
		});
	}
}

async.series([
	makeDir( "./build/speakers" ),
	makeDir( "./build/talks" ),
	makeDir( "./build/agendas" ),
	makeDir( "./build/tags" ),
	makeDir( "./build/sponsors" ),
], function () {
	outputTemplate( [ "_layout", "index" ], {
		page: {
			title: ""
		}
	}, "index.html" );
	buildSpeakersIndex();
	buildSpeakers();
	buildSponsors();
	buildAgenda();
	buildTalks();
	buildTags();
	console.log( "Done" );
})