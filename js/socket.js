/* main file for IRC socket related stuff */
var net = require('net');
var tls = require('tls');

var cache = [];

var socket = {
	logData: false,
	
	sockets: [],/* where active socket objects are stored, {id: random_id, socket: socket_object, networkInfo: net_info} */
	

	sendData: function(data, id){
		/* sends data to a socket matching id */
		data = data.replace(/\u00A0/g, " ");
		scripting_iframe.contentWindow.postMessage({c: "irc_data_out", data: data, network: id}, "*");
		var sock = this.getSocketByID(id);
		sock.socket.write(data + "\r\n");
		if(this.logData) console.log("< " + data);

	},
	
	close: function(id){
		/* close a socket matching id */
		var sock = this.getSocketByID(id);
		if(!sock) return;
		sock.networkInfo["loggedin"] = false;
		if(sock.networkInfo.reconnect){
			channel("!", id).addInfo( "Disconnected from IRC. Reconnecting in 10 seconds..." );
			clearTimeout(sock.reconnectTimer);
			sock.reconnectTimer = setTimeout(function(){
				socket.create(sock.networkInfo.server, sock.networkInfo.port, sock.networkInfo.SSL, sock.id);

				
			},10000);
		}else{
			channel("!", id).addInfo( "Disconnected from IRC" );
		}

	},
	
	create: function(server, port, ssl, id){
		/*
			called when a socket is to be created.
			if we have a sid, then we need to reconnect, otherwise make a new sid
		*/
		var sock = null;
		sid = id||socket.newID();
		if(ssl){
			sock = tls.connect({port: port, host: server, rejectUnauthorized: false}, function() {
				socket.parseData( "CONNECTED", sid, who );
			});
		}else{
			sock = new net.Socket();
			sock.connect(port, server, function() {
				socket.parseData( "CONNECTED", sid, who );
			});
		}
		
		if(id!=undefined){
			var sObject = this.getSocketByID(id);
			sObject.socket = sock;
		}else{
			
			var sObject = { id: sid, socket: sock, networkInfo: {}, cache: "", tmpPacketHold: [], reconnectTimer: 0, dataHook: function(e){} };
			sObject.networkInfo.getISUPPORT = function(e){
				 for(var i in this.ISUPPORT){
					 var sb = this.ISUPPORT[i].split("=");
					 if(sb[0].toLowerCase() == e.toLowerCase()){
						 if(sb.length == 1){
							 return true;
						 }else{
							return sb[1];
						 }
					 }
				 }
				 return false;
			}
			socket.sockets.push(sObject);
		}
		
		sock.on("data", function(data) {
			data = data.toString().replace(/\r/g, "\n");
			if(data.substr(-1) == "\n"){
				var db = (sObject.cache + data).split("\n");
				sObject.cache = "";
				for(var i in db){
					if(db[i] != ""){
						scripting_iframe.contentWindow.postMessage({c: "irc_data", data: db[i], network: sObject.id}, "*");
						socket.parseData(db[i], sObject.id, who);
					}
				}
			}else{
				/* mid packet, so lets cache. */
				sObject.cache += data;
			}

		});
		
		sock.on("end", function() {
			socket.close(sObject.id);
		});
		sock.on("close", function() {
			socket.close(sObject.id);
		});
		sock.on("error", function() {
			
		});
		setTimeout(function(){
			if(ssl){
				channel("!", sid).addInfo( "Connecting to IRC via SSL..." );
			}else{
				channel("!", sid).addInfo( "Connecting to IRC..." );
			}
		},10);

		return sObject;
	},
	
	getSocketByID: function(e){
		for(var i in this.sockets){
			if(this.sockets[i].id == e) return this.sockets[i];
		}
		return false;
	},
	
	newID: function(){
		return Math.floor(Math.random()*9999999) + 1;
	},
	
	parseData: function(data, id, who){
		/* see parsedata.js */
	}
}