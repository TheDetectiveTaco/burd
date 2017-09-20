/* 
	HAXUI 0.0.1
	Created by Matthew Ryan ( www.haxed.net )
	-
	THIS CODE IS RELEASED UNDER THE GNU GENERAL PUBLIC LICENSE
	http://www.gnu.org/licenses/gpl-3.0.en.html
*/
jQuery.menu = {
		show: function(e){
			if( Array.isArray( e ) === false || e.length === 0 ) throw( "menu object is not an array or has has no array items" );
			var res = this.resources;
			var left = res.mouse.x - 5;
			var top = res.mouse.y - 10;
			/*
			if there is already a menu shown then we assume we're showing a sub menu, in
			which case we want to left position to be beside the last menu shown.
			*/
			if( jQuery("div.haxui-menu").length > 0 ){
				left = parseInt(jQuery("div.haxui-menu:last").css("left").replace("px", "")) + 100;
			}
			
			var menuHTML = "<div id=\"" + res.GUID() + "\" class=\"haxui-menu-" + this.style + " haxui-menu-win10 haxui-menu\" style=\"top:" + top + "px; left: " + left + "px\"><ul>";
			for( var i in e ) {
				/* if the name is "-" then we know it's a menu separator  */
				if(e[i].name === "-"){
					menuHTML += "<li class=\"haxui-menu-bar\">&nbsp;</li>";
				}else{
					var className = "haxui-menu-item";
					/* set the background image as a blank gif */
					var background = "background-image:url('" + res.images.blankGIF + "') ";
					/* each menu has a unique ID set so we can match it to the relative callback function  */
					var menuID = res.GUID();
					/* add the item to an array we can referece later when the menu item is clicked */
					this.callbacks.push( [ menuID, e[i] ] );
					/* Check if icon is false, if not we need to set an icon */
					if(e[i].icon !== false) background = "background-image:url('" + e[i].icon + "')";
					/* Check subMenu is not false we need to add the relevant icon */
					if(e[i].subMenu !== false) background += ", url('" + res.images.rightArrow + "')"
					/* build the HTML for the menu item and append it to our html veritable */
					if ( e[i].enabled === false ) className += " haxui-menu-item-disabled";
					if( e[i].key == false || e[i].key == undefined ) e[i].key = "&nbsp;" ;
					menuHTML += "<li class=\"" + className + "\" id=\"" + menuID + "\" style=\"" + background + ";background-size:16px 16px;\">" + e[i].name + "<div class=\"haxui-keycode\">" + e[i].key + "</div></li>";
					
				}
			}
			menuHTML += "</ul></div>"
			jQuery("body").append(menuHTML);
			jQuery("div.haxui-menu").fadeIn(jQuery.menu.animation);
			this.checkBounds();
		},
		checkBounds: function(){
			var e = jQuery("div.haxui-menu:last");
			if(( e.height() + e.position().top + 20) > jQuery(window).height() ) {
				var t = (jQuery(window).height() - e.height() - 6);
				e.css("top", (jQuery(window).height() - e.height() - 20) + "px");
			}
			if(e.position().top < 5) {
				e.css("top", "5px");
			}
			if(( e.width() + e.position().left + 5) > jQuery(window).width() ) {
				e.css("left", (jQuery(window).width() - e.width() - 10) + "px");
				if( $("div.haxui-menu-win10").length > 1 ) e.css("left", (jQuery(window).width() - e.width() - 20) + "px");
			} 
		},
		remove: function(){
			jQuery("div.haxui-menu").remove();
			
			this.callbacks = [];
		},
		click: function(e){
			var menuItem = null;
			for(var i in this.callbacks){
				if(this.callbacks[i][0] == e.id){
					menuItem = this.callbacks[i][1];
				}
			}
			
			if(menuItem.subMenu === false){
				jQuery.menu.remove();
			}else{
				this.show( menuItem.subMenu );
			}
			if(menuItem.callback !== false && menuItem.enabled) menuItem.callback(menuItem);
		},
		lastMenu: 0,
		resources: {
			images: {
				blankGIF: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
				rightArrow: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAACVBMVEVHcEz///8AAADmzmMiAAAAAXRSTlMAQObYZgAAAClJREFUeF5jgIAFIGIGiJgGIqY2gIgEEBEBIsLgRARcogGmeAbEAAgAAMnzC2EKTThnAAAAAElFTkSuQmCC"
			},
			GUID: function(){
				var e = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
				e += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
				return e;
			},
			mouse: {
				x: 0,
				y: 0
			}
		},
		style: "light",
		animation: 200,
		callbacks: []
	}



jQuery(function() {

	jQuery("body").on("mouseup", function(e) {
		if( jQuery("div.haxui-menu:visible").length > 0 && jQuery(e.target).hasClass("haxui-menu-item") == false && jQuery(e.target).parent().hasClass("haxui-menu-item") == false){
            jQuery.menu.remove();
        }
	});
	jQuery("body").on("mousemove", function(e) {
		jQuery.menu.resources.mouse = {x: e.pageX, y: e.pageY};
		if( e.target.className.split != undefined ){
			if(e.target.className.split(" ")[0] == "haxui-menu-item"){
				var menuID = $(e.target).parent().parent().attr("id");
				
				var doRemove = false;
				if(jQuery.menu.lastMenu != menuID){
					while($("div.haxui-menu:last").attr("id") != menuID){
						$("div.haxui-menu:last").remove();
					}
				}

				jQuery.menu.lastMenu = menuID;
			}
		}

	});

	jQuery("body").on("click", "li.haxui-menu-item", function(e) {
		jQuery.menu.click(e.currentTarget);
		
	});
	
});
