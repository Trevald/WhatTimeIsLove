/*! WhatTimeIsLove v0.0.1 ~ (c) 2015 Benjamin Holfve ~ Licensed under the MIT License */
(function (window, document) {

	WhatTimeIsLove = function(el, options) {
		this.element = typeof el == 'string' ? document.querySelector(el) : el;
		this.view = {
			year    : 0,
			month   : 0,
			day     : 0,
			hours   : 0,
			minutes : 0,
			date : function() {
				return new Date(this.year, this.month, this.day, this.hours, this.minutes);
			}
		}
		this.values = {
			year    : 0,
			month   : 0,
			day     : 0,
			hours   : 0,
			minutes : 0,
			date : function() {
				return new Date(this.year, this.month, this.day, this.hours, this.minutes);
			}
		}

		this.viewDate = new Date();
		this.valueDate = null;

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
			this.buildSubmitHTML();

			// Bind handlers to events
			this.daysBindEvents();
			this.monthBindEvents();
			this.yearBindEvents();
			this.timeBindIScroll();
			this.submitBindEvents();

			// Get the current timezone
			this.timeZoneOffset = this.getTimezoneOffset();

			this.setStartDate();

			// Render weekly calendar
			this.renderDays();

		},

		update : function() {
			this.container.year.input.setAttribute('value', this.view.year);
			this.container.month.value.innerHTML = this.getMonthString(this.view.month);
			this.renderDays();

			//this.element.setAttribute('value', this.date());
		},

		getDate : function() {
			return new Date(this.view.year, this.view.month, this.view.day );
		},

		getDateTime : function() {
			var year  	= helpers.pad(this.view.year, 4);
			var month 	= helpers.pad(this.view.month+1, 2);
			var day   	= helpers.pad(this.view.day, 2);
			var hours 	= helpers.pad(this.view.hours, 2);
			var minutes = helpers.pad(this.view.minutes, 2);

			var dateTime = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':00' + this.timeZoneOffset;
			//var dateTime = new Date(year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':00' + this.timeZoneOffset).toISOString()
			//console.log(dateTime);
			return dateTime;
		},

		setStartDate : function() {
			var now = new Date();
			this.view.year = now.getFullYear();
			this.view.month = now.getMonth();
			this.view.day = now.getDate(); this.view.day = 19;
			this.view.hours = now.getHours();
			this.view.minutes = now.getMinutes();
			this.update();
		},

		/*
		 * Year functions
		 */

		setYear : function(value) {
		 	this.view.year = value;
		 	this.update();
		},

		/*
		 * Month functions
		 */

		setMonth : function(value) {
		 	if( value < 0 ) {
		 		this.view.month = 11;
		 	} else if( value > 11 ) {
		 		this.view.month = 0;
		 	} else {
		 		this.view.month = value;
		 	}

		 	this.update();
		},

		getMonthString : function(value) {
		 	return this.monthStrings[value];
		},

		renderDays : function() {
		 	var calendarStart = this.getCalendarStart();
		 	var calendarEnd   = this.getCalendarEnd();

		 	var now = new Date();
		 	var currentDate = calendarStart;
		 	var activeDate = helpers.getStringDate(this.values.date());
		 	var nowTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

		 	var cssClass = '';
		 	var trs = [];
		 	var tds = [];

		 	console.log('activeDate:' + activeDate);

		 	// Remove old TDs
		 	while (this.container.days.tbody.firstChild) {
    			this.container.days.tbody.removeChild(this.container.days.tbody.firstChild);
			}

		 	while( currentDate <= calendarEnd ) {
		 		cssClass = 'wtl-table-cell';

		 		// Sunday
		 		if( currentDate.getDay() == 0 ) {
		 			trs[trs.length] = document.createElement('div');
		 			trs[trs.length-1].className = 'wtl-table-row';

		 			this.container.days.tbody.appendChild(trs[trs.length-1]);
		 		}

		 		tds[tds.length] = document.createElement('span');

		 		// Older month
		 		if( currentDate.getMonth() < this.view.month ) { cssClass+= ' wtl-previous-month '; }

		 		// Later month
		 		if( currentDate.getMonth() > this.view.month ) { cssClass+= ' wtl-next-month '; }

		 		// Today
		 		if( currentDate.getTime() == nowTimestamp ) { cssClass+= ' wtl-today '; }

		 		// Active
		 		if( helpers.getStringDate(currentDate) == activeDate ) { cssClass+= ' wtl-active '; }

		 		tds[tds.length-1].className = cssClass;
		 		tds[tds.length-1].setAttribute('data-year', currentDate.getFullYear());
		 		tds[tds.length-1].setAttribute('data-month', currentDate.getMonth());
		 		tds[tds.length-1].setAttribute('data-date', currentDate.getDate());
		 		tds[tds.length-1].appendChild(
		 			document.createTextNode(currentDate.getDate())
		 		);
		 		trs[trs.length-1].appendChild(tds[tds.length-1]);

		 		currentDate.setDate( currentDate.getDate() + 1 );
		 	}
		},

		getCalendarStart : function() {
		 	var firstOfMonth = new Date(this.view.year, this.view.month, 1);
		 	var firstOfMonthWeekday = firstOfMonth.getDay();
		 	//console.log('This month starts on a: ' + firstOfMonthWeekday);
		 	var calendarStart = new Date(this.view.year, this.view.month, 1);
		 	calendarStart.setDate(calendarStart.getDate() - firstOfMonthWeekday );
		 	//console.log('calendarStart: ' + calendarStart);
		 	return calendarStart;
		},

		getCalendarEnd : function() {
		 	var lastOfMonth = new Date(this.view.year, this.view.month + 1, 0);
		 	var lastOfMonthWeekday = lastOfMonth.getDay();
		 	//console.log('This month ends on a: ' + lastOfMonthWeekday);
		 	var calendarEnd = new Date(this.view.year, this.view.month + 1, 0);
		 	calendarEnd.setDate(calendarEnd.getDate() + ( 6 - lastOfMonthWeekday ) );
		 	//console.log('calendarEnd: ' + calendarEnd);
		 	return calendarEnd;
		},

		 /*
		  * Value functions
		  */

		 setValue : function() {
		 	this.values.year    = this.view.year;
		 	this.values.month   = this.view.month;
		 	this.values.day     = this.view.day;
		 	this.values.hours   = this.view.hours;
		 	this.values.minutes = this.view.minutes;
		 	this.updateInput();
		 },

		 updateInput : function() {
		 	this.element.setAttribute('value', this.getDateTime());
		 },

		 /*
		  * Date functions
		  */

		setDate : function(value) {
			this.view.year = value.getFullYear();
			this.view.month = value.getMonth();
			this.view.day = value.getDate();
			this.update();
		},

		 /*
		  * Day functions
		  */

		 setDay : function(value) {
		 	this.view.day = value;
		 	//this.update();
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


		 },

		/*
		 * Bind events
		 */

		submitBindEvents : function() {
			var self = this;

			var triggerSubmit = function() {
				console.log(1);
				self.setValue();
			}

			this.container.submit.addEventListener('click', triggerSubmit);
			this.container.submit.addEventListener('touchstart', triggerSubmit);

		},

		daysBindEvents : function() {
			var self = this;

			// Handlers
			var clickActiveDay = function(e) {
		 		if( e.target && e.target.nodeName == 'SPAN' ) {
		 			var oldActive = this.getElementsByClassName('wtl-active')[0];
		 			if( oldActive ) {
		 				helpers.removeClass(oldActive, 'wtl-active');
		 			}
		 			e.target.className = e.target.className + ' wtl-active';
		 			var date = new Date(
		 				e.target.getAttribute('data-year'),
		 				e.target.getAttribute('data-month'),
		 				e.target.getAttribute('data-date')
		 			);
		 			console.log(e.target.getAttribute('data-date'));
		 			console.log(date);
		 			self.setDay(e.target.getAttribute('data-date'));
		 			self.setDate(date);
		 		}
			}
			this.container.days.table.addEventListener('click', clickActiveDay);
			this.container.days.table.addEventListener('touchstart', clickActiveDay);
		},

		monthBindEvents : function() {
			var self = this;

			// Handlers
		 	var previousMonth = function() {
		 		self.setMonth( self.view.month - 1);
		 	}

		 	var nextMonth = function() {
		 		self.setMonth( self.view.month + 1);
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
		 		self.setYear( self.view.year - 1);
		 	}

		 	var nextYear = function() {
		 		self.setYear( self.view.year + 1);
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
				self.view.hours = value;
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
				self.view.minutes = value;
				//console.log(self.getDateTime());
			});
		},


		/*
		 * Builders
		 */

		 buildSubmitHTML : function() {
		 	// Text
		 	var submitText = document.createTextNode('Done!');

		 	// Submit button
		 	this.container.submit = document.createElement('button');
		 	this.container.submit.className = 'wtl-submit';
		 	this.container.submit.appendChild(submitText);

		 	// Append to container
		 	this.container.appendChild(this.container.submit);
		 },

		buildDayHTML : function() {
			// Wrapper for day selector
			this.container.days = document.createElement('div');
			this.container.days.className = 'wtl-days';

			// TABLE for days
			this.container.days.table = document.createElement('div');
			this.container.days.table.className = 'wtl-days-table';

			// THEAD for days
			this.container.days.thead = document.createElement('div');
			this.container.days.thead.className = 'wtl-days-thead';
			//this.container.days.thead.tr = document.createElement('tr');
			//this.container.days.thead.appendChild(this.container.days.thead.tr);

			// THs for headings
			var tHeadHTML = '';
			for( i = 0; i < this.dayShortStrings.length; ++i ) {
				tHeadHTML+= '<span class="wtl-table-heading wtl-day-' + this.dayShortStrings[i].toLowerCase() + '">' + this.dayShortStrings[i] + '</span>';
			}
			this.container.days.thead.innerHTML = '<div class="wtl-table-row">' + tHeadHTML +'</div>';

			// TBODY for days
			this.container.days.tbody = document.createElement('div');
			this.container.days.tbody.className = 'wtl-days-tbody';

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

			// Shadows
			this.container.time.shadows = document.createElement('div');
			this.container.time.shadows.className = 'wtl-time-shadows';

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
			this.container.time.appendChild(this.container.time.shadows);
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
		},

		getElementByClassName : function(elements, className) {
			for( i in elements ) {
  				if((' ' + elements[i].className + ' ').indexOf(' ' + className + ' ') > -1) {
            		return elements[i];
        		}
			}
			return null;
		},

		removeClass : function(element, remove) {
			element.className = element.className.replace( new RegExp(" ?\\b"+remove+"\\b") ,'');
		},

		/**
		 * [getStringDate description]
		 * @param  {Date object} date
		 * @return {String}
		 */
		getStringDate : function(date) {
			return date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();
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
