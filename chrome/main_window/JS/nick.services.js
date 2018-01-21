/* used to hold all the nicks from 353 */
var nickCache = [];

function parseNick( e ){
	e = HTMLParser.stringify( e );
	var d = e.replace(":","").split(/!|@/g);
	return { nick: d[0], username: d[1], host: d[2] };
}

function formatRegex( e ){
	var returnStr = "";
	for( var i in e ) {
		returnStr += e[i].replace( /[^a-zA-Z\d\s\*:]/, "\\" + e[i] );
	}
	returnStr = returnStr.replace( /\s/g, "\\s" );
	returnStr = returnStr.replace( /\*/g, "(.*)" );
	return returnStr;
}

/* processes HTML for channel users list using nickCache */
function processNickList( socket, channelName, preserveColors ){
	nickCache = sortNames( nickCache );
	var chan = channel.find( socket.socketID, channelName );
	var nickHTML = "";
	var prefix = socket.serverProperties().PREFIX.split(")")[1].split( "" );
	if ( chan.obj.length > 0 ) {
		/* channel was found */
		for( var i in nickCache ) {
			var color = nickCache[i].split(":")[1];
			nickCache[i] = nickCache[i].split(":")[0];
			var fNick = nickCache[i];
			var uModes = "";
			for( var j in prefix ) {
				if( fNick.indexOf( prefix[j] ) > -1 ) {
					switch( prefix[j] ) {
						case "@":
							uModes += " op"
							break;
						case "+":
							uModes += " voice"
							break;
						case "&":
							if( socket.serverProperties().PREFIX.indexOf( "&" ) < 0 ) break;
							uModes += " admin"
							break;
						case "~":
							if( socket.serverProperties().PREFIX.indexOf( "~" ) < 0 ) break;
							uModes += " owner"
							break;
						case "%":
							if( socket.serverProperties().PREFIX.indexOf( "%" ) < 0 ) break;
							uModes += " halfop"
							break;
					}
				}
				fNick = fNick.replace( prefix[j], "" );
			}
			nickHTML += '<div onick="'+ base64.encode( nickCache[i] ) +'" nick="'+ fNick +'" class="'+color +' user ' + uModes + '">' + HTMLParser.stringify( fNick ) + '</div>';
		}
		chan.obj.find( "div.userlist" ).html( nickHTML );
		chan.obj.find( "div.list-count" ).html( "Users here - " + nickCache.length );
		nickCache = [];
	}
	
}

function genNickColor(){
	return "rgb("+ random.number(20,120) +", " + random.number(20,120) + "," + random.number(20,120) + ");";
}

/* nick sorter */

function sortNames(names) {
	/* stolen from http://hawkee.com/snippet/10177/ */
    names.sort(function (a,b) {
        var modes = '~&@%+';
        var rex = new RegExp('^['+modes+']');
        var nicks = [a.replace(rex,'').toLowerCase(), b.replace(rex,'').toLowerCase()];
        var prefix = [];
        if (rex.test(a)) prefix.push(modes.indexOf(a[0])); 
            else prefix.push(modes.length+1);
        if (rex.test(b)) prefix.push(modes.indexOf(b[0])); 
            else prefix.push(modes.length+1);
        if (prefix[0] < prefix[1]) return -1;
        if (prefix[0] > prefix[1]) return 1;
        if (nicks[0] > nicks[1]) return 1;
        if (nicks[0] < nicks[1]) return -1;
        return 0;
    });
    return names;
}