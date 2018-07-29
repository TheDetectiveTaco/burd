$(function(){
	
	$('body').on('click', 'div.slider', function(e) {
		if($(this).hasClass("slider_on")){
			$(this).removeClass("slider_on");
		}else{
			$(this).addClass("slider_on");
		}
		sliderChanged({id: $(this).attr("id"), state: $(this).hasClass("slider_on")});
	});
	
	$('body').on('click', 'div.radio div', function(e) {
		$(this).parent().find("div").removeClass("checked");
		$(this).addClass("checked");
		radioChanged({id: $(this).attr("id"), group: $(this).parent().attr("id")});
	});
	
	$('body').on('click', 'div.list div.item', function(e) {
		$("div.list div.item div.buttons").hide();
		$("div.list div.item").removeClass("selected");
		$(this).find("div.buttons").show();
		$(this).addClass("selected");
		
	});
	
});

var radioChanged = function(e){
	
}

var sliderChanged = function(e){
	
}
