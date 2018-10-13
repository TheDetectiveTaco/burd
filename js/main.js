var remote = require('electron').remote;
var dataPath = remote.app.getPath("userData");
var fs = require('fs');
var tar = require('tar-fs');
var appPath = ".";
var shell = require('electron').shell;
var http = require('http');
var https = require('https');

var firstRun = false;

var messageHistory = [];
var historyIndex = 0;

var modal = false;

var themes = [];

/*if electron isn't installed globally then we need to change the app path*/
if(fs.existsSync("./resources/app")) appPath = "./resources/app";


/*check for log folder, create it*/
if (fs.existsSync(dataPath + "/logs")){
	fs.readFile(dataPath + "/config.json", function(err, f){
		var nconfig = JSON.parse(f.toString());
		for(var i in nconfig){
			config[i] = nconfig[i];
		}
		applyConfig();
		startupConnect();
	});
}else{
	fs.mkdirSync(dataPath + "/logs", 0777);
	firstRun = true;
	saveSettings();
}

function applyConfig(){
	$("link#theme").attr('href', 'themes/' + config.theme);
	$("body").css("font-size", config.fontSize);
	scripting_iframe.contentWindow.postMessage({c: "config_loaded"}, "*");
}


function saveSettings(){
	if(config != undefined && config.networks.length>0) fs.writeFileSync(dataPath + "/config.json", JSON.stringify(config));
}


fs.readdir(appPath + "/themes", function(err, items) {
    themes = items;
});
 

$(function(){
	
	window.onbeforeunload = function(){
		saveSettings();
	}
	
	$( window ).resize(function() {
		iframe.repos();
		$("div.simple_menu").remove();
	});
	
});

var startupCache = [];
var startupInt = 0;
function startupConnect(){
	for(var i in config.networks){
		if(config.networks[i].startup){
			startupCache.push(config.networks[i]);
		}
	}
	startupInt = setInterval(function(){
		if(startupCache.length == 0){
			clearInterval(startupInt);
			return;
		}else{
			network.create(startupCache[0]);
			startupCache.splice(0,1);
		}
	},200);
}


function channel(name,network){
	var channelObj = null;
	var switchObj = null;
	if(name!=undefined && network!=undefined){
		if(name == "*") name = HTML.decodeParm($("div.channel[network='" + network + "']:visible").attr("channel"));
		if(name == undefined) name = "network console";
		channelObj = $("div.channel[network='" + network + "'][channel='" + HTML.encodeParm(name.toLowerCase()) + "']");
		switchObj = $("div.channel_item[network='" + network + "'][channel='" + HTML.encodeParm(name.toLowerCase()) + "']");
		if(name == "!"){
			channelObj = $("div.channel[network='" + network + "']");
			switchObj = $("div.channel_item[network='" + network + "']");
		}
	}
	var r = {
		show: function(){
			$("div.channel_item").removeClass("selected");
			switchObj.removeClass("notice");
			switchObj.addClass("selected");
			$("div.channel").hide();
			channelObj.show().find("input.channel_input").focus();
			switchObj.find("div.unread").text("0");
			$("div.unread").each(function(){
				if($(this).text() == "0") $(this).hide();
			});
			return this;
		},
		close: function(){
			if( switchObj.hasClass("selected") ){
				if( switchObj.next().length == 0 ){
					switchObj.prev().click();
				}else{
					switchObj.next().click();
				}
				if(!switchObj.hasClass("pm_item")) socket.sendData("PART " + name, network);
				switchObj.remove();
				channelObj.remove();
			}else{
				if(!switchObj.hasClass("pm_item")) socket.sendData("PART " + name, network);
				switchObj.remove();
				channelObj.remove();
				
			}
		},
		recount: function(){
			channelObj.find("div.usercount").html("Users Here - " + channelObj.find("div.channel_users div.user").length);
		},
		create: function(type){
			if(channelObj.length == 0){
				if(type == "new_pm_window"){
					$("div#main_list_container div.server_list[network='" + network + "']").append(HTML.getTemplate("new_pm_item", { attrname: HTML.encodeParm(name.toLowerCase()), channel: name, network: network, lchannel: name.toLowerCase()  }));
				}else{
					$("div#main_list_container div.server_list[network='" + network + "']").append(HTML.getTemplate("new_channel_item", { attrname: HTML.encodeParm(name.toLowerCase()), channel: name, network: network, lchannel: name.toLowerCase()  }));
				}
				$("div#channel_container").append(HTML.getTemplate(type, { attrname: HTML.encodeParm(name.toLowerCase()), channelname: name, network: network, lcasechannel: name.toLowerCase() }));
			}
			channelObj = $("div.channel[network='" + network + "'][channel='" + HTML.encodeParm(name.toLowerCase()) + "']");
			switchObj = $("div.channel_item[network='" + network + "'][channel='" + HTML.encodeParm(name.toLowerCase()) + "']");
			$("div.unread").each(function(){
				if($(this).text() == "0") $(this).hide();
			});
			return this;
		},
		object: channelObj,
		addInfo: function(text, classes, allowHTML){
			//error-info
			//user-info
			//text-in
			//text-out
			if(classes == undefined || classes == "") classes = "info-default";
			channelObj.find("div.channel_content").append(HTML.getTemplate("new_channel_info", { message: text, class: classes, date: getDate(1) }, {allowHTML: allowHTML}));
			if(name == "network console") this.unread();
			this.scrollBottom();
			return this;
		},
		addPrivmsg: function(user,hostmask,color,highlight,message){
			var classes = "";
			if( highlight ) classes = "highlight";
			message = cocktography.dechode(message);
			if( message.match(/(^([\uD800-\uDBFF][\uDC00-\uDFFF]\s?\=?\>?){1,9}$)/g) != null ) classes += " emoji";
			channelObj.find("div.channel_content").append(HTML.linkify(HTML.getTemplate("new_user_message", { nick: user, message: message, color: color, date: getDate(1), classes: classes })));
			this.scrollBottom();
			this.unread();
			if(highlight){
				sound.play("sounds/highlight.mp3");
				if(channelObj.is(":hidden")) switchObj.addClass("notice");
			}
			
			media.parse(name,network,message);
			
			logging.addLog({date: Date.now(), network: socket.getSocketByID(network).networkInfo.getISUPPORT("network"), channel: name, user: user, type: "privmsg", message: message});
			return this;
		},
		addAction: function(user,hostmask,color,highlight,message){
			var classes = "";
			if( highlight ) classes = "highlight";
			channelObj.find("div.channel_content").append(HTML.linkify(HTML.getTemplate("new_user_action_message", { nick: user, message: message, color: color, date: getDate(1), classes: classes })));
			this.scrollBottom();
			this.unread();
			if(highlight){
				sound.play("sounds/highlight.mp3");
				if(channelObj.is(":hidden")) switchObj.addClass("notice");
			}
			return this;
		},
		scrollBottom: function(){
			//$("div.channel_content:visible").scrollTop($("div.channel_content:visible").height() + $(window).height());
			if( channelObj.is(":visible") ){
				$("div.channel_content:visible").animate({
					scrollTop: $('div.channel_content:visible')[0].scrollHeight - $('div.channel_content:visible')[0].clientHeight
				}, 0);
			}
			this.truncate();
		},
		unread: function(){
			var count = parseInt(switchObj.find("div.unread").text());
			if(channelObj.is(":hidden")){
				if(count+1>99){
					switchObj.find("div.unread").text("99+");
				}else{
					switchObj.find("div.unread").text(count+1);
				}
				if($("div.channel_closer:visible").length==0) switchObj.find("div.unread").show();
			}
		},
		truncate: function(){
			while( channelObj.find("div.truncate").length > config.scrollback ){
				channelObj.find("div.truncate:first").remove();
			}
		}
	}
	return r;
}

var sticky = {
	create: function(network,message){
		$("div#stickies").append('<div network="' + network + '" class="sticky">' + message + '<div class="closer">&nbsp;</div></div>');
	}
}

var network = {
	create: function(e){
		/*e = { server: { host: "irc.irc.com", port: 6667, password: "blanky" }, nick, user, password, channels }
		var id = activeNetworks.length;
		e["ISUPPORT"] = [];
		e["server"].name = e["server"].host;
		activeNetworks.push(e);
		$("div#main_list_container").append(HTML.getTemplate("new_server_item", { name: e.server.host, network: id }));
		$("div#channel_container").append(HTML.getTemplate("new_console_window", { channel: "Network Console", lcasechannel: "network console", network: id, netname: e.server.host }));
		channel("network console",id).show().addInfo("Connecting to IRC...");
		*/
		
		var sock = socket.create(e.server.host, e.server.port, e.SSL);
		sock.networkInfo["nick"] = e.nick;
		sock.networkInfo["auth"] = e.auth;
		sock.networkInfo["ISUPPORT"] = [];
		sock.networkInfo["server"] = e.server.host;
		sock.networkInfo["port"] = e.server.port;
		sock.networkInfo["realName"] = e.realName;
		sock.networkInfo["user"] = e.user;
		sock.networkInfo["SSL"] = e.SSL;
		sock.networkInfo["commands"] = e.commands;
		sock.networkInfo["cache"] = [];
		sock.networkInfo["reconnect"] = e.reconnect;
		sock.networkInfo["loggedin"] = false;
		sock.networkInfo["redirectTopic"] = false;
		sock.networkInfo["lastWhoPoll"] = Date.now();
		sock.networkInfo["whoPollChans"] = [];
		sock.networkInfo["idleUsers"] = [];
		
		$("div#main_list_container").append(HTML.getTemplate("new_server_item", { name: e.server.host, network: sock.id }));
		$("div#channel_container").append(HTML.getTemplate("new_console_window", { attrname: HTML.encodeParm("network console"), channel: "Network Console", lcasechannel: "network console", network: sock.id, netname: e.server.host }));
		
		channel("network console",sock.id).show();
		$( ".sortable:last" ).sortable({
			cancel: "div.console_item"
		});
		
		$( ".sortable:last" ).on( "sortbeforestop", function( event, ui ) {
			if($(this).find("div.channel_item:first").attr("channel") != "network console"){
				$(this).sortable( "cancel" );
			}
		} );
	},
	remove: function(sid){
		var s = socket.getSocketByID(sid);
		s.networkInfo.reconnect = false;
		s.socket.end();
		$("div.channel[network='" + sid + "']").remove();
		$("div.server_list[network='" + sid + "']").remove();
		socket.sockets.splice(socket.sockets.indexOf(s),1);
		
	}
};

var HTML = {
	getTemplate: function(id, e, flags){
		if( flags == undefined ) flags = {};
		var html = $("template#" + id).html();
		for(var i in e){
			var re = new RegExp("\%" + i + "\%", "g");
			if( flags["allowHTML"] == undefined ){
				if(i == "channelname"){
					var fc = pColors(this.encodeString(e[i]));
					html = html.replace(re, fc);
				}else{
					html = html.replace(re, pColors(this.encodeString(e[i])));
				}
			}else{
				html = html.replace(re, pColors(e[i]));
			}
		}
		function pColors(e){
			if( flags["noColors"] != undefined ) return e;
			return colors.parse(e);
		}
		
		return html;
	},
	emojiPattern: /([\uD800-\uDBFF][\uDC00-\uDFFF])/g,
	encodeParm: function(str){
		str = str.replace(/\\/g, ",spchr92,");
		return str;
	},
	decodeParm: function(str){
		if(typeof(str) == "string") str = str.replace(/\,spchr92\,/g, "\\");
		return str;
	},
	encodeString: function(str){
		if(typeof(str) == "string"){
			str = str.replace(/\'/g, "&#x27;");
			str = str.replace(/\"/g, "&#x22;");
			str = str.replace(/\</g, "&#x3C;");
			str = str.replace(/\>/g, "&#x3E;");
			str = str.replace(/\\/g, "&#92;");
		}
		
		return str;
	},
	linkify: function(inputText) {


		/* http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links */
		var replacedText, replacePattern1, replacePattern2, replacePattern3;
		replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
		replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

		replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

		if(replacedText.indexOf("<a")<0){
			//replacePattern3 = /([#][#&!\.\_a-zA-Z1-9]{1,50})/gi;
			//replacedText = replacedText.replace(replacePattern3, '<a href="channel:$1">$1</a>');
		}
		


		return replacedText;
	}
}

var random = {
	number: function(min,max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	guid: function(){
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
		  .toString(16)
		  .substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();

	}
}


var media = {
	pending: false,
	timer: 0,
	parse: function(chan, network, message){
		if(this.pending) return;
		if(config.showChannelMedia == false) return;
		var im = message.match(/https?\:\/\/((.*)\.(jpg|jpeg|png|gif))/i);
		if(im != null){
			media.add(chan,network,im[0]);
			return;
		}
		if(message.indexOf("/arxius.io/i/") > -1){
			var s = message.split("/arxius.io/i/")[1].split(/\/|\s/)[0];
			media.add(chan,network,"https://i.arxius.io/" + s);
		}
		if(message.indexOf("/i.arxius.io/") > -1){
			var s = message.split("/i.arxius.io/")[1].split(/\/|\s/)[0];
			media.add(chan,network,"https://i.arxius.io/" + s);
		}
		if(message.indexOf("/imgur.com/gallery/") > -1){
			var s = message.split("imgur.com/gallery/")[1].split(/\/|\s/)[0];
			media.add(chan,network,"http://api.haxed.net/imageproxy/imgur.php?i=https://imgur.com/gallery/" + s);
		}
		if(message.indexOf("/imgur.com/a/") > -1){
			var s = message.split("imgur.com/a/")[1].split(/\/|\s/)[0];
			media.add(chan,network,"http://api.haxed.net/imageproxy/imgur.php?i=https://imgur.com/a/" + s);
		}
	},
	add: function(chan, network, url){
		this.pending = true;
		var c = channel(chan, network);
		var r = random.guid();
		url = "http://api.haxed.net/imageproxy/?i=" + url;
		c.object.find("div.channel_content").append(HTML.getTemplate("new_channel_media", {guid: r, url: url, date: getDate(1) }));
		if(c.object.find("div.channel_media").length > 3) c.object.find("div.channel_media:first").remove();
		c.object.find("img.mediaimg:last").on('load', function() {
			c.scrollBottom();
			media.pending = false;
			clearTimeout(media.timer);
		});
		this.timer = setTimeout(function(){
			media.pending = false; /*some servers are slow and hang. just reset pending if it's been over 5 seconds.*/
		},5000);
	}
}

function getDate(e){
	var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
	var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	var D = new Date();
	var month = months[D.getMonth()];
	var day = days[D.getDay()];
	var time = padZero(D.getHours()) + ":" + padZero(D.getMinutes()) + ":" + padZero(D.getSeconds());
	
	if(e == undefined){
		return day + " " + month + " " + padZero(D.getDate()) + " " + time + " " + D.getFullYear();
	}else{
		return time;
	}
	
	
	function padZero(e){
		if(e < 10) {
			e = "0" + e;
			return e;
		}
		return e;
	}
}


var colors = {
	strip: function( e ) {
		e = e.replace( /\u0003[0-9][0-9]?(,[0-9][0-9]?)?|\u0003/ig, "" );
		e = e.replace( /\u0008|\u0002|\x1F|\x0F|\x11|\x1E/ig, "" );
		return e;
	},
	parse: function( e ) {
		if(typeof(e) == "string"){
			e = this.parseColors( e );
			e = this.parseBold( e );
			e = this.parseItalic( e );
			e = this.parseUnderline( e );
			e = this.parseStrike( e );
			e = this.parseMonospace( e );
			e = this.strip( e );
		}
		return e;
	},
	parseColors: function( e ) {
		/*  */
		var c = e.match( /\u0003[0-9][0-9]?(,[0-9][0-9]?)?/ig, "" );
		var newText = e;
		var colors = [ 
			"#FFFFFF","#000000","#000080",
			"#008000","#FF0000","#A52A2A",
			"#800080","#FFA500","#FFFF00",
			"#00FF00","#008080","#00FFFF",
			"#4169E1","#FF00FF","#808080",
			"#C0C0C0","transparent"
		];
		
		if ( c == null ) return e; /* no colors, no need to go on */
		
		var nt = 0;
		
		for ( var i in c ) {
			/* now lets loop the matches */
			var BG = 16;
			var FG = 16;
			var m = c[i].substr( 1 ).split( "," );
			if ( m.length == 2 ) BG = parseInt( m[1] );
			FG = parseInt( m[0] );
			if ( FG > 16 || BG > 16 || BG < 0 || FG < 0 ) return this.strip( e );
			BG = colors[BG];
			FG = colors[FG];
			newText = newText.replace( c[i], '<span style="color:' + FG + ';text-shadow:none;background:' + BG + '">' );
			nt += 1;
		}
		
		newText = newText.replace( /\u0003/g, "</span>" );
		var tnt = newText.match( /<\/span>/g );
		if ( tnt != null ) nt = nt - tnt.length;
		
		if ( nt < 0 ) return this.strip( e );
		
		while ( nt > 0 ) {
			nt -= 1;
			newText += "</span>";
		}
		
		if ( nt != 0 ) return this.strip( e );
		
		tnt = newText.match( /<\/?span/g );
		
		nt = 0;
		
		for ( var i in tnt ) {
			if ( tnt[i] == "<span" ) nt += 1;
			if ( tnt[i] == "</span" ) {
				if ( nt < 1 ) return this.strip( e );
				nt = nt - 1;
			}
		}

		return newText;
	},
	parseBold: function( e ) {
		var c = e.match( /\u0002/g, "" );
		var nt = 0;
		for ( var i in c ) {
			if ( nt == 0 ) {
				nt = 1;
				e = e.replace( /\u0002/, '<span style="font-weight:bold;text-shadow:none;">' );
			} else {
				nt = 0;
				e = e.replace( /\u0002/, '</span>' );
			}
		}
		if ( nt == 1 ) e += "</span>";
		return e;
	},
	parseItalic: function( e ) {
		var c = e.match( /\x1D/g, "" );
		var nt = 0;
		for ( var i in c ) {
			if ( nt == 0 ) {
				nt = 1;
				e = e.replace( /\x1D/, '<span style="font-style:italic;text-shadow:none;">' );
			} else {
				nt = 0;
				e = e.replace( /\x1D/, '</span>' );
			}
		}
		if ( nt == 1 ) e += "</span>";
		return e;
	},
	parseUnderline: function( e ) {
		var c = e.match( /\x1F/g, "" );
		var nt = 0;
		for ( var i in c ) {
			if ( nt == 0 ) {
				nt = 1;
				e = e.replace( /\x1F/, '<span style="text-decoration:underline;text-shadow:none;">' );
			} else {
				nt = 0;
				e = e.replace( /\x1F/, '</span>' );
			}
		}
		if ( nt == 1 ) e += "</span>";
		return e;
	},
	parseStrike: function( e ) {
		var c = e.match( /\x1E/g, "" );
		var nt = 0;
		for ( var i in c ) {
			if ( nt == 0 ) {
				nt = 1;
				e = e.replace( /\x1E/, '<span style="text-decoration: line-through;text-shadow:none;">' );
			} else {
				nt = 0;
				e = e.replace( /\x1E/, '</span>' );
			}
		}
		if ( nt == 1 ) e += "</span>";
		return e;
	},
	parseMonospace: function( e ) {
		var c = e.match( /\x11/g, "" );
		var nt = 0;
		for ( var i in c ) {
			if ( nt == 0 ) {
				nt = 1;
				e = e.replace( /\x11/, '<span style="font-family: Courier, Monaco, \'Ubuntu Mono\', monospace;">' );
			} else {
				nt = 0;
				e = e.replace( /\x11/, '</span>' );
			}
		}
		if ( nt == 1 ) e += "</span>";
		return e;
	}
}

function generateColor(str){
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
	hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	var num = parseInt(hash.toString().substr(1,2));
	while(num > 30){
		num = num - 10;
	}
	if(num < 1) num = 1;

	return num;
}


var overlay = {
	show: function(){
		$("div#overlay").show();
	},
	hide: function(){
		$("div#sidebar_iframe iframe").attr("src", "about:blank");
		$(".covering").hide();
		$("div#overlay").hide();
		$("div#main_container").removeClass("blur");
	}
}


var crypt = {
	encrypt: function(e){
		var keyIndex = 0;
		var res = "";
		for(var i in e){
			res += String.fromCharCode(e[i].charCodeAt(0) + cryptoKey.charCodeAt(keyIndex));
			keyIndex++;
			if(keyIndex==cryptoKey.length) keyIndex = 0;
		}
		return btoa(res);
	},
	decrypt: function(e){
		var keyIndex = 0;
		var res = "";
		e = atob(e);
		for(var i in e){
			res += String.fromCharCode(e[i].charCodeAt(0) - cryptoKey.charCodeAt(keyIndex));
			keyIndex++;
			if(keyIndex==cryptoKey.length) keyIndex = 0;
		}
		return res;
	}
}


var sound = {
	play: function(e){
		$("div#sound").html("<audio autoplay><source src=\"" + e + "\" type=\"audio/mpeg\"></audio>");
	}
}


function sysinfo(){
	var os = require('os');
	var txt = "<b>Client<b>: Burd " + appVersion + " * <b>OS<b>: ";
	switch(os.platform().toLowerCase()){
		case "win32":
			txt += "Windows";
			break;
		case "darwin":
			txt += "Mac";
			break;
		case "linux":
			txt += "Linux";
			break;
		case "android":
			txt += "Android";
			break;
	}
	
	txt += " (" +  os.arch() + ") " + os.release() + " * ";
	
	txt += "<b>CPU<b>: " + os.cpus()[0].model + " * ";
	txt += "<b>Memory<b>: " + humanFileSize(os.totalmem()) + " total (" + humanFileSize(os.freemem()) + " free) * ";
	txt += "<b>Uptime<b>: " + convertSeconds(parseInt(os.uptime()));

	
	return txt.replace(/\<b\>/g, String.fromCharCode(2)).replace(/\*/g, String.fromCharCode(8226));
	
	
	function humanFileSize(bytes, si) {
		var thresh = si ? 1000 : 1024;
		if(Math.abs(bytes) < thresh) {
			return bytes + ' B';
		}
		var units = si
			? ['kB','MB','GB','TB','PB','EB','ZB','YB']
			: ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
		var u = -1;
		do {
			bytes /= thresh;
			++u;
		} while(Math.abs(bytes) >= thresh && u < units.length - 1);
		return bytes.toFixed(1)+' '+units[u];
	}
}



function convertSeconds(ms) {
	var d, h, m, s;
	s = ms;
	m = Math.floor(s / 60);
	s = s % 60;
	h = Math.floor(m / 60);
	m = m % 60;
	d = Math.floor(h / 24);
	h = h % 24;
	return d + " day(s), " + h + " hour(s), " + m + " minute(s)";
};

function openWin(e,s){
	if(modal) modal.close();
	modal = window.open(e, "", s);
}

$.expr[':'].iAttrContains = function(node, stackIndex, properties){
	var args = properties[3].split(',').map(function(arg) {
		return arg.replace(/^\s*["']|["']\s*$/g, '');  
	});
	if ($(node).attr(args[0])) {
		//exact match:
		return $(node).attr(args[0]).toLowerCase() == HTML.encodeParm(args[1].toLowerCase());
		//if you actually prefer a "contains" behavior:
		//return -1 !== $(node).attr(args[0]).toLowerCase().indexOf(args[1].toLowerCase());
	}
};

var cocktography = {
	cockCache: "",
	enchode: function(e, strokes){
		var n = 0;
		e = "\x0F" + e;
		while(n != strokes){
			e = btoa(e);
			n++;
			if(n>20) break;
		}
		
		var bits = e.split("");
		
		var result = "";
		for(var i in bits){
			for(var x in this.dicktionary){
				x = parseInt(x);
				if(bits[i] == this.dicktionary[x]){
					var txt = this.dicktionary[x-1];
					result += txt + " ";
				}
			}
		}
		console.log(result);
		result = result.slice(0,-1);
		
		if(result.length > 320){
			var mArr = splitter(result,320);
			for(var i in mArr){
				if(i == 0){
					mArr[i] = "8=wm=D " + mArr[i] + " 8=ww=D";
				}else if(i == mArr.length - 1){
					mArr[i] = "8wmD " + mArr[i] + " 8=mw=D";
				}else{
					mArr[i] = "8wmD " + mArr[i] + " 8=ww=D";
				}
			}
			return mArr;
		}
		
		return ["8=wm=D " + result + " 8=mw=D"];
		
		function splitter(str, l){
			/*
			var strs = [];
			var pos = 0;
			while(pos < str.length){
				var chunk = str.substr(pos,l);
				if(chunk.slice(-1)==" ") chunk = chunk.slice(0,-1);
				if(chunk.substr(0,1)==" ") chunk = chunk.substr(1);
				if(chunk.length > 0) strs.push(chunk);
				pos = pos + l;
			}
			return strs;
			*/
			var strs = str.match(/\s*(.{1,340})(?=\s|$)/gm);
			console.log(strs);
			return strs;
		}
		
	},
	
	dechode: function(e){
		var result = "";
		var bits = e.split(" ");
		if(this.cockCache.length > 1024) this.cockCache = "";
		if(bits[0] == "8=wm=D" || bits[0] == "8wmD"){
			for(var i in bits){
				for(var x in this.dicktionary){
					x = parseInt(x);
					if(bits[i] == this.dicktionary[x]){
						var txt = this.dicktionary[x+1];
						if(txt == "start"){
							this.cockCache = "";
						}else if(txt == "mark"){
							
						}else if(txt == "stop"){
							this.cockCache += result;
							result = this.cockCache;
							var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

							if(base64regex.test(result) == true){
								/* assume base64 */
								var n = 0;
								while(n<11 && base64regex.test(result)){
									try{
										result = atob(result);
									}catch(e){
										break;
									}
									n++;
								}
								return "[cocktography][stroke=" + n + "] " + result;
							}
							return "[cocktography] " + result;
						}else if(txt == "cont"){
							this.cockCache += result;
							return "[cocktography][incomplete] " + result;
						}else{
							result += txt;
						}
					}
				}
			}
			return "[cocktography] " + result;
		}
		return e;
	},	
	
	
	dicktionary: ["8=D", "e", "8==D", "o", "8===D", "d", "8====D", "D", "8=D~", "E", "8==D~", "i", "8===D~", "l", "8====D~", "L", "8=D~~", "w", "8==D~~", "W", "8===D~~", "g", "8====D~~", "G", "8=D~~~", "c", "8==D~~~", "C", "8===D~~~", "f", "8====D~~~", "F", "8=D~~~~", "u", "8==D~~~~", "U", "8===D~~~~", "m", "8====D~~~~", "M", "8wD", "t", "8w=D", "a", "8w==D", "H", "8w===D", "y", "8wD~", "T", "8w=D~", "n", "8w==D~", "Y", "8w===D~", "p", "8wD~~", "P", "8w=D~~", "b", "8w==D~~", "B", "8w===D~~", "�", "8wD~~~", "h", "8w=D~~~", "1", "8w==D~~~", "!", "8w===D~~~", "2", "8wD~~~~", "@", "8w=D~~~~", "3", "8w==D~~~~", "#", "8w===D~~~~", "4", "8=wD", "A", "8=w=D", "$", "8=w==D", "5", "8=wD~", "%", "8=w=D~", "6", "8=w==D~", "^", "8=wD~~", "7", "8=w=D~~", "&", "8=w==D~~", "8", "8=wD~~~", "*", "8=w=D~~~", "9", "8=w==D~~~", "(", "8=wD~~~~", "0", "8=w=D~~~~", ")", "8=w==D~~~~", "-", "8==wD", "R", "8==w=D", "_", "8==wD~", "+", "8==w=D~", "=", "8==wD~~", ",", "8==w=D~~", "<", "8==wD~~~", ".", "8==w=D~~~", ">", "8==wD~~~~", "/", "8==w=D~~~~", "?", "8===wD", ";", "8===wD~", ":", "8===wD~~", "\"", "8===wD~~~", "'", "8===wD~~~~", "[", "8mD", " ", "8m=D", "O", "8m==D", "{", "8m===D", "]", "8mD~", "I", "8m=D~", "N", "8m==D~", "r", "8m===D~", "v", "8mD~~", "V", "8m=D~~", "k", "8m==D~~", "K", "8m===D~~", "j", "8mD~~~", "J", "8m=D~~~", "x", "8m==D~~~", "X", "8m===D~~~", "q", "8mD~~~~", "Q", "8m=D~~~~", "z", "8m==D~~~~", "Z", "8m===D~~~~", "`", "8=mD", "s", "8=m=D", "S", "8=m==D", "}", "8=mD~", "\\", "8=m=D~", "|", "8=m==D~", "~", "8=wm=D", "start", "8=mw=D", "stop", "8=ww=D", "cont", "8wmD", "mark"]
}
