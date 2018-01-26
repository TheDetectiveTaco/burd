var P = window.parent;

var tmpObj = null;

$(function(){
	$.menu.style = "dark";
	$( "div.close,input#apply" ).click(function() {
		window.parent.postMessage( { command: "close_modal" } , "*" );
	});
	$( "div.tab" ).click(function() {
		$( "div.right-panel" ).hide();
		$( "div.right-panel[sid='" + $(this).attr("sid") + "']" ).show();
		$( "div.tab" ).removeClass( "selected-tab" );
		$(this).addClass( "selected-tab" );
	});
	
	$( "div.checkbox" ).click(function() {
		if( $(this).hasClass( "checked" ) ){
			$(this).removeClass( "checked" );
		}else{
			$(this).addClass( "checked" );
		}
	});
	
	$("body").on("click", "div[sid='ignore'] div.litem", function() {
		tmpObj = $(this);
		$.menu.show([
			{
				name: "Remove Item",  enabled:true,
				icon: false,
				subMenu: false,
				key: false,
				callback: function(e){
					removeIgnore( tmpObj.find(".ltyp").text(), tmpObj.find(".lval").text() );
				}
			}
		]);
	});
	
	$("body").on("click", "div[sid='usercoms'] div.litem", function() {
		tmpObj = $(this);
		$.menu.show([
			{
				name: "Remove Item",  enabled:true,
				icon: false,
				subMenu: false,
				key: false,
				callback: function(e){
					removeCom( tmpObj.find(".ltyp").text(), tmpObj.find(".lval").text() );
				}
			}
		]);
	});
	
	$( "input#add_ignore" ).click(function() {
		var ignoreText = $( "input#ignore_text" ).val();
		if( ignoreText != "" ) {
			if( $( "select#ignore_type" ).val() == "string" ) {
				if( ignoreText.indexOf( "@" ) < 0 ) ignoreText += "!*@*";
				P.settings.ignore.users.push( ignoreText );
			}else{
				if( ignoreText.indexOf( "/" ) != 0 ) ignoreText = "/" + ignoreText + "/ig";
				P.settings.ignore.regex.push( ignoreText );
			}
		}
		$( "input#ignore_text" ).val( "" );
		loadIgnore();
	});

	$( "input#add_command" ).click(function() {
		P.settings.userCommands.push({
			command: $( "input#command" ).val(),
			action: $( "input#action" ).val()
		});
		loadComs();
	});
	
	/* set the state of checkboxes */
	if( P.settings.channels.userColors ) $( "div#colored_nicks" ).addClass( "checked" );
	if( P.settings.channels.textColors ) $( "div#colored_text" ).addClass( "checked" );
	if( P.settings.channels.showTime ) $( "div#timestamps" ).addClass( "checked" );
	if( P.settings.channels.showJPQ ) $( "div#jpq" ).addClass( "checked" );
	if( P.settings.channels.showModes ) $( "div#modes" ).addClass( "checked" );
	if( P.settings.channels.focusOnJoin ) $( "div#autofocus" ).addClass( "checked" );
	if( P.settings.channels.showEmoji ) $( "div#emojis" ).addClass( "checked" );
	
	if( P.settings.sounds.pm ) $( "div#pm_sound" ).addClass( "checked" );
	if( P.settings.sounds.channel ) $( "div#channel_sound" ).addClass( "checked" );
	if( P.settings.sounds.notice ) $( "div#notice_sound" ).addClass( "checked" );
	if( P.settings.sounds.kick ) $( "div#kick_sound" ).addClass( "checked" );
	if( P.settings.sounds.channel ) $( "div#channel_sound" ).addClass( "checked" );
	if( P.settings.sounds.disconnect ) $( "div#disconnect_sound" ).addClass( "checked" );
	
	loadIgnore();
	loadComs();


	

	$( "div.tab[sid='usercoms']" ).click();
});	

function loadComs(){
	var lvo = $( "div[sid='usercoms'] div.lview" );
	lvo.html( "" );
	for( var i in P.settings.userCommands ) {
		lvo.append('<div class="litem"><div class="ltyp">' + P.settings.userCommands[i].command + '</div><div class="lval">' + P.settings.userCommands[i].action + '</div><div class="lc">&nbsp;</div></div>');
	}
}

function loadIgnore(){
	var lvo = $( "div[sid='ignore'] div.lview" );
	lvo.html( "" );
	for( var i in P.settings.ignore.users ) {
		lvo.append('<div class="litem"><div class="ltyp">string</div><div class="lval">' + P.settings.ignore.users[i] + '</div><div class="lc">&nbsp;</div></div>');
	}
	for( var i in P.settings.ignore.regex ) {
		lvo.append('<div class="litem"><div class="ltyp">regex</div><div class="lval">' + P.settings.ignore.regex[i] + '</div><div class="lc">&nbsp;</div></div>');
	}
}

function removeIgnore( a, b ){
	if( a == "string" ) {
		for( var i in P.settings.ignore.users ) {
			if( P.settings.ignore.users[i] == b ) {
				P.settings.ignore.users.splice( i, 1 );
			}
		}
	}else{
		for( var i in P.settings.ignore.regex ) {
			if( P.settings.ignore.regex[i] == b ) {
				P.settings.ignore.regex.splice( i, 1 );
			}
		}
	}
	loadIgnore();
}
function removeCom( a, b ){

	for( var i in P.settings.userCommands ) {
		if( P.settings.userCommands[i].command == a ) {
			P.settings.userCommands.splice( i, 1 );
		}
	}

	loadComs();
}