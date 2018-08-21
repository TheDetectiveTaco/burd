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

		}
		event.preventDefault();
	});
});