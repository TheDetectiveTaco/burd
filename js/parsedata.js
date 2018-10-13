socket.parseData = function(data, id, whox){
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
	socketObj.dataHook({id: id, data: data});
	
	if(data == ":server.address CONNECTED"){
		
		channel("network console",id).addInfo("Registering with network...", "text-out");
		if(networkInfo.auth.type == "server_password"){
			socket.sendData("PASS " + crypt.decrypt(networkInfo.auth.password),id);
		}

		socket.sendData("CAP LS",id);
		capTimer = setTimeout(function(){
						socket.sendData("NICK " + networkInfo.nick,id);
						socket.sendData("USER " + networkInfo.user + " * * :" + networkInfo.realName,id);
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
								/*
									send on-connect commands on a 3 second delay
									so chanserv has time to log us in
								*/
								for(var i in networkInfo.commands){
									socket.sendData(networkInfo.commands[i],id);
								}
								
							},3000);
							
							
							if(networkInfo.auth.type == "nickserv"){
								/*
									send NICKSERV as a command and not a nick to prevent
									password leaking
								*/
								socket.sendData("NICKSERV IDENTIFY " + crypt.decrypt(networkInfo.auth.password),id);
							}

							
							printMsg(getKeyFromNumber(num), [cData]);
							break;
							
						case E.RPL_LIST:
							/* don't do anything. this is handled by channel list window */
							break;
							
						case E.RPL_YOURHOST:
						case E.RPL_CREATED:
						case E.RPL_LUSERCLIENT:
						case E.RPL_LUSERME:
						case E.RPL_STATSCONN:
						case E.RPL_UMODEIS:
							printMsg(getKeyFromNumber(num), [cData], "network console");
							break;
							
						case E.RPL_LUSEROP:
						case E.RPL_LUSERCHANNELS:
						case E.RPL_STATSPLINE:
						case E.RPL_ENDOFSTATS:
						case E.RPL_TRYAGAIN:
						case E.RPL_ENDOFBANLIST:
						case E.RPL_KNOCKDLVR:
							printMsg(getKeyFromNumber(num), [3, cData], "network console");
							break;
							
						case E.RPL_CHANNEL_URL:
							channel(bits[3], id).addInfo( "Channel url: <a href=" + cData + ">" + cData + "</a>", "text-in", true );
							break;
							
						case E.RPL_STATSILINE:
							channel("network console", id).addInfo( getAfter(data, 3), "text-in" );
							break;
							
						case E.RPL_LOCALUSERS:
						case E.RPL_GLOBALUSERS:
							printMsg(getKeyFromNumber(num), [3, 4, cData], "network console");
							break;
							
						case E.RPL_MOTDSTART:
						case E.RPL_MOTD:
						case E.RPL_ENDOFMOTD:
							printMsg("MOTD:", [cData], "network console");
							break;
						
						case E.RPL_NAMREPLY:
							cache = cache.concat( cData.split(" ") );
							break;
							
						case E.RPL_ENDOFNAMES:
							addNicksToChannel(bits[3], cache);
							cache = [];
							whox.applyIdleStates(bits[3], id);
							break;
							
						case E.RPL_KNOCK:
							var chan = bits[3];
							var user = bits[4].split("!")[0];
							channel(chan, id).addInfo(user + " has requested an invite", "");
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
								$("div.server_list[network='" + id + "'] div.console_item span.title").text(net);
								channel("network console",id).object.find("span.topic").text(net);
							}
							break;
							
							
							
						case E.RPL_TOPIC:
							var chan = bits[3];
							if(networkInfo["redirectTopic"]) chan = "*";
							channel(chan, id).object.find("span.topic").html(colors.parse(HTML.encodeString(cData)));
							channel(chan, id).addInfo( "<b>Topic for " + HTML.encodeString(bits[3]) + "</b>: " + colors.parse(HTML.linkify(HTML.encodeString(cData))), "", true );
							break;
							
						case E.RPL_TOPICWHOTIME:
							var chan = bits[3];
							if(networkInfo["redirectTopic"]) chan = "*";
							var who = bits[4].split("!")[0];
							var time = bits[5];
							channel(chan, id).addInfo( "Topic was set by <span class=teal>" + HTML.encodeString(who) + "</span> on <span class=orange>" + getDateStr(time) + "</span>", "text-in", true );
							networkInfo["redirectTopic"] = false;
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
							//console.log(bits[7]);
							var userState = bits[8].substr(0,1);
							var userNick = bits[7];
							if(userState == "G"){
								/* $("div.channel[network='" + socketObj.id + "'] div.channel_users div.user:iAttrContains('nick','" + userNick.toLowerCase() + "')").each(function(){
									$(this).addClass("away");
							}); */
								if(!networkInfo.idleUsers.includes(userNick+":away") && !networkInfo.idleUsers.includes(userNick+":setaway")){
									networkInfo.idleUsers.push(userNick+":away");
								}
							}else{
								if(networkInfo.idleUsers.includes(userNick+":setaway")){
									//user has returned from being away
									for(var i in networkInfo.idleUsers){
										if(networkInfo.idleUsers[i] == userNick + ":setaway"){
											networkInfo.idleUsers.splice(i,1);
											$("div.channel[network='" + socketObj.id + "'] div.channel_users div.user:iAttrContains('nick','" + userNick.toLowerCase() + "')").each(function(){
												$(this).removeClass("away");
											});
										}
									}
								}
							}
							

							
							networkInfo.lastWhoPoll = Date.now();
							//channel("*", id).addInfo( getAfter(data,3), "text-in" );
							break;
							
						case E.RPL_ENDOFWHO:
							networkInfo.lastWhoPoll = Date.now();
							//channel("*", id).addInfo( "End of /WHO", "text-in" );
							break;
							
						case E.RPL_BANLIST:
							var chan = HTML.encodeString(bits[3]);
							var host = HTML.encodeString(bits[4]);
							var banee = HTML.encodeString(bits[5]);
							var time = bits[6];
							
							channel("network console", id).addInfo( '<span class="purple bold">' + chan + ':</span> <span class="teal">' + host + '</span> on <span class="orange">' + getDateStr(time) + '</span> by <span class="blue">' + banee + '</span>', "text-in", true );
							break;
							
						case E.RPL_CHANNELMODEIS:
							var chan = HTML.encodeString(bits[3]);
							channel(chan, id).addInfo( "Channel modes: " + bits[4], "text-in", true );
							break;
							
						case E.RPL_CREATIONTIME:
							var chan = HTML.encodeString(bits[3]);
							channel(chan, id).addInfo( "Channel created on: " + getDateStr(bits[4]), "text-in", true );
							break;
							
							
						case E.ERR_UNKNOWNCOMMAND:
						case E.ERR_BADCHANNAME:
						case E.ERR_NOSUCHCHANNEL:
						case E.ERR_NOSUCHNICK:
						case E.ERR_BANNEDFROMCHAN:
						case E.ERR_ERRONEUSNICKNAME:
						case E.ERR_NICKNAMEINUSE:
						case E.ERR_INVITEONLYCHAN:
						case E.ERR_NEEDMOREPARAMS:
						case E.ERR_UNAVAILRESOURCE:
							printMsg(getKeyFromNumber(num), [3, cData], "network console");
							networkInfo["redirectTopic"] = false;
							break;
							
							
						case E.ERR_CANNOTSENDTOCHAN:
						case E.ERR_CHANOPRIVSNEEDED:
						case E.ERR_NOTONCHANNEL:
							printMsg(getKeyFromNumber(num), [3, cData]);
							break;
							
						case E.ERR_NOPRIVILEGES:
						case E.ERR_USERSDONTMATCH:
							printMsg(getKeyFromNumber(num), [cData]);
							break;
							
						case E.ERR_PASSWDMISMATCH:
							channel("network console",id).addInfo("ERROR 464: INVALID PASSWORD", "text-in");
							break;
						case E.SASL_AUTH_FAILURE:
						case E.SASL_AUTH_SUCCESS:
							socket.sendData("CAP END",id);
							break;
							
						case E.ERR_BADCHANNELKEY:
							var chan = bits[3];
							inputRequest.create({
								title: "Channel key required",
								text: "Please enter the key to join " + HTML.encodeString(chan),
								inputs: ["Key"],
								buttons: ["OK", "Cancel"],
								callback: function(e){
									if(e.button == "OK"){
										if(e.inputs.Key.length > 0){
											socket.sendData("JOIN "+ chan + " " + e.inputs.Key, id);
										}
									}
								}
							});
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
									var supported = ["multi-prefix", "extended-joinnn"];
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
								channel(cData, id).create("new_channel_window");
								if(requestedChannel.toLowerCase() == cData.toLowerCase()) channel(cData, id).show();
								cache = [];
								networkInfo.whoPollChans = [cData].concat(networkInfo.whoPollChans);
								requestedChannel = "";
							}else{
								if(!ignore.check(data)) channel(cData, id).addInfo( usr.nick + " (" + usr.nick + "!" + usr.ident + "@" + usr.host + ") has joined the channel.", "text-in" );
								resortNicks(cData, usr.nick);
								logging.addLog({date: Date.now(), network: networkInfo.getISUPPORT("network"), channel: cData, user: usr.nick, type: "join"});
							}
							postToScript({c: "channelJoin", nick: bits[0].substr(1), channel: cData, networkID: id});
							break;
							
						case "KICK":
							var kicker = HTML.encodeString( parseUser(bits[0]).nick );
							var kickee = bits[3];
							var chan = bits[2];
							var reason = HTML.encodeString(cData);
							channel(chan, id).addInfo( "<b>" + kicker + "</b> has kicked <b>" + HTML.encodeString(kickee) + "</b> from the channel (" + reason + ")", "", true );
							channel(chan, id).object.find("div.channel_users div.user:iAttrContains('nick','" + kickee.toLowerCase() + "')").remove();
							channel(chan, id).recount();
							//if( kickee == networkInfo.nick ) socket.sendData("JOIN " + chan,id);
							postToScript({c: "channelKick", kicker: bits[0].substr(1), kickee: kickee, message: reason, channel: chan, networkID: id});
							break;
							
						case "MODE":
							parseMode();
							break;
							
						case "NICK":
							var newNick = bits[2].replace(":","");
							var oldNick = parseUser(bits[0]).nick;
							if( oldNick == networkInfo.nick ){
								/* our own nickname was changed */
								networkInfo.nick = newNick;
							}else{
								/* someone else */
							}
							nickChange(oldNick,  newNick);
							postToScript({c: "nickChange", old: oldNick, new: newNick, networkID: id});
							for(var i in networkInfo.idleUsers){
								if(networkInfo.idleUsers[i] == (oldNick + ":setaway") || networkInfo.idleUsers[i] == (oldNick + ":away")){
									networkInfo.idleUsers.splice(i,1);
									break;
								}
							}
							break;
							
						case "NOTICE":
							if(ignore.check(data)) return;
							if(cData.substr(0,1) == String.fromCharCode(1)) return parseCTCP();
							channel("*",id).addInfo("-<b>" + HTML.encodeString(parseUser(bits[0]).nick) + "</b>-: " + HTML.linkify(HTML.encodeString(cData)), "", true);
							postToScript({c: "notice", nick: bits[0].substr(1), message: cData, networkID: id});
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
							postToScript({c: "channelPart", nick: bits[0].substr(1), channel: bits[2], networkID: id});
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
								
								for(var i in networkInfo.idleUsers){
									if(networkInfo.idleUsers[i] == (usr.nick + ":setaway") || networkInfo.idleUsers[i] == (usr.nick + ":away")){
										networkInfo.idleUsers.splice(i,1);
										break;
									}
								}
								
								
							}
							postToScript({c: "userQuit", nick: bits[0].substr(1), message: cData, networkID: id});
							break;
							
						case "PING":
							socket.sendData("PONG " + bits[2],id);
							break;
						case "PRIVMSG":
							var chan = bits[2].toLowerCase().replace(/^\@|\!|\&|\~/g, "");
							var nick = parseUser(bits[0]).nick;
							var highlight = highlights.process(networkInfo.nick, cData);

							if(ignore.check(data)) return;
							
							if(cData.substr(0,1) == String.fromCharCode(1) && cData.toUpperCase().slice(1,7) != "ACTION") return parseCTCP();
							
							scripting_iframe.contentWindow.postMessage({c: "privmsg", nick: bits[0].substr(1), message: cData, channel: chan, networkID: id}, "*");
							
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
							postToScript({c: "channelTopic", nick: bits[0].substr(1), channel: bits[2], topic: cData, networkID: id});
							break;
							
						case "INVITE":
							var nick = parseUser(bits[0]).nick;
							var chan = HTML.encodeString(cData);
							sticky.create(id,HTML.encodeString(nick) + ' has invited you to <a href="schannel:'+chan+'">' + chan + '</a>');
							postToScript({c: "channelInvite", nick: bits[0].substr(1), channel: chan, networkID: id});
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
	
	function printMsg(msg,e,chan){
		if(chan == undefined) chan = "*";
		for(var i in e){
			if(typeof(e[i]) == "string"){
				msg = msg + " " + e[i];
			}else{
				msg = msg + " " + bits[e[i]];
			}
		}
		channel(chan,id).addInfo(msg, "text-in");

	}
	
	function resortNicks(chan, nickToAdd){
		cache = [];
		if(nickToAdd != undefined) cache.push(nickToAdd + ":false");
		channel(chan, id).object.find("div.channel_users div.user").each(function(){
			var isAway = $(this).hasClass("away");
			cache.push(HTML.decodeParm($(this).attr("onick")) + ":" + isAway);
		});
		addNicksToChannel(chan, cache);
	}
	
	function addNicksToChannel( chan, cache ){
		cache = sortNames( cache );
		var nickHTML = "";
		var prefix = "~&@%+";
		var nickCount = 0;
		for( var i in cache ) {
			var fNick = cache[i].split(":")[0];
			var awayState = (cache[i].split(":")[1] == "true");
			var uModes = "";
			var classes = "";
			if(awayState) classes = "away";
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
			nickHTML += '<div class="user' + uModes + " nick" + generateColor(fNick) + ' ' + classes + '" onick="' + HTML.encodeParm(cache[i].split(":")[0]) + '" nick="' + HTML.encodeParm(fNick) + '" fullmask="">' + HTML.encodeString(fNick) + '</div>';
			
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
	
	function postToScript(e){
		scripting_iframe.contentWindow.postMessage(e, "*");
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

/* remove code below after beta  */
	function getKeyFromNumber(e){
		for(var i in E){
			if(E[i] == e) return i;
		}
	}