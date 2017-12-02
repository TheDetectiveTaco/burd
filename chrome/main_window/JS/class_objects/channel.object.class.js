
var channel = {
	obj: 0,
	find: function( socket, channel ) {
		this.obj = $("div.right-content.channel[socket='" + socket + "'][channel='" + base64.encode( channel.toLowerCase() ) + "']");
		return this;
	},
	all: function( socket ) {
		this.obj = $("div.right-content.channel[socket='" + socket + "']");
		return this;
	},
	current: function( socket ){
		if( $("div.channel[socket='" + socket + "']:visible").length > 0 ) {
			this.byObject( $("div.channel:visible") );
		}else{
			this.find( socket, "network console" );
		}
		
		return this;
	},
	byObject: function( e ){
		this.obj = e;
		return this;
	},
	
	remove: {
		server: function( socket ){
			$( "div[socket='" + socket.socketID + "']" ).remove();
			socket.lsend( "QUIT :Burd IRC ( haxed.net )" );
			socket.remove();
		}
	},
	
	add: {
		userNotice: function( user, to, text ){
			
			/* blocking notices to channels */
			if( settings.channels.showChannelNotices == false && to.substr( 0, 1 ) == "#" ) return;
			
			user = HTMLParser.stringify( user );
			text = HTMLParser.linkify(HTMLParser.stringify(text));
			to = HTMLParser.linkify(HTMLParser.stringify(to));
			
			var html = HTMLParser.html.addUserNotice;
			var time = (new Date).toString().split(" ")[4];
			text = colors.parse( text );
			
			channel.obj.find("div.content").append(
				HTMLParser.parse( html, { time:  time, message: text, nick: user, to: to } )
			);
			
			switcher.findByChannelObj( channel.obj ).markUnread();
			channel.scrollBottom( false );
			
		},
		info: function( e, allowHTML ) {
			var time = (new Date).toString().split(" ")[4];
			if( allowHTML == undefined || allowHTML == false ) e = HTMLParser.stringify( e );
			channel.obj.find("div.content").append(
				HTMLParser.parse( HTMLParser.html.addInfo, { time:  time, message: e } )
			);
			channel.scrollBottom( false );
		},
		userText: function( e ) {
			/*
				channel.add.userText({ user: str, text: str, action: bool, color: str, highlight: bool }); 
				color can be either hex or rgb, do not add "color:"
			*/
			

			if( e.action == undefined ) e.action = false;
			if( e.highlight == undefined ) e.highlight = false;
			if( e.color == undefined ) e.color = channel.obj.find("div.user:iAttrContains( 'nick', '" + e.user + "' )").css("color");
			if( e.color == undefined ) e.color = cssGetValue( "nickremote", "color" );
			var style = "";
			var time = (new Date).toString().split(" ")[4];
			var html = HTMLParser.html.addUserText;
			if( e.action ){
				e.color = cssGetValue( "action", "color" );
				html = HTMLParser.html.addActionText;
			}
			e.text = HTMLParser.linkify(HTMLParser.stringify(e.text));
			e.text = colors.parse( e.text );
			
			if(e.onick != undefined && e.onick.substr(0,1) == ":"){
				e.onick = e.onick.substr(1);
			}else{
				e.onick = e.user;
			}
			
			if( e.highlight ) {
				switcher.findByChannelObj( channel.obj ).highlight();
				style = "highlight";
			}else{
				switcher.findByChannelObj( channel.obj ).markUnread();
			}
			
			/* parse emojis */
			if( emoji.isEmoji( e.text ) ) style += " emojimsg";
			
			
			channel.obj.find("div.content").append(
				HTMLParser.parse( html, {
					time:  time,
					message: e.text,
					nick: e.user,
					onick: e.onick,
					color: e.color,
					style: style
				} )
			);
			
			channel.scrollBottom( false );
			
		}
	},
	
	getLastMessage: function(){
		var rt = this.obj.find("div.message:last div.name").text();
		rt += " ";
		rt += this.obj.find("div.message:last div.message-text").text();
		return rt;
	},
	
	changeUserNick: function(oldNick, newNick){
		var sid = this.obj.attr("socket");
		var wins = $("div.right-content.channel[socket='" + sid + "']");
		wins.each(function(){
			var userObj = $(this).find( "div.userlist div.user:iAttrContains('nick','" + oldNick + "')" );
			if( userObj.length > 0 ){
				/* found a channel with the user in it! */
				channel.byObject( $(this) ).add.info( oldNick + " is now known as " + newNick );
				nickCache = [];
				$(this).find( "div.userlist div.user" ).each(function(){
					if( oldNick.toLowerCase() == $(this).attr( "nick" ).toLowerCase() ) {
						var onick = base64.decode( $(this).attr( "onick" ) );
						var prefix = getSocketByID( sid ).serverProperties().PREFIX.split(")")[1].split( "" );
						var newNickA = newNick;
						for(var i in prefix){
							if( onick.indexOf( prefix[i] ) > -1 ) newNickA = prefix[i] + newNickA;
						}
						nickCache.push( newNickA + ":" + $(this).attr("class").split(" ")[0] );
					}else{
						nickCache.push( base64.decode( $(this).attr( "onick" ) ) + ":" + $(this).attr("class").split(" ")[0] );
					}
				});
				processNickList( getSocketByID( sid ), base64.decode( $(this).attr( "channel" ) ), true );
			}
		});
	},
	quitUser: function( socketID, nick, cMsg ) {
		/* called when a user has quit */
		var user = parseNick(nick).nick;
		var time = (new Date).toString().split(" ")[4];
		$( "div.right-content[socket='" + socketID + "'][type='1']" ).each(function(){
			/* 
				loop through every channel, see if we find the user,
				and remove them each time
			*/
			
			var u = $( this ).find( "div.userlist div.user:iAttrContains('nick','" + user + "')" );
			if( u.length > 0 ) {
				/* found the user! */
				u.remove();
				if( settings.channels.showJPQ ) {
					channel.byObject( $( this ) ).addHTML(
						HTMLParser.parse( HTMLParser.html.userQuitText, { time:  time, nick: HTMLParser.stringify( user ), onick: HTMLParser.stringify( nick ), message: colors.parse( HTMLParser.stringify( cMsg ) ) } )
					);
				}
				channel.obj.find( "div.list-count" ).text( "Users here - " + channel.obj.find( "div.userlist div.user" ).length );
			}
		});
	},
	addHTML: function( e ){
		this.obj.find("div.content").append( e );
		this.scrollBottom( false );
	},
	addYoutube: function( e ){
		/*disable for now*/ return;
		var me = this.obj;
		var time = (new Date).toString().split(" ")[4];
		switcher.findByChannelObj( this.obj ).markUnread();
		var xhr = new XMLHttpRequest();
		
		xhr.open('GET', "http://burd.haxed.net/API/ytinfo.php?v=" + e, true);
		xhr.setRequestHeader("burd", "1");
		xhr.onload = function(e) {
			if (this.readyState == 4 && this.status == 200) {
				channel.byObject( me );
				var j = JSON.parse(this.responseText);
				var html = HTMLParser.parse( HTMLParser.html.youTube, { time: time, image: j.thumbnail, ytlink: "http://youtu.be/" + j.id, title: j.title, uploader: j.user } );
				channel.obj.find("div.content").append( html );
				switcher.findByChannelObj( channel.obj ).markUnread();
				channel.scrollBottom( false );
			}
		};
		xhr.send();
	},
	addUserImage: function( user, imgurl ){
		user = HTMLParser.stringify( user );
		var html = HTMLParser.html.addUserText;
		var nick = parseNick(user).nick;
		var guid = random.guid();
		var imgHtml = HTMLParser.parse( HTMLParser.html.addUserImage, { link: imgurl, guid: guid } );
		var time = (new Date).toString().split(" ")[4];
		this.obj.find("div.content").append(
			HTMLParser.parse( html, { time:  time, message: imgHtml, nick: nick, onick: user, color: $("body .nickdefault").css("color") } )
		);
		switcher.findByChannelObj( this.obj ).markUnread();
		this.scrollBottom( false );
		
		
		/* now lets load the image */
		var xhr = new XMLHttpRequest();
		var me = this.obj;
		xhr.open('GET', imgurl, true);
		xhr.responseType = 'blob';
		xhr.onload = function(e) {
			channel.byObject( me );
			var src = window.URL.createObjectURL(this.response);
			$("img[guid='" + guid + "']").attr("src", src);
			setTimeout(function(){ channel.scrollBottom( false ); }, 50);
		};
		xhr.send();

	},
	addUserText: function( user, text, isAction, defaultColor ){
		if( isAction == undefined ) isAction = false;
		if( isAction ) color = cssGetValue( ".action", "color" );
		var nick = parseNick(user).nick;
		var html = HTMLParser.html.addUserText;
		if( isAction ) html = HTMLParser.html.addActionText;
		var time = (new Date).toString().split(" ")[4];
		var color = defaultColor;
		if( color == undefined || color == false ) color = this.obj.find("div.user:iAttrContains( 'nick', '"+ nick +"' )").css("color");
		if( color == undefined ) color = $("body .nickremote").css("color");
		var message =  HTMLParser.linkify(HTMLParser.stringify(text));
		if( message.length == 2 && message.match(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g) != null ) {
			message = "<span class=emoji>" + message + "</span>";
		}
		message = colors.parse( message );
		this.obj.find("div.content").append(
			HTMLParser.parse( html, { time:  time, message: message, nick: nick, onick: user, color: color } )
		);
		switcher.findByChannelObj( this.obj ).markUnread();
		this.scrollBottom( false );
	},
	addText: function( e ) {
		var time = (new Date).toString().split(" ")[4];
		
		this.obj.find("div.content").append(
			HTMLParser.parse( HTMLParser.html.addText, { time:  time, message: e } )
		);
		this.scrollBottom( false );
	},
	truncate: function(){
		/* this function removes old messages to conserve memory */
		var cl = this.obj.find("div.message");
		var quitLoop = false;
		if( cl.length > settings.ui.scrollback ) {
			cl.each(function(){
				if( quitLoop ) return;
				if( !$(this).hasClass( "highlight" ) ){
					$(this).remove();
					quitLoop = true;
					
				}
			});
		}
	},
	scrollBottom: function( e ){
		this.truncate();
		sObj = this.obj.find("div.content:visible");
		if( sObj.length > 0 ) sObj[0].scrollTop = sObj[0].scrollHeight;
	},
	create: function( t, e ){
		
		switch( t ){
			/* create a socket and network console HTML object */
			case "server":
				var s = new socket( e.server.host, e.server.port );
				s.userInfo = e;
				e.socketID = 0;
				e.channel = "";
				s.created = function(){
					$( "div#nav-tree" ).append(
						HTMLParser.parse($( "div#html div#server-list" ).html(),{ socket: this.socketID, server: this.address })
					);
					$( "div#right-content" ).append(
						HTMLParser.parse($( "div#html div#network-console" ).html(),{ socket: this.socketID, nick: this.userInfo.nick.nick, server: this.address, channel: base64.encode( "network console" ) })
					);
					switcher.find( this.socketID, "network console" ).show();
					channel.find( this.socketID, "network console" ).add.info("Connecting to server...")
					this.connect();
				}
				break;
			
			/*
				create a channel HTML object
				channel.create( "channel", { socketID: e, channel: e } );
			*/
			
			case "channel":
				
				$( "div.server-list[socket=" + e.socketID + "] ul.server-items" ).append( 
					"<li type=\"1\" channel=\"" + base64.encode( e.channel.toLowerCase() ) + "\">" + HTMLParser.stringify( e.channel ) + "</li>"
				);
			
				$( "div#right-content" ).append(
					HTMLParser.parse($( "div#html div#channel" ).html(),{ socket: e.socketID, channel: base64.encode( e.channel.toLowerCase() ), channeltext: HTMLParser.stringify( e.channel ) })
				);
				
				if( settings.channels.focusOnJoin ) switcher.find( e.socketID, e.channel ).show();

				break;
				
			case "pm":
				var user = parseNick( e.user );
				if( switcher.find( e.socketID, user.nick ).channel.length > 0 ) {
					//switcher.show();
				}else{
					e.channel = "";
					$( "div.server-list[socket=" + e.socketID + "] ul.server-items" ).append( 
						"<li type=\"2\" channel=\"" + base64.encode( user.nick.toLowerCase() ) + "\">" + HTMLParser.stringify( user.nick ) + "</li>"
					);
				
					$( "div#right-content" ).append(
						HTMLParser.parse($( "div#html div#pm" ).html(),{ socket: e.socketID, channel: base64.encode( user.nick.toLowerCase() ), user: user.nick })
					);
					if( settings.channels.focusOnJoin ) switcher.find( e.socketID, user.nick ).show();
					
				}
				channel.find( e.socketID, user.nick );
				break;

		}
		$( "ul.server-items" ).sortable();
		return this;
	}
}


