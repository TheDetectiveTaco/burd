var inputRequest = {
	callback: function(e){},
	create: function(e){
		/*
			inputRequest.create({
				title: "Hello",
				inputs: ["How are you?", "another"],
				buttons: ["OK", "Cancel"],
				callback: function(e){
					console.log(e);
				}
			});
		*/
		overlay.show();
		
		$("div#input_request div.input_title").text(e.title||"Input Request");
		$("div#input_request div.input_content").text(e.text||"");
		
		if(e.inputs != undefined){
			var htm = "<table class=\"input\" style=\"width:100%;\">";
			for(var i in e.inputs){
				htm += ("<tr><td>" + e.inputs[i] + ": </td><td><input type=\"text\" style=\"width:100%;\" q=\""+ e.inputs[i] +"\"></td></tr>");
			}
			$("div#input_request div.input_content").append(htm + "</table>");
		}
		
		if(e.buttons == undefined){
			$("div#input_request div.input_buttons").html("<input type=\"button\" value=\"OK\" style=\"width:70px;\">");
		}else{
			$("div#input_request div.input_buttons").html("");
			for(var i in e.buttons){
				$("div#input_request div.input_buttons").append("<input type=\"button\" value=\"" + e.buttons[i] + "\" style=\"width:70px;\">&nbsp;");
			}
		}
		
		this.callback = e.callback||function(){};
		
		$("div#input_request").fadeIn(config.animation, function(){
			$("div#input_request input:first").focus();
		});
	}
}

$(function(){
	$('body').on("click", "div.input_buttons input[type='button']", function() {
		var rObj = {
			button: $(this).val(),
			inputs: {}
		};
		$("div#input_request input[type='text']").each(function(){
			rObj.inputs[$(this).attr("q")] = $(this).val();
		});
		inputRequest.callback(rObj);
		overlay.hide();
	});
});