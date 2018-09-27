
var iframe = {
	show: function(e){
		//e={type: "left", url: "./test/test.html"}
		overlay.show();
		setTimeout(function(){
			if(e.type == "left"){
				$("div#sidebar_iframe").css("left","0px").show();
			}else if(e.type == "right"){
				$("div#sidebar_iframe").css("left",$(window).width()-300).show();
			}
		},50);


		$("div#sidebar_iframe iframe").attr("src", "data:text/html,:)");
		$("div#sidebar_iframe iframe").attr("src", e.url);
	},
	hide: function(e){
		$("div.covering").hide();
		$("div#sidebar_iframe").hide();
		overlay.hide();
		$("div#sidebar_iframe iframe").attr("src", "about:blank");
	},
	repos: function(){
		if($("div#sidebar_iframe:visible").length > 0){
			if($("div#sidebar_iframe").css("left") != "0px"){
				$("div#sidebar_iframe").css("left",($(window).width()-300) + "px");
			}	
		}
	}
}