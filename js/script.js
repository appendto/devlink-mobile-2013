"use strict";

$( document ).on( "mobileinit", function( e, data ) {

});

$( document ).on( "pagebeforetransition", function( e, data ) {
  var page = data.toPage.attr("id");
  if (page === "day") {
    getAgenda( data );
  } else if ( page === "speakers" ) {
    //getSpeakers();
    //generateSpeakersHTML();
    //generateSpeakersSprite();
    //generateSpeakerBios();
  } 
});

$( "#speakers" ).on( "submit", "form", function( e ) {
  e.preventDefault();
  $( this ).find("input").blur();
});

$( document ).on( "pagebeforecreate", function( e, date ) {
  var headerSource = $("#template-header").html();
  
  if (headerSource) {
    $("div[data-role='header']").each( function( i ) {
      $(this).html(headerSource);
      $(this).find("a[data-icon='bars']").attr("href", "#menu-" + i);
    });
  }

  var footerSource = $("#template-footer").html();
  if (footerSource) {
    $("div[data-role='page']").append(footerSource);
  }

  var panelSource = $("#template-panel").html();
  if ( panelSource ) {
    $("div[data-role='page']").each( function( i ) {
      $(this).append(panelSource);
      $(this).find("div[data-role='panel']").attr("id", "menu-" + i).panel().find("ul").listview();
    });
  }

});

function getAgenda( data ) {
  $("#agenda-items").empty();
  var _date,
      url = (data.absUrl === undefined) ? window.location.href : data.absUrl;
  var day = url.substr( url.indexOf( "=" )+ 1 - url.length );

  switch (day) {
  case "wednesday":
    _date = "Wed. Aug. 28, 2013";
    break;
  case "thursday":
    _date = "Thur. Aug. 29, 2013";
    break;
  case "friday":
    _date = "Fri. Aug. 30, 2013";
    break;
  default:
    _date = "Wed. Aug. 28, 2013";
    break;
  }

  $("#day-name").text( _date );

  var _tempset = "";
  var _temp = "";
  var _timeset = "";
  agenda.forEach( function( talk ) {
    if (_date === talk.date) {
      if (talk.time !== _timeset ) {
        if (_tempset.length > 0 ) {
          //_tempset.appendTo("#agenda-items").collapsible();
          _tempset += "</div>\n";
        }
        //_tempset = $("<div data-role='collapsible'><h3>" + talk.time + "</h3></div>");
        _tempset += "<div data-role='collapsible'>\n\t<h3>" + talk.time + "</h3>\n";
      }

      _timeset = talk.time;

      var _title = "<h3>" + talk.title + "</h3>\n\t\t";
      var _speaker = "<h2>" + talk.speaker + "</h2>\n\t\t\t";
      var _room = "<p><em>" + talk.room + "</em></p>\n\t\t\t";
      var _description = "<p>" + talk.description +"</p>\n\t\t";
      var _time = "<p>" + talk.date + ", " + talk.time + "</p>\n\t\t\t";
      //_temp = $("<div data-role='collapsible'>" + _title + "<div>" + _title + _speaker + _time + _room + _description + "</div></div>");
      //_temp.appendTo(_tempset).collapsible();
      _temp = "\t<div data-role='collapsible'>\n\t\t" + _title + "<div>\n\t\t\t" + _title + "\t" + _speaker + _time + _room + _description + "</div>\n\t</div>\n";
      _tempset += _temp;

    }
  });
  _tempset += "</div>\n";
  //_tempset.appendTo("#agenda-items").collapsible();
  console.log(_tempset);
}

/*function getSpeakers( data ) {
  var _temp;
  speakers.forEach( function( speaker, index ) {
    var _img = "<img src='" + speaker.image + "' alt='" + speaker.name + "'>";
    var _name = speaker.name;
    var _bio = "<p><img src='" + speaker.image + "' style='float: left; margin-right: 20px; margin-bottom: 20px;' alt='" + speaker.name + "'>" + speaker.bio +"</p>";
    _temp = $("<li><a href='#speaker-" + index + "' data-rel='popup'>" + _img + "<h2>" + _name + "</h2></li>");
    $("#speakers-list").append(_temp).listview( "refresh" );

    $("<div data-role='popup' class='ui-content ui-corner-all' style='max-width: 400px;' data-overlay-theme='b' data-theme='a' id='speaker-" + index + "'><div class='ui-corner-top'><h1>" + _name + "</h1></div><div>" + _bio + "</div><div style='clear: both;'></div></div>")
      .appendTo("#speakers").popup();

    $("#speaker-" + index + "-button").button();
  });
}

function generateSpeakersHTML() {
  var _temp = "";
  speakers.forEach( function( speaker, index ){
    _temp += "<li>\n";
    _temp += "\t<a href='#speaker-" + index + "' data-rel='popup'>\n";
    _temp += "\t\t<div style='" + getBackground( index ) +"' class='speaker-image'></div>\n";
    _temp += "\t\t<h2>" + speaker.name + "</h2>\n";
    _temp += "\t</a>\n";
    _temp += "</li>\n";
  });

  console.log(_temp);
  //$(_temp).appendTo("ul");

}

function generateSpeakersSprite() {
  var _temp = "";
  speakers.forEach( function( speaker, index ){
    if (index % 10 == 0 ) {
      if(index != 0) {
        _temp += "</div>";
      }
      _temp += "<div style='margin:0; padding: 0; clear: both;' >";
    }
    _temp += "<img src='" + speaker.image + "' style='float:left; display: block;'>";
  });

  $("ul").after(_temp);
}

function getBackground( index ) {
  var _top = (Math.floor(index/10) % 10) * 80;
  if (_top > 0) { _top = _top * -1; }
  var _left = (index % 10) * 80;
  if (_left > 0) { _left = _left * -1; }
  return "background-position: " + _left + "px " + _top + "px;";
}

function generateSpeakerBios() {
  var _temp = "";
  speakers.forEach(function(speaker, index) {
    _temp += "<div data-role='page' id='speaker-" + index + "'>\n";
    _temp += "\t<div data-role=\"header\" class=\"ui-corner-top\">\n";
    _temp += "\t</div>\n";
    _temp += "\t<div data-role=\"content\" class=\"ui-corner-bottom ui-content\">\n";
    _temp += "\t\t<h1>" + speaker.name + "</h1>\n";
    _temp += "\t\t<div style='" + getBackground(index) + "' class='bio-image'></div>" + speaker.bio + "\n";
    _temp += "\t</div>\n";
    _temp += "</div>\n";
  });
  console.log(_temp);
}
*/

