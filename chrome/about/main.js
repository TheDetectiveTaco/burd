$(function(){
	$( "input#close" ).click(function() {
		window.parent.postMessage( { command: "close_modal" } , "*");
	});	
});