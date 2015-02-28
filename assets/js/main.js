/*! WhatTimeIsLove v0.0.1 ~ (c) 2015 Benjamin Holfve ~ Licensed under the MIT License */
(function (window, document) {

	WhatTimeIsLove = function(el, options) {
		this.element = typeof el == 'string' ? document.querySelector(el) : el;

		this._init();
	}

	WhatTimeIsLove.prototype = {
		version: '5.1.3',

		templates : {
			container : '<div class="wtl-container">%content</div>',
			iScroll : '<ul>%content</ul>',
			timeSeperator : '<div class="seperator">:</div>'
		},

		_init : function() {
			this.element.style.display = 'none';

			// Build the HTML
			this.HTML = this._buildHTML();

			// Append the HTML
			this.container = document.createElement('div');
			this.container.className = 'wtl-container';
			this.element.parentNode.insertBefore(this.container, this.element.nextSibling);
			//this.container.innerHTML = this.HTML;
			this.container.time = document.createElement('div');
			this.container.time.className = 'wtl-time';

			this.container.time.hours = document.createElement('div');
			this.container.time.hours.className = 'wtl-hours';

			this.container.time.minutes = document.createElement('div');
			this.container.time.minutes.className = 'wtl-minutes wtl-iscroll';
			this.container.time.minutes.innerHTML = this._getMinutesHTML();

			this.container.time.appendChild(this.container.time.hours);
			this.container.time.appendChild(this.container.time.minutes);
			this.container.appendChild(this.container.time);


			/*
			this.iScroll.hours = new IScroll(this.container.time.hours, {
		 		mouseWheel: true,
		 		snap: 'li'
			});
			this.iScroll.hours.on('scrollEnd', function(e) { console.log( getPage(this) + 1); });
*/
			this.iScroll = {};
			this.iScroll.minutes = new IScroll(this.container.time.minutes, {
		 		mouseWheel: true,
		 		snap: 'li'
			});
			this.iScroll.minutes.on('scrollEnd', function(e) { console.log( getPage(this) ); });

		},

		_buildHTML : function() {
			var returnString = '';
			var hours = this._buildHours();
			var minutes = this._buildHours();

			returnString+= this.templates.iScroll.replace('%content', hours).replace('#cssClasses', 'wtl-hours');
			returnString+= this.templates.timeSeperator;
			returnString+= this.templates.iScroll.replace('%content', minutes).replace('#cssClasses', 'wtl-minutes');
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
				if( i < 10 ) { text = '0' + i; } else { text = i; }
				returnString+= '<li>' + text + '</li>';
			}
			returnString+= '<li>00</li>';
			returnString+= '<li>&nbsp;</li>';

			return returnString;
		},

		_buildHours : function() {
			var returnString = '';
			for( i = 1 ; i < 24 ; ++i ) {
				returnString+= '<li>' + i + '</li>';
			}
			returnString+= '<li>&nbsp;</li>';

			return returnString;
		}

	}

	//window.WhatTimeIsLove = WhatTimeIsLove;
	//if ( typeof module != 'undefined' && module.exports ) {
//		module.exports = WhatTimeIsLove;
	//} else {
		window.WhatTimeIsLove = WhatTimeIsLove;
	//}

})(window, document, Math);

$(document).on('ready', function() {
	var wtl = new WhatTimeIsLove('#wtl-input', {});
});

/*
$(document).on('ready', function() {
	var hourScroll = new IScroll('#hours', {
 		mouseWheel: true,
 		snap: 'li'
	});
	var minutesScroll = new IScroll('#minutes', {
 		mouseWheel: true,
 		snap: 'li'
	});
	hourScroll.on('scrollEnd', function(e) { console.log( getPage(this) + 1); });
	minutesScroll.on('scrollEnd', function(e) { console.log( getPage(this) ); });
});
*/

function getPage(obj) {
	var scrollY = obj.y * -1;
	var itemHeight = obj.pages[0][0].height;
	console.log(obj.y);
	return Math.floor(scrollY / itemHeight);
}