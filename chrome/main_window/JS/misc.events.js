function setMiscEvents(){
	$("body").on("paste", "input.user-input", function(e) {
		/*
			convert newLine to VT in pasted data
		*/
		var cd = clipboard.read();
		$(this).focus();
		if( cd.indexOf( "\n" ) > -1 ) {
			cd = cd.replace( /\r/g, "" );
			cd = cd.replace( /\n/g, String.fromCharCode( 11 ) );
			$(this).val( cd );
			console.log( "default prevented" );
			e.preventDefault();
		}
	});
}