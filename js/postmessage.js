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
		case "save_network":
			config.networks.push(e.data.network);
			saveSettings();
			break;
		case "delete_network":
			config.networks.splice(e.data.network,1);
			saveSettings();
			break;
		case "connect":
			network.create(e.data.network);
			break;
		default:
			console.log(e.data);
	}
}, false);

