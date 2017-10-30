function setKeyEvents(){
	/* Globsl key events */
	$( "body" ).keydown(function(e) {

		if( e.key != "Tab" ) tabUsers = [];
		switch( e.key ){
			case "Escape":
				if( $("div.modal-content:visible").length > 0 ){
					/*hide all modal boxes if escape key is pressed */
					$("div.modal-content").hide().parent().parent().hide();
					$( "div#main-app" ).css("-webkit-filter", "");
					$( "div#main-app" ).css("filter", "");
					$( "input.user-input:visible" ).focus();
				}
				break;
			case "Enter":
				lastMouseClick = Date.now();
				textCache.index = 0;
				textCache.addText( $("input.user-input:visible").val() );
				if( $("div.right-content input:focus").length == 1 ) {
					$( "#scripts" )[0].contentWindow.postMessage( {
						command: "on_user_input",
						socketID: $("div.right-content:visible").attr("socket"),
						message: $("input.user-input:visible").val()
						
					}, "*" );
					$("input.user-input:visible").val( "" );
				}else if( $("div.userinput input:focus").length == 1){
					ui.input.hide( $( "div.userinput input[type='text']" ).val() );
				}

				break;
			case "Tab":
				if( e.ctrlKey ) {
					switcher.nextChannel();
				} else {
					tabComplete();
					e.preventDefault(); 
				}
				break;
			
			case "F11":
				if( app.fullScreen ){
					app.fullScreen = false;
					document.webkitExitFullscreen();
				}else{
					app.fullScreen = true;
					document.documentElement.webkitRequestFullScreen();
				}
				break;
				
			case "ArrowUp":
				textCache.scroll( true );
				break;
				
			case "ArrowDown":
				textCache.scroll( false );
				break;
				
			case "k":
				if( e.ctrlKey ){
					var t = $( "input.user-input:visible" );
					t.val( t.val() + String.fromCharCode( 3 ) );
				}
				break;
				
			case "b":
				if( e.ctrlKey ){
					var t = $( "input.user-input:visible" );
					t.val( t.val() + "\x02" );
				}
				break;
				
			case "i":
				if( e.ctrlKey ){
					var t = $( "input.user-input:visible" );
					t.val( t.val() + "\x1D" );
				}
				break;
				
			case "u":
				if( e.ctrlKey ){
					var t = $( "input.user-input:visible" );
					t.val( t.val() + "\x1F" );
				}
				break;
				
			case "u":
				if( e.ctrlKey ){
					var t = $( "input.user-input:visible" );
					t.val( t.val() + "\x1F" );
				}
				break;
				
			case "m":
				if( e.ctrlKey ) ui.html.show( "about" );
				break;
			case "n":
				if( e.ctrlKey ) ui.html.show( "network_list" );
				break;
				break;
			case "s":
				if( e.ctrlKey ) ui.html.show( "settings_window" );
				break;
				

		}
	});
	
}