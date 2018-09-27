var dragTimer = 0;
$(function(){
	$("html").on("dragover", function(e) {
		e.preventDefault();
		e.stopPropagation();
		overlay.show();
		clearTimeout(dragTimer);
	});
	
	$("html").on("dragleave", function(e) {
		dragTimer = setTimeout(function(){
			overlay.hide();
		},100);
	});
	$("html").on("drop", function(e) {
        var file = e.originalEvent.dataTransfer.files;

		e.preventDefault();
		e.stopPropagation();
		
		if(file.length == 0){
			return;
		}
		
		uploadFile(file[0]);
	});
});

function uploadFile(file){
	$("div#uploading").show();
	overlay.show();
	var fd = new FormData();
	fd.append(config.fileUploadService.fileParam, file);
	for(var i in config.fileUploadService.miscParams){
		var data = config.fileUploadService.miscParams[i].split("=");
		fd.append(data[0], data[1]);
	}
	
	$.ajax({
		url: config.fileUploadService.uri,
		type: 'post',
		data: fd,
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