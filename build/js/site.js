(function () {
	$( document ).on( "mobileinit", function() {
	  $.mobile.defaultPageTransition = "none";
	});

	function updateSaved() {
		amplify.store( "agenda", saved );
	}

	var saved = amplify.store( "agenda" ) || {};

	var $document = $( document );

	$document.on( "pagebeforecreate", function ( e ) {
		var $target = $( e.target );
		if ( /\/agenda/.test($target.data( "url" ) ) ){
			$target.find( "ul[data-role=listview] li" ).each( function () {
				var $li = $( this );
				var slug = $li.data("slug");
				$li.toggleClass( "is-selected", !!saved[slug] );
			});

			if ( amplify.store("view-mine") ) {
				$target.find( ".show-selected" ).attr("checked", "checked");
				$( document.documentElement ).addClass( "only-selected" );
			} else {
				$( document.documentElement ).removeClass( "only-selected" );
			}
		}
	});

	$document.on( "change", ".my-agenda", function ( e ) {
		amplify.store("view-mine", e.target.checked);
		$( document.documentElement ).toggleClass( "only-selected", e.target.checked );
	});

	$document.on( "click", ".radio-button", function () {
		var $li = $( this ).closest( "li" );
		var slug = $li.data("slug");
		if ( saved[slug] ) {
			delete saved[slug];
		} else {
			$li.prevAll( ".ui-li-divider" ).first().nextUntil( ".ui-li-divider" ).each( function () {
				var $other = $( this );
				var other_slug = $other.data("slug" );
				if ( other_slug !== slug ) {
					delete saved[other_slug];
					$other.removeClass("is-selected");
				}
			});
			saved[slug] = true;
		}
		updateSaved();
		$li.toggleClass( "is-selected", !!saved[slug] );
	});
})();