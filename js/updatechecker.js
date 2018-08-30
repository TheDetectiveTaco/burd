

function httpGet(e, callback){
	
	var h = http;
	if(e.split(":")[0] == "https") h = https;
	
	h.get(e, (resp) => {
	var data = '';
	resp.on('data', (chunk) => {
		data += chunk;
	});
	resp.on('end', () => {
		callback(data);
	});
	}).on("error", (err) => {
	
	});

}
function updateCheck(f){
	httpGet("https://haxed.net/burd/updates.json.php?ver=" + appVersion, function(e){
			try{
				var res = JSON.parse(e);
				if(res.version > appVersion || f){
					overlay.show();
					$("div#update").show();
					$("div#update .myver").text( appVersion );
					$("div#update .newver").text( res.version );
					$("div#update .updatetype").text( res.type );
					$("div#update .update-info").text( res.description );
					if(res.type == "security"){
						$("div#update .updatetype").css("color", "red");
						$("input#cancel_update").remove();
					}
				}
			}catch(err){
			}
	});
}
$(function(){
	if(config.checkForUpdates) updateCheck();
	$('body').on('click', 'input#cancel_update', function() {
		overlay.hide();
	});
	$('body').on('click', 'input#update_go', function() {
		$("div.update_buttons").html('<img src="images/loading.svg" style="width:30px">');
		var tarball = "";
		var file = fs.createWriteStream("update.tar");
		var request = https.get("https://haxed.net/burd/latest.tar", function(response) {
			var fp = response.pipe(file);
			fp.on('finish', function () {
				var piped = fs.createReadStream('update.tar').pipe(tar.extract(appPath));
				piped.on('finish', function () {
					fs.unlink('update.tar',function(err){
						setTimeout(function(){
							window.location.reload();
						},2000);
					});
				});
			});
		});
	});
});


