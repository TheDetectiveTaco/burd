$(function(){
	$.menu.style = "dark";
	$( "div.close" ).click(function() {
		window.parent.postMessage( { command: "close_modal" } , "*" );
	});
	$( "div.tab" ).click(function() {
		console.log($(this).attr("sid"));
		$( "div.right-panel" ).hide();
		$( "div.right-panel[sid='" + $(this).attr("sid") + "']" ).show();
		$( "div.tab" ).removeClass( "selected-tab" );
		$(this).addClass( "selected-tab" );
	});
	
	$( "div.checkbox" ).click(function() {
		if( $(this).hasClass( "checked" ) ){
			$(this).removeClass( "checked" );
		}else{
			$(this).addClass( "checked" );
		}
	});
	
	$("body").on("click", "div.litem", function() {
		$.menu.show([
			{
				name: "Remove Item",  enabled:true,
				icon: false,
				subMenu: false,
				key: false,
				callback: function(){
				}
			},
			{
				name: "Clear List",  enabled:true,
				icon: false,
				subMenu: false,
				key: false,
				callback: function(){
				}
			}
		]);
	});
	

	
	
	$( "div.tab[sid='ignore']" ).click();
});	