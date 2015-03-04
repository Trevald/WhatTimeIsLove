/*! WhatTimeIsLove v0.0.1 ~ (c) 2015 Benjamin Holfve ~ Licensed under the MIT License */
(function (window, document) {

	WhatTimeIsLove = function(el, options) {
		this.element = typeof el == 'string' ? document.querySelector(el) : el;
		this.values = {
			year    : 0,
			month   : 0,
			day     : 0,
			hours   : 0,
			minutes : 0
		}

		this.date = new Date();

		this._init();
	}

	WhatTimeIsLove.prototype = {
		version: '0.1',
		timeZoneOffset : 0,

		monthStrings : ['January', 'February', 'Mars', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		dayStrings : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		dayShortStrings : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

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

			// Build the HTML
			this.buildMonthHTML();
			this.buildDayHTML();
			this.buildYearHTML();
			this.buildTimeHTML();

			// Bind handlers to events
			this.monthBindEvents();
			this.yearBindEvents();
			this.timeBindIScroll();

			// Get the current timezone
			this.timeZoneOffset = this.getTimezoneOffset();

			this.setStartDate();

			// Render weekly calendar
			this.renderDays();

		},

		update : function() {
			var value = this.getDateTime();
			this.date.setYear(this.values.year);
			this.date.setMonth(this.values.month);
			this.date.setDate(this.values.day);
			this.date.setHours(this.values.hours);
			this.date.setMinutes(this.values.minutes);

			this.container.year.input.setAttribute('value', this.values.year);
			this.container.month.value.innerHTML = this.getMonthString(this.values.month);
			this.renderDays();

			this.element.setAttribute('value', value);
			console.log(this.date);
		},

		getDate : function() {
			return new Date(this.values.year, this.values.month, this.values.day );
		},

		getDateTime : function() {
			var year  	= helpers.pad(this.values.year, 4);
			var month 	= helpers.pad(this.values.month+1, 2);
			var day   	= helpers.pad(this.values.day, 2);
			var hours 	= helpers.pad(this.values.hours, 2);
			var minutes = helpers.pad(this.values.minutes, 2);


			var dateTime = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':00' + this.timeZoneOffset;
			//var dateTime = new Date(year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':00' + this.timeZoneOffset).toISOString()
			//console.log(dateTime);
			return dateTime;
		},

		setStartDate : function() {
			var now = new Date();
			this.values.year = now.getFullYear();
			this.values.month = now.getMonth();
			this.values.day = now.getDate();
			this.values.hours = now.getHours();
			this.values.minutes = now.getMinutes();
			this.update();
		},

		/*
		 * Year functions
		 */

		 setYear : function(value) {
		 	this.values.year = value;
		 	this.update();
		 },


		/*
		 * Month functions
		 */

		 setMonth : function(value) {
		 	if( value < 0 ) {
		 		this.values.month = 11;
		 	} else if( value > 11 ) {
		 		this.values.month = 0;
		 	} else {
		 		this.values.month = value;
		 	}

		 	this.update();
		 },

		 getMonthString : function(value) {
		 	return this.monthStrings[value];
		 },

		 renderDays : function() {
		 	var calendarStart = this.getCalendarStart();
		 	var calendarEnd = this.getCalendarEnd();
		 	//console.log(calendarStart, calendarEnd);

		 	var currentDate = calendarStart;
		 	var now = new Date();
		 	var todayTimestamp = new Date(this.values.year, this.values.month, this.values.day).getTime();
		 	var weeksHTML = '';
		 	var cssClass = '';
		 	while( currentDate <= calendarEnd ) {
		 		cssClass = '';

		 		// Sunday
		 		if( currentDate.getDay() == 0 ) { weeksHTML+= '<tr>'; }

		 		// Older month
		 		if( currentDate.getMonth() < this.values.month ) { cssClass+= 'wtl-previous-month '; }

		 		// Later month
		 		if( currentDate.getMonth() > this.values.month ) { cssClass+= 'wtl-next-month '; }

		 		// Today
		 		if( currentDate == now ) { cssClass+= 'wtl-today '; }

		 		// Selected
		 		if( currentDate.getTime() == todayTimestamp ) { cssClass+= 'wtl-active '; }

		 		weeksHTML+= '<td class="' + cssClass + '">' + currentDate.getDate() + '</td>';

		 		// Saturday
		 		if( currentDate.getDay() == 6 ) { weeksHTML+= '</tr>'; }

		 		currentDate.setDate( currentDate.getDate() + 1 );
		 	}

		 	this.container.days.tbody.innerHTML = weeksHTML;

		 },

		 getCalendarStart : function() {
		 	var firstOfMonth = new Date(this.values.year, this.values.month, 1);
		 	var firstOfMonthWeekday = firstOfMonth.getDay();
		 	//console.log('This month starts on a: ' + firstOfMonthWeekday);
		 	var calendarStart = new Date(this.values.year, this.values.month, 1);
		 	calendarStart.setDate(calendarStart.getDate() - firstOfMonthWeekday );
		 	//console.log('calendarStart: ' + calendarStart);
		 	return calendarStart;
		 },

		 getCalendarEnd : function() {
		 	var lastOfMonth = new Date(this.values.year, this.values.month + 1, 0);
		 	var lastOfMonthWeekday = lastOfMonth.getDay();
		 	//console.log('This month ends on a: ' + lastOfMonthWeekday);
		 	var calendarEnd = new Date(this.values.year, this.values.month + 1, 0);
		 	calendarEnd.setDate(calendarEnd.getDate() + ( 6 - lastOfMonthWeekday ) );
		 	//console.log('calendarEnd: ' + calendarEnd);
		 	return calendarEnd;
		 },

		 /*
		  * Day functions
		  */

		 setDay : function(value) {
		 	this.values.date = value;
		 	this.update();
		 },

		/*
		 * Time functions
		 */
		getTimezoneOffset : function() {
			var timeZonePrefix = '+';
			var x = new Date();
			timeZoneOffset = x.getTimezoneOffset() / 60;
			// Handle minutes in offset
			if( timeZoneOffset % 1 === 0 ) {
				//console.log('No minutes');
				timeZoneOffset = timeZoneOffset.toString() + ':00';
			} else {
				timeZoneOffset = timeZoneOffset.toString().split('.');
				timeZoneOffsetMinutes = ( 60 / ( 10 / parseInt(timeZoneOffset[1]) ) );
				timeZoneOffsetMinutes = helpers.pad(timeZoneOffsetMinutes, 2);
				//console.log('Minutes', timeZoneOffset[0], timeZoneOffsetMinutes );

				timeZoneOffset = timeZoneOffset[0] + ':' + timeZoneOffsetMinutes;
			}

			if( timeZoneOffset.charAt(0) == '-' ) {
				timeZonePrefix = '-';
				timeZoneOffset = timeZoneOffset.substring(1, timeZoneOffset.length);
			}


			timeZoneOffset = timeZonePrefix + helpers.pad(timeZoneOffset, 5)


			//console.log(timeZoneOffset);
			return timeZoneOffset;
		},

		/*
		 * Event handlers
		 */

		 events : {

		 	/*
		 	 * Year handlers
		 	 */


		 },

		/*
		 * Bind events
		 */
		monthBindEvents : function() {
			var self = this;

			// Handlers
		 	var previousMonth = function() {
		 		self.setMonth( self.values.month - 1);
		 	}

		 	var nextMonth = function() {
		 		self.setMonth( self.values.month + 1);
		 	}

			this.container.month.btnMinus.addEventListener('click', previousMonth);
			this.container.month.btnMinus.addEventListener('touchstart', previousMonth);

			this.container.month.btnPlus.addEventListener('click', nextMonth);
			this.container.month.btnPlus.addEventListener('touchstart', nextMonth);
		},

		yearBindEvents : function() {
			var self = this;

			// Handlers
		 	var editYear = function() {
		 		self.container.year.input.focus();
		 	}

		 	var previousYear = function() {
		 		self.setYear( self.values.year - 1);
		 	}

		 	var nextYear = function() {
		 		self.setYear( self.values.year + 1);
		 	}

			this.container.year.btnMinus.addEventListener('click', previousYear);
			this.container.year.btnMinus.addEventListener('touchstart', previousYear);

			this.container.year.btnPlus.addEventListener('click', nextYear);
			this.container.year.btnPlus.addEventListener('touchstart', nextYear);

			this.container.year.btnEdit.addEventListener('click', editYear);
			this.container.year.btnEdit.addEventListener('touchstart', editYear);
		},

		timeBindIScroll : function() {
			self = this;
			this.iScroll = {};
			this.iScroll.hours = new IScroll(this.container.time.hours, {
		 		mouseWheel: true,
		 		snap: 'li'
			});
			this.iScroll.hours.on('scrollEnd', function(e) {
				var value = WhatTimeIsLove.helpers.getIScrollPage(this) + 1;
				self.values.hours = value;
				//console.log(self.getDateTime());
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
				//console.log(self.getDateTime());
			});
		},


		/*
		 * Builders
		 */

		buildDayHTML : function() {
			// Wrapper for day selector
			this.container.days = document.createElement('div');
			this.container.days.className = 'wtl-days';

			// TABLE for days
			this.container.days.table = document.createElement('table');
			this.container.days.table.className = 'wtl-days-table';

			// THEAD for days
			this.container.days.thead = document.createElement('thead');
			//this.container.days.thead.tr = document.createElement('tr');
			//this.container.days.thead.appendChild(this.container.days.thead.tr);

			// THs for headings
			var tHeadHTML = '';
			for( i = 0; i < this.dayShortStrings.length; ++i ) {
				tHeadHTML+= '<th class="wtl-day-' + this.dayShortStrings[i].toLowerCase() + '">' + this.dayShortStrings[i] + '</th>';
			}
			this.container.days.thead.innerHTML = '<tr>' + tHeadHTML +'</tr>';

			// TBODY for days
			this.container.days.tbody = document.createElement('tbody');

			// Append everything to container
			this.container.days.table.appendChild(this.container.days.thead);
			this.container.days.table.appendChild(this.container.days.tbody);
			this.container.days.appendChild(this.container.days.table);
			this.container.appendChild(this.container.days);

		},

		buildMonthHTML : function() {
			// Buttons content
			var btnMinusText = document.createTextNode('');
			var btnPlusText = document.createTextNode('');
			var optionsText = ['January', 'February', 'Mars', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

			// Wrapper for month selector
			this.container.month = document.createElement('div');
			this.container.month.className = 'wtl-month';

			// Text holder for month value
			this.container.month.value = document.createElement('div');
			this.container.month.value.className = 'wtl-month-value';

			// Buttons
			this.container.month.btnMinus = document.createElement('a');
			this.container.month.btnMinus.className = 'wtl-btn-minus';
			this.container.month.btnMinus.appendChild(btnMinusText);

			this.container.month.btnPlus = document.createElement('a');
			this.container.month.btnPlus.className = 'wtl-btn-plus';
			this.container.month.btnPlus.appendChild(btnPlusText);

			/*
			// Can SELECT be freely styled in all browsers?

			// Select
			this.container.month.select = document.createElement('select');
			this.container.month.select.className = 'wtl-month-select';
			this.container.month.select.setAttribute('size', '1');

			// Options
			for( i = 0 ; i < optionsText.length ; ++i ) {
				option = document.createElement('option');
				option.appendChild(document.createTextNode(optionsText[i]));
				option.setAttribute('value', i);
				this.container.month.select.appendChild(option);
			}
			*/

			// Append everything to container
			this.container.month.appendChild(this.container.month.value);
			this.container.month.appendChild(this.container.month.btnMinus);
			this.container.month.appendChild(this.container.month.btnPlus);
			this.container.appendChild(this.container.month);

		},

		buildYearHTML : function() {
			// Buttons content
			var btnMinusText = document.createTextNode('');
			var btnPlusText = document.createTextNode('');
			var btnEditText = document.createTextNode('');

			// Wrapper for year selector
			this.container.year = document.createElement('div');
			this.container.year.className = 'wtl-year';

			// Wrapper for year input
			this.container.year.wrapper = document.createElement('div');
			this.container.year.wrapper.className = 'wtl-year-input-wrapper';

			// Input
			this.container.year.input = document.createElement('input');
			this.container.year.input.className = 'wtl-year-input';
			this.container.year.input.setAttribute('type', 'tel'); // Use tel so we get numpad on touch devices
			this.container.year.input.setAttribute('maxlength', '4');

			// Buttons
			this.container.year.btnMinus = document.createElement('a');
			this.container.year.btnMinus.className = 'wtl-btn-minus';
			this.container.year.btnMinus.appendChild(btnMinusText);

			this.container.year.btnPlus = document.createElement('a');
			this.container.year.btnPlus.className = 'wtl-btn-plus';
			this.container.year.btnPlus.appendChild(btnPlusText);

			this.container.year.btnEdit = document.createElement('a');
			this.container.year.btnEdit.className = 'wtl-btn-edit';
			this.container.year.btnEdit.appendChild(btnEditText);

			// Append everything to container
			this.container.year.wrapper.appendChild(this.container.year.input);
			this.container.year.wrapper.appendChild(this.container.year.btnEdit);
			this.container.year.appendChild(this.container.year.wrapper);
			this.container.year.appendChild(this.container.year.btnMinus);
			this.container.year.appendChild(this.container.year.btnPlus);
			this.container.appendChild(this.container.year);

		},

		buildTimeHTML : function() {
			// Wrapper for time selector
			this.container.time = document.createElement('div');
			this.container.time.className = 'wtl-time';

			// Hours
			this.container.time.hours = document.createElement('div');
			this.container.time.hours.className = 'wtl-hours wtl-iscroll';
			this.container.time.hours.innerHTML = this.getHoursHTML();

			// Minutes
			this.container.time.minutes = document.createElement('div');
			this.container.time.minutes.className = 'wtl-minutes wtl-iscroll';
			this.container.time.minutes.innerHTML = this.getMinutesHTML();

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

		buildHoursContent : function() {
			var returnString = '';
			for( i = 1 ; i < 25 ; ++i ) {
				text = i.toString();
				if( text.length > 1 ) {
					returnString+= '<li><span>' + text.charAt(0) + '</span><span>' + text.charAt(1) + '</span></li>';
				} else {
					returnString+= '<li><span></span><span>' + text + '</span></li>';
				}
			}
			returnString+= '<li>&nbsp;</li>';

			return returnString;
		},

		buildMinutesContent : function() {
			var returnString = '';
			for( i = 0 ; i < 60 ; ++i ) {
				if( i < 10 ) { text = '0' + i; } else { text = i + ''; }
				returnString+= '<li><span>' + text.charAt(0) + '</span><span>' + text.charAt(1) + '</span></li>';
			}
			returnString+= '<li>00</li>';
			returnString+= '<li>&nbsp;</li>';

			return returnString;
		},

		getHoursHTML : function() {
			var returnString = '';
			var minutes = this.buildHoursContent();
			returnString+= this.templates.iScroll.replace('%content', minutes).replace('%cssClasses', 'wtl-hours');

			return returnString;
		},

		getMinutesHTML : function() {
			var returnString = '';
			var minutes = this.buildMinutesContent();
			returnString+= this.templates.iScroll.replace('%content', minutes).replace('%cssClasses', 'wtl-minutes');

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
