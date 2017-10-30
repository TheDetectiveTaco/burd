/* onClick events */
var lastMouseClick = 0;

function setMouseEvents(){
	$( "body" ).click(function() {
		lastMouseClick = Date.now();
		$("div#tooltip").hide();

	});	
	
	$( "div.emoji" ).click(function() {
		console.log( "emoji click" );
		$( "input.user-input:visible" ).val( $( "input.user-input:visible" ).val() + $(this).text() ).focus();
	});	
	
	$( "body" ).mouseup(function() {
		$( "div#smile" ).hide();
	});	
	
	$( "div#menu-icon" ).click(function() {
		$.menu.show( menu.hamburger() );
	});	


	$( "input.error-close" ).click(function() {
		ui.errorMessage.hide();
	});	
	
	$( "input#close-scripts" ).click(function() {
		ui.scripts.hide();
	});	
	

	
	$( "input" ).click(function() {
		$( this ).removeClass( "invalid_input" );
	});
	$( "input" ).on("input", function() {
		$( this ).removeClass( "invalid_input" );
	});	
	
	$( "input.question-yes" ).click(function() {
		ui.ask.hide(true);
	});	
	
	
	$( "input.question-no" ).click(function() {
		ui.ask.hide(false);
	});	
	
	$( "input.input-no" ).click(function() {
		ui.input.hide("");
	});	
	$( "input.input-yes" ).click(function() {
		ui.input.hide( $("input#userinput").val() );
	});	
	
	$( "div.check_container" ).click(function() {
		checkbox( $(this) ).toggleState();
	});	
	
	
	$("div#nav-tree").on("click", "li", function() {
		switcher.find( $(this).parent().parent().attr("socket") , base64.decode( $(this).attr("channel") ) ).show();
	});
	
	
	/* onClick for body */
	$("body").on("click", "div.user", function() {
		$.menu.show( menu.chatUser( $(this).attr("nick"), $("div.right-content:visible").attr("socket") ) );

	});
	
	$("body").on("click", "div.smile", function() {
		$.menu.show( menu.addToChat() );
	});

	$("body").on("click", "div.server-title", function() {
		if( $( this ).parent().hasClass( "open" ) ) {
			$(this).parent().removeClass( "open" );
			$( this ).parent().find( "ul.server-items" ).slideUp( settings.ui.animation );
		}else{
			$(this).parent().addClass( "open" );
			$( this ).parent().find( "ul.server-items" ).slideDown( settings.ui.animation );
		}
		
	});
	
	$("body").on("click", "div.list-count", function() {
		$.menu.show( menu.usersHere() );
	});
	
	$("body").on("click", "a", function() {
		if( $(this).attr("href").substr(0,7) == "http://" || $(this).attr("href").substr(0,8) == "https://" ){
			window.open( $(this).attr("href") );
		}else if( $(this).attr("href").substr(0,8) == "channel:" ){
			var s = getSocketByID( $( "div.channel:visible" ).attr( "socket" ) );
			s.send( "JOIN " + $(this).attr("href").substr(8) );
		}
		event.preventDefault();
	});
	
	$("body").on("click", ".menu-nick", function() {
		$.menu.show( menu.chatUser( $(this).text(), $("div.right-content:visible").attr("socket") ) );
	});
	
	
	$( "div#top-menu-bar ul li" ).click(function() {
		switch( $(this).text().toLowerCase() ){

			case "*":
				$.menu.show([
					{
						name: "Error Popup",
						enabled:true,
						icon: "../images/menu_icons/test.png",
						subMenu: false,
						callback: function(){
							ui.errorMessage.show("Hello","This is a test of the error message system!", function(){ console.log('callback'); } );
						}
					},
					{
						name: "Ask",
						enabled:true,
						icon: "../images/menu_icons/test.png",
						subMenu: false,
						callback: function(){
							ui.ask.show("Are you sure you want to be king?", function(e){ console.log(e); } );
						}
					}
				]);
				break;
			
			case "irc": $.menu.show( menu.IRC ); break;
			case "help": $.menu.show( menu.Help ); break;
		}

	});
}
