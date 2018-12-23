var editing = window.location.href.toString().split("=")[1];
var networks = [];


slider.addEventListener(function(e){
	console.log(e);
});

var newServer = {
	server: { host: "chat.freenode.net", port: 6667 },
	nick: "null",
	altNick: "null",
	user: "Burd",
	realName: "Burd IRC",
	commands: [],
	SSL: false,
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

window.addEventListener("message", function(e){
	switch(e.data.c){
		case "networks":
			networks = e.data.data;
			newServer = networks[editing];
			fillInInfo();
			break;
	}
}, false);

function fillInInfo(){
	$("input#nick").val(newServer.nick);
	$("input#second_nick").val(newServer.altNick);
	$("input#username").val(newServer.user);
	$("input#realname").val(newServer.realName);
	
	$("input#server_name").val(newServer.name || "Blank");
	$("input#server_address").val(newServer.server.host);
	$("input#server_port").val(newServer.server.port);
	
	if(newServer.reconnect) $("div#reconnect").addClass("slider_on");
	if(newServer.startup) $("div#startup").addClass("slider_on");
	if(newServer.SSL) $("div#ssl").addClass("slider_on");
	
	if(newServer.auth.type == "nickserv") $("div#radio_nickserv").click();
	if(newServer.auth.type == "server_password") $("div#radio_serverpassword").click();
	if(newServer.auth.type == "sasl_plain") $("div#radio_saslplain").click();
	
	$("input#sasl_password,input#nickserv_password,input#server_password").val(newServer.auth.password);
	$("input#sasl_user").val(newServer.auth.username);
	
	$("input#commands").val(newServer.commands.join(","));
	
}


$(function(){
	postMsg({c: "get_networks"});
	
	
	
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

		newServer.SSL = slider.getState("ssl");
		newServer.reconnect = slider.getState("reconnect");
		newServer.startup = slider.getState("startup");
		
		newServer.auth.type = authType;
		newServer.auth.username = authUser;
		newServer.auth.password = authPassword;
		newServer.commands = $("input#commands").val().split(",");
		newServer.name = $("input#server_name").val();
		
		postMsg({c: "edit_network", network: newServer, index: editing});
		setTimeout(function(){
			window.location.href="index.html";
		},100);
		
		
	});
});