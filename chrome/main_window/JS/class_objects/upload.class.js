/* Handles uploading files to imgur when dragged and dropped */
window.addEventListener("dragover",function(e){
	e = e || event;
	e.preventDefault();
},false);
window.addEventListener("drop",function(e){
	e = e || event;
	e.preventDefault();
	$("input.user-input:visible").focus();
	channel.byObject( $( "div.channel:visible" ) ).addInfo( "Uploading image..." );
	var fd = new FormData();
	var xhttp = new XMLHttpRequest();
	fd.append('image', e.dataTransfer.files[0]);
	xhttp.open('POST', 'https://api.imgur.com/3/image');
	xhttp.setRequestHeader('Authorization', 'Client-ID f8599394e641962'); //Get yout Client ID here: http://api.imgur.com/
	xhttp.onreadystatechange = function () {
		if (xhttp.status === 200 && xhttp.readyState === 4) {
			var res = JSON.parse(xhttp.responseText);
			$("input.user-input:visible").val(res.data.link);
			var a = jQuery.Event("keydown");
			a.which = 13;
			a.key = "Enter";
			$("input.user-input:visible").focus().trigger(a);
		}else if (xhttp.readyState === 4) {
			channel.byObject( $( "div.channel:visible" ) ).addInfo( "Uploading has failed" );
		}
	};
	xhttp.send(fd);
},false);
