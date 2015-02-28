/*! WhatTimeIsLove v0.0.1 ~ (c) 2015 Benjamin Holfve ~ Licensed under the MIT License */
(function (window, document) {

	WhatTimeIsLove = function(el, options) {
		this.element = typeof el == 'string' ? document.querySelector(el) : el;
		this.values = {
			year    : 2015,
			month   : 2,
			day     : 28,
			hours   : 0,
			minutes : 0
		}

		this._init();
	}

	WhatTimeIsLove.prototype = {
		version: '5.1.3',
		timeZoneOffset : 0,

		templates : {
			container : '<div class="wtl-container">%content</div>',
			iScroll : '<ul>%content</ul>',
			timeSeperator : ':'
		},

		_init : function() {
			this.element.style.display = 'none';

			// Create and append the container
			this.container = document.createElement('div');
			this.container.className = 'wtl-container';
			this.element.parentNode.insertBefore(this.container, this.element.nextSibling);

			// Build the time selector
			this._timeBuildHTML();

			// Bind iScroll to the time selector
			this._timeBindIScroll();

			// Get the current timezone
			this.timeZoneOffset = this.getTimezoneOffset();


		},

		getDateTime : function() {
			var year  	= helpers.pad(this.values.year, 4);
			var month 	= helpers.pad(this.values.month, 2);
			var day   	= helpers.pad(this.values.day, 2);
			var hours 	= helpers.pad(this.values.hours, 2);
			var minutes = helpers.pad(this.values.minutes, 2);


			var dateTime = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':00' + this.timeZoneOffset;
			//var dateTime = new Date(year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':00' + this.timeZoneOffset).toISOString()
			console.log(dateTime);
			return dateTime;
		},

		getTimezoneOffset : function() {
			var timeZonePrefix = '+';
			var x = new Date();
			timeZoneOffset = x.getTimezoneOffset() / 60;
			// Handle minutes in offset
			if( timeZoneOffset % 1 === 0 ) {
				console.log('No minutes');
				timeZoneOffset = timeZoneOffset.toString() + ':00';
			} else {
				timeZoneOffset = timeZoneOffset.toString().split('.');
				timeZoneOffsetMinutes = ( 60 / ( 10 / parseInt(timeZoneOffset[1]) ) );
				timeZoneOffsetMinutes = helpers.pad(timeZoneOffsetMinutes, 2);
				console.log('Minutes', timeZoneOffset[0], timeZoneOffsetMinutes );

				timeZoneOffset = timeZoneOffset[0] + ':' + timeZoneOffsetMinutes;
			}

			if( timeZoneOffset.charAt(0) == '-' ) {
				timeZonePrefix = '-';
				timeZoneOffset = timeZoneOffset.substring(1, timeZoneOffset.length);
			}


			timeZoneOffset = timeZonePrefix + helpers.pad(timeZoneOffset, 5)


			console.log(timeZoneOffset);
			return timeZoneOffset;
		},

		_timeBindIScroll : function() {
			self = this;
			this.iScroll = {};
			this.iScroll.hours = new IScroll(this.container.time.hours, {
		 		mouseWheel: true,
		 		snap: 'li'
			});
			this.iScroll.hours.on('scrollEnd', function(e) {
				var value = WhatTimeIsLove.helpers.getIScrollPage(this) + 1;
				self.values.hours = value;
				console.log(self.getDateTime());
				//console.log( WhatTimeIsLove.helpers.getIScrollPage(this) + 1);
			});
			this.iScroll.minutes = new IScroll(this.container.time.minutes, {
		 		mouseWheel: true,
		 		snap: 'li'
			});
			this.iScroll.minutes.on('scrollEnd', function(e) {
				var value = WhatTimeIsLove.helpers.getIScrollPage(this);
				if( value == 60 ) { value = 0; }
				self.values.minutes = value;
				console.log(self.getDateTime());
			});
		},

		_timeBuildHTML : function() {
			// Wrapper for time selector
			this.container.time = document.createElement('div');
			this.container.time.className = 'wtl-time';

			// Hours
			this.container.time.hours = document.createElement('div');
			this.container.time.hours.className = 'wtl-hours wtl-iscroll';
			this.container.time.hours.innerHTML = this._getHoursHTML();

			// Minutes
			this.container.time.minutes = document.createElement('div');
			this.container.time.minutes.className = 'wtl-minutes wtl-iscroll';
			this.container.time.minutes.innerHTML = this._getMinutesHTML();

			// Seperator
			this.container.time.seperator = document.createElement('div');
			this.container.time.seperator.className = 'wtl-seperator';
			this.container.time.seperator.innerHTML = this.templates.timeSeperator;

			// Append everything to container
			this.container.time.appendChild(this.container.time.hours);
			this.container.time.appendChild(this.container.time.seperator);
			this.container.time.appendChild(this.container.time.minutes);
			this.container.appendChild(this.container.time);
		},

		_getMinutesHTML : function() {
			var returnString = '';
			var minutes = this._buildMinutes();
			returnString+= this.templates.iScroll.replace('%content', minutes).replace('%cssClasses', 'wtl-minutes');

			return returnString;
		},

		_buildMinutes : function() {
			var returnString = '';
			for( i = 0 ; i < 60 ; ++i ) {
				if( i < 10 ) { text = '0' + i; } else { text = i + ''; }
				returnString+= '<li><span>' + text.charAt(0) + '</span><span>' + text.charAt(1) + '</span></li>';
			}
			returnString+= '<li>00</li>';
			returnString+= '<li>&nbsp;</li>';

			return returnString;
		},

		_getHoursHTML : function() {
			var returnString = '';
			var minutes = this._buildHours();
			returnString+= this.templates.iScroll.replace('%content', minutes).replace('%cssClasses', 'wtl-hours');

			return returnString;
		},

		_buildHours : function() {
			var returnString = '';
			for( i = 1 ; i < 24 ; ++i ) {
				text = i.toString();
				if( text.length > 1 ) {
					returnString+= '<li><span>' + text.charAt(0) + '</span><span>' + text.charAt(1) + '</span></li>';
				} else {
					returnString+= '<li><span></span><span>' + text + '</span></li>';
				}
			}
			returnString+= '<li>&nbsp;</li>';

			return returnString;
		}
	}

	var helpers = {

		getIScrollPage : function(obj) {
			var scrollY = obj.y * -1;
			var itemHeight = obj.pages[0][0].height;
			return Math.floor(scrollY / itemHeight);
		},

		pad : function( value, max) {
			value = value.toString();
			return value.length < max ? WhatTimeIsLove.helpers.pad('0' + value, max) : value;
		}
	}
	WhatTimeIsLove.helpers = helpers;

	window.WhatTimeIsLove = WhatTimeIsLove;

})(window, document);

// Add Date.toISOString support to older browsers
if (!Date.prototype.toISOString) {
  (function() {

    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }

    Date.prototype.toISOString = function() {
      return this.getUTCFullYear() +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate()) +
        'T' + pad(this.getUTCHours()) +
        ':' + pad(this.getUTCMinutes()) +
        ':' + pad(this.getUTCSeconds()) +
        '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z';
    };

  }());
}

$(document).on('ready', function() {
	var wtl = new WhatTimeIsLove('#wtl-input', {});
});
