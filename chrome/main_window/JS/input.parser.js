
function parseInput( e ){
	/*
		e.object
		e.input
		e.socketID
	*/
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
	
	var cMsg = "";
	if( e.input.length > e.input.indexOf( " " ) ) cMsg = e.input.substr( e.input.indexOf( " " ) + 1 );
	var inputBits = e.input.split( " " );
	var chan = channel.byObject( e.object );
	
	if( channelName == "network console" && e.input.substr(0,1) != "/" ){
		chan.addInfo( "Not a channel window. Try /join #channel" );
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
					var chan = base64.decode( $( this ).attr( "channel" ) );
					var server = $( this ).parent().parent().attr( "socket" );
					switcher.find( server, chan ).close();
				});
				break;
				
			case "ctcp":
				if( inputBits.length < 3 ) return inputError( "Invalid command arguments for " + inputBits[0] );
				e.socket.send( "PRIVMSG " + inputBits[1] + (" :{1}" + cMsg.substr(inputBits[1].length + 1) + "{1}").replace(/\{1\}/g, String.fromCharCode(1)) );
				break;
			
			case "test":
				chrome.notifications.onClicked.addListener(function(e){console.log(e)});
				chrome.notifications.create("hd663d76h", {
					type: "basic",
					message: "sdfsdf",
					iconUrl: "../images/mdl/black/ic_question_answer_48px.svg",
					title: "asdasd",
					isClickable: true
				});
				break;
			
			case "action":
			case "me":
				if( inputBits.length < 2 ) return inputError( "Invalid command arguments for " + inputBits[0] );
				e.socket.send("PRIVMSG " + channelName + " :" + String.fromCharCode(1) + "ACTION " +cMsg + String.fromCharCode(1));
				chan.addUserText( e.socket.userInfo.nick.nick, cMsg, true );
				break;
				
			case "ignore":
				if( cMsg == inputBits[0] ){
					/* /ignore with no values */
					chan.addInfo( "There are " + settings.ignore.users.length + " user string(s) and " + settings.ignore.regex.length + " regex value(s) on ignore." );
					chan.addInfo( "<b>User string(s):</b> " + HTMLParser.stringify(settings.ignore.users.toString().replace(/\,/g, ", ")) );
					chan.addInfo( "<b>Regex value(s):</b> /" + HTMLParser.stringify(settings.ignore.regex.toString().replace(/\,/g, "/, /")) + "/" );
				}else if( cMsg.substr( 0, 1 ) == "/" && cMsg.lastIndexOf( "/" ) == cMsg.length-1 ) {
					/* it's regex */
					var re = cMsg.substr( 1, cMsg.length-2 );
					settings.ignore.regex.push( re );
					chan.addInfo( "Added regex value to ignore: /<b>" + HTMLParser.stringify(re) + "</b>/" );
				}else{
					cMsg = cMsg.toLowerCase();
					if ( cMsg.indexOf( "!" ) < 0 ) cMsg = cMsg + "!*@*"
					if( ignore.matchUser( cMsg ) ) return inputError( "Value is already a part of the ignore list" );
					chan.addInfo( "Added user string to ignore: <b>" + HTMLParser.stringify( cMsg ) + "</b>" );
					settings.ignore.users.push( cMsg );
				}
				break;
			
			case "join":
			case "j":
				if( inputBits.length < 2 ) return inputError( "Invalid command arguments for " + inputBits[0] );
				e.socket.send( "JOIN " + cMsg );
				break;
			
			case "msg":
			case "privmsg":
			case "pm":
				if( inputBits.length < 3 ) return inputError( "Invalid command arguments for " + inputBits[0] );
				e.socket.send( "PRIVMSG " + inputBits[1] + " :" + cMsg.substr(inputBits[1].length + 1));
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
				if( cMsg == inputBits[0] ) return inputError( "You didn't enter anything to say" );
				e.socket.send( "PRIVMSG " + channelName + " :" + cMsg );
				break;

			case "unignore":
				if( cMsg == inputBits[0] ){
					/* /ignore with no values */
				}else if( cMsg.substr( 0, 1 ) == "/" && cMsg.lastIndexOf( "/" ) == cMsg.length-1 ) {
					/* it's regex */
					var re = cMsg.substr( 1, cMsg.length-2 );
					//settings.ignore.regex.push( re );
					for( var i in settings.ignore.regex ) {
						if( settings.ignore.regex[i].toLowerCase() == re.toLowerCase() ) {
							chan.addInfo( "Removed regex value from ignore: <b>/" + HTMLParser.stringify(settings.ignore.regex[i]) + "/</b>" );
							settings.ignore.regex.splice( i, 1 );
							return;
						}
					}
					chan.addInfo( "Regex value was not found" );
				}else{
					cMsg = cMsg.toLowerCase();
					if ( cMsg.indexOf( "!" ) < 0 ) cMsg = cMsg + "!*@*"
					for( var i in settings.ignore.users ) {
						if( settings.ignore.users[i].toLowerCase() == cMsg ) {
							chan.addInfo( "Removed user string from ignore: <b>" + HTMLParser.stringify(settings.ignore.users[i]) + "</b>" );
							settings.ignore.users.splice( i, 1 );
							return;
						}
					}
					chan.addInfo( "User string was not found" );
				}
				break;
				
			case "umode":
				if( inputBits.length == 1 ){
					e.socket.send( "MODE " + e.socket.userInfo.nick.nick );
				}else{
					e.socket.send( "MODE " + e.socket.userInfo.nick.nick + " :" + cMsg );
				}
				break;
				
			default:
				e.socket.send( e.input.substr( 1 ) );
				break;
				
		}
	}else{
		channel.add.userText({
			user: e.socket.userInfo.nick.nick,
			text: e.input,
			color: cssGetValue( "nickdefault", "color" )
		});
		
		e.socket.send("PRIVMSG " + channelName + " :" + e.input);
	}
	
}
function inputError( e ){
	if( e != undefined ) {
		channel.addInfo( e + " -- for command help <a href='http://www.haxed.net/burd/help#commands'>click here</a>." );
	}else{
		channel.addInfo( "Invalid command or command arguments" );
	}
	return false;
}