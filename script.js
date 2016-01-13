$(function() {		
	// Helper to uniquely identify popups
	var popupCounter = 0;	
	
	// Add popstate handler to handle history navigation
	var handlePopstate = function(event) {
		event = event.originalEvent;
		console.log('popped', event.state, event);
		
		if (event && event.state && event.state.popupState != null) {
			if (event.state.popupState) {
				var $existingPopup = $('#popup');
				if ($existingPopup.length) {
					$existingPopup.trigger('popup-select', [event.state.id]);
				} else {
					loadAndShowPopup(event.state.id);
				}
			} else {
				//destroy popup on back
				$('#popup').trigger('popup-destroy'); 
				//or reload
				//location.reload(true);						
			}
		}
	}
	$(window).on('popstate', handlePopstate);

	// Replace current history state with one that signals no popup
	window.history.replaceState({
		popupState: false
	}, null);
	
	function loadAndShowPopup(idFromPopstate) {
		// Popup is already open.
		if ($('#popup').length) {
			visualLog($('#popup').attr('title') + ' is already opened');
			return;
		}

		// Create popup element from template
		var popupTitle = "Popup no. " + popupCounter++;
		$($('#popupTemplate').text())
			.hide()
			.attr('id', 'popup')
			.attr('title', popupTitle)
			.prepend('<div class="title">' + popupTitle + '</div>')
			.appendTo($('body'));

		var $popup = $('#popup');
		var $items = $('.itm', $popup);

		// Select item on specific event
		$popup.on('popup-select', function(e, itemId) {
			var $this = $('#' + itemId);
			if (!$this.hasClass('current')) {
				$items.removeClass('current');
				$this.addClass('current');
			}
		});
		// Destroy popup on specific event
		$popup.on('popup-destroy', function() {
			$(this).remove();
			visualLog(popupTitle + ' was destroyed.');
		});

		// Select initial item
		var selectedItemId = '';
		if (idFromPopstate) {
			// just select received item from history entry state
			selectedItemId = idFromPopstate;
			// we already have popup state on the current history entry
		} else {
			// select first item
			selectedItemId = $items.first().attr('id');
			// and also push state with its data
			window.history.pushState({
				popupState: true,
				id: selectedItemId
			}, null, '/pseudo-path/' + selectedItemId);
		}
		$popup.trigger('popup-select', [selectedItemId]);

		// On each item click replace current state with new data and select it
		$items.click(function() {
			if (!$(this).hasClass('current')) {
				window.history.replaceState({
					popupState: true,
					id: this.id
				}, null, '/pseudo-path/' + this.id);
			}
			$popup.trigger('popup-select', [this.id]);
		});
		
		// Add handler for close button to destroy popup and go to previous history entry
		$('#closePopup').click(function() {
			$('#closePopup').trigger('popup-destroy');
			window.history.back();
		});

		// Show the popup
		$popup.show();
		visualLog(popupTitle + ' was opened.');
	}
	
	// Load and show a new popup every time the button is clicked (if one isn't already opened)
	$('#showPopup').click(function() {
		loadAndShowPopup();
	});
	
	// Helper to log some info on the screen
	function visualLog(text) {
		$('#logConsole').append('<div class="record">' + text + '</div>');
	}
});
