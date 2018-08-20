var ignore = {
	add: function(type, value){
		var ignoreObj = {type: type.toLowerCase(), value: value.toLowerCase()};
		for(var i in config.ignores){
			if(config.ignores[i].value == value && config.ignores[i].type == type) return false;
		}
		config.ignores.push(ignoreObj);
		return true;
	},
	remove: function(type, value){
		for(var i in config.ignores){
			if(config.ignores[i].value.toLowerCase() == value && config.ignores[i].type.toLowerCase() == type){
				config.ignores.splice(i,1);
				return true;
			}
		}
		return false;
	},
	check: function(str){
		for(var i in config.ignores){
			if(config.ignores[i].type == "user"){
				var urx = this.userAsRegex(config.ignores[i].value);
				if(str.split(" ")[0].match(urx) != null) return true;
			}else if(config.ignores[i].type == "regex"){
				var regx = this.regexFromStr(config.ignores[i].value);
				if(str.match(regx) != null) return true;
			}
		}
		return false;
	},
	regexFromStr: function(e){
		return new RegExp(e, "ig");
	},
	userAsRegex: function( e ){
		var returnStr = "";
		for( var i in e ) {
			returnStr += e[i].replace( /[^a-zA-Z\d\s\*:]/, "\\" + e[i] );
		}
		returnStr = returnStr.replace( /\s/g, "\\s" );
		returnStr = returnStr.replace( /\*/g, "(.*)" );
		return new RegExp(returnStr, "ig");
	}
}