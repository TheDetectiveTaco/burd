/*
	function for tab completion. when typing in a channel and you press TAB
	the client should take the text before the cursor and match it to a nickname
	in that channel, then insert whatever is left of that nickname
 */
 var tabUsers = [];
function tabComplete(){
	var obj = $( "input.user-input:visible" );
	if( $("input.user-input:visible").length > 0 ) {
		if( tabUsers.length == 0 ) {
			/* build list of auto complete users */
			var text = obj.val().split(" ")[ obj.val().split(" ").length -1 ].toLowerCase();
			if( text == "" ) return;
			
			$( "div.user:visible" ).each(function(){
				var userText = $(this).text().toLowerCase();
				if( userText.length > text.length ) {
					if ( userText.substr(0, text.length) == text ) tabUsers.push( $(this).text() );
				}
			});
			if( tabUsers.length > 0 ) tabComplete();
		} else {
			obj.val( obj.val().substr( 0, obj.val().lastIndexOf(" ") + 1 ) + tabUsers[0] );
			tabUsers.splice(0, 1);
		}
	}
}