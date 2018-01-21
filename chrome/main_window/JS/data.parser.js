var whoCaptureState = 0; //if the state is >0 then we need to capture the results of /who
var lastCTCP = 0;
var lastCTCPping = 0;
var pmCache = [];
function parseData( sock, data ){
	
	if( data[0] != ":" ) data = ":host " + data;
	
	/* split the data by space for easy processing */
	var bits = data.split( " " );


	log( "IN: " + data );
	
	var cMsg = bits[bits.length-1];
	if( data.indexOf( " :" ) > 0 ) cMsg = data.substr( data.indexOf( " :" ) + 2 );
	
	channel.find( sock.socketID, "network console" );
	
	if ( parseInt( bits[1] ) > 0 ) {
		/* it's a numeric! */
		switch( parseInt( bits[1] ) ) {
			
			case E.RPL_WELCOME:
				/* welcome message. registration must have been a success */
				sock.send( "PROTOCTL NAMESX" );
				
				/* attempt to authenticate if set */
				if( sock.userInfo.auth.method == "nickserv" ) {
					sock.send( "NICKSERV IDENTIFY " + sock.userInfo.auth.password );
				}
				
				sock.userInfo.nick.nick = bits[2];
				/*
					attempt to join the channels on autojoin if any
					we put this on a 5 second delay to give time for authentication
				*/
				if( sock.userInfo.autojoin.length > 0 ) {
					setTimeout(function(){
						sock.send( "JOIN " + sock.userInfo.autojoin.toString() );
					}, 5000);
				}
			case E.RPL_YOURHOST:
			case E.RPL_CREATED: 
				channel.add.text(
					HTMLParser.stringify( cMsg )
				);
				break;
			
			case E.RPL_MYINFO:
				/* 004 <my_nick> <server_name> <version> <user_modes> <chan_modes> */
				sock.serverInfo.serverName = bits[3];
				sock.serverInfo.serverVersion = bits[4];
				sock.serverInfo.userModes = bits[5];
				sock.serverInfo.channelModes = bits[6];
				
				break;
				
			case E.RPL_ISUPPORT:
				if( cMsg.toLowerCase() == "are supported by this server" ) {
					/* RPL_ISUPPORT */
					for( var i in bits ) {
						if( bits[i].toLowerCase() == ":are" ) break;
						if ( i > 2 ) {
							sock.iSupport.push( bits[i] );
							if( bits[i].substr(0,8).toLowerCase() == "network=" ){
								$("div.server-list[socket=" + sock.socketID + "] div.server-title").text( bits[i].split( "=" )[1] );
								channel.obj.find( "div.channel-topic b" ).text( bits[i].split( "=" )[1] );
							}
						}
					}
					cMsg = data.substr( bits[1].length + bits[2].length + 2 );
					channel.add.text(
						HTMLParser.stringify( cMsg )
					);
				}
				break;
			case E.RPL_ENDOFSTATS:
				pcmsg();
				break;
				
			case E.RPL_UMODEIS:
				channel.current( sock.socketID ).add.info( "Your modes are: " + bits[3] );
				break;
				
			case E.RPL_STATSLLINE:
			case E.RPL_STATSOLINE:
			case E.RPL_STATSHLINE:
			case E.RPL_STATSSLINE:
			case E.RPL_STATSTLINE:
			case E.RPL_STATSBLINE:
			case E.RPL_STATSPLINE:
			case E.RPL_LUSEROP:
			case E.RPL_LUSERCHANNELS:
			case E.RPL_TRYAGAIN:
			case E.ERR_NICKNAMEINUSE:
				pcmsg(3);
				break;
				
			case E.RPL_STATSCONN:	
			case E.RPL_LUSERCLIENT:
			case E.RPL_LUSEROP:
			case E.RPL_LUSERUNKNOWN:
			case E.RPL_LUSERCHANNELS:
			case E.RPL_LUSERME:
			case E.RPL_ADMINME:
			case E.RPL_ADMINLOC1:
			case E.RPL_ADMINLOC2:
			case E.RPL_ADMINEMAIL:
			case E.RPL_GLOBALUSERS:
			case E.RPL_STATSUPTIME:
				pcmsg();
				break;
				

			case E.RPL_AWAY:
				channel.current( sock.socketID ).add.text( "<span class=\"whois_name\">[<b>" + HTMLParser.stringify(bits[3]) + "</b>]</span> is away (<span class=\"whois_away\">" + colors.parse( HTMLParser.linkify( HTMLParser.stringify(cMsg) ) ) + "</span>)"  );
				break;
			
			
			
			case E.RPL_WHOISUSER:
			case E.RPL_WHOWASUSER:
				channel.current( sock.socketID ).add.text( "<span class=\"whois_name\">[<b>" + HTMLParser.stringify(bits[3]) + "</b>]</span> (" + HTMLParser.stringify(bits[4]) + "@" + bits[5] + "): <span class=\"whois_extra\">" + HTMLParser.stringify(cMsg) + "</span>" );
				break;
			case E.RPL_WHOISSERVER:
				channel.current( sock.socketID ).add.text( "<span class=\"whois_name\">[<b>" + HTMLParser.stringify(bits[3]) + "</b>]</span> <span class=\"whois_server\">" + bits[4] + " (" + HTMLParser.linkify( HTMLParser.stringify(cMsg) ) + ")</span>"  );
				break;
				
			case E.RPL_WHOISOPERATOR:
				channel.current( sock.socketID ).add.text( "<span class=\"whois_name\">[<b>" + HTMLParser.stringify(bits[3]) + "</b>]</span> " + HTMLParser.stringify(cMsg)  );
				break;				
			case E.RPL_WHOISIDLE:
				/* whois idle sign on time */
				channel.current( sock.socketID ).add.text( "<span class=\"whois_name\">[<b>" + HTMLParser.stringify(bits[3]) + "</b>]</span> signed on " + timeConverter( bits[5] )  );
				channel.current( sock.socketID ).add.text( "<span class=\"whois_name\">[<b>" + HTMLParser.stringify(bits[3]) + "</b>]</span> seconds idle " +  bits[4]  );
				break;
				
			case E.RPL_WHOISCHANNELS:
				/* whois channels */
				channel.current( sock.socketID ).add.text( "<span class=\"whois_name\">[<b>" + HTMLParser.stringify(bits[3]) + "</b>]</span> " + HTMLParser.linkify( HTMLParser.stringify(cMsg) )  );
				break;
				
			case E.RPL_WHOISACCOUNT:
				/* whois login */
				channel.current( sock.socketID ).add.text( "<span class=\"whois_name\">[<b>" + HTMLParser.stringify(bits[3]) + "</b>]</span> is logged in as <b>" + HTMLParser.linkify( HTMLParser.stringify(bits[4]) ) + "</b>"  );
				break;
				
			
			case E.RPL_WHOSPCRPL:
				/* special who reply */
				channel.current( sock.socketID ).add.info( data.substr( bits[0].length + bits[1].length + bits[2].length + 3  ) );
				break;
				
			case E.RPL_TOPIC:
				/* Channel topic */
				var channelName = bits[3];
				channel.find( sock.socketID, channelName );
				if ( channel.obj.length > 0 ) {
					/* channel was found */
					channel.obj.find( "div.channel-topic" ).html( "<b>" + HTMLParser.stringify( channelName ) + ":</b> " + colors.parse( HTMLParser.stringify( cMsg ) ) );
					channel.add.text( "<b>Topic for " + HTMLParser.stringify( channelName ) + " is:</b> " + colors.parse( HTMLParser.linkify( HTMLParser.stringify( cMsg ) ) ) );
					channel.obj.find( "div.channel-topic" ).attr("tooltip", cMsg );
				}
				break;
				
			case E.RPL_TOPICWHOTIME:
				/* Channel topic info*/
				var channelName = bits[3];
				channel.find( sock.socketID, channelName );
				if ( channel.obj.length > 0 ) {
					/* channel was found */
					channel.add.text( "<div style=\"opacity:0.5;\" tooltip=\"" + bits[4] + "\"><b>Topic set by </b>" + HTMLParser.stringify( bits[4].split("!")[0] ) + "<b> on </b>" + timeConverter( bits[5] ) + "</div>" );
				}
				break;
				
			case E.RPL_NAMREPLY:
				/* channel nicks */
				var nicks = cMsg.split( " " );
				for( var i in nicks ) {
					/* add NICK:COLOR */
					nickCache.push( nicks[i] + ":nick" + random.number(1,30) );
				}
				break;
				
			case E.RPL_WHOREPLY:
				/* /who results */
				var sLen = bits[0].length + bits[2].length + 5;
				if( whoCaptureState == 0 ){
					channel.current( sock.socketID ).add.text( HTMLParser.stringify( data.substr( sLen ) ) );
				}else{
					/* 
					we need to do something with these results
					1: copy nickname, 2: copy username, 3: copy hostmask
					*/
					switch( whoCaptureState ) {
						case 1:
							copyToClipboard( bits[7] );
							break;
						case 2:
							copyToClipboard( bits[4] );
							break;
						case 3:
							copyToClipboard( bits[7] + "!" + bits[4] + "@" + bits[5] );
							break;
						case 4:
							/* ban (*!*@domain) */
							var cName = base64.decode( $( "div.channel:visible" ).attr( "channel" ) );
							sock.send( "MODE " + cName + " +b *!*@" + bits[5] );
							break;
						case 5:
							/* ban (*!user@domain) */
							var cName = base64.decode( $( "div.channel:visible" ).attr( "channel" ) );
							sock.send( "MODE " + cName + " +b *!" + bits[4] + "@" + bits[5] );
							break;	
					}
				}
				whoCaptureState = 0; //reset the state
				break;
				
			case E.RPL_ENDOFNAMES:
				/* End of /NAMES list. */
				var channelName = bits[3];
				processNickList( sock, channelName );
				nickCache = [];
				break;
				
			case E.RPL_BANLIST:
			case E.RPL_INVITELIST:
			case E.RPL_EXCEPTLIST:
			
				/* +b list */
				var HTML = '<span class="list-name">' + bits[3] + ': </span>';
				HTML +=  '<span class="list-content">' + bits[4] + '</span> on ';
				HTML +=  '<span class="list-date">' + timeConverter(bits[6]) + '</span> by ';
				HTML +=  '<span class="list-user">' + bits[5] + '</span>';
				channel.current( sock.socketID ).add.text( HTML );
				break;
				
			case E.RPL_ENDOFINVITELIST:
			case E.RPL_ENDOFEXCEPTLIST:
			case E.RPL_ENDOFBANLIST:
				pcmsg();
				break;
				
			case E.RPL_WHOISHOST:
				/* whois is connecting from */
				channel.current( sock.socketID ).add.text( "<span class=\"whois_name\">[<b>" + HTMLParser.stringify(bits[3]) + "</b>]</span> " + HTMLParser.stringify( cMsg ) );
				break;
			case E.RPL_MOTD:
			case E.RPL_MOTDSTART:
			case E.RPL_ENDOFMOTD:
				channel.add.text(
					"<span style=\"font-family: monaco, Consolas, 'Lucida Console', monospace\">" + HTMLParser.stringify( cMsg ).replace(/\s\s/g, "&nbsp;&nbsp;") + "</span>"
				);
				break;

			case E.ERR_BANNEDFROMCHAN:
				//banned message
				ui.errorMessage.show("Banned", HTMLParser.stringify( bits[3] ) + ": " + HTMLParser.stringify( cMsg ), 10);
				break;
			case E.ERR_BADCHANNELKEY:
				//channel key
				ui.input.show( "You need to enter a key to join " + HTMLParser.stringify( bits[3] ), "", "../images/mdl/white/ic_vpn_key_white_24px.svg", function( e ){
					if( e.length > 0 ) {
						sock.send( "JOIN " + bits[3] + " " + e );
					}
				} );
				break;
				

				
			case E.RPL_WHOISSECURE:
				channel.current( sock.socketID ).add.text( "<span class=\"whois_name\">[<b>" + HTMLParser.stringify( bits[3] ) + "</b>]</span> is using a secure connection"  );
				break;
				
			case E.QLIST:
				/* +q list */
				var HTML = '<span class="list-name">' + bits[3] + ': </span>';
				HTML +=  '<span class="list-content">' + bits[5] + '</span> on ';
				HTML +=  '<span class="list-date">' + timeConverter( bits[7] ) + '</span> by ';
				HTML +=  '<span class="list-user">' + bits[6] + '</span>';
				channel.current( sock.socketID ).add.text( HTML );
				break;
				
				
			case E.ERR_NOSUCHNICK:
			case E.ERR_UMODEUNKNOWNFLAG:
			case E.RPL_LOCALUSERS:
			case E.RPL_NOUSERS:
			case E.RPL_UNAWAY:
			case E.RPL_NOWAWAY:
			case E.RPL_INFO:
			case E.RPL_CHANNEL_URL:
			case E.ERR_USERSDONTMATCH:
			case E.ERR_KNOCKDISABLED:
			case E.RPL_OMOTDSTART:
			case E.RPL_OMOTD:
			case E.RPL_ENDOFOMOTD:
				pcmsg();
				break;

			case E.ERR_NOSUCHNICK:
			case E.ERR_CANNOTSENDTOCHAN:	
			case E.ERR_NOTEXTTOSEND:
			case E.ERR_UNKNOWNCOMMAND:
			case E.ERR_NEEDMOREPARAMS:
			case E.ERR_CHANOPRIVSNEEDED:
			case E.ERR_INVITEONLYCHAN:
			case E.ERR_WASNOSUCHNICK:
			case E.RPL_TARGUMODEG:
			case E.RPL_TARGNOTIFY:
			case E.RPL_KNOCKDLVR:
			case E.ERR_TOOMANYKNOCK:
			case E.ERR_CHANOPEN:
			case E.ERR_KNOCKONCHAN:
			case E.ERR_NOPRIVS:
			case E.ERR_CANNOTCHANGEUMODE:
			case E.ERR_CANNOTCHANGECHANMODE:
			case E.ERR_CANNOTCHANGESERVERMODE:
			case E.ERR_CANNOTSENDTONICK:
			case E.ERR_UNKNOWNSERVERMODE:
			case E.ERR_SERVERMODELOCK:
			case E.ERR_TOOMANYLANGUAGES:
			case E.ERR_NOLANGUAGE:
			case E.ERR_TEXTTOOSHORT:
				pcmsg(3);
				break;
				
				
			default:
				console.log( data );
				
				
				
		}
	}else{
		/* it's NOT a numeric */
		switch( bits[1].toUpperCase() ) {
			case "CONNECTED":
				/*
					CONNECTED is sent to us by the socket as soon as a connection is established.
					it is a simulated packet.
				*/
				
				/* we need to request capabilities before anything else! */
				sock.send( "CAP LS" );
				
				if( sock.userInfo.auth.method == "server-password" ){
					sock.send( "PASS " + sock.userInfo.auth.password );
				}
				if( sock.userInfo.nick.realname == "" ) sock.userInfo.nick.realname = "Burd IRC";
				sock.send( "NICK " + sock.userInfo.nick.nick );
				sock.send( "USER " + sock.userInfo.username + " * * :" + sock.userInfo.nick.realname );
				channel.add.info("Connected, registering with network...");
				$( "#scripts" )[0].contentWindow.postMessage( {
					command: "on_connect",
					socketID: sock.socketID
				}, "*" );
				break;
				
			case "CAP":
					/*
						when we get CAP LS we get a list of supported capabilities 
						when we find one we want we request it using CAP REQ
					*/
					if( bits[3].toUpperCase() == "LS" ) {
						var caps = cMsg.toLowerCase().split( " " );
						var mycaps = "";
						for( var i in caps ) {
							switch( caps[i] ){
								case "multi-prefix":
								case "away-notify":
								case "account-notify":
									mycaps += " " + caps[i];
									break;
								case "sasl":
									/* only request sasl if that method is selected */
									if( sock.userInfo.auth.method == "sasl_plain" ) mycaps += " " + caps[i];
									break;
							}
						}
						sock.send( "CAP REQ :"  + mycaps.substr(1) );
						setTimeout( function(){ sock.send( "CAP END" ); }, 1000 );
					}else if( bits[3].toUpperCase() == "ACK" ) {
						if( cMsg.toUpperCase().indexOf( "SASL" ) > -1 ) {
							/* we got an ACK back tellings us SASL was enabled, not we must authenticate */
							sock.send("AUTHENTICATE PLAIN");
						}
					}
				break;
				
			case "AUTHENTICATE":
				sock.send( "AUTHENTICATE " + base64.encode( sock.userInfo.auth.id + String.fromCharCode( 0 ) + sock.userInfo.auth.auth + String.fromCharCode( 0 ) + sock.userInfo.auth.password ) );
				break;
			
			case "ERROR":
				channel.add.info( cMsg );
				break;
			
			case "JOIN":
				/* 
					when we recieve the JOIN command either one of the two has happend:
					A) we joined a channel and need to set up an HTML obj for it
					B) someone else has joined a channel we're already in
					
					the way we distinguish between the two is to check the nick against our own
				*/
				
				/* if the server didn't send us a PREFIX in iSupport then lets make our own */
				if( sock.serverProperties().PREFIX == undefined ) sock.iSupport.push("PREFIX=(waohv)~!@%+", "CHANTYPES=%#&+" );
				
				/* sometimes channels will follow ":", but sometimes not */
				if( bits[2].substr( 0,1 ) == ":" ) bits[2] = bits[2].substr( 1 );
				if( parseNick( bits[0] ).nick.toLowerCase() == sock.userInfo.nick.nick.toLowerCase() ) {
					/* it's us! we need to create a DOM element for this new channel */
					log("CHANNEL CREATION");
					nickCache = [];
					
					channel.find( sock.socketID, bits[2] );
					
					if( channel.obj.length == 0 ) channel.create( "channel", { socketID: sock.socketID, channel: bits[2] } );
					
					channel.find( sock.socketID, bits[2] );
					
					channel.add.info( "Now talking in " + bits[2] );
					
					$( "#scripts" )[0].contentWindow.postMessage( {
						command: "on_channel_joined",
						socketID: sock.socketID,
						serverName: sock.serverInfo.serverName,
						channelName: bits[2]
					}, "*" );
					
				}else{
					/* someone joined our channel */
					channel.find( sock.socketID, bits[2] );
					var user = parseNick(bits[0]).nick;
					nickCache = [user + ":nick" + random.number(1,30)];
					channel.obj.find( "div.userlist div.user" ).each(function(){
						nickCache.push( base64.decode( $(this).attr( "onick" ) ) + ":" + $(this).attr("class").split(" ")[0] );
					});
					processNickList( sock, bits[2], true );
					var time = (new Date).toString().split(" ")[4];
					if( ignore.matchUser( bits[0].substr( 1 ) ) ) return;
					if( ignore.matchRegex( data ) ) return;
					if( !settings.channels.showJPQ ) return;
					channel.addHTML(
						HTMLParser.parse( HTMLParser.html.userJoinedText, { time:  time, nick: user, onick: HTMLParser.stringify( bits[0].substr( 1 ) ) } )
					);
					
					$( "#scripts" )[0].contentWindow.postMessage( {
						command: "on_user_joined",
						socketID: sock.socketID,
						serverName: sock.serverInfo.serverName,
						channelName: bits[2],
						userName: user
						
					}, "*" );
				}
				break;
				
			case "KICK":
				var kicker = parseNick( bits[0] ).nick;
				var kicked = HTMLParser.stringify(bits[3]);
				channel.find( sock.socketID, bits[2] ).add.info( "<b>" + kicker + "</b> has kicked <b>" + kicked + "</b> from the channel (" + HTMLParser.stringify(cMsg) + ")", true );
				channel.obj.find("div.user:iAttrContains('nick','" + kicked + "')").remove();
				channel.obj.find( "div.list-count" ).text( "Users here - " + channel.obj.find( "div.userlist div.user" ).length );
				$( "#scripts" )[0].contentWindow.postMessage( {
					command: "on_user_kicked",
					socketID: sock.socketID,
					serverName: sock.serverInfo.serverName,
					channelName: bits[2],
					userName: kicked,
					kicker: kicker
					
				}, "*" );
				break;
				
			case "MODE":
				processMODE( sock, data );
				break;
				
			case "NICK":
				/*
					someone chnaged their nickname. it could be us.
				*/
				var oldN = parseNick(bits[0]).nick;
				var newN = bits[2].replace( ":", "" );
				
				if( oldN.toLowerCase() == sock.userInfo.nick.nick.toLowerCase() ) {
					/* It's our nick! let's update our records */
					sock.userInfo.nick.nick = newN;
					channel.obj.find( "span.mynick" ).html( HTMLParser.stringify( newN ) );
					channel.changeUserNick( oldN, newN );
				}else{
					/*
						it's someone else! we need to search all objects with this socket
						and update any of their nicks we find 
					*/
					
					channel.changeUserNick( oldN, newN );
				}
				break;
				
			case "NOTICE":
				if( ignore.matchUser( bits[0].substr( 1 ) ) ) return;
				if( ignore.matchRegex( data ) ) return;
				if( cMsg.length > 1 && cMsg.substr( 0,1 ) == String.fromCharCode( 1 ) ){
					/* if the messages is encapsulated in 0x01 then it's a CTCP reply, otherwise it's a normal notice */
					processCTCP( sock, bits[0], cMsg, true );
				}else{
					switch( bits[2].toUpperCase() ){
						case "AUTH":
						case "*":
							channel.add.info( cMsg );
							break;
						default:
							channel.current( sock.socketID ).add.userNotice( parseNick(bits[0]).nick, bits[2], cMsg );
					}
				}
				break;
				
			case "PART":
			
					/* sometimes channels will follow ":", but sometimes now */
					if( bits[2].substr( 0,1 ) == ":" ) bits[2] = bits[2].substr( 1 );
					
					channel.find( sock.socketID, bits[2] );
					var user = parseNick(bits[0]).nick;

					var time = (new Date).toString().split(" ")[4];
					if( !ignore.matchRegex( data ) && !ignore.matchUser( bits[0].substr( 1 ) ) && settings.channels.showJPQ ){
						channel.addHTML(
							HTMLParser.parse( HTMLParser.html.userLeftText, { time:  time, nick: user, onick: HTMLParser.stringify( bits[0].substr( 1 ) ), message: HTMLParser.stringify( cMsg ) } )
						);
					}
					
					channel.obj.find( "div.user:iAttrContains('nick','" + user + "')" ).remove();
					channel.obj.find( "div.list-count" ).text( "Users here - " + channel.obj.find( "div.userlist div.user" ).length );
					
					if( user.toLowerCase() == sock.userInfo.nick.nick.toLowerCase() ){
						$( "#scripts" )[0].contentWindow.postMessage( {
							command: "on_channel_left",
							socketID: sock.socketID,
							serverName: sock.serverInfo.serverName,
							channelName: bits[2]
						}, "*" );
					}else{
						$( "#scripts" )[0].contentWindow.postMessage( {
							command: "on_user_left",
							socketID: sock.socketID,
							serverName: sock.serverInfo.serverName,
							channelName: bits[2],
							userName: user
							
						}, "*" );
					}
					
				break;
				
			case "PING":
				sock.send( "PONG" + data.split( "PING" )[1] );
				
				break;
				
			case "INVITE":
				//IN: :sdifh48h!cc74c3da@gateway/web/freenode/ip.204.116.195.218 INVITE duckgoose :##testxcv
				var user = parseNick(bits[0]).nick;
				channel.current( sock.socketID ).add.info( "INVITED: " + user + " wants you to join " + cMsg );
				break;
				
			case "PRIVMSG":
				/* a PRIVMSG goes either to a channel or directly to us */
				var nick = bits[0];
				if( ignore.matchUser( bits[0].substr( 1 ) ) ) return;
				if( ignore.matchRegex( data ) ) return;
				channel.find( sock.socketID, bits[2] );
				//if( cMsg.indexOf( " quack" ) > 1 ) sock.send("privmsg ##llamas :.bang");
				if( bits[2].toLowerCase() == sock.userInfo.nick.nick.toLowerCase() ) {
					/* a PRIVMSG directly to us! */
					if( cMsg.length > 1 && cMsg.substr( 0,1 ) == String.fromCharCode( 1 ) ) {
						/* message begins with 0x01, so it must be CTCP! */
						channel.current( sock.socketID );
						if( cMsg.substr(1,7).toLowerCase() == "action " ) channel.create( "pm", { socketID: sock.socketID, user: bits[0].substr( 1 )} );
						processCTCP( sock, nick, cMsg, false );
						
					}else{
						
						pmCache.push( { time: Date.now(), from: bits[0].substr( 1 ), message: cMsg } );
						if( pmCache.length > 10 ) pmCache.splice( 0, 1 );
						var mCount = 0;
						for( var i in pmCache ){ 
							if( pmCache[i].message == cMsg && ( pmCache[i].time+10000 ) > Date.now() ) mCount++;
						}
						if( mCount > 3 ) return;
						
						channel.create( "pm", { socketID: sock.socketID, user: bits[0].substr( 1 )} );
						
						channel.add.userText({
							user: parseNick( nick ).nick,
							onick: nick,
							text: cMsg,
							highlight: checkHighlight( cMsg )
						});
					}
					$( "#scripts" )[0].contentWindow.postMessage( {
						command: "on_pm_message",
						socketID: sock.socketID,
						serverName: sock.serverInfo.serverName,
						userName: parseNick( bits[0] ).nick,
						message: cMsg,
						heighlight: checkHighlight( cMsg )
						
					}, "*" );
					
					
				}else{
					/* it wasn't to us so lets assume it's a channel message */
					if( cMsg.length > 1 && cMsg.substr( 0,1 ) == String.fromCharCode( 1 ) ) {
						/* message begins with 0x01, so it must be CTCP! */
						channel.find( sock.socketID, bits[2] );
						processCTCP( sock, nick, cMsg, false );
					}else{
						
						channel.add.userText({
							user: parseNick( nick ).nick,
							onick: nick,
							text: cMsg,
							highlight: checkHighlight( cMsg )
						});
						
					}
					$( "#scripts" )[0].contentWindow.postMessage( {
						command: "on_channel_message",
						socketID: sock.socketID,
						serverName: sock.serverInfo.serverName,
						channelName: bits[2],
						userName: parseNick( bits[0] ).nick,
						message: cMsg
						
					}, "*" );
				}
				
				break;
				
			case "QUIT":
				channel.quitUser( sock.socketID, bits[0].substr( 1 ), cMsg );
				break;
				
			case "TOPIC":
				channel.find( sock.socketID, bits[2] );
				
				var tHTML = colors.parse( HTMLParser.linkify( HTMLParser.stringify( cMsg ) ) );
				
				channel.add.info( parseNick( bits[0] ).nick + " has changed the topic to: " + tHTML, true );

				channel.obj.find( "div.channel-topic" ).html( "<b>" + HTMLParser.stringify( bits[2] ) + ":</b> " + colors.parse( HTMLParser.stringify( cMsg ) ) );
					
				channel.obj.find( "div.channel-topic" ).attr("tooltip", cMsg );
				
				break;
		}
	}
	
	
	
	function checkHighlight( e ){
		for( var i in settings.highlights ){
			if( settings.highlights[i] != "%n" && e.toLowerCase().indexOf( settings.highlights[i].toLowerCase() ) > -1 ) return true;
		}

		var re = new RegExp("\\b" + formatRegex( sock.userInfo.nick.nick.toLowerCase() ) + "\\b", "ig");
		
		if( settings.highlights.indexOf("%n") > -1 && e.toLowerCase().match( re ) != null ) return true;
		return false;
	}
	function pcmsg(e){
		/* prints the cMsg */
		if( e == undefined ) {
			channel.current( sock.socketID ).add.info( cMsg );
		}else{
		/* prints bits[e] and the cMsg */
			channel.current( sock.socketID ).add.info( bits[e] + " " + cMsg );
		}
	}
}



function processCTCP( sock, nick, message, reply ){
	if( Date.now() - lastCTCP < 3000 ) return; /* ignore all CTCP for at least 3 seconds from the last one to prevent flooding */
	lastCTCP = Date.now();
	message = message.replace( /\x01/ig, "" );
	var bits = message.split( " " );
	message = message.substr( message.indexOf( " " ) + 1 ); /* cut off the CTCP type */
	onick = nick;
	nick = parseNick(nick);
	if( reply ){
		/* it's a CTCP reply */
		
		if( bits[0].toUpperCase() == "PING" ) {
			if( lastCTCPping == message ) {
				channel.current( sock.socketID ).add.info( "<b>CTCP " + HTMLParser.stringify( bits[0].toUpperCase() ) + " Reply from " + nick.nick + ":</b> " + ((Date.now() - lastCTCPping) / 1000) + " seconds", true );
			}
		}else{
			channel.current( sock.socketID ).add.info( "<b>CTCP " + HTMLParser.stringify( bits[0].toUpperCase() ) + " Reply from " + nick.nick + ":</b> " + message, true );
		}
		
		
	} else {

		/* it's a CTCP request */
		if( message.length > 0 ) {

			switch( bits[0].toUpperCase() ) {

				case "ACTION":
					/* CTCP Action (/me) */
					channel.add.userText({
						user: nick.nick,
						text: message,
						onick: onick,
						action: true
					});
					break;

				case "VERSION":
					sock.send( "NOTICE " + nick.nick + " :\x01VERSION " + app.name + " [" + app.version + "] http://haxed.net\x01");
					channel.add.info( nick.nick + " requested CTCP VERSION" );
					break;

				case "PING":
					if( bits.length == 2 ) {
						sock.send( "NOTICE " + nick.nick + " :\x01PING "+ bits[1] +"\x01");
					}else if( bits.length == 1 ) {
						sock.send( "NOTICE " + nick.nick + " :\x01PING "+ parseInt(Date.now()/1000) +"\x01");
					}
					channel.add.info( nick.nick + " requested CTCP PING" );
					break;

				case "TIME":
					sock.send( "NOTICE " + nick.nick + " :\x01TIME "+ timeConverter(Date.now()/1000) +"\x01");
					channel.add.info( nick.nick + " requested CTCP TIME" );
					break;

				default:
					channel.add.info( nick.nick + " sent an unknown CTCP request: " + bits[0].toUpperCase() );
					break;
			}
		}
	}
}



function processMODE( sock, data ){
	var bits = data.split(" ");
	
	function setUserMode( user, mode, modeState ) {
		var onick = base64.decode( channel.obj.find("div.user:iAttrContains('nick', '" + user + "'):first").attr( "onick" ) );
		onick = onick.replace( mode, "" );
		if( modeState ) onick = mode + onick;
		channel.obj.find("div.user:iAttrContains('nick', '" + user + "'):first").attr( "onick", base64.encode( onick ));
		channel.obj.find( "div.userlist div.user" ).each(function(){
			nickCache.push( base64.decode( $(this).attr( "onick" ) ) + ":" + $(this).attr("class").split(" ")[0] );
		});
		processNickList( sock, bits[2], true );
	}
	
	function getUserSymbol( mode ){
		var p = sock.serverProperties().PREFIX.replace( "(", "" ).split( ")" );
		var m = p[1].split( "" );
		var n = p[0].split( "" );
		for( var i in n ) {
			if( n[i] == mode ) return m[i];
		}
		return false;
	}
	
	if( bits.length > 2){
		if( bits[2].toLowerCase() == sockets[0].userInfo.nick.nick.toLowerCase() ) {

			channel.current( sock.socketID ).add.info( "User mode set: " + data.substr( data.toLowerCase().indexOf("mode") + 5 +  bits[2].length + 1 ).replace(":","") );
			
		}else{
			var chan = channel.find( sock.socketID, bits[2] );
			
			if( chan.obj.length > 0 ) {
				var setter = parseNick( bits[0] );
				/* split off the values (if any) so we can work with the mode flags */
				var modeStr = data.substr( data.indexOf( bits[2] ) + bits[2].length + 1 );
				/* modes should now be an array of mode flags or +/- */
				var modes = modeStr.split(" ")[0].split("");
				/* now lets get any array of values for the mode flags */
				var values = [];
				if( modeStr.split( " " ).length > 0 ) values = modeStr.substr( modeStr.indexOf( " " ) + 1 ).split(" ");
				
				if( settings.channels.showModes ) chan.add.info( "<b>" + setter.nick + "</b> has set mode: " + "<b>" + HTMLParser.stringify( modeStr ) + "</b>", true );
				
				$( "#scripts" )[0].contentWindow.postMessage( {
					command: "on_channel_mode",
					socketID: sock.socketID,
					serverName: sock.serverInfo.serverName,
					channelName: bits[2],
					userName: setter.nick,
					modeString: modeStr
					
				}, "*" );
				
				
				/* now the mode processing shall start */
				
				/* this index is incremented every time a value is used by a mode */
				var valueIndex = 0;
				/* the mode state is changed when we encouter either + or -, - being false */
				var modeState = false;
				
				
				for( var i in modes ) {
					switch( modes[i] ) {
						
						case "+":
							modeState = true;
							break;
							
						case "-":
							modeState = false;
							break;
							
						case "o":
						case "v":
						case "h":
						case "a":
						case "o":
						case "q":
							var s = getUserSymbol( modes[i] );
							if( s ){
								var user = values[valueIndex];
								setUserMode( user, s, modeState );
								valueIndex++;
							}
							break;
						
						case "b":
							valueIndex++;
							break;
						
						
						
					}
				}
			}
			
		}
	}
}

function log(e){
	//if(e.indexOf(" 354 ")<1) console.log(e);
}