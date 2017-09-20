var ui = {
	resize: function(){
		/* called when the window is resized */
		var to = $("div.right-content:visible div.content");
		if( to.length > 0 ) to[0].scrollTop = to[0].scrollHeight;
		return;


		var nvw = $( "div#nav-tree" ).width();
		if( $( "div#nav-tree:visible" ).length == 0 ) nvw = 5;

		$( "div#nav-tree, div#right-content" ).css( "height", ( $( window ).height() - 29 ) + "px" );
		
		$( "div#right-content" ).css( "width", ( $( window ).width() - nvw - 1 ) + "px" );
		$("div.userlist:visible").css( "height",($(window).height()-55) + "px" );
		
		$( "div#right-content div.content:visible" ).css( "width", ( $( window ).width() - nvw - ($( "div.userlist:visible" ).width()==undefined ? 0 : $( "div.userlist:visible" ).width() ) - 15 ) + "px" );
		
		$( "input.user-input" ).css( "width", ( $( window ).width() - nvw - ($( "div.userlist:visible" ).width()==undefined ? 0 : $( "div.userlist:visible" ).width() ) - 15 ) + "px" );
		
		$( "div.right-content div.content:visible" ).css( "height", ( $( window ).height() - $( "div.channel-meta:visible" ).height() - 60) + "px" );
		
		$( "div.channel-topic:visible" ).css( "width", ( $( window ).width() - nvw - $( "div.userlist:visible" ).width() - 10 ) + "px" );
		
		$( "div#modal-content" ).css( "top", Math.max(0, ($( window ).height() - $( "div#modal-content" ).outerHeight()) / 2 ) + "px" );
		
		var to = $("div.right-content:visible div.content");
		if( to.length > 0 ) to[0].scrollTop = to[0].scrollHeight;
		
	},
	channelSwitcher: {
		toggleServer: function( e ){
			
		}
	},
	hideModalWin: function(){
		$( "div.modal-content" ).hide();
		$("div#main-app").removeClass("blur");
		if( $( "div#modal:visible" ).length > 0 ) $( "div#modal" ).fadeOut( settings.ui.animation );
		$("div.right-content input.user-input:visible").focus();
	},
	html: {
		params: {},
		show: function( e ){
			$("div#main-app").addClass("blur");
			if( typeof( e ) ==  "string" ) {
				$( "div.htmlwin" ).hide().find( "iframe" ).attr( "src", "../" + e + "/main.html" );
			}else{
				this.params = e;
				$( "div.htmlwin" ).hide().find( "iframe" ).attr( "src", "../" + e.src + "/main.html" );
			}
			$( "div#modal" ).fadeIn( settings.ui.animation );
			setTimeout( function(){ $( "div.htmlwin" ).show(200) }, 200 );
		}
	},
	scripts: {
		show: function(){
			this.hide();
			$( "div.scripts" ).show();
			$( "div#modal" ).fadeIn( settings.ui.animation );
		},
		hide: function(){
			$( "div.modal-content" ).hide();
			if( $( "div#modal:visible" ).length > 0 ) $( "div#modal" ).fadeOut( settings.ui.animation );
			$("div.right-content input.user-input:visible").focus();
		}
	},
	input: {
		show: function( text, defaultText, icon, callback ){
			this.callback = function(){};
			this.hide();
			$("div#main-app").addClass("blur");
			$( "div.userinput" ).show();
			$( "div.userinput img").attr("src", icon);
			$( "div.userinput div.title" ).html(text);
			$( "div.userinput input[type='text']" ).val( defaultText );
			$( "div#modal" ).fadeIn( settings.ui.animation, function(){ 
				$( "div.userinput input[type='text']" ).focus();
			} );
			ui.resize();
			if( typeof( callback ) == "function" ) this.callback = callback;
		},
		hide: function(e){
			ui.hideModalWin();
			this.callback(e);
			$("div.right-content input.user-input:visible").focus();
		},
		callback: function(){}
	},
	ask: {
		show: function( text, callback ){
			this.callback = function(){};
			this.hide();
			$("div#main-app").addClass("blur");
			$( "div.question" ).show();
			$( "div.question div.text" ).text(text);
			$( "div#modal" ).fadeIn( settings.ui.animation, function(){ $( "input.question-no" ).focus(); } );
			ui.resize();
			if( typeof( callback ) == "function" ) this.callback = callback;
		},
		hide: function(e){
			ui.hideModalWin();
			this.callback(e);
		},
		callback: function(){}
	},
	errorMessage: {
		show: function( title, text, socket, callback ){
			this.callback = function(){};
			this.hide();
			$("div#main-app").addClass("blur");
			if( typeof( callback ) == "function" ){
				showUIerror();
			}else{
				if( ( Date.now() - lastMouseClick ) < 2000 ){
					showUIerror();
				}else{
					channel.current( socket ).addInfo("<b>Error:</b> " + text );
				}
			}
			function showUIerror(){
				$( "div.error-message" ).show();
				$( "div.error-message div.error-text" ).text(text);
				$( "div.error-message div.error-title" ).text(title);
				$( "div#modal" ).fadeIn( settings.ui.animation, function(){ $( "input.error-close" ).focus(); } );
				ui.resize();
				this.callback = callback;
			}
		},
		hide: function(){
			ui.hideModalWin();
			$("input.user-input:visible").focus();
			this.callback();
		},
		callback: function(){}
	}
}


