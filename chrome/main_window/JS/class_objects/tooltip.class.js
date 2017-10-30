$(function(){
	$("body").on("mouseenter", "div[tooltip]", function(e) {
		tooltip.mousex = e.pageX;
		tooltip.mousey = e.pageY;
		tooltip.show($(this));
	}).on("mouseleave", "div[tooltip]", function() {
		tooltip.hide();
	});
	
	$("body").on("click", "input#tooltipReply", function(e) {
		$("input#tooltipReply").css("color", "black").val("");
	});
	$("body").on("mousemove", "div#nav-tree", function(e) {
		//$("div#chantip").css("top", (e.pageY-20) + "px");
	});
	
	$("body").on("mouseenter", "ul.server-items li", function(e) {
		var t = $(this);
		/*
		tooltip.timer = setTimeout(function(){
			if( settings.tooltips ) $("div#chantip").show();
			$("div#lastChannelName").text( base64.decode( t.attr("channel") ) );
			$("div#lastChannelMsg").text( channel.find(t.parent().parent().attr("socket"), base64.decode( t.attr("channel") ) ).getLastMessage() );
		}, 1000);

		*/
	}).on("mouseleave", "ul.server-items li", function(e) {
		clearTimeout(tooltip.timer);
		/*
		if(e.toElement == null || e.toElement.id != "chantip"){
			$("div#chantip").hide();
			$("div#chantip input").removeAttr("style").val("Type reply and press enter");
		}
		*/
	});
	
	$("body").on("mouseleave", "div#chantip", function(e) {
		$("div#chantip").hide();
		$("div#chantip input").removeAttr("style").val("Type reply and press enter");
	});
	
});


var tooltip = {
	mousex: 0,
	mousey: 0,
	timer:0,
	show: function(e){
		$("div#tooltip").css("top", "1px").css("left", "1px");
		if( settings.tooltips ) $("div#tooltip").show().css("opacity","1");
		var tw = $("div#tooltip").width();
		var l = tooltip.mousex + 5;
		if( (l+tw) > $("body").width() - 10 ) l = $("body").width() - tw;
		$("div#tooltip").css("top", tooltip.mousey + 15).css("left", l).text( e.attr( "tooltip" ) );
		
		
	},
	hide: function(){
		$("div#tooltip").hide();
	}
}