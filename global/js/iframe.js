$("head").append('<link id="theme" href="../' + window.parent.$("#theme").attr("href") + '" rel="stylesheet">');

$(function(){

	
	$('body').on('click', 'div.slider', function(e) {
		if($(this).hasClass("slider_on")){
			$(this).removeClass("slider_on");
		}else{
			$(this).addClass("slider_on");
		}
		slider.callback({id: $(this).attr("id"), state: $(this).hasClass("slider_on")});
	});
	
	$('body').on('click', 'div.radio div', function(e) {
		$(this).parent().find("div").removeClass("checked");
		$(this).addClass("checked");
		radio.callback({id: $(this).attr("id"), group: $(this).parent().attr("id")});
	});
	
	$('body').on('click', 'div.list div.item', function(e) {
		$("div.list div.item div.buttons").hide();
		$("div.list div.item").removeClass("selected");
		$(this).find("div.buttons").show();
		$(this).addClass("selected");
		
	});
	
	$("body").on("click", "a", function() {
		var bits = $(this).attr("href").toLowerCase().split(":");
		switch( bits[0].toLowerCase() ){
			
			case "http":
			case "https":
				postMsg({c: "open_url", url: $(this).attr("href")});
				break;
			
			default:
				window.location.href = $(this).attr("href");
				break;

		}
		event.preventDefault();
	});
	
	$('body').on('click', 'img#back', function() {
		window.location.href = "index.html";
	});	
	
	
});

var slider = {
	callback: function(e){},
	addEventListener: function(callback){
		this.callback = callback;
	},
	getState: function(id){
		return $("div.slider[id='" + id + "']").hasClass("slider_on");
	}
}

var radio = {
	callback: function(e){},
	addEventListener: function(callback){
		this.callback = callback;
	},
	getSelected: function(group){
		return $("div.radio[id='" + group + "'] div.checked").attr("id");
	}
}

function postMsg(e){
	window.parent.postMessage(e, "*");
}