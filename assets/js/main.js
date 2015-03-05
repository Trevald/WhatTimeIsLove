/*! WhatTimeIsLove v0.0.1 ~ (c) 2015 Benjamin Holfve ~ Licensed under the MIT License */
(function (window, document) {

	WhatTimeIsLove = function(el, options) {
		this.element = typeof el == 'string' ? document.querySelector(el) : el;

		// Holds the data that is currently rendered on screen
		this.viewDate = new Date();
		this.viewDate.setHours(12);
		this.viewDate.setMinutes(0);

		// Holds the data that user submits to the original input
		this.date = null;

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
			this.buildPreviewHTML();

			// Bind handlers to events
			this.daysBindEvents();
			this.monthBindEvents();
			this.yearBindEvents();
			this.timeBindIScroll();
			this.submitBindEvents();

			// Get the current timezone
			this.timeZoneOffset = this.getTimezoneOffset();

			// Render initial values
			this.updateView();

			// Set time
			this.setTime(this.viewDate.getHours(), this.viewDate.getMinutes());
		},

		setTime : function(hours, minutes) {
			this.iScroll.hours.goToPage(0, this.viewDate.getHours() - 1, 0); // IScroll.utils.ease.bounce);
			this.iScroll.minutes.goToPage(0, this.viewDate.getMinutes(), 0); // IScroll.utils.ease.bounce);
		},

		updateView : function() {
			this.container.year.input.setAttribute('value', this.viewDate.getFullYear());
			this.container.month.value.innerHTML = this.getMonthString(this.viewDate.getMonth());
			this.renderDays();
		},

		updatePreview : function() {
			if( this.date === null ) { this.container.preview.innerHTML = ''; return false; }

			var dateOptions = {
				year: 	 'numeric',
				month:   'long',
				day:     'numeric',
				weekday: 'long'
			}
			var previewDate = this.date.toLocaleDateString(navigator.language, dateOptions);

			var timeOptions = {
				hour12 : false
			}
			var previewTime = this.date.getHours() + ':' + helpers.pad(this.date.getMinutes(), 2);

			this.container.preview.innerHTML = previewDate + ' @ ' + previewTime;
		},

		getDateTime : function() {
			var year  	= helpers.pad(this.date.getFullYear(), 4);
			var month 	= helpers.pad(this.date.getMonth() + 1, 2);
			var day   	= helpers.pad(this.date.getDate(), 2);
			var hours 	= helpers.pad(this.date.getHours(), 2);
			var minutes = helpers.pad(this.date.getMinutes(), 2);

			var dateTime = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':00' + this.timeZoneOffset;

			return dateTime;
		},

		/*
		 * Year functions
		 */

		setYear : function(value) {
		 	this.viewDate.setYear(value);
		 	this.updateView();
		},

		/*
		 * Month functions
		 */

		setMonth : function(value) {
		 	if( value < 0 ) {
		 		this.viewDate.setMonth(11);
		 	} else if( value > 11 ) {
		 		this.viewDate.setMonth(0);
		 	} else {
		 		this.viewDate.setMonth(value);
		 	}

		 	this.updateView();
		},

		getMonthString : function(value) {
		 	return this.monthStrings[value];
		},

		renderDays : function() {
		 	var calendarStart = this.getCalendarStart();
		 	var calendarEnd   = this.getCalendarEnd();

		 	var currentDate = calendarStart;
		 	var activeDate = helpers.getStringDate(this.date);
		 	var today = helpers.getStringDate(new Date());

		 	var cssClass = '';
		 	var trs = [];
		 	var tds = [];

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
		 		if( currentDate.getMonth() < this.viewDate.getMonth() ) { cssClass+= ' wtl-previous-month '; }

		 		// Later month
		 		if( currentDate.getMonth() > this.viewDate.getMonth() ) { cssClass+= ' wtl-next-month '; }

		 		// Today
		 		if( helpers.getStringDate(currentDate) == today ) { cssClass+= ' wtl-today '; }

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
		 	var firstOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
		 	var firstOfMonthWeekday = firstOfMonth.getDay();

		 	var calendarStart = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
		 	calendarStart.setDate(calendarStart.getDate() - firstOfMonthWeekday );

		 	return calendarStart;
		},

		getCalendarEnd : function() {
		 	var lastOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0);
		 	var lastOfMonthWeekday = lastOfMonth.getDay();

		 	var calendarEnd = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0);
		 	calendarEnd.setDate(calendarEnd.getDate() + ( 6 - lastOfMonthWeekday ) );

		 	return calendarEnd;
		},

		 /*
		  * Value functions
		  */

		setValue : function() {
		 	if( this.date === null ) { this.date = new Date(); }

		 	this.date.setYear(this.viewDate.getFullYear());
		 	this.date.setMonth(this.viewDate.getMonth());
		 	this.date.setDate(this.viewDate.getDate());
		 	this.date.setHours(this.viewDate.getHours());
		 	this.date.setMinutes(this.viewDate.getMinutes());

		 	this.updatePreview();
		 	this.updateInput();
		},

		destroyValue : function() {
			this.date = null;

			this.updatePreview();
			this.element.setAttribute('value', '');
		},

		updateInput : function() {
			this.element.setAttribute('value', this.getDateTime());
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
				timeZoneOffset = timeZoneOffset.toString() + ':00';
			} else {
				timeZoneOffset = timeZoneOffset.toString().split('.');
				timeZoneOffsetMinutes = ( 60 / ( 10 / parseInt(timeZoneOffset[1]) ) );
				timeZoneOffsetMinutes = helpers.pad(timeZoneOffsetMinutes, 2);

				timeZoneOffset = timeZoneOffset[0] + ':' + timeZoneOffsetMinutes;
			}

			if( timeZoneOffset.charAt(0) == '-' ) {
				timeZonePrefix = '-';
				timeZoneOffset = timeZoneOffset.substring(1, timeZoneOffset.length);
			}

			timeZoneOffset = timeZonePrefix + helpers.pad(timeZoneOffset, 5)

			return timeZoneOffset;
		},

		/*
		 * Bind events
		 */

		submitBindEvents : function() {
			var self = this;

			var triggerSubmit = function() {
				//self.setValue();
				// Close datepicker
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
		 			if( e.target == oldActive ) {
		 				helpers.removeClass(oldActive, 'wtl-active');
		 				self.destroyValue();
		 			} else {
			 			if( oldActive ) {
			 				helpers.removeClass(oldActive, 'wtl-active');
			 			}
			 			e.target.className = e.target.className + ' wtl-active';

			 			self.viewDate.setYear( e.target.getAttribute('data-year') );
			 			self.viewDate.setMonth( e.target.getAttribute('data-month') );
			 			self.viewDate.setDate( e.target.getAttribute('data-date') );
						self.setValue();
					}
		 		}
			}
			this.container.days.table.addEventListener('click', clickActiveDay);
			this.container.days.table.addEventListener('touchstart', clickActiveDay);
		},

		monthBindEvents : function() {
			var self = this;

			// Handlers
		 	var previousMonth = function() {
		 		self.setMonth( self.viewDate.getMonth() - 1);
		 	}

		 	var nextMonth = function() {
		 		self.setMonth( self.viewDate.getMonth() + 1);
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
		 		self.setYear( self.viewDate.getFullYear() - 1);
		 	}

		 	var nextYear = function() {
		 		self.setYear( self.viewDate.getFullYear() + 1);
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
				self.viewDate.setHours(value);
				if( self.date !== null ) { self.setValue(); }

			});
			this.iScroll.minutes = new IScroll(this.container.time.minutes, {
		 		mouseWheel: true,
		 		snap: 'li'
			});
			this.iScroll.minutes.on('scrollEnd', function(e) {
				var value = WhatTimeIsLove.helpers.getIScrollPage(this);
				if( value == 60 ) { value = 0; }
				self.viewDate.setMinutes(value);
				if( self.date !== null ) { self.setValue(); }
			});
		},


		/*
		 * Builders
		 */

		buildPreviewHTML : function() {
			this.container.preview = document.createElement('p');
			this.container.preview.className = 'wtl-preview';

			this.container.appendChild(this.container.preview);
		},

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
					returnString+= '<li value="'+i+'"><span>' + text.charAt(0) + '</span><span>' + text.charAt(1) + '</span></li>';
				} else {
					returnString+= '<li value="'+i+'"><span></span><span>' + text + '</span></li>';
				}
			}
			returnString+= '<li>&nbsp;</li>';

			return returnString;
		},

		buildMinutesContent : function() {
			var returnString = '';
			for( i = 0 ; i < 60 ; ++i ) {
				if( i < 10 ) { text = '0' + i; } else { text = i + ''; }
				returnString+= '<li value="'+i+'"><span>' + text.charAt(0) + '</span><span>' + text.charAt(1) + '</span></li>';
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

		removeClass : function(element, remove) {
			element.className = element.className.replace( new RegExp(" ?\\b"+remove+"\\b") ,'');
		},

		/**
		 * [getStringDate description]
		 * @param  {Date object} date
		 * @return {String}
		 */
		getStringDate : function(date) {
			if( typeof(date) !== 'object' || date === null ) { return null; }
			if( typeof(date.getMonth) !== 'function' ) { return null; }
			return date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();
		},

		getElementsByAttribute : function(elements, attr, value) {
			var returnArray = [];
			for( i = 0; i < elements.length ; ++i ) {
				//if( elements[i].typeof() === 'object' ) {
					if( elements[i].getAttribute(attr) == value ) {
						returnArray.push(elements[i]);
					}
				//}
			}
			return returnArray;
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
