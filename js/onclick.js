$(function(){
	$('body').on('click', 'div.channel_item', function(e) {
		//code
		if($(e.target).hasClass("channel_closer")){
			if( $(this).attr("nick") != undefined ){
				menu.create({
					"Close": { callback: function(e){ alert("menu click"); } },
					"Whois": { callback: function(e){ alert("menu click"); } },
					"Ignore": { callback: function(e){ alert("menu click"); } }
				});
			}else{
				var chanWin = channel($(this).attr("channel"),$(this).attr("network"));
				menu.create({
					"Close": {callback: function(e){ 
						chanWin.close();
					}},
					"Rejoin": { callback: function(e){ alert("menu click"); } },
					"Invite": { callback: function(e){ alert("menu click"); } },
					"Set Mode": { callback: function(e){ alert("menu click"); } }
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
