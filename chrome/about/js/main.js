$(function(){
	$( "div.close" ).click(function() {
		window.parent.postMessage( { command: "close_modal" } , "*" );
	})
});	