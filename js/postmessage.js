window.addEventListener("message", function(e){
	switch(e.data.c){
		case "get_networks":
			e.source.postMessage({c: "networks", data: config.networks}, "*");
			break;
		case "add_input_text":
			$("input.channel_input:visible").val( $("input.channel_input:visible").val() + e.data.text ).focus();
			break;
		case "close_iframe":
			iframe.hide();
			break;
	}
}, false);

