var resizeTimeout = 0;
var cache = "";
$.menu.style = "dark";

var app = {
	name: "Burd",
	version: "0.01",
	versionString: "Burd IRC 0.01 www.haxed.net",
	fullScreen: false
}

var settings = {
	ui: {
		animation: 200, /* speed of animation for the UI. can be set to 0 for no animation */
		scrollback: 100, /* amount of messages to hold before truncation */
		navTreeSize: 120
	},
	channels: {
		focusOnJoin: true,
		textColors: true,
		userColors: true,
		showChannelNotices: false,
		showJPQ: true, /* show join quit and part messages */
		showTime: true,
		showModes: true,
		showEmoji: true
	},
<<<<<<< HEAD
	userCommands: [
		{ command: "action", action: "me &2" },
		{ command: "m", action: "msg &2" },
		{ command: "banlist", action: "quote MODE %c +b" },
		{ command: "sv", action: "echo You're using Burd %v" },
		{ command: "wii", action: "whois &2 &2" }
=======
	customCommands: [
>>>>>>> 66c0dbe913d8081bf8a122a4f8c0c42b5b43e022
	],
	ignore: {
		users: ["test!*@fake.gov"],
		regex: [ "/cake!/ig", "/hello123/ig" ]
	},
	notification: {
		enabled: true,
		showOnChannelMessage: false,
		showOnPM: true,
		showOnNotice: true
	},
	sounds: {
		pm: true,
		channel: false,
		notice: true,
		kick: true,
		disconnect: true
	},
	tooltips: true,
	highlights: [ "test123", "%n" ],
	networks: [

		]
		
}

/* jQuery Stuff */
$(function(){
	
	var menuTarget = null; /* last item that triggered a menu. used in menu callbacks. */
	
	

	function processMessage(e){
		switch( e.data.command ){
			case "on_data_in":
				parseData( getSocketByID( e.data.socketID ), e.data.data );
				break;
			case "on_data_out":
				getSocketByID( e.data.socketID ).lsend( e.data.data );
				break;
				
			case "on_user_input":
				parseInput({
					input: e.data.message,
					object: $("div.right-content:visible:first"),
					socketID: e.data.socketID
				});
				break;
			
			case "send_packet":
				getSocketByID( e.data.socketID ).lsend( e.data.data );
				break;
			
			case "add_info":
				channel.find( e.data.socketID, e.data.windowName );
				if(  e.data.windowName == "*" ) channel.current( e.data.socketID );
				channel.add.info( e.data.message );
				break;
				
			case "get_channels":
				var chans = [];
				$("div.channel[type='1'][socket='" + e.data.socketID + "']").each(function(){
					chans.push( base64.decode( $(this).attr("channel") ) );
				});
				$( "#scripts" )[0].contentWindow.postMessage( {
					command: "get_channels",
					channels: chans
					
				}, "*" );
				break;
				
			case "get_pms":
				var pms = [];
				$("div.channel[type='2'][socket='" + e.data.socketID + "']").each(function(){
					pms.push( base64.decode( $(this).attr("channel") ) );
				});
				$( "#scripts" )[0].contentWindow.postMessage( {
					command: "get_pms",
					pms: pms
					
				}, "*" );
				break;
				
			case "get_servers":
				var servers = [];
				for(var i in sockets){
					servers.push( sockets[i].serverInfo.serverName );
				}
				$( "#scripts" )[0].contentWindow.postMessage( {
					command: "get_servers",
					servers: servers
					
				}, "*" );
				break;
			
			case "close_modal":
				ui.hideModalWin();
				$("body").focus();
				break;
			
			case "get_network_list":
				e.source.postMessage( {
					command: "get_network_list",
					servers: settings.networks
					
				}, "*" );
				break;
				
			case "network_list_update":
				settings.networks = e.data.list;
				e.source.postMessage( {
					command: "get_network_list",
					servers: settings.networks
					
				}, "*" );
				break;
				
				
			case "get_params":
				e.source.postMessage( {
					command: "get_params",
					params: ui.html.params
					
				}, "*" );
				break;
				
			case "connect_to":
				ui.hideModalWin();
				//settings.networks.default = e.data.server;
				channel.create( "server", e.data.server );
				break;
	
			default:
				console.log(e);
				break;
		}
	}
	
	$( window ).resize(function() {
		ui.resize();
	});
	
	window.addEventListener('message', function( e ) { processMessage(e); });
	
	window.addEventListener("contextmenu", function(e) {
		menuTarget = $( e.target );
		if( menuTarget.parents( ".nomenu" ).length > 0 ){
			e.preventDefault();
			if( menuTarget.hasClass( "user" ) ) $.menu.show( menu.chatUser( menuTarget[0].innerText, $("div.right-content:visible").attr("socket") ) );
			if( menuTarget.parents( ".server-items" ).length > 0 ) $.menu.show( menu.switcherObject( menuTarget ) );
		}
	});
	
	
	
	$.expr[':'].iAttrContains = function(node, stackIndex, properties){
		var args = properties[3].split(',').map(function(arg) {
			return arg.replace(/^\s*["']|["']\s*$/g, '');  
		});
		if ($(node).attr(args[0])) {
			//exact match:
			return $(node).attr(args[0]).toLowerCase() == args[1].toLowerCase();
			//if you actually prefer a "contains" behavior:
			//return -1 !== $(node).attr(args[0]).toLowerCase().indexOf(args[1].toLowerCase());
		}
	};


	/* hook mouse and keyboard */
	setMouseEvents();
	setKeyEvents();
	setMiscEvents();


	/* load saved data */
	chrome.storage.local.get(["settings"],function(e){
		if( e.settings != undefined ){
			for( var i in e.settings ) {
				//settings[i] = e.settings[i];
			}
		}

		applySettings();
		
	});
});

function applySettings(){
		/*
		settings are loaded, lets look for a network that
		wants to connect on startup.
		*/
		setTimeout(function(){
			var addedServer = false;
			for( var i in settings.networks ) {
				if( settings.networks[i].startup ) {
					channel.create( "server", settings.networks[i] );
					addedServer = true;
				}
			}
			if( !addedServer ){
				ui.html.show( "network_list" );
			}
		},100);
		
		/* disable colored nicks setting */
		$( "head link#nocolors" ).remove();
		if( !settings.channels.userColors ) $( "head" ).append( '<link id="nocolors" rel="stylesheet" href="css/no.nick.colors.css">' );
		

		
		
}

function saveSettings(){
	chrome.storage.local.set({settings3: settings});
}


var audio = {
	play: function(e){
		$("div#audio").html(
			'<audio autoplay=1>' +
			'<source src="' + e + '" type="audio/mpeg">'+
			'</audio>'
		);
	},
	channel_message: 'sound/328117_3624044-hq.mp3',
	pm: 'sound/351545_3450800-hq.mp3'
	
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
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
	}
}

function timeConverter(UNIX_timestamp){
	function pad(e){
		if(e<10) e = "0" + e;
		return e;
	}
	var a = new Date(UNIX_timestamp * 1000);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time = pad(date) + ' ' + month + ' ' + year + ' ' + pad(hour) + ':' + pad(min) + ':' + pad(sec) ;
	return time;
}

var pingTimer = setInterval(function(){
	/* pings the server every 30 seconds to check for disconnection */
	for( var i in sockets ){
		if( sockets[i].connected ) sockets[i].send( "PING :HELLO" );
	}
}, 30000);



function copyToClipboard( e ) {
	clipboard.copy(e);
}

var clipboard = {
	copy: function(e) {
		$("textarea#copy").show().val(e).focus().select();
		document.execCommand("Copy");
		$("textarea#copy").hide();
	},
	read: function(){
		$("textarea#copy").show().val("").focus();
		document.execCommand("Paste");
		$("textarea#copy").hide();
		return $( "textarea#copy" ).val();
	}
}

function cssGetValue( a, b ){
	$( "body" ).append( "<div style='display:none' class='tmpelem " + a + "'></div>"  );
	var rs = $( "div.tmpelem" ).css( b );
	$( "div.tmpelem" ).remove();
	return rs;
}