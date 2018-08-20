var config = {};

function applyConfig(){
}

window.addEventListener("message", function(e){
	switch(e.data.c){
		case "settings":
			config = e.data.data;
			applyConfig();
			break;
	}
}, false);

window.onbeforeunload = function(){
	if(config != {}) postMsg({c: "update_settings", data: config});
}

$(function(){
	$('body').on('click', 'img#back', function() {
		window.location.href = "index.html";
	});
	postMsg({c: "get_settings"});
});