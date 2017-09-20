$(function(){
	$( "div.close" ).click(function() {
		$( "webview" ).remove();
		window.parent.postMessage( { command: "close_modal" } , "*" );
	})
	
	window.parent.postMessage( { command: "get_params" } , "*" );
	
	window.addEventListener('message', function( e ) { 
		switch( e.data.command ){
			case "get_params":
				console.log(e.data.params.url);
				$( "webview" ).attr( "src", e.data.params.url );
				break;
		}
	});
});	