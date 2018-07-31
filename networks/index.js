$(function(){
	postMsg({c: "get_networks"});
	
	$('body').on('click', 'input.connect', function(e) {
		postMsg({c: "connect", network: networks[$("div.selected").attr("index")]});
		postMsg({c: "close_iframe"});
	});
	$('body').on('click', 'input.delete', function(e) {
		postMsg({c: "delete_network", network: $("div.selected").attr("index")});
		setTimeout(function(){
			postMsg({c: "get_networks"});
		},100);
	});
});

var networks = [];

window.addEventListener("message", function(e){
	switch(e.data.c){
		case "networks":
			networks = e.data.data;
			genHTML();
			break;
	}
}, false);

function genHTML(){
	var HTML = "";
	for(var i in networks){
		HTML += '<div class="item" index="' + i + '">';
		HTML += '<div class="title">' + networks[i].server.host + "/" + networks[i].server.port + '</div>';
		HTML += '<div class="meta"><b>Nickname</b>: ' + networks[i].nick + '</div>';
		HTML += '<div class="buttons"><input type="button" class="delete" value="Delete">'+
		'<input type="button" class="connect" value="Connect"></div></div>';
	}
	$("div.list").html(HTML);
}
