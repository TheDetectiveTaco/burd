var highlights = {
	process: function(nick, str){
		/* check to see if text has a highlight */
		for(var i in config.highlights){
			if( config.highlights[i] == "%n" ){
				var re = new RegExp("\\b" + formatRegex( nick.toLowerCase() ) + "\\b", "ig");
				if( str.toLowerCase().match( re ) != null ) return config.highlights[i];
			}else{
				if( str.toLowerCase().indexOf( config.highlights[i].toLowerCase() ) > -1 ){
					return config.highlights[i];
				}
			}
		}
		return false;
	}
}
function formatRegex( e ){
	var returnStr = "";
	for( var i in e ) {
		returnStr += e[i].replace( /[^a-zA-Z\d\s\*:]/, "\\" + e[i] );
	}
	returnStr = returnStr.replace( /\s/g, "\\s" );
	returnStr = returnStr.replace( /\*/g, "(.*)" );
	return returnStr;
}