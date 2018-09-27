var who = {
	enabled: true,
	timer: setInterval(function(){
		if(who.enabled == false) return;
		who.resetIdleCaches();
		for(var i in socket.sockets){
			var sock = socket.sockets[i];
			if(sock.networkInfo.whoPollChans.length == 0) who.compileList(sock);
			if(sock.networkInfo.whoPollChans.length == 0) break;
			if(sock.networkInfo.loggedin == false) break;
			if((Date.now() - sock.networkInfo.lastWhoPoll) < 40000) break;
			/*
				don't poll who if it's been done less than 40 seconds ago
				Multiple clients on a ZNC polling WHO could cause issues
			*/
			socket.sendData("WHO " + sock.networkInfo.whoPollChans[0], sock.id);
			sock.networkInfo.whoPollChans.splice(0,1);
		}
	},45000),

	compileList: function(sock){
		/* add all the channels from all the networks to who.channels for polling. */
		$("div.channel[type='channel'][network='" + sock.id + "']").each(function(){
			sock.networkInfo.whoPollChans.push($(this).attr("channel"));
		});
	},

	resetIdleCaches: function(){
		/*
			every 5 minutes we reset the cache of idle users
			so we don't end up with a memory leak
		*/
		if(who.enabled == false) return;
		for(var i in socket.sockets){
			var sock = socket.sockets[i];
			sock.networkInfo.idleUsers = [];
			$("div.channel[network='" + sock.id + "'] div.channel_users div.away").each(function(){
				var nick = HTML.decodeParm($(this).attr("nick"));
				if(!sock.networkInfo.idleUsers.includes(nick + ":setaway")){
					sock.networkInfo.idleUsers.push(nick + ":setaway");
				}
			});
		}
	},

	applyIdleStates: function(chan,id){
			var sock = socket.getSocketByID(id);
			$("div.channel[network='" + id + "'] div.channel_users div.user").each(function(){
				var nick = HTML.decodeParm($(this).attr("nick"));
				if(sock.networkInfo.idleUsers.includes(nick + ":setaway")){
					$(this).addClass("away");
				}
			});
	},

	setOneAway: function(){
		/*
			work with one state change per server per timer interval
			because searching for and changing HTML elements is
			intensive
		*/
		var found = false;
		for(var i in socket.sockets){
			var sock = socket.sockets[i];
			if(sock.networkInfo.idleUsers.length == 0) break;
			for(var a in sock.networkInfo.idleUsers){
				if(sock.networkInfo.idleUsers[a].indexOf(":away") > 0){
					var user = sock.networkInfo.idleUsers[a].split(":")[0];
					$("div.channel[network='" + sock.id + "'] div.channel_users div.user:iAttrContains('nick','" + user.toLowerCase() + "')").each(function(){
						$(this).addClass("away");
					});
					found = true;
					sock.networkInfo.idleUsers[a] = user + ":setaway";
					break;
				}
			}
		}

		/*
			when a find a user that has changed away state then we
			set the timer to a speed of 500 until no other state changes need
			to be applied
		*/
		if(found == false && who.speed == 300){
			clearInterval(who.awayHandler);
			who.speed = 5000;
			who.awayHandler= setInterval(function(){
				who.setOneAway();
			},5000);
		}else if(found == true && who.speed == 5000){
			clearInterval(who.awayHandler);
			who.speed = 300;
			who.awayHandler= setInterval(function(){
				who.setOneAway();
			},300);
		}
	},

	awayHandler: setInterval(function(){
		if(who.enabled == false) return;
		who.setOneAway();
	},5000),

	speed: 5000
}
