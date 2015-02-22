$(document).on('ready', function() {
	var myScroll = new IScroll('#hours', {
 		mouseWheel: true,
 		snap: 'li'
	});
	var myScroll = new IScroll('#minutes', {
 		mouseWheel: true,
 		snap: 'li'
	});
});