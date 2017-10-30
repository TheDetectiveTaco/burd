var servers = [];
var editing = -1;
$(function(){
	setTimeout(function(){
		window.parent.postMessage( { command: "get_network_list" } , "*" );
	},200);
	$( "div.close" ).click(function() {
		window.parent.postMessage( { command: "close_modal" } , "*" );
	});
	$( "div.tab" ).click(function() {
		$( "div.right-panel" ).hide();
		$( "div.right-panel[sid='" + $(this).attr("sid") + "']" ).show();
		$( "div.tab" ).removeClass( "selected-tab" );
		$(this).addClass( "selected-tab" );
	});
	$( "body" ).on( "click", "div.network", function() {
			if( $( this ).hasClass( "selected-network" ) == false ) {
				$( "div.network" ).find( "div.options" ).html( "" );
				$(this).find( "div.options" ).html(
					'<input type="button" id="connect-to-network" value="Connect"> '+
					'<input type="button" id="edit-network" value="Edit"> '+
					'<input type="button" id="delete-network" value="Delete">'
				).hide().fadeIn(200);
			}
			$( "div.network" ).removeClass( "selected-network" );
			$( this ).addClass( "selected-network" );

	});
	$( "body" ).on( "click", "input", function() {
		switch( $( this ).attr("id")  ){
			case "connect-to-network":
				window.parent.postMessage( { command: "connect_to", "server": servers[ $( this ).parent().parent().attr("sid") ] } , "*" );
				break;
			case "delete-network":
				servers.splice($(this).parent().parent().attr("sid"),1);
				window.parent.postMessage( { command: "network_list_update", list: servers } , "*" );
				break;
			case "edit-network":
				editing = $(this).parent().parent().attr("sid");
				$("div.tab[sid='new']").click();
				fillInServer( servers[ editing ] );
				$("div.tab").hide();
				$("input#connect-now").hide();
				$( "h1#nn" ).text( "Edit Network" );
				break;
		}
	});
	
	$( "select.login" ).change(function() {
		$( "div.login-method" ).hide();
		$( "div." + $(this).val() ).show();
		$( "input#sasl-authz" ).val( $( "input#nick" ).val() );
		$( "input#sasl-authc" ).val( $( "input#nick" ).val() );
	});
	
	$( "input#save" ).click(function() {
		saveNew();
	});
	
	$( "input" ).click(function() {
		$(this).removeClass( "error" );
	});
	
	$( "div.checkbox" ).click(function() {
		if( $(this).hasClass( "checked" ) ){
			$(this).removeClass( "checked" );
		}else{
			$(this).addClass( "checked" );
		}
		
	});
	
	$("div[sid='networks']").click();
});	

window.addEventListener('message', function( e ) { 
	switch( e.data.command ) {
		case "get_network_list":
			servers = e.data.servers;
			buildServerList();
			$("div.tab[sid='networks']").click();
			break;
	}
});

function buildServerList(){
	var html = "";
	for( var i in servers ){
		html += '<div class="network" sid="'+ i +'">';
		html += '<div class="server">' + servers[i].server.host + '/' + servers[i].server.port + '</div>';
		html += '<div class="meta">Nickname: ' + servers[i].nick.nick + '</div>';
		html += '<div class="options"></div></div>';
	}
	$( "div#networks" ).html(html);
	if( servers.length == 0 ) $( "div#no-nets" ).show();
}

function saveNew(){
	if( $("input#server").val() == "" ) $("input#server").addClass( "error" );
	if( $("input#nick").val() == "" ) $("input#nick").addClass( "error" );
	if( $( ".error" ).length == 0 ) {
		var ns = {
			server: { host:  $("input#server").val().split("/")[0], port: $("input#server").val().split("/")[1], password: "" },
			nick: { nick: $("input#nick").val(), alt: $("input#nick").val() + "_", realname:  $("input#realname").val()},
			username: $("input#username").val(),
			autojoin: splitVals( $( "input#autojoin" ).val() ),
			commands: splitVals( $( "input#commands" ).val() ),
			auth: getLoginMethod(),
			startup: $( "div#startup" ).hasClass( "checked" ),
			SSL: $( "div#ssl" ).hasClass( "checked" ),
			reconnect: $( "div#reconnect" ).hasClass( "checked" ),
			proxy: {
				type: "none",
				server: "127.0.0.1",
				port: "5555",
				user: "",
				password: ""
			}
		}
		if(editing == -1){
			servers.unshift(ns);
			window.parent.postMessage( { command: "network_list_update", list: servers } , "*" );
		}else{
			servers[editing] = ns;
			window.parent.postMessage( { command: "network_list_update", list: servers } , "*" );
			editing = -1;
			$("div.tab").show();
			$("input#connect-now").show();
			$( "h1#nn" ).text( "New Network" );
		}
	}
	
}

function getLoginMethod(){
	if( $( "select.login" ).val() == "login-none" ) return { method: "none" };
	if( $( "select.login" ).val() == "login-nickserv" ) return { method: "nickserv", password: $( "input#nick-password" ).val() };
	if( $( "select.login" ).val() == "login-server" ) return { method: "server-password", password: $( "input#server-password" ).val() };
	
	if( $( "select.login" ).val() == "login-sasl-plain" ) return {
		method: "sasl-plain",
		authz: $( "input#sasl-authz" ).val(),
		authc: $( "input#sasl-authc" ).val(),
		password: $( "input#sasl-password" ).val()
	 };
}

function splitVals( e ){
	/* we need to split the values but ignore escaped commas */
	var mutex = "7698a8e1cbcf4c0";
	e = e.replace( /\\\,/g, mutex );
	e = e.replace( /\,\s/g, "," );
	var sp = e.split( "," );
	for( var i in sp ) {
		var re = new RegExp(mutex, "g");
		sp[i] = sp[i].replace(re, ",");
	}
	return sp;
}

function fillInServer( e ){
	$("input#server").val( e.server.host + "/" + e.server.port );
	$("input#nick").val( e.nick.nick );
	$("input#realname").val( e.nick.realname );
	$("input#username").val( e.username );
	$("input#autojoin").val( e.autojoin.toString() );
	$("input#commands").val( e.commands.toString() );
	
	/* time for checkboxes */
	$( "div.checkbox" ).removeClass( "checked" );
	if( e.SSL ) $( "div#ssl" ).addClass( "checked" );
	if( e.reconnect ) $( "div#reconnect" ).addClass( "checked" );
	if( e.startup ) $( "div#startup" ).addClass( "checked" );
	
	/* need to set the auth method */
	switch( e.auth.method ) {
		case "none":
			$( "select.login" ).val( "login-none" );
			break;
		case "nickserv":
			$( "select.login" ).val( "login-nickserv" );
			$( "input#nick-password" ).val( e.auth.password );
			break;
		case "server-password":
			$( "select.login" ).val( "login-server" );
			$( "input#server-password" ).val( e.auth.password );
			break;
		case "sasl-plain":
			$( "select.login" ).val( "sasl-plain" );
			$( "input#sasl-authz" ).val( e.auth.authz );
			$( "input#sasl-authc" ).val( e.auth.authc );
			$( "input#sasl-password" ).val( e.auth.password );
			break;
	}
	$( "select.login" ).change();
}