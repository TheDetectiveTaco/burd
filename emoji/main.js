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
});
