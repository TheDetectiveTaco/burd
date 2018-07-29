$(function(){
	
});

var iframe = {
	show: function(e){
		//e={type: "left", url: "./test/test.html"}
		overlay.show();
		if(e.type == "left"){
			$("div#sidebar_iframe").show().css("left","-300px").animate({left:"0px"},config.animation);
		}else if(e.type == "right"){
			$("div#sidebar_iframe").show().css("left",$(window).width() + "px").animate({left:($(window).width()-300) + "px"},config.animation);
		}
		$("div#sidebar_iframe iframe").attr("src", "about:blank");
		$("div#sidebar_iframe iframe").attr("src", e.url);
	},
	hide: function(e){
		
		$("div#sidebar_iframe").hide();
		overlay.hide();
	}
}