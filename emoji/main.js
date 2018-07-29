$(function(){
	$("div.emoji").on("click", function(){
		window.parent.postMessage({c: "add_input_text", text: $(this).text()}, "*");
		window.parent.postMessage({c: "close_iframe"}, "*");
	});
});
