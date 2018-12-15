var s = null;

window.addEventListener("message", function(e){
	s = e.source;
	switch(e.data.c){
		case "get_scripts":
			//e.source.postMessage({c: "script", data: script.scripts}, "*");
			break;
			
		case "irc_data":
			scripts.callEvent("dataIn", {networkID: e.data.network, data: e.data.data});
			break;
			
		case "irc_data_out":
			scripts.callEvent("dataOut", {networkID: e.data.network, data: e.data.data});
			break;
		
		case "privmsg":
		case "channelJoin":
		case "channelPart":
		case "userQuit":
		case "channelTopic":
		case "nickChange":
			scripts.callEvent(e.data.c, e.data);
			break;
			
		default:
			console.log(e.data);
	}
}, false);



var scripts = {
	installed: [
		{
			name: "Matt's awesome script",
			version: "0.0.1",
			description: "My awesome script that tests stuff",
			id: "jf74dy7s8"
		}
	],
	
	listeners: [
		{id: "jf74dy7s8", event: "privmsg", callback: function(e){
			if(e.message.toLowerCase().indexOf("。") > 0 && e.nick.indexOf("bot/ceilingcat") > 0){
				setTimeout(function(){
					//IRC.sendData(e.networkID, "PRIVMSG " + e.channel + " :.bef");
				},1200);
			}				
		}}
	],
	
	callEvent: function(a, b){
		for(var i in this.listeners){
			if(this.listeners[i].event == a){
				try{
					this.listeners[i].callback(b);
				}catch(e){
					
				}
			}
		}
	}
};

var IRC = {
	on: function(a, b){
		var id = scripts.installed[scripts.installed.length - 1].id;
		scripts.listeners.push({id: id, event: a, callback: b});
	},
	sendData: function(ID, data){
		s.postMessage({c: "send_data", data: data, id: ID}, "*");
	}
}


