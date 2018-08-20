$(function(){

	$('body').on('click', 'div.simple_item', function(e) {
		window.location.href = $(this).attr("id") + ".html";
	});
});