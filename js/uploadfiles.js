var dragTimer = 0;
$(function(){
	$("html").on("dragover", function(e) {
		e.preventDefault();
		e.stopPropagation();
		overlay.show();
		clearTimeout(dragTimer);
		dragTimer = setTimeout(function(){
			overlay.hide();
			clearTimeout(dragTimer);
		},200);
	});
	$("html").on("dragend", function(e) {
		overlay.hide();
	});
	$("html").on("drop", function(e) {
        var file = e.originalEvent.dataTransfer.files;
        var fd = new FormData();
        fd.append('file', file[0]);

		if(file[0].path.substr(-4) == ".css"){
			/* it's a theme file */
			overlay.hide();
		}else{
			uploadData(fd);
		}
		
		e.preventDefault();
		e.stopPropagation();
		
		function uploadData(formdata){
			$.ajax({
				url: 'https://arxius.io',
				type: 'post',
				data: formdata,
				contentType: false,
				processData: false,
				dataType: 'json',
				complete: function(response){
					overlay.hide();
					
					$("input.channel_input:visible").val( response.responseText ).focus();

					var e = jQuery.Event("keydown");
					e.which = 13;
					e.keyCode = 13;
					e.key = "Enter";
					$("input.channel_input:visible").trigger(e);
					
					
				},
				error: function(){
					overlay.hide();
				}
			});
		}
	});
});