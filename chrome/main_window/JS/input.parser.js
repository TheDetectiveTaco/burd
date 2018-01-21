function parseInput( e ){
	/*
		e.object
		e.input
		e.socketID
	*/
	
	var VT = String.fromCharCode( 11 );
	if( e.input.indexOf( VT ) > -1 ) {
		/* char 11 is used to send multiple messages */
		var lines = e.input.split( VT );
		for( var i in lines ){
			e.input = lines[i];
			parseInput( e );
		}
		return;
	}
	
	
	e.socket = getSocketByID( e.socketID );
	if ( e.input == "" ) return;
	
	var channelName = base64.decode( e.object.attr( "channel" ) );
	
	/* translate custom commands */
	for( var i in settings.customCommands ) {
		var re = new RegExp(settings.customCommands[i][0], 'i');
		var matches = e.input.match( re );
		if( matches != null ) {
			var result = settings.customCommands[i][1];
			result = result.replace( /\%n/g, channelName );
			for(var a in matches){
				result = result.replace("$" + a, matches[a]);
			}
			e.input = "/" + result;
		}
	}
	
	/*
	cMsg will be the entire text after the first space
	we put this in it's own var because we use it often!
	*/
	var cMsg = "";
	var inputBits = e.input.split( " " );
	var com = inputBits[0].toLowerCase().substr( 1 );
	
	channel.byObject( e.object );
	if( e.input.length > e.input.indexOf( " " ) ) cMsg = e.input.substr( e.input.indexOf( " " ) + 1 );
	
	if( channelName == "network console" && e.input.substr(0,1) != "/" ){
		channel.add.info( "Not a channel window. Only commands are accepted here!" );
		return;
	}
	
	if ( inputBits[0].substr(0,1) == "/" ){
		switch( inputBits[0].toLowerCase().substr(1) ){
			case "clear":
			case "clr":
				$( "div.channel:visible div.content" ).html( "" );
				break;
				
			case "closepms":
				//
				$("li[type='2']").each(function(){
					var server = $( this ).parent().parent().attr( "socket" );
					switcher.find( server, base64.decode( $( this ).attr( "channel" ) ) ).close();
				});
				break;
				
			case "ctcp":
				if( inputBits.length < 3 ) return argError( "/%c nick ctcp_message" );
				e.socket.send( "PRIVMSG " + inputBits[1] + (" :{1}" + cMsg.substr(inputBits[1].length + 1) + "{1}").replace(/\{1\}/g, String.fromCharCode(1)) );
				break;
			
			case "echo":
				channel.add.info( e.input.substr( 6 ) );
				break;

			case "test":
				notifications.create( { title: "a message", message: "hi\r\nthere", callback: function(){
					console.log("yay");
				} } );
				break;
			
			case "action":
			case "me":
				if( inputBits.length < 2 ) return argError( "/%c message" );
				e.socket.send("PRIVMSG " + channelName + " :" + String.fromCharCode(1) + "ACTION " +cMsg + String.fromCharCode(1));
				channel.addUserText( e.socket.userInfo.nick.nick, cMsg, true );
				break;
				
			case "ignore":
				if( cMsg == inputBits[0] ){
					/* /ignore with no values */
					channel.add.info( "There are " + settings.ignore.users.length + " user string(s) and " + settings.ignore.regex.length + " regex value(s) on ignore." );
					channel.add.info( "<b>User string(s):</b> " + HTMLParser.stringify(settings.ignore.users.toString().replace(/\,/g, ", ")), true );
					channel.add.info( "<b>Regex value(s):</b> " + HTMLParser.stringify(settings.ignore.regex.toString().replace(/\,/g, ", ")), true );
				}else if( cMsg.substr( 0, 1 ) == "/" && cMsg.lastIndexOf( "/"  > 2 ) ) {
					/* it's regex */
					var re = cMsg;
					settings.ignore.regex.push( re );
					channel.add.info( "Added regex value to ignore: <b>" + HTMLParser.stringify(re) + "</b>", true );
				}else{
					cMsg = cMsg.toLowerCase();
					if ( cMsg.indexOf( "!" ) < 0 ) cMsg = cMsg + "!*@*"
					if( ignore.matchUser( cMsg ) ) return inputError( "Value is already a part of the ignore list" );
					channel.add.info( "Added user string to ignore: <b>" + HTMLParser.stringify( cMsg ) + "</b>", true );
					settings.ignore.users.push( cMsg );
				}
				break;
			
			case "join":
			case "j":
				if( inputBits.length < 2 ) return argError( "/%c #channel" );
				e.socket.send( "JOIN " + cMsg );
				break;
			
			case "msg":
			case "privmsg":
			case "pm":
				if( inputBits.length < 3 ) return argError( "/%c nick message" );
				e.socket.send( "PRIVMSG " + inputBits[1] + " :" + cMsg.substr(inputBits[1].length + 1));
				break;

			case "mode":
				if( inputBits.length < 2 ){
					return argError( "/%c user/channel [mode]" );
				}else if( inputBits.length == 2 ){
					e.socket.send( "MODE " + inputBits[1]);
				}else{
					e.socket.send( "MODE " + inputBits[1] + " " + cMsg.substr(inputBits[1].length + 1));
				}
				break;				
				
				
			case "notice":
				if( inputBits.length < 3 ) return argError( "/%c nick message" );
				e.socket.send( "NOTICE " + inputBits[1] + " :" + cMsg.substr(inputBits[1].length + 1));
				break;
			
			case "part":
			case "leave":
				if( inputBits.length == 1 ){
					e.socket.send( "PART " + channelName );
				}else{
					e.socket.send( "PART " + cMsg );
				}
				break;
				
			case "say":
				/* added for MetaNova compatibility */
				if( cMsg == inputBits[0] ) return argError( "/%c message" );
				e.socket.send( "PRIVMSG " + channelName + " :" + cMsg );
				break;

			case "unignore":
				if( cMsg == inputBits[0] ){
					return argError( "/%c value" );
				}else if( cMsg.substr( 0, 1 ) == "/" && cMsg.lastIndexOf( "/"  > 2 ) ) {
					/* it's regex */
					var re = cMsg;
					//settings.ignore.regex.push( re );
					for( var i in settings.ignore.regex ) {
						if( settings.ignore.regex[i].toLowerCase() == re.toLowerCase() ) {
							channel.add.info( "Removed regex value from ignore: <b>" + HTMLParser.stringify(settings.ignore.regex[i]) + "</b>", true );
							settings.ignore.regex.splice( i, 1 );
							return;
						}
					}
					channel.add.info( "Regex value was not found" );
				}else{
					cMsg = cMsg.toLowerCase();
					if ( cMsg.indexOf( "!" ) < 0 ) cMsg = cMsg + "!*@*"
					for( var i in settings.ignore.users ) {
						if( settings.ignore.users[i].toLowerCase() == cMsg ) {
							channel.add.info( "Removed user string from ignore: <b>" + HTMLParser.stringify(settings.ignore.users[i]) + "</b>", true );
							settings.ignore.users.splice( i, 1 );
							return;
						}
					}
					channel.add.info( "User string was not found" );
				}
				break;
			case "raw":
			case "quote":
				e.socket.send( cMsg );
				break;	
			case "umode":
				if( inputBits.length == 1 ){
					e.socket.send( "MODE " + e.socket.userInfo.nick.nick );
				}else{
					e.socket.send( "MODE " + e.socket.userInfo.nick.nick + " :" + cMsg );
				}
				break;
				
			default:
				if( processUserCommands() ) {
					return;
				}else{
					e.socket.send( e.input.substr( 1 ) );
				}
				break;
				
		}
	}else{

		channel.add.userText({
			user: e.socket.userInfo.nick.nick,
			text: e.input,
			color: cssGetValue( "nickdefault", "color" ),
			nosound: true
		});
		
		e.socket.send("PRIVMSG " + channelName + " :" + e.input);
		
	}
	
	function argError( e ) {
		channel.add.info( "Invalid usage of command \"" + com.toUpperCase() + "\"" );
		channel.add.info( "Usage example: " + e.replace( /\%c/g, com ) );
		return false;
	}
	
	function inputError( e ){
		if( e != undefined ) {
			channel.add.info( e );
		}else{
			channel.add.info( "Invalid command or command arguments" );
		}
		return false;
	}


	function processUserCommands(){
		if( e.isUserCommand != undefined ) return false;
		
		var uc = settings.userCommands;
		var input = inputBits[0].toLowerCase().substr(1);
		var d = new Date();
		for( var i in uc ) {
			if( uc[i].command == input ){
				var action = uc[i].action;
				action = action.replace( /\%c/g, channelName );
				action = action.replace( /\%e/g, e.socket.serverInfo.serverName );
				action = action.replace( /\%n/g, e.socket.userInfo.nick.nick );
				action = action.replace( /\%v/g, app.version );
				action = action.replace( /\%t/g, d.toTimeString() );
				action = action.replace( /\%d/g, d.toLocaleDateString() );
				action = wordToEnd( action, e.input );
				e.input = "/" + action;
				e.isUserCommand = true;
				parseInput( e );
				return true;
			}
		}
		return false; /* if false is returned then no user command was processed */

		function wordToEnd( i, z ){
			var words = ( "undefined " + z ).split( " " ); /* add undefined to pad the indexes out, making 1 the first word */
			for (a = 1; a < 9; a++) { 
				if( i.indexOf( "&" + a ) > -1 ) {
					var start = 0;
					for (b = 1; b < a; b++) { 
						start += words[b].length + 1;
					}
					for (k = 0; k < 9; k++) { 
						i = i.replace( "&" + a, z.substr( start ) );
						i = i.replace( "%" + a, words[a] );
					}
				}
			}
			return i;
		}

	}
}