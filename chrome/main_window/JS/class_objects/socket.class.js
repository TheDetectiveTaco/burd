/*
	var x = new socket("192.168.1.135",8080);
	x.created = function(){ this.connect() };
*/

//array of socket objects.
var sockets = [];

function getSocketByID(e) {
	for( var i in sockets ) {
		if( sockets[i].socketID == e ) return sockets[i];
	}
	return false;
}

/* the socket object class */
function socket( server, port ){
	this.address = server;
	this.port = parseInt( port );
	this.socketID = null;
	this.buffer = "";
	this.connected = false;
	this.autoReconnect = false;
	this.SSL = false;
	
	/* if ssl we need to a forge client */
	this.sslClient = "";
	
	//user information
	this.userInfo = {};
	
	//server information
	this.serverInfo = {
		serverName: "",
		serverVersion: "",
		userModes: "",
		channelModes: ""
	}
	
	this.iSupport = [  ];
	
	//add this socket to the sockets array
	sockets.push(this);
	
	//create a chrome TCP socket for this object
	this.created = function(){};
	this.createSocket();
}

socket.prototype.createSocket = function(){
	var tmp = this;
	chrome.sockets.tcp.create({}, function( e ) {
		var t = $( "[socket='" + tmp.socketID + "']" );
		if( t.length > 0 ) t.attr( "socket", e.socketId );
		tmp.socketID = e.socketId;
		tmp.created( e );
	});
}

socket.prototype.reconnect = function(){
	this.connect();
	chrome.sockets.tcp.setPaused( this.socketID, false );
}

/* finds and returns information from ISUPPORT as JSON */
socket.prototype.serverProperties = function( e ){
	var is = this.iSupport;
	var returnObj = {};
	for( var i in is ){
		if( is[i].indexOf( "=" ) > 1 ) {
			
			var v = is[i].split( "=" );
			returnObj[ v[0].toUpperCase() ] = v[1];
		}else{
			returnObj[is[i].toUpperCase()] = true;
		}
	}
	return returnObj;
}

socket.prototype.connect = function(){
	var tmp = this;
	switcher.find( this.socketID, "network console" ).current.removeClass( "disconnected" );
	chrome.sockets.tcp.connect( this.socketID, this.address, this.port, function( e ) {
		//any non negitive result means we're connected
		if( e > -1 ){
			tmp.connected = true;
			/*  at this point we check if ssl/tls is to be used, or if it's just plain text */
			if( tmp.SSL ){
				/* SSL connection */
				chrome.sockets.tcp.setPaused(tmp.socketID, true);
				forgeSetup( tmp );
				chrome.sockets.tcp.setPaused(tmp.socketID, false);
			}else{
				/* plain text connection */

				/* send CONNECTED to the data parser so it knows it's time to register */
				parseData( tmp, "CONNECTED TO SERVER" );
			}
		}else{
			tmp.disconnected();
		}
	} );
}

/* called to send data to the scripting window which returns the data to be sent via .lsend */
socket.prototype.send = function( e ){
	$( "#scripts" )[0].contentWindow.postMessage( {
		command: "on_data_out",
		socketID: this.socketID,
		serverName: this.serverInfo.serverName,
		data: e
	}, "*" );
}

/* converts UTF8 string to an ArrayBuffer and sends it */
socket.prototype.lsend = function( e ){
	if( this.connected == false ) return;
	log( "OUT: " + e );
	e += "\r\n"; //IRC packets end in a new line so lets add it
	if( this.SSL ) {
		/* if SSL then we send the data to forge for processing */
		this.sslClient.prepare(forge.util.encodeUtf8(e));
	}else{
		var str = unescape( encodeURIComponent( e ) );
		var idx, len = str.length, arr = new Array( len );
		for ( idx = 0 ; idx < len ; ++idx ) {
			arr[ idx ] = str.charCodeAt(idx) & 0xFF;
		}
		var newBuffer = new Uint8Array( arr ).buffer;
		var tmp = this;
		
		//we try to send the data and if we get an error we're disconnected
		var sid = this.socketID;
		var data = newBuffer;
		chrome.sockets.tcp.getInfo( this.socketID , function(e){
			if( e.connected ) {
				chrome.sockets.tcp.send( sid, data, function( e ){
					if( e < 0 ){
						tmp.disconnected();
					}
				} );
			}else{
				tmp.disconnected();
			}
		});
	}


}

/* called when disconnected. disconnection is determined by polling the socket */
socket.prototype.disconnected = function() {
	this.connected = false;
	channel.all( this.socketID ).addInfo("Disconnected from server");
	switcher.find( this.socketID, "network console" ).current.addClass( "disconnected" );
	chrome.sockets.tcp.disconnect( this.socketID );
}

/* self explanatory */
function getSocketByID( e ) {
	for( var i in sockets ) {
		if ( sockets[i].socketID == e ) return sockets[i];
	}
	return false;
}


//add a listener to the chrome TCP socket.
chrome.sockets.tcp.onReceive.addListener( function( e ){
	var sock = getSocketByID( e.socketId );
	if ( sock ) {
		if( sock.SSL ){
			arrayBuffer2String(e.data, function (data) {
					sock.sslClient.process( data );
			});
			
		}else{
			//we turn the ArrayBuffer into a string and check if it ends
			//in \r, if it doesn't then we buffer the data until it does.
			//otherwise we split the data by \r\n and process each packet.
			var data = Utf8ArrayToStr( e.data );
			if ( data[ data.length - 1 ] == "\n" ){
				data = sock.buffer + data;
				sock.buffer = "";
				//split the apckets up
				data = data.replace( /\r/g, "" );
				var bits = data.split( "\n" );
				for( var i in bits ) {
					if( bits[i].length > 0 ){
						$( "#scripts" )[0].contentWindow.postMessage( {
							command: "on_data_in",
							socketID: e.socketId,
							serverName: sock.serverInfo.serverName,
							data: bits[i]
						}, "*" );
					}
					//parseData( sock, bits[i] );
				}
			}else{
				sock.buffer += data;
			}
		}
	}else{
		//we didn't get a socket. something is wrong.
		//close the socket and forget about it.
		chrome.sockets.tcp.disconnect( e.socketId );
	}
} );


function Utf8ArrayToStr(array) {
	array = new Uint8Array(array);
    var out, i, len, c;
    var char2, char3, char4;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
		c = array[i++];
		
		switch(c >> 4)
		{ 
		  case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
		  case 8: case 9: case 10: case 11:
			// 0xxxxxxx
			out += String.fromCharCode(c);
			break;
		  case 12: case 13:
			// 110x xxxx   10xx xxxx
			char2 = array[i++];
			out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
			break;
		  case 14:
			
			// 1110 xxxx  10xx xxxx  10xx xxxx
			char2 = array[i++];
			char3 = array[i++];
			out += String.fromCharCode(((c & 0x0F) << 12) |
						   ((char2 & 0x3F) << 6) |
						   ((char3 & 0x3F) << 0));
			break;
		case 15:
			//11110xxx 65536 1114111
			char2 = array[i++];
			char3 = array[i++];
			char4 = array[i++];
			var x = (((c & 0x0F) << 18) |
						   ((char2 & 0x3F) << 12) |
						   ((char3 & 0x3F) << 6) | (char4 & 0x3F));

			out += String.fromCodePoint(x);
			break;
		 default:
			console.log("error in data parse at Utf8ArrayToStr");
			console.log(c >> 4);
			break;
		}
    }

    return out;
}


/* Forge SSL */
function forgeSetup( sock ){
	// create TLS client
	console.log("FORGE");
	var client = forge.tls.createConnection({
	  server: false,
	  caStore: []/* Array of PEM-formatted certs or a CA store object */,
	  sessionCache: {},
	  // supported cipher suites in order of preference
	  cipherSuites: [
		forge.tls.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA,
		forge.tls.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA],
	  virtualHost: null,
	  verify: function(connection, verified, depth, certs) {
		if(depth === 0) {
		  var cn = certs[0].subject.getField('CN').value;
		  if(false) {
			verified = {
			  alert: forge.tls.Alert.Description.bad_certificate,
			  message: 'Certificate common name does not match hostname.'
			};
		  }
		}
		return true;
	  },
	  connected: function(connection) {
		sock.connected = true;
		parseData( sock, "CONNECTED TO SERVER" );
	  },
	  getPrivateKey: function(connection, cert) {
		return myClientPrivateKey;
	  },
	  tlsDataReady: function(connection) {
		var b  = connection.tlsData.getBytes();
		string2ArrayBuffer(b, function(data) {
		chrome.sockets.tcp.send(sock.socketID, data, function(){}) });
	  },
	  dataReady: function(connection) {
		// clear data from the server is ready
			var data = forge.util.decodeUtf8(connection.data.getBytes());
			data = data.replace( /\r/g, "" );
			var bits = data.split( "\n" );
			for( var i in bits ) {
				if( bits[i].length > 0 ){
					$( "#scripts" )[0].contentWindow.postMessage( {
						command: "on_data_in",
						socketID: sock.socketID,
						serverName: sock.serverInfo.serverName,
						data: bits[i]
					}, "*" );
				}
			}
	  },
	  closed: function(connection) {
		console.log('disconnected');
	  },
	  error: function(connection, error) {
		console.log('uh oh', error);
	  }
	});
	
	sock.sslClient = client;
	client.handshake();
}

/* code taken from circ (because I'm lazy) */
var string2ArrayBuffer = function(string, callback) {
	var buf = new ArrayBuffer(string.length);
	var bufView = new Uint8Array(buf);
	for (var i=0; i < string.length; i++) {
	  bufView[i] = string.charCodeAt(i);
	}
	callback(buf);
};
var arrayBuffer2String = function(buf, callback) {
	var bufView = new Uint8Array(buf);
	var chunkSize = 65536;
	var result = '';
	for (var i = 0; i < bufView.length; i += chunkSize) {
	  result += String.fromCharCode.apply(null, bufView.subarray(i, Math.min(i + chunkSize, bufView.length)));
	}
	callback(result);
};
/* end of circ code */