$(function(){
	$('body').on('mousedown', 'div.channel_item', function(e) {
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
			}else if( $(this).hasClass("console_item") ){
				menu.create({
					"Remove Network": {callback: function(e){ 
						network.remove(id);
					}}
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
					"Invite": { callback: function(e){
						inputRequest.create({
							title: "Invite User",
							text: "Please enter the user you would like to invite",
							inputs: ["Nick"],
							buttons: ["OK", "Cancel"],
							callback: function(e){
								console.log(e);
								if(e.button == "OK"){
									if(e.inputs.Nick.length > 0){
										socket.sendData("INVITE " + e.inputs.Nick + " " + chan, id);
									}
								}
							}
						});
					}}
				});
			}
		}else{

			channel($(this).attr("channel"),$(this).attr("network")).show().scrollBottom();
			
		}
	});

	$('body').on('click', 'div.chan_smile', function() {
		iframe.show({type: "right", url: "./emoji/index.html"});
	});
	
	$('body').on('click', 'div.chan_options', function() {
		iframe.show({type: "right", url: "./chan_options/index.html"});
	});
	
	$('body').on('click', 'div#stickies div.sticky div.closer', function() {
		$(this).parent().hide(config.animation, function(){
			$(this).remove();
		});
		
	});
	
	$('body').on('click', 'div.imgremove', function() {
		
		$(this).parent().remove();
	});
	
	$('body').on('click', 'div#settings_button', function() {
		iframe.show({type: "left", url: "./settings/index.html"});
	});
	
	$('body').on('click', 'div#new_button', function() {
		iframe.show({type: "left", url: "./networks/index.html"});
	});
	
	$('body').on('click', 'div#hide_button', function() {
		if($(this).hasClass("hide_button_on")){
			$(this).removeClass("hide_button_on");
			$("#hidenav").remove();
		}else{
			$(this).addClass("hide_button_on");
			$("head").append('<link id="hidenav" href="hidenav.css" rel="stylesheet">');
		}
	});
	
	$('body').on('click', 'div#overlay', function() {
		if( $("div#update:visible").length == 0 ) overlay.hide();
	});
	$('body').on('click', 'div.usercount', function() {
		menu.create({
			"List bans": {callback: function(e){ 
				socket.sendData("MODE " + $("div.channel_item.selected .title").text() + " +b", $("div.channel_item.selected").attr("network"));
			}}
		});
	});
	
	$('body').on('click', '#hamburger_button', function() {
			menu.create({
				"Join a Channel": {callback: function(e){ 
					inputRequest.create({
						title: "Join a channel",
						text: "Please enter the channel name",
						inputs: ["Channel"],
						buttons: ["OK", "Cancel"],
						callback: function(e){
							console.log(e);
							if(e.button == "OK"){
								if(e.inputs.Channel.length > 0){
									socket.sendData("JOIN " + e.inputs.Channel, $("div.channel_item.selected").attr("network"));
								}
							}
						}
					});
				}},
				"Send a PM": { callback: function(e){ 
					inputRequest.create({
						title: "Send a PM",
						text: "Please enter the nick you would like to message",
						inputs: ["Nick"],
						buttons: ["OK", "Cancel"],
						callback: function(e){
							console.log(e);
							if(e.button == "OK"){
								if(e.inputs.Nick.length > 0){
									channel(e.inputs.Nick, $("div.channel_item.selected").attr("network")).create("new_pm_window");
								}
							}
						}
					});
				}}
			});
			
	});
});
