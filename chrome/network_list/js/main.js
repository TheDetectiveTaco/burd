var servers = [];

$(function(){
	setTimeout(function(){
		window.parent.postMessage( { command: "get_network_list" } , "*" );
	},200);
	$( "div.close" ).click(function() {
		window.parent.postMessage( { command: "close_modal" } , "*" );
	});
	$( "div.tab" ).click(function() {
		console.log($(this).attr("sid"));
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
					'<input type="button" value="Edit"> '+
					'<input type="button" value="Delete">'
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
		}
	});
	
	$( "select.login" ).change(function() {
		$( "div.login-method" ).hide();
		$( "div." + $(this).val() ).show();
	});
	
	$("div[sid='networks']").click();
});	

window.addEventListener('message', function( e ) { 
	switch( e.data.command ) {
		case "get_network_list":
			servers = e.data.servers;
			buildServerList();
			break;
	}
});

function buildServerList(){
	console.log(servers);
	var html = "";
	for( var i in servers ){
		html += '<div class="network" sid="'+ i +'">';
		html += '<div class="server">' + servers[i].server.host + '/' + servers[i].server.port + '</div>';
		html += '<div class="meta">Nickname: ' + servers[i].nick.nick + '</div>';
		html += '<div class="options"></div></div>';
	}
	$( "div#networks" ).html(html).hide().fadeIn(200);
	if( servers.length == 0 ) $( "div#no-nets" ).show();
}