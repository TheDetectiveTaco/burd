function parseInput(input,chan,network){
	
	if(input == "") return;
	
	var co = channel(chan,network);
	var bits = input.substr(1).split(" ");
	var UC = bits[0].toUpperCase();
	var nick = socket.getSocketByID(network).networkInfo.nick;
	var color = $("div.user:iAttrContains('nick','" + nick.toLowerCase() + "')").css("color");
	co.object.find("input.channel_input").val("");
	
	if( input.substr(0,1) == "/" ){
		switch(UC){
			
			case "AWAY":
				socket.sendData(bits[0].toUpperCase() + " :" + getAfter(1), network);
				break;
				
			case "JOIN":
				if( bits.length < 2 ){
					co.addInfo(UC + " expects more parameters", "error-info");
					return;
				}
				socket.sendData(UC + " " + getAfter(1), network);
				break;
				
			case "PART":
				if( bits.length < 2 ){
					co.addInfo(UC + " expects more parameters", "error-info");
					return;
				}else if( bits.length == 2 ){
					socket.sendData(UC + " " + getAfter(1), network);
				}else{
					socket.sendData(UC + " " + bits[1] + " :" + getAfter(2), network);
				}
				break;
				
			case "ME":
			case "ACTION":
				if( bits.length < 2 ){
					co.addInfo(UC + " expects more parameters", "error-info");
					return;
				}else{
					socket.sendData("PRIVMSG " + chan + " :" + String.fromCharCode(1) + "ACTION " + getAfter(1) + String.fromCharCode(1), network);
					co.addAction(nick, "*!*@*", color, false, getAfter(1));
					return;
				}
				break;
				
			default:
				socket.sendData(input.substr(1), network);
		}
		co.addInfo(input.substr(1), "text-out");
	}else{
		if(chan == "network console"){
			co.addInfo("This is the network console, you can't send messages here. For a list of command try /help.");
		}else{
			socket.sendData( "PRIVMSG " + chan + " :" + input, network );
			co.addPrivmsg(nick, "*!*@*", color, false, input);
		}
	}
	
	function getAfter(e){
		//gets data after input segment
		var start = 0;
		for (var i = 0; i < e; i++) { 
			start += (bits[i].length + 1);
		}
		return input.substr(start + 1);
	}
}

