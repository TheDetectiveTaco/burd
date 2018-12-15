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
			$("div.unread").each(function(){
				if($(this).text() == "0") $(this).hide();
			});
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
			if(name == "network console") this.unread();
			this.scrollBottom();
			return this;
		},
		addPrivmsg: function(user,hostmask,color,highlight,message){
			var classes = "";
			if( highlight ) classes = "highlight";
			if( message.match(/(^([\uD800-\uDBFF][\uDC00-\uDFFF]\s?\=?\>?){1,9}$)/g) != null ) classes += " emoji";
			channelObj.find("div.channel_content").append(HTML.linkify(HTML.getTemplate("new_user_message", { nick: user, message: message, color: color, date: getDate(1), classes: classes })));
			this.scrollBottom();
			this.unread();
			if(highlight){
				sound.play("sounds/highlight.mp3");
				if(channelObj.is(":hidden")) switchObj.addClass("notice");
			}
			
			media.parse(name,network,message);
			
			logging.addLog({date: Date.now(), network: socket.getSocketByID(network).networkInfo.getISUPPORT("network"), channel: name, user: user, type: "privmsg", message: message});
			return this;
		},
		addAction: function(user,hostmask,color,highlight,message){
			var classes = "";
			if( highlight ) classes = "highlight";
			channelObj.find("div.channel_content").append(HTML.linkify(HTML.getTemplate("new_user_action_message", { nick: user, message: message, color: color, date: getDate(1), classes: classes })));
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
				if(count+1>99){
					switchObj.find("div.unread").text("99+");
				}else{
					switchObj.find("div.unread").text(count+1);
				}
				if($("div.channel_closer:visible").length==0) switchObj.find("div.unread").show();
			}
		},
		truncate: function(){
			if(channelObj.attr("type") != "pm" && channelObj.find("div.truncate").length > config.scrollback) channelObj.find("div.truncate:first").remove();
		}
	}
	return r;
}