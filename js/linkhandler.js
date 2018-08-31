function openURL(e){
	if(e.toLowerCase().substr(0,6) == "https:" || e.toLowerCase().substr(0,5) == "http:"){
		require('electron').shell.openExternal(e);
	}
}

$(function(){
	$("body").on("click", "a", function() {
		var bits = $(this).attr("href").toLowerCase().split(":");
		switch( bits[0].toLowerCase() ){
			
			case "http":
			case "https":
				openURL($(this).attr("href"));
				break;
				
			case "channel":
				
				break;
			case "schannel":
				$(this).parent().find("div.closer").click();
				socket.sendData("JOIN " + $(this).text(), $(this).parent().attr("network"));
				break;

		}
		event.preventDefault();
	});
});