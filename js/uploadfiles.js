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

					if($("input.channel_input:visible").val().length > 0){
						$("input.channel_input:visible").val( $("input.channel_input:visible").val() + " " + response.responseText ).focus();
					}else{
						$("input.channel_input:visible").val( $("input.channel_input:visible").val() + response.responseText ).focus();
					}
					
					
				},
				error: function(){
					overlay.hide();
				}
			});
		}
	});
});