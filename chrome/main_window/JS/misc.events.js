function setMiscEvents(){
	$("body").on("paste", "input.user-input", function(e) {
		/*
			convert newLine to VT in pasted data
		*/
		var cd = clipboard.read();
		$(this).focus();
		if( cd.indexOf( "\n" ) > -1 ) {
			
		}
	});
}