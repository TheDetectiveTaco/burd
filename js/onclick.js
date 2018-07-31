$(function(){
	$('body').on('click', 'div.channel_item', function(e) {
		//code
		if($(e.target).hasClass("channel_closer")){
			var chanWin = channel($(this).attr("channel"),$(this).attr("network"));
			var id = $(this).attr("network");
			var chan = $(this).attr("channel");
			
			if( $(this).hasClass("pm_item") ){
				menu.create({
					"Close": {callback: function(e){ 
						chanWin.close();
					}},
					"Whois": { callback: function(e){ 
						socket.sendData("WHOIS " + chan, id);
					}},
					"Ignore": { callback: function(e){ }}
				});
			}else{
				menu.create({
					"Close": {callback: function(e){ 
						chanWin.close();
					}},
					"Rejoin": { callback: function(e){ 
						socket.sendData("PART " + chan + " brb", id);
						socket.sendData("JOIN " + chan, id);
					}},
					"Invite": { callback: function(e){ }}
				});
			}
		}else{

			channel($(this).attr("channel"),$(this).attr("network")).show().scrollBottom();
			
		}
	});

	$('body').on('click', 'div.chan_smile', function() {
		iframe.show({type: "right", url: "./emoji/index.html"});
	});
	
	$('body').on('click', 'div#settings_button', function() {
		iframe.show({type: "left", url: "./settings/index.html"});
	});
	
	$('body').on('click', 'div#new_button', function() {
		iframe.show({type: "left", url: "./networks/index.html"});
	});
	
	$('body').on('click', 'div#overlay', function() {
		$("div.covering").hide();
		$("div.blur").removeClass("blur");
	});
});
