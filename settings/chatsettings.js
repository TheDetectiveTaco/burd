applyConfig = function(){
	if(config.showJoinMessages) $("#joinpart").addClass("slider_on");
	if(config.showQuitMessages) $("#quit").addClass("slider_on");
	if(config.showKickMessages) $("#kick").addClass("slider_on");
	if(config.showModeMessages) $("#mode").addClass("slider_on");
	
	$("#scrollback").val(config.scrollback);
	if(config.nickColors) $("#colornicks").addClass("slider_on");
	if(config.textColors) $("#colortext").addClass("slider_on");
	
	if(config.sounds.highlight) $("#highlight").addClass("slider_on");
	if(config.sounds.pm) $("#pmsound").addClass("slider_on");
	if(config.sounds.notice) $("#noticesound").addClass("slider_on");
}