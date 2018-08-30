slider.addEventListener(function(e){
	console.log(e);
});

var newServer = {
	server: { host: "chat.freenode.net", port: 6667 },
	name: "Blank",
	nick: "null",
	altNick: "null",
	user: "Burd",
	realName: "Burd IRC",
	commands: [],
	SSL: true,
	reconnect: true,
	startup: false,
	auth: {
		type: "none",
		username: "",
		password: ""
	}
}

radio.addEventListener(function(e){
	$("div.login_method").hide();
	$("div.login_method[rid='" + e.id + "'],div.login_info_div").show();
	if(e.id == "radio_none") $("div.login_info_div").hide();
});

$(function(){
	$('body').on('click', 'input#save_button', function(e) {
		
		var nickName = $("input#nick").val();
		var altNickName = $("input#second_nick").val();
		var user = $("input#username").val();
		var realName = $("input#realname").val();
		
		var serverAddr = $("input#server_address").val();
		var serverPort = $("input#server_port").val();
		
		var authType = "none";
		var authUser= "";
		var authPassword = "";
		
		if(nickName == "" || altNickName == "" || user == "" || realName == "" || serverAddr == "" || serverPort == ""){
			$("div.error").show();
			return;
		}
		
		if( radio.getSelected("radio_login") == "radio_nickserv"){
			authType = "nickserv";
			authPassword = $("input#nickserv_password").val();
		}else if( radio.getSelected("radio_login") == "radio_serverpassword"){
			authType = "server_password";
			authPassword = $("input#server_password").val();
		}else if( radio.getSelected("radio_login") == "radio_saslplain"){
			authType = "sasl_plain";
			authUser = $("input#sasl_user").val();
			authPassword = $("input#sasl_password").val();
		}
		
		newServer.server.host = serverAddr;
		newServer.server.port = serverPort;
		
		newServer.nick = nickName;
		newServer.altNick = altNickName;
		newServer.realName = realName;
		
		newServer.commands = [];
		newServer.SSL = slider.getState("ssl");
		newServer.reconnect = slider.getState("reconnect");
		newServer.startup = slider.getState("startup");
		
		newServer.auth.type = authType;
		newServer.auth.username = authUser;
		newServer.auth.password = authPassword;
		newServer.commands = $("input#commands").val().split(",");
		newServer.name = $("input#server_name").val();
		
		postMsg({c: "save_network", network: newServer});
		
		window.location.href="index.html";
		
	});
});