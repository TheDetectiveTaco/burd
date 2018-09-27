var menu = {
	create: function(e){
		$("div.simple_menu").remove();
		this.lastMenu = e;
		$("body").append('<div class="simple_menu" style="display:none;left:0px;top:0px;"><ul></ul></div>');
		for(var i in e){
			if(e[i].title == undefined){
				$("div.simple_menu ul").append("<li class=\"menu_item\">" + i + "</li>");
			}else{
				$("div.simple_menu ul").append("<li class=\"menu_item menu_title\">" + i + "</li>");
			}
		}

		
		this.repos();
		
		$("div.simple_menu").show();
		setTimeout(function(){
			$("div.simple_menu").addClass("ani_complete");
		},300);
	},
	repos: function(){
		var mouseLeft = mousePos.x - 20;
		var mouseTop = mousePos.y - 20;
		
		if( $("div.simple_menu:visible").length > 0 ){
			var mouseLeft = $("div.simple_menu").position().left;
			var mouseTop = $("div.simple_menu").position().top;
		}
		if( mouseLeft > ($( window ).width() - $("div.simple_menu").width() - 20) ) mouseLeft = $( window ).width() - $("div.simple_menu").width() - 10;
		if( mouseTop > ($( window ).height() - $("div.simple_menu").height() - 20) ) mouseTop = $( window ).height() - $("div.simple_menu").height() - 10;
		
		if( mouseTop < 15 ) mouseTop = 0;
		if( mouseLeft < 15 ) mouseLeft = 0;
		
		$("div.simple_menu").css("left", mouseLeft + "px");
		$("div.simple_menu").css("top", mouseTop + "px");
		
	},
	lastMenu: [],
	cache: ""
}






var mousePos = { x: -1, y: -1 };
$(function(){
	//$(".channel_content").jScrollPane();
    $(document).mousemove(function(event) {
        mousePos.x = event.pageX;
        mousePos.y = event.pageY;
    });
	
	$('body').on('click', function(e) {
		if( $(e.target).hasClass("menu_item") == false && $("div.simple_menu").length > 0 && $("div.simple_menu").hasClass("ani_complete") ){
			menu.lastMenu = [];
			$("div.simple_menu").remove();
		}
	});
	
	$('body').on('click', 'div.simple_menu ul li', function(e) {
		if($(this).hasClass("menu_title")) return;
		$(this).css("background", "rgb(204, 204, 204)");
		$(this).animate({backgroundColor: '#ffffff'}, 200, function(){
			for(var i in menu.lastMenu){
				if( i == $(this).text() ){
					if( menu.lastMenu[i].subMenu == undefined ){
						menu.lastMenu[i].callback(menu.lastMenu[i]);
						menu.lastMenu = [];
						$("div.simple_menu").remove();
					}else{
						menu.lastMenu = menu.lastMenu[i].subMenu;
						$("div.simple_menu ul").html("");
						for(var i in menu.lastMenu){
							if(menu.lastMenu[i].title == undefined){
								$("div.simple_menu ul").append("<li class=\"menu_item\">" + i + "</li>");
							}else{
								$("div.simple_menu ul").append("<li class=\"menu_item menu_title\">" + i + "</li>");
							}
						}
						menu.repos();
					}
				}
			}
		});
		
	});

	$('body').on('click', 'div.channel_users div.user', function(e) {
		menu.create( menuObjects.user($(this).text()) );
	});
	$('body').on('click', 'div.user_message span.name', function(e) {
		menu.create( menuObjects.user($(this).text()) );
	});
	
});