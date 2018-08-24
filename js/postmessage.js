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
			e.data.network.auth.password = crypt.encrypt(e.data.network.auth.password);
			config.networks.push(e.data.network);
			saveSettings();
			break;
		case "edit_network":
			if(e.data.network.auth.password != config.networks[e.data.index].auth.password){
				e.data.network.auth.password = crypt.encrypt(e.data.network.auth.password);
			}
			config.networks[e.data.index] = e.data.network;
			saveSettings();
			break;
		case "delete_network":
			config.networks.splice(e.data.network,1);
			saveSettings();
			break;
		case "connect":
			network.create(e.data.network);
			break;
		case "get_version":
			e.source.postMessage({c: "version", version: appVersion}, "*");
			break;
		case "get_settings":
			e.source.postMessage({c: "settings", data: config}, "*");
			break;
		case "update_settings":
			if(e.data.data["networks"]==undefined) return;
			if(e.data.data["ignores"]==undefined) return;
			config = e.data.data;
			break;
		case "open_url":
			openURL(e.data.url);
			break;
		case "shell":
			e.data.path = e.data.path.replace("%dataPath%", dataPath);
			shell.openItem( e.data.path );
			break;
		default:
			console.log(e.data);
	}
}, false);

