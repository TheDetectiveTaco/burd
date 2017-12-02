var cache = {};
var src = null;

var $ = {
	workingSocket: 0,
	callback: function(e){},
	sendPacket: function( e, s ){
		/*+ sendPacket( data, [socketID] ); */
		if( s != undefined ) this.workingSocket = s;
		var msg = { command: "send_packet", socketID: this.workingSocket, data: e };
		src.postMessage( msg, "*");
		return this;
	},
	getChannels: function( e, s ) {
		/* getChannels( callback, [socketID]  ) */
		this.callback = e;
		if( s != undefined ) this.workingSocket = s;
		var msg = { command: "get_channels", socketID: this.workingSocket };
		src.postMessage( msg, "*");
		return this;

	},
	getChannelUsers: function( e, c, s ) {
		/* ( channelName, callback, [socketID] ); */
		this.callback = c;
		if( s != undefined ) this.workingSocket = s;
		var msg = { command: "get_channel_users", socketID: this.workingSocket, channelName: e };
		src.postMessage( msg, "*");
		return this;
	},
	getPMs: function( e, s ) {
		/* ( callback, [socketID] ); */
		this.callback = e;
		if( s != undefined ) this.workingSocket = s;
		var msg = { command: "get_pms", socketID: this.workingSocket };
		src.postMessage( msg, "*");
		return this;
	},
	getServers: function( e, s ) {
		/* ( callback, [socketID] ); */
		this.callback = e;
		if( s != undefined ) this.workingSocket = s;
		var msg = { command: "get_servers", socketID: this.workingSocket };
		src.postMessage( msg, "*");
		return this;
	},
	
	addWindowInfo: function( e, m, s ){
		/*+
			( windowName, message, [socketID] )
			if windowName = "*" then add to current window.
		*/
		/* ( callback, [socketID] ); */
		if( s != undefined ) this.workingSocket = s;
		var msg = { command: "add_info", socketID: this.workingSocket, message: m, windowName: e };
		src.postMessage( msg, "*");
		return this;
	}
}


var scripts = [
	{
		name: "Example Script",
		GUID: "94056d42-7829-4eac-bc8e-635365ea3d43",
		
		onDataIn: function( e ){
			/*
				e = { serverName, socketID, data }
				manipulate and return e
			*/
			e.data = e.data.replace( /hello\sworld\!/g, "hello mars!" );
			return e;
		},
		onDataOut: function( e ){
			/*
				e = { serverName, socketID, data }
				manipulate and return e
			*/
			return e;
		},
		
		/* channel stuff */
		onChannelJoined: function( e ){
			/*+ e = { serverName, socketID, channelName } */
		},
		onChannelLeft: function( e ){
			/*+ e = { serverName, socketID, channelName } */
		},
		onChannelUserJoined: function( e ){
			/*+ e = { serverName, socketID, channelName, userName } */
		},
		onChannelUserLeft: function( e ){
			/*+ e = { serverName, socketID, channelName, userName } */
		},
		onChannelUserKicked: function( e ){
			/*+ e = { serverName, socketID, channelName, userName } */
		},
		onChannelMessage: function( e ){
			/*+ e = { serverName, socketID, channelName, userName, message } */
		},
		onChannelMode: function( e ){
			/*+ e = { serverName, socketID, channelName, userName, modeString } */
		},
		
		/* PM stuff */
		onPrivateMessage: function( e ){
			/*+ e = { serverName, socketID, userName, message } */
		},

		onUserInput: function( e ){
			/* 
				e = { socketID, message }
				manipulate and return e, or return false to prevent default
			*/
			
			if( e.message == "/boo" ){
				
				return false;
			}
			return e;
		}
		
	},
	
	
	
	
	{
		name: "IPInfo",
		GUID: "94056d42-7829-4uac-oc8e-635365ea3d43",

		onUserInput: function( e ){
			/* 
				e = { socketID, message }
				manipulate and return e, or return false to prevent default
			*/
			if( e.message.substr( 0, 8 ) == "/ipinfo " ){
				var ip = e.message.split( " " )[1];
				http.get({
					url: "http://ipinfo.io/" + ip + "/?callback",
					onComplete: function(e){
						console.log(e);
						$.addWindowInfo( "*", "IP Information for " + ip + " = " + e );
					}
				});
				return false;
			}
		}
	}
]



window.addEventListener('message', function( e ) {
	var command = e.data.command;
	src = e.source;
	if( e.data.socketID != undefined ) $.workingSocket = e.data.socketID;
	switch ( command ) {
		
		case "test":
			postReply( e, {
				command: "test",
				data: "success"
			} );
			break;
		
		case "on_data_in":
			for( var i in scripts ){
				if( scripts[i].onDataIn != undefined ) e.data.data = scripts[i].onDataIn( {serverName: e.data.serverName, data: e.data.data} ).data;
			}
			postReply( e, {
				command: "on_data_in",
				data: e.data.data,
				socketID: e.data.socketID
			} );
			break;
			
		case "on_data_out":
			for( var i in scripts ){
				if( scripts[i].onDataOut != undefined ) e.data.data = scripts[i].onDataOut( {serverName: e.data.serverName, data: e.data.data} ).data;
			}
			postReply( e, {
				command: "on_data_out",
				data: e.data.data,
				socketID: e.data.socketID
			} );
			break;
			
		case "on_channel_joined":
			for( var i in scripts ){
				if( scripts[i].onChannelJoined != undefined ) scripts[i].onChannelJoined( e.data );
			}
			break;
			
		case "on_channel_left":
			for( var i in scripts ){
				if( scripts[i].onChannelLeft != undefined ) scripts[i].onChannelLeft( e.data );
			}
			break;
			
		case "on_user_joined":
			for( var i in scripts ){
				if( scripts[i].onChannelUserJoined != undefined ) scripts[i].onChannelUserJoined( e.data );
			}
			break;
			
		case "on_user_left":
			for( var i in scripts ){
				if( scripts[i].onChannelUserLeft != undefined ) scripts[i].onChannelUserLeft( e.data );
			}
			break;
			
		case "on_user_kicked":
			for( var i in scripts ){
				if( scripts[i].onChannelUserKicked != undefined ) scripts[i].onChannelUserKicked( e.data );
			}
			break;
			
		case "on_channel_message":
			for( var i in scripts ){
				if( scripts[i].onChannelMessage != undefined ) scripts[i].onChannelMessage( e.data );
			}
			break;
			
		case "on_pm_message":
			for( var i in scripts ){
				if( scripts[i].onPrivateMessage != undefined ) scripts[i].onPrivateMessage( e.data );
			}
			break;
			
		case "on_channel_mode":
			for( var i in scripts ){
				if( scripts[i].onChannelMode != undefined ) scripts[i].onChannelMode( e.data );
			}
			break;
			
		case "on_user_input":
			var te = e.data;
			for( var i in scripts ){
				if( scripts[i].onUserInput != false ) te = scripts[i].onUserInput( te );
				if( te == undefined ) te = e.data;
			}
			if( te == false ) return;
			postReply( e, te );
			break;
			
		case "get_channels":
			$.callback( e.data.channels );
			break;
		case "get_pms":
			$.callback( e.data.pms );
			break;
		case "get_servers":
			$.callback( e.data.servers );
			break;
			
	}
});

function postReply( a, b ){
	a.source.postMessage( b , "*");
}

http = {
	get: function( a ){
		try{
			var xhr =  new XMLHttpRequest();
			xhr.open("GET", a.url, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && xhr.status == 200) a.onComplete( xhr.response ); 
			}
			xhr.send();
			xhr.onerror = function(e){ if( a.onError != undefined ) a.onError() };
		} catch(e) {
			if( a.onError != undefined ) a.onError();
		}
	}
}
