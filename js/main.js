var remote = require('electron').remote;
var dataPath = remote.app.getPath("userData");
var fs = require('fs');
var tar = require('tar-fs');
var appPath = ".";

var firstRun = false;

//check for log folder, create it
if (fs.existsSync(dataPath + "/logs")){
	fs.readFile(dataPath + "/config.json", function(err, f){
		var nconfig = JSON.parse(f.toString());
		for(var i in nconfig){
			config[i] = nconfig[i];
		}
	});
}else{
	fs.mkdirSync(dataPath + "/logs", 0777);
	firstRun = true;
	saveSettings();
}

if(fs.existsSync("./resources/app")) appPath = "./resources/app";

function saveSettings(){
	fs.writeFileSync(dataPath + "/config.json", JSON.stringify(config));
}

$(function(){
	
	//$(".channel_content").jScrollPane();
	window.onbeforeunload = function(){
		saveSettings();
	}
	
	$( window ).resize(function() {
		iframe.hide();
	});
	
	$('body').on('keydown', 'input.channel_input', function(e) {
		if(e.key=="Tab"){
			tabComplete.process();
			e.preventDefault();
		}else{
			tabComplete.reset();
		}
		switch(e.key){
			case "Enter":
				parseInput( $(this).val(), $("div.channel:visible").attr("channel"), $("div.channel:visible").attr("network") );
				break;
		}
	});
	
});

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
			this.scrollBottom();
			return this;
		},
		addPrivmsg: function(user,hostmask,color,highlight,message){
			var classes = "";
			if( highlight ) classes = "highlight";
			channelObj.find("div.channel_content").append(HTML.linkify(HTML.getTemplate("new_user_message", { nick: user, message: message, color: color, date: getDate(1), classes: classes })));
			this.scrollBottom();
			this.unread();
			if(highlight){
				sound.play("sounds/highlight.mp3");
				if(channelObj.is(":hidden")) switchObj.addClass("notice");
			}
			return this;
		},
		addAction: function(user,hostmask,color,highlight,message){
			var classes = "";
			if( highlight ) classes = "highlight";
			channelObj.find("div.channel_content").append(HTML.getTemplate("new_user_action_message", { nick: user, message: message, color: color, date: getDate(1), classes: classes }));
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
				switchObj.find("div.unread").text(count+1).show();
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
		sock.networkInfo["SSL"] = e.SSL;
		sock.networkInfo["cache"] = [];
		sock.networkInfo["reconnect"] = e.reconnect;
		sock.networkInfo["loggedin"] = false;
		
		$("div#main_list_container").append(HTML.getTemplate("new_server_item", { name: e.server.host, network: sock.id }));
		$("div#channel_container").append(HTML.getTemplate("new_console_window", { attrname: HTML.encodeParm("network console"), channel: "Network Console", lcasechannel: "network console", network: sock.id, netname: e.server.host }));
		
		channel("network console",sock.id).show();
		
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
	encodeParm: function(str){
		str = str.replace(/\\/g, ",spchr92,");
		return str;
	},
	decodeParm: function(str){
		str = str.replace(/\,spchr92\,/g, "\\");
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

random = {
	number: function(min,max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
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
		e = e.replace( /\u0002|\x1F|\x0F|\x11|\x1E/ig, "" );
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
		$("div#main_container").addClass("blur");
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
			res += String.fromCharCode(e[i].charCodeAt(0) + config.cryptoKey.charCodeAt(keyIndex));
			keyIndex++;
			if(keyIndex==config.cryptoKey.length) keyIndex = 0;
		}
		return btoa(res);
	},
	decrypt: function(e){
		var keyIndex = 0;
		var res = "";
		e = atob(e);
		for(var i in e){
			res += String.fromCharCode(e[i].charCodeAt(0) - config.cryptoKey.charCodeAt(keyIndex));
			keyIndex++;
			if(keyIndex==config.cryptoKey.length) keyIndex = 0;
		}
		return res;
	}
}


var sound = {
	play: function(e){
		$("div#sound").html("<audio autoplay><source src=\"" + e + "\" type=\"audio/mpeg\"></audio>");
	}
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



