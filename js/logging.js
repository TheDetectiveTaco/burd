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
			var d = new Date(a.date);
<<<<<<< HEAD
			var path = removeBadChars(config.logs.path.replace("%dataPath%", dataPath) + "/" + a.network);
			if (!fs.existsSync(path)) fs.mkdirSync(path);
			path += "/" + removeBadChars(a.channel);
=======
			var path = config.logs.path.replace("%dataPath%", dataPath) + "/" + a.network;
			if (!fs.existsSync(path)) fs.mkdirSync(path);
			path += "/" + a.channel;
>>>>>>> 8f2ef63dbbbf701d0e01762dc3aa59c5c4bf23e2
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
<<<<<<< HEAD
		
		function removeBadChars(e){
			e = e.replace(/\*/, "_");
			return e;
		}
=======
>>>>>>> 8f2ef63dbbbf701d0e01762dc3aa59c5c4bf23e2
	}
}

