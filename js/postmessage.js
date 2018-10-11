window.addEventListener("message", function(e){
	switch(e.data.c){
		case "get_networks":
			e.source.postMessage({c: "networks", data: config.networks}, "*");
			break;
		case "get_themes":
			e.source.postMessage({c: "themes", data: themes}, "*");
			break;
		case "get_active_network":
			var aNet = $("div#main_list_container div.selected").attr("network");
			e.source.postMessage({c: "active_network", id: aNet, name: socket.getSocketByID(aNet).networkInfo.getISUPPORT("network")}, "*");
			break;
		case "hook_data":
			var aNet = $("div#main_list_container div.selected").attr("network");
			var s = socket.getSocketByID(aNet);
			var sWin = e.source;
			s.dataHook = function(e){
				sWin.postMessage({c: "data", data: e}, "*");
			};
			e.source.postMessage({c: "hook_set"}, "*");
			break;
		case "unhook_data":
			var s = socket.getSocketByID(e.data.id);
			s.dataHook = function(e){};
			e.source.postMessage({c: "hook_unset"}, "*");
			break;
		case "add_input_text":
			if(e.data.retain != undefined && e.data.retain == false){
				$("input.channel_input:visible").val( e.data.text ).focus();
			}else{
				if($("input.channel_input:visible").val().length > 0){
					$("input.channel_input:visible").val( $("input.channel_input:visible").val() + " " + e.data.text ).focus();
				}else{
					$("input.channel_input:visible").val( $("input.channel_input:visible").val() + e.data.text ).focus();
				}
			}
			
			
			if(e.data.send != undefined && e.data.send == true){
				var e = jQuery.Event("keydown");
				e.which = 13;
				e.keyCode = 13;
				e.key = "Enter";
				$("input.channel_input:visible").trigger(e);
			}
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
		case "send_data":
			socket.sendData(e.data.data, e.data.id);
			break;
		case "update_settings":
			if(e.data.data["networks"]==undefined) return;
			if(e.data.data["ignores"]==undefined) return;
			config = e.data.data;
			applyConfig();
			break;
		case "open_url":
			openURL(e.data.url);
			break;
		case "set_theme":
			$("link#theme").attr('href', 'themes/' + e.data.theme);
			break;
		case "upload_file":
			uploadFile(e.data.file);
			break;
		case "shell":
			e.data.path = e.data.path.replace("%dataPath%", dataPath);
			shell.openItem( e.data.path );
			break;

		default:
			console.log(e.data);
	}
}, false);

