$(function(){
	$("div.emoji").on("click", function(){
		window.parent.postMessage({c: "add_input_text", text: $(this).text()}, "*");
		window.parent.postMessage({c: "close_iframe"}, "*");
	});
	$("div.color").on("click", function(){
		window.parent.postMessage({c: "add_input_text", text: String.fromCharCode(3) + $(this).attr("sid")}, "*");
		window.parent.postMessage({c: "close_iframe"}, "*");
	});
	$("input.content_button").on("click", function(){
		window.parent.postMessage({c: "add_input_text", text: String.fromCharCode($(this).attr("sid"))}, "*");
		window.parent.postMessage({c: "close_iframe"}, "*");
	});
	$("input#send_file").on("click", function(){
		performClick('theFile');
	});
	$("input#theFile").on("change", function(){
		$("div.main_content").hide();
		$("div.uploading").show();
		performUpload();
	});
	postMsg({c: "get_settings"});
});

function performClick(elemId) {
   var elem = document.getElementById(elemId);
   if(elem && document.createEvent) {
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      elem.dispatchEvent(evt);
   }
}

function performUpload(){
	/*
	var fd = new FormData();
	fd.append('file', $("#theFile")[0].files[0]);
	fd.append('apikey', config.uploadApiKey);
	$.ajax({
		url: 'https://arxius.io',
		type: 'post',
		data: fd,
		contentType: false,
		processData: false,
		dataType: 'json',
		complete: function(response){
			if(response.responseText.indexOf("https") > -1) window.parent.postMessage({c: "add_input_text", text: response.responseText }, "*");
			window.parent.postMessage({c: "close_iframe"}, "*");
		},
		error: function(){
			window.parent.postMessage({c: "close_iframe"}, "*");
		}
	});
	*/
	window.parent.postMessage({c: "upload_file", file: $("#theFile")[0].files[0]}, "*");
}

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
