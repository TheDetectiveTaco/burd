var logging = {
	cache: [],
	addLog: function(e){
		if(config.logs.enabled){
			this.cache.push(e);
			if(this.cache.length > 20) this.pushToFile();
		}
	},
	pushToFile: function(){
		for(var i in this.cache){
			var a = this.cache[i];
			if(a.network==false) return;
			var d = new Date(a.date);
			var path = config.logs.path.replace("%dataPath%", dataPath) + "/" + removeBadStr(a.network.toLowerCase());
			if (!fs.existsSync(path)) fs.mkdirSync(path);
			path += "/" + removeBadStr(a.channel.toLowerCase());
			if (!fs.existsSync(path)) fs.mkdirSync(path);
			var db = d.toString().split(" ");
			var messageStr = "";
			if(a.type == "privmsg"){
				messageStr = "[" + db[4] + "] <" + a.user + "> " + a.message + "\r\n";
			}else if(a.type == "join"){
				messageStr = "[" + db[4] + "] *** Joins: " + a.user + "\r\n";
			}else if(a.type == "part"){
				messageStr = "[" + db[4] + "] *** Parts: " + a.user + "\r\n";
			}else if(a.type == "quit"){
				messageStr = "[" + db[4] + "] *** Quits: " + a.user + "\r\n";
			}
			fs.appendFileSync(path + "/" + db[0]+" "+db[1]+" "+db[2]+" "+db[3] + ".txt", messageStr);
		}
		this.cache = [];
		
		function removeBadStr(e){
			var chars = [
				"*",
				"\\",
				"/",
				":",
				"|",
				"\"",
				"^",
				"con",
				"nul",
				"prn",
				"?",
				">",
				"."
			];
			
			var replaced = true;
			while(replaced == true){
				replaced = false;
				for(var i in chars){
					if(e.indexOf(chars[i])>-1){
						e = e.replace(chars[i], "_");
						replaced = true;
					}
				}
			}
			e = e.replace(/com[0-9]/ig, "_");
			e = e.replace(/lpt[0-9]/ig, "_");
			return e;
		}
	}
}

