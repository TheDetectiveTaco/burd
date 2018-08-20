var menuObjects = {
	user: function(e){
		var id = $("div.channel:visible").attr("network");
		var chan = $("div.channel:visible").attr("channel");
		return {
				[e]: { title: true },
				"PM User": { callback: function(a){
					channel(e, id).create("new_pm_window");
					channel(e, id).show();
				}},
				"Whois": { callback: function(a){
					socket.sendData("whois " + e, id); 
				}},
				"Ignore": { callback: function(a){  }},
				"OP Action": { subMenu: {
					[e]: { title: true },
					"Give OP": { callback: function(a){ 
						socket.sendData("MODE " + chan + " +o " + e, id);
					}},
					"Remove OP": { callback: function(a){ 
						socket.sendData("MODE " + chan + " -o " + e, id);
					}},
					"Give Voice": { callback: function(a){ 
						socket.sendData("MODE " + chan + " +v " + e, id);
					}},
					"Remove Voice": { callback: function(a){ 
						socket.sendData("MODE " + chan + " -v " + e, id);
					}},
					"Kick User": { callback: function(a){ 
						socket.sendData("KICK " + chan + " " + e, id);
					}},
					"Ban User": { callback: function(a){ 
						socket.sendData("MODE " + chan + " +b " + e + "!*@*", id);
					}}
				}}
			}
	}
}