var switcher = {
	current: 0,
	channel: 0,
	timer:-1,
	find: function( socket, channel ) {
		channel = channel.toLowerCase();
		this.current = $("div.server-list[socket='" + socket + "'] ul li[channel='" + base64.encode( channel.toLowerCase() ) + "']:first");
		this.channel = $("div.right-content[socket='" + socket + "'][channel='" + base64.encode( channel.toLowerCase() ) + "']:first");
		return this;
	},
	findByChannelObj: function( obj ){
		this.current = $("div.server-list[socket='" + obj.attr("socket") + "'] ul li[channel='" + obj.attr("channel") + "']");
		this.channel = obj;
		return this;
	},
	findBySwitcherObj: function( obj ){
		var sock = obj.parent().parent().attr("socket");
		console.log(sock);
		this.current = $("div.server-list[socket='" + sock + "'] ul li[channel='" + obj.attr("channel") + "']");
		this.channel = $("div.right-content[socket='" + sock + "'][channel='" + obj.attr("channel") + "']:first");
		return this;
	},
	markUnread: function(){
		if( !this.current.hasClass( "selected" ) ) this.current.addClass( "unread" );
	},
	close: function(){
		var after = this.closest();
		this.current.remove();
		this.channel.remove();
		if( $( "ul.server-items li.selected" ).length == 0 ) this.findBySwitcherObj( after ).show();
		
	},
	show: function(){
		$("div.server-list ul li.selected").removeClass( "selected" );
		this.current.addClass( "selected" );
		this.current.removeClass( "unread" ).removeClass( "highlight" );
		$("div.right-content").hide();
		this.channel.show();
		clearTimeout(this.timer);
		this.timer = setTimeout(function(){
			//these slow down channel switching, so we run them on a timer
			ui.resize();
			switcher.current.removeClass( "unread" ).removeClass( "highlight" );
			$("input.user-input:visible").focus();
		},100);
		//$("input.user-input:visible:first").focus();
		//ui.resize();
	},
	highlight: function(){
		if( !this.current.hasClass( "selected" ) ) this.current.addClass( "highlight" );
	},
	nextChannel: function(){
		var e = $( "div#right-content div.channel:visible" );
		if( e.length > 0 ){
			if( e.next().length > 0 ){
				switcher.findByChannelObj( e.next() ).show();
			}else{
				switcher.findByChannelObj( $( "div#right-content div.channel:first" ) ).show();
			}
		}
	},
	closest: function(){
		if( this.current.next()[0] == undefined ) return this.current.prev();
		return this.current.next();
	},
	prevChannel: function(){
		var e = $( "div#right-content div.channel:visible" );
		if( e.length > 0 ){
			if( e.next().length > 0 ){
				switcher.findByChannelObj( e.prev() ).show();
			}else{
				switcher.findByChannelObj( $( "div#right-content div.channel:last" ) ).show();
			}
		}
	}
}


var base64 = {
	encode: function(e){
		return btoa(e);
	},
	decode: function(e){
		return atob(e);
	}
}


// switcher.find(socketID, "#wow").show();