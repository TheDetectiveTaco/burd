$(function(){
	window.parent.postMessage({c: "get_networks"}, "*");
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
		HTML += '<div class="item">';
		HTML += '<div class="title">' + networks[i].server.host + "/" + networks[i].server.port + '</div>';
		HTML += '<div class="meta"><b>Nickname</b>: ' + networks[i].nick + '</div>';
		HTML += '<div class="buttons"><input type="button" value="Delete">'+
		'<input type="button" value="Edit"><input type="button" value="Connect"></div></div>';
	}
	$("div.list").html(HTML);
}