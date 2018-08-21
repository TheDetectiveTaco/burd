/* main file for IRC socket related stuff */
var net = require('net');
var tls = require('tls');

var cache = [];

var socket = {
	logData: false,
	
	sockets: [],/* where active socket objects are stored, {id: random_id, socket: socket_object, networkInfo: net_info} */
	

	sendData: function(data, id){
		/* sends data to a socket matching id */
		var sock = this.getSocketByID(id);
		sock.socket.write(data + "\r\n");
		if(this.logData) console.log("< " + data);
		sock.socket.pause();
		sock.socket.resume();

	},
	
	close: function(id){
		/* close a socket matching id */
		var sock = this.getSocketByID(id);
		if(!sock) return;
		sock.networkInfo["loggedin"] = false;
		if(sock.networkInfo.reconnect){
			channel("!", id).addInfo( "Disconnected from IRC. Reconnecting in 10 seconds..." );
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
				socket.parseData( "CONNECTED", sid );
			});
		}else{
			sock = new net.Socket();
			sock.connect(port, server, function() {
				socket.parseData( "CONNECTED", sid );
			});
		}
		
		if(id!=undefined){
			var sObject = this.getSocketByID(id);
			sObject.socket = sock;
		}else{
			
			var sObject = { id: sid, socket: sock, networkInfo: {}, cache: "", tmpPacketHold: [], reconnectTimer: 0 };
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
					socket.parseData(db[i], sObject.id);
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
		return Math.floor(Math.random()*99999) + 1;
	},
	
	parseData: function(data, id){
		/* IRC packets are sent to this function for processing */
		if(data.length < 3) return;
		
		data = secure(data);
		
		if(this.logData) console.log("> " + data);
		
		if(data.substr(0, 1) != ":") data = ":server.address " + data;
		var socketObj = socket.getSocketByID(id);
		if(socketObj==false) return;
		var networkInfo = socketObj.networkInfo;
		var bits = data.split(" ");
		var cData = bits[bits.length - 1]; //data after " :"
		var capTimer = 0;
		if(data.indexOf(" :") > 0){
			cData = data.substr(data.indexOf(" :") + 2);
		}
		
		if(data == ":server.address CONNECTED"){
			channel("network console",id).addInfo("Registering with network...", "text-out");
			if(networkInfo.auth.type == "server_password"){
				socket.sendData("PASS " + crypt.decrypt(networkInfo.auth.password),id);
			}

			socket.sendData("CAP LS",id);
			capTimer = setTimeout(function(){
							socket.sendData("NICK " + networkInfo.nick,id);
							socket.sendData("USER " + networkInfo.nick + " * * :" + networkInfo.realName,id);
						},2000);
		}else{
			if(data.substr(0,1) == ":"){
				if(bits.length > 1){
					if(isNaN(bits[1]) == false){
						//IRC Numeric!
						var num = parseInt(bits[1]);
						switch(num){
							
							case E.RPL_WELCOME:
								setTimeout(function(){
									networkInfo["loggedin"] = true;
								},3000);
								printMsg(getKeyFromNumber(num), [cData]);
								
								break;
							case E.RPL_YOURHOST:
							case E.RPL_CREATED:
							case E.RPL_LUSERCLIENT:
							case E.RPL_LUSERME:
							case E.RPL_STATSCONN:
								printMsg(getKeyFromNumber(num), [cData]);
								break;
								
							case E.RPL_LUSEROP:
							case E.RPL_LUSERCHANNELS:
							case E.RPL_CHANNEL_URL:
							case E.RPL_STATSPLINE:
							case E.RPL_ENDOFSTATS:
							case E.RPL_TRYAGAIN:
								printMsg(getKeyFromNumber(num), [3, cData]);
								break;
								
							case E.RPL_STATSILINE:
								channel("*", id).addInfo( getAfter(data, 3), "text-in" );
								break;
								
							case E.RPL_LOCALUSERS:
							case E.RPL_GLOBALUSERS:
								printMsg(getKeyFromNumber(num), [3, 4, cData]);
								break;
								
							case E.RPL_MOTDSTART:
							case E.RPL_MOTD:
							case E.RPL_ENDOFMOTD:
								printMsg("MOTD:", [cData]);
								break;
							
							case E.RPL_NAMREPLY:
								cache = cache.concat( cData.split(" ") );
								break;
								
							case E.RPL_ENDOFNAMES:
								addNicksToChannel(bits[3], cache);
								cache = [];
								break;
							
							case E.RPL_MYINFO:
								var info = {
									serverName: bits[3],
									serverVersion: bits[4],
									userModes: bits[5],
									channelModes: bits[6],
									channelArgModes: "bkov",
									userArgModes: ""
								};
								if(bits.length > 7) info.channelArgModes = bits[7];
								if(bits.length > 8) info.userArgModes = bits[8];
								networkInfo["serverInfo"] = info;
								break;
							
							case E.RPL_ISUPPORT:
							
								var is = data.substr((data.indexOf(bits[2]) + bits[2].length + 1)).split(" :")[0].split(" ");
								networkInfo["ISUPPORT"] = networkInfo["ISUPPORT"].concat(is);
								
								if(networkInfo.getISUPPORT("network")){
									var net = networkInfo.getISUPPORT("network");
									$("div.server_list[network='" + id + "'] div.server_title").text(net);
									channel("network console",id).object.find("span.topic").text(net);
								}
								break;
								
								
								
							case E.RPL_TOPIC:
								var chan = bits[3];
								channel(bits[3], id).object.find("span.topic").text(cData);
								channel(bits[3], id).addInfo( "<b>Topic</b>: " + HTML.linkify(HTML.encodeString(cData)), "", true );
								break;
								
							case E.RPL_TOPICWHOTIME:
								var chan = bits[3];
								var who = bits[4].split("!")[0];
								var time = bits[5];
								channel(bits[3], id).addInfo( "Topic was set by <span class=teal>" + HTML.encodeString(who) + "</span> on <span class=orange>" + getDateStr(time) + "</span>", "text-in", true );
								break;
							

							case E.RPL_WHOISUSER:
								channel("*", id).addInfo( "<span class=whois_name>[" + HTML.encodeString(bits[3]) + "]</span> (" + HTML.encodeString(bits[4]) + "@" + HTML.encodeString(bits[5]) + "): <span class=whois_realname>" + HTML.encodeString(cData) + "</span>", "text-in", true );
								break;
								
							case E.RPL_WHOISCHANNELS:
								channel("*", id).addInfo( "<span class=whois_name>[" + HTML.encodeString(bits[3]) + "]</span> " + HTML.encodeString(cData), "text-in", true );
								break;
								
							case E.RPL_WHOISSERVER:
								channel("*", id).addInfo( "<span class=whois_name>[" + HTML.encodeString(bits[3]) + "]</span> <span class=whois_server>" + HTML.encodeString(bits[4] + ": " + cData) + "</span>", "text-in", true );
								break;
								
							case E.RPL_WHOISHOST:
								channel("*", id).addInfo( "<span class=whois_name>[" + HTML.encodeString(bits[3]) + "]</span> " + HTML.encodeString(cData), "text-in", true );
								break;
								
							case E.RPL_WHOISIDLE:
								channel("*", id).addInfo( "<span class=whois_name>[" + HTML.encodeString(bits[3]) + "]</span> " + HTML.encodeString("seconds idle: " + bits[4] + ", signon time: " + getDateStr(bits[5])), "text-in", true );
								break;
															
							case E.RPL_AWAY:
								channel("*", id).addInfo( "<span class=whois_name>[" + HTML.encodeString(bits[3]) + "]</span> is away (<span class=whois_away>" + HTML.encodeString(cData) + "</span>)", "text-in", true );
								break;
								
							case E.RPL_WHOISACCOUNT:
								channel("*", id).addInfo( "<span class=whois_name>[" + HTML.encodeString(bits[3]) + "]</span> is logged in as " + HTML.encodeString(bits[4]), "text-in", true );
								break;
								
							case E.RPL_WHOISSECURE:
								channel("*", id).addInfo( "<span class=whois_name>[" + HTML.encodeString(bits[3]) + "]</span> is using a secure connection", "text-in", true );
								break;
								
							case E.RPL_WHOREPLY:
								channel("*", id).addInfo( getAfter(data,3), "text-in" );
								break;
							case E.RPL_ENDOFWHO:
								channel("*", id).addInfo( "End of /WHO", "text-in" );
								break;
								
							case E.ERR_UNKNOWNCOMMAND:
							case E.ERR_BADCHANNAME:
							case E.ERR_NOSUCHCHANNEL:
							case E.ERR_NOSUCHNICK:
							case E.ERR_BANNEDFROMCHAN:
							case E.ERR_CANNOTSENDTOCHAN:
							case E.ERR_ERRONEUSNICKNAME:
							case E.ERR_NICKNAMEINUSE:
							case E.ERR_INVITEONLYCHAN:
							case E.ERR_CHANOPRIVSNEEDED:
								printMsg(getKeyFromNumber(num), [3, cData]);
								break;
								
							case E.ERR_NOPRIVILEGES:
								printMsg(getKeyFromNumber(num), [cData]);
								break;
								
							case E.ERR_PASSWDMISMATCH:
								channel("network console",id).addInfo("ERROR 464: INVALID PASSWORD", "text-in");
								break;
							case E.SASL_AUTH_FAILURE:
							case E.SASL_AUTH_SUCCESS:
								socket.sendData("CAP END",id);
								break;
							default:
								console.log("UNHANDLED: " + data);
						}
					}else{
						//packet was not irc numeric
						switch(bits[1].toUpperCase()){
							case "AUTHENTICATE":
								if(bits[2] == "+"){
									var login = networkInfo.auth.user;
									login += String.fromCharCode(0) + networkInfo.auth.user;
									login += String.fromCharCode(0) + crypt.decrypt(networkInfo.auth.password);
									socket.sendData("AUTHENTICATE " + btoa(login),id);
								}else{
									socket.sendData("CAP END",id);
								}

								break;
							case "CAP":
								switch(bits[3].toUpperCase()){
									case "LS":
										var caps = cData.toLowerCase().split(" ");
										var supported = ["multi-prefix"];
										if(networkInfo.auth.type == "sasl_plain") supported.push("sasl");
										var capRequest = "";
										for(var i in caps){
											if(supported.includes(caps[i])){
												capRequest += caps[i] + " ";
											}
										}
										socket.sendData("CAP REQ :" + capRequest.slice(0,-1),id);
										break;
									case "ACK":
										if(cData.indexOf("sasl")>-1){
											socket.sendData("AUTHENTICATE PLAIN",id);
										}else{
											socket.sendData("CAP END",id);
										}
										break;
									case "NAK":
										socket.sendData("CAP END",id);
										break
								}
								break;
							case "JOIN":
								var usr = parseUser(bits[0]);
								if( usr.nick == networkInfo.nick ){
									//we joined the channel! let's create the window!
									channel(cData, id).create("new_channel_window").show();
									cache = [];
								}else{
									if(!ignore.check(data)) channel(cData, id).addInfo( usr.nick + " (" + usr.nick + "!" + usr.ident + "@" + usr.host + ") has joined the channel.", "text-in" );
									cache = [];
									channel(cData, id).object.find("div.channel_users div.user").each(function(){
										cache.push(HTML.decodeParm($(this).attr("onick")));
									});
									cache.push(usr.nick);
									addNicksToChannel(cData, cache);
									logging.addLog({date: Date.now(), network: networkInfo.getISUPPORT("network"), channel: cData, user: usr.nick, type: "join"});
								}
								break;
								
							case "KICK":
								var kicker = HTML.encodeString( parseUser(bits[0]).nick );
								var kickee = bits[3];
								var chan = bits[2];
								var reason = HTML.encodeString(cData);
								channel(chan, id).addInfo( "<b>" + kicker + "</b> has kicked <b>" + HTML.encodeString(kickee) + "</b> from the channel (" + reason + ")", "", true );
								channel(chan, id).object.find("div.channel_users div.user:iAttrContains('nick','" + kickee.toLowerCase() + "')").remove();
								channel(chan, id).recount();
								break;
								
							case "MODE":
								parseMode();
								break;
								
							case "NICK":
								if( parseUser(bits[0]).nick == networkInfo.nick ){
									/* our own nickname was changed */
									networkInfo.nick = bits[2].replace(":","");
								}else{
									/* someone else */
								}
								nickChange(parseUser(bits[0]).nick,  bits[2].replace(":",""));
								break;
								
							case "NOTICE":
								if(ignore.check(data)) return;
								if(cData.substr(0,1) == String.fromCharCode(1)) return parseCTCP();
								channel("*",id).addInfo("-<b>" + HTML.encodeString(parseUser(bits[0]).nick) + "</b>-: " + HTML.linkify(HTML.encodeString(cData)), "", true);
								break;
								
							case "PART":
								var usr = parseUser(bits[0]);
								if( usr.nick == networkInfo.nick ){
									//we left the channel!
									channel(bits[2], id).addInfo( usr.nick + " (" + usr.nick + "!" + usr.ident + "@" + usr.host + ") has left the channel (" + cData + ").", "text-out" );
									channel(bits[2], id).addInfo( "You're no longer in this channel.", "error-info" );
								}else{
									if(!ignore.check(data)) channel(bits[2], id).addInfo( usr.nick + " (" + usr.nick + "!" + usr.ident + "@" + usr.host + ") has left the channel (" + cData + ").", "text-out" );
									channel(bits[2], id).object.find("div.channel_users div.user:iAttrContains('nick','" + usr.nick.toLowerCase() + "')").remove();
									channel(bits[2], id).recount();
									logging.addLog({date: Date.now(), network: networkInfo.getISUPPORT("network"), channel: bits[2], user: usr.nick, type: "part"});
								}
								break;
								
							case "QUIT":
								var usr = parseUser(bits[0]);
								if( usr.nick == networkInfo.nick ){
									//we quit!
									//channel(cData, id).addInfo( "You've quit this irc session.", "error-info" );
								}else{
									//we need to find all channels that user is in and remove them from it.
									$("div.channel[network='" + id + "']").each(function(){
										var chanUserObj = $(this).find("div.channel_users div.user:iAttrContains('nick','" + usr.nick.toLowerCase() + "')");
										if( chanUserObj.length > 0 ){
											//user object was found, lets remove them and add info to the channel
											chanUserObj.remove();
											channel($(this).attr("channel"), id).recount();
											channel($(this).attr("channel"), id).addInfo( usr.nick + " (" + usr.nick + "!" + usr.ident + "@" + usr.host + ") has quit (" + cData + ")", "text-out" );
											logging.addLog({date: Date.now(), network: networkInfo.getISUPPORT("network"), channel: $(this).attr("channel"), user: usr.nick, type: "quit"});
										}
									});
									
								}
								break;
								
							case "PING":
								socket.sendData("PONG " + bits[2],id);
								break;
							case "PRIVMSG":
								var chan = bits[2].toLowerCase();
								var nick = parseUser(bits[0]).nick;
								var highlight = highlights.process(networkInfo.nick, cData);

								if(ignore.check(data)) return;
								
								if(cData.substr(0,1) == String.fromCharCode(1) && cData.toUpperCase().slice(1,7) != "ACTION") return parseCTCP();
								
								if(chan == networkInfo.nick.toLowerCase()){
									//it's a message directly to me!
									//:buttbot!897776e2@gateway/web/freenode/ip.137.119.118.226 PRIVMSG duckgoose :dfgdfg
									channel(nick, id).create("new_pm_window");
									if(cData.substr(0,8).toLowerCase() == String.fromCharCode(1) + "action "){
										//action
										channel(nick, id).addAction(nick, bits[0], color, highlight, cData.substr(8).slice(0,-1));
									}else{
										channel(nick, id).addPrivmsg(nick, bits[0], color, highlight, cData);
									}
								}else{
									//let's assume it's a channel message
									if(channel(chan, id).object.length > 0){
										var color = $("div.user:iAttrContains('nick','" + nick.toLowerCase() + "')").css("color");
										if(cData.substr(0,8).toLowerCase() == String.fromCharCode(1) + "action "){
											//action
											channel(chan, id).addAction(nick, bits[0], color, highlight, cData.substr(8).slice(0,-1));
										}else{
											channel(chan, id).addPrivmsg(nick, bits[0], color, highlight, cData);
										}
									}
								}
								
								break;
							case "TOPIC":
								var chan = bits[2].toLowerCase();
								var nick = parseUser(bits[0]).nick;
								if(channel(chan, id).object.length > 0){
									channel(chan, id).object.find("div.title span.topic").text(cData);
									channel(chan, id).addInfo( nick + " has changed the topic to: " + cData );
								}
								break;
								
								
							default:
								console.log(data);
						}
					
					}
				}
			}
		}
		
		
		
		/* below are some common functions we use during data parsing */
		
		function secure(e){
			e = e.replace(/\=\s*?(\"|\'|(ht|f)tp)/ig, "[filtered]");
			e = e.replace(/<script/ig, "<" + String.fromCharCode(5082) + "cript");
			return e;
		}
		
		function parseCTCP(){
			var nick = parseUser(bits[0]).nick;
			var ctcpMsg = cData.slice(1,-1).toUpperCase().split(" ");
			var cChar = String.fromCharCode(1);
			
			if( bits[1].toUpperCase() == "NOTICE" ){
				/* it's a CTCP reply */
				channel("*",id).addInfo("-<b>" + HTML.encodeString(nick) + "</b>- CTCP Reply <span class=orange>" + HTML.encodeString(cData.slice(1,-1)) + "</span>", "", true);
				
			}else{
			
				channel("*",id).addInfo("-<b>" + HTML.encodeString(nick) + "</b>- Requested CTCP <span class=orange>" + HTML.encodeString(ctcpMsg[0]) + "</span>", "", true);
				
				switch(ctcpMsg[0]){
					case "VERSION":
						socket.sendData("NOTICE " + nick + " :" + cChar + "VERSION Burd IRC " + appVersion + cChar,id);
						break;
					case "PING":
						if(ctcpMsg.length > 1) socket.sendData("NOTICE " + nick + " :" + cChar + "PING " + ctcpMsg[1] + cChar,id);
						break;
					case "TIME":
						socket.sendData("NOTICE " + nick + " :" + cChar + "TIME " + getDateStr(Date.now()/1000) + cChar,id);
						break;
				}
			
			}
			
			console.log("CTCP:" + data);
			//:duckgoose_!~lol@2001:470:5:c75:4156:ea25:b45:d43e PRIVMSG duckgoose :[1]VERSION[1]
			
		}
		
		
		function getDateStr(UNIX_timestamp){
			/* https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript */
			var a = new Date(UNIX_timestamp * 1000);
			var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
			var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
			var year = a.getFullYear();
			var month = months[a.getMonth()];
			var date = a.getDate();
			var hour = pad(a.getHours());
			var min = pad(a.getMinutes());
			var sec = pad(a.getSeconds());
			var time = days[a.getDay()] + ' ' + month + ' ' + date + ' ' + hour + ':' + min + ':' + sec + ' ' + year ;
			
			function pad(e){
				if(e < 10) e = "0" + e;
				return e;
			}
			
			return time;
		}
		
		
		
		function getAfter(t,e){
			/* get text after x amount of spaces */
			e = e - 1;
			var st = t.split(" ");
			var rt = 0;
			for(var i in st){
				rt += st[i].length + 1;
				if(i==e) break;
			}
			return t.substr(rt);
		}
		
		
		function parseMode(){
			var nickInfo = parseUser(bits[0]);
			if( networkInfo.getISUPPORT("chantypes").indexOf( bits[2].substr(0,1) ) > -1  ){
				/* it's a channel mode */
				var chan = bits[2];
				var modeData = bits[3].split("");
				var argModes = networkInfo.serverInfo.channelArgModes;
				var args = data.substr(bits[0].length + bits[1].length + bits[2].length + bits[3].length + 4).split(" ");
				var argIndex = 0;
				var adding = false;
				for(var i in modeData){
					
					switch(modeData[i]){
						case "+":
							adding = true;
							break;
							
						case "-":
							adding = false;
							break;
							
						case "o":
						case "v":
							setChanUserSym(args[argIndex], modeToSym(modeData[i]), adding);
							break;
							
						case "h":
						case "Y":
						case "a":
						case "q":
							if( networkInfo.getISUPPORT("prefix").includes(modeData[i]) ){
								setChanUserSym(args[argIndex], modeToSym(modeData[i]), adding);
							}
							break;
							
					}
					
					if( argModes.includes(modeData[i]) ) argIndex++;
					
				}

				channel(chan, id).addInfo("<b>" + HTML.encodeString(nickInfo.nick) + "</b> has set mode: " + HTML.encodeString(bits[3] + " " + args), "", true);
				
				function modeToSym(mode){
					var sym = networkInfo.getISUPPORT("prefix").substr(1).split(")");
					for(var i in sym[0]){
						if(sym[0][i] == mode) return sym[1][i];
					}
				}
				
				function setChanUserSym(user, sym, add){
					var no = channel(chan, id).object.find("div.channel_users div.user:iAttrContains('nick','" + user.toLowerCase() + "')");
					if(add){
						no.attr("onick", sym + HTML.encodeParm(no.attr("onick").replace(sym, "")));
					}else{
						no.attr("onick", HTML.encodeParm(no.attr("onick").replace(sym, "")));
					}
					resortNicks(chan);
				}
			}
			
		}
		
		
		function nickChange(o,n){
			$("div.channel[network='" + id + "']").each(function(){
				var no = $(this).find("div.channel_users div.user:iAttrContains('nick','" + o.toLowerCase() + "')");
				if( no.length > 0 ){
					var chanName = $(this).attr("channel");
					no.text(n);
					no.attr("nick", HTML.encodeParm(n));
					no.attr("onick", nickModes(HTML.decodeParm(no.attr("onick"))) + HTML.encodeParm(n));
					channel(chanName, id).addInfo( "<b>" + HTML.encodeString(o) + "</b> has changed their nick to <b>" + HTML.encodeString(n) + "</b>", "", true );
					resortNicks(chanName);
				}
			});
			
		}
		
		function nickModes(e){
			/* takes a nick string with modes and returns only the modes  */
			var prefixes = networkInfo.getISUPPORT("prefix").split(")")[1].split("");
			var fm = "";
			for(var i in prefixes){
				if(e.indexOf(prefixes[i])>-1) fm += prefixes[i];
			}
			return fm;
		}
		
		function parseUser(e){
			if(e.substr(0,1) == ":") e = e.substr(1);
			e = e.replace("@", "!").split("!");
			return { nick: e[0], ident:e[1], host: e[2] };
		}
		
		function getKeyFromNumber(e){
			for(var i in E){
				if(E[i] == e) return i;
			}
		}
		
		function printMsg(msg,e){
			for(var i in e){
				if(typeof(e[i]) == "string"){
					msg = msg + " " + e[i];
				}else{
					msg = msg + " " + bits[e[i]];
				}
			}
			if(networkInfo["loggedin"]){
				channel("*",id).addInfo(msg, "text-in");
			}else{
				channel("network console",id).addInfo(msg, "text-in");
			}
		}
		
		function resortNicks(chan){
			cache = [];
			channel(chan, id).object.find("div.channel_users div.user").each(function(){
				cache.push(HTML.decodeParm($(this).attr("onick")));
			});
			addNicksToChannel(chan, cache);
		}
		
		function addNicksToChannel( chan, cache ){
			cache = sortNames( cache );
			var nickHTML = "";
			var prefix = "@+";
			var nickCount = 0;
			for( var i in cache ) {
				var fNick = cache[i];
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
								uModes += " admin"
								break;
							case "~":
								uModes += " owner"
								break;
							case "%":
								uModes += " halfop"
								break;
						}
					}
					fNick = fNick.replace( prefix[j], "" );
				}
				nickCount++;
				nickHTML += '<div class="user' + uModes + " nick" + generateColor(fNick) + '" onick="' + HTML.encodeParm(cache[i]) + '" nick="' + HTML.encodeParm(fNick) + '" fullmask="">' + HTML.encodeString(fNick) + '</div>';
				
			}
			
			channel(chan, id).object.find("div.channel_users").html(nickHTML);
			channel(chan, id).object.find("div.usercount").html("Users Here - " + nickCount);
			cache = [];
			
		}
		
		function getKeyFromNumber(e){
			for(var i in E){
				if(E[i] == e) return i;
			}
		}
		
		function sortNames(names) {
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
		
	}
}