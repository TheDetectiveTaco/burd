$(function(){
	$('body').on('keyup', function(e) {
		if(e.key == "Tab"){
			$("input.channel_input:visible").focus();
		}else{
			
			if($(':focus').length == 0){
				if(e.ctrlKey == false){
					if(e.key.length == 1) $("input.channel_input:visible").val($("input.channel_input:visible").val() + e.key);
					$("input.channel_input:visible").focus();
				}
			}
			
		}
	});
	
	
	$('body').on('keydown', 'input.channel_input', function(e) {
		if(e.key=="Tab"){
			tabComplete.process();
			e.preventDefault();
		}else{
			tabComplete.reset(e.ctrlKey, e.key);
		}
		switch(e.key){
			case "Enter":
				historyIndex = 0;
				parseInput( $(this).val(), $("div.channel:visible").attr("channel"), $("div.channel:visible").attr("network") );
				break;
			case "ArrowUp":
				if(messageHistory.length == 0) return;
				historyIndex -= 1;
				if(historyIndex < 0) historyIndex = messageHistory.length - 1;
				$(this).focus().val('').val(messageHistory[historyIndex]);
				e.preventDefault();
				break;
			case "ArrowDown":
				if(messageHistory.length == 0) return;
				historyIndex += 1;
				if(historyIndex > (messageHistory.length - 1)) historyIndex = 0;
				$(this).focus().val('').val(messageHistory[historyIndex]);
				e.preventDefault();
				break;
		}
	});
	$('body').on('keydown', 'div#input_request', function(e) {
		if(e.key == "Enter") $("div#input_request input[type='button']:first").click();
	});
});