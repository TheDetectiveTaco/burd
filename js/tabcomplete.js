var tabComplete = {
	userCache: [],
	index: 0,
	process: function(){
		if(this.userCache.length == 0){
			var searchStr = $("input.channel_input:visible").val().split(" ").pop().toLowerCase();
			if(searchStr.length == 0) return;
			
			$("div.channel_users div.user:visible").each(function(){
				//tabComplete.userCache.push( $(this).text() );
				var nickText = $(this).text().toLowerCase();
				if(nickText.length > searchStr.length){
					if(nickText.substr(0,searchStr.length) == searchStr){
						tabComplete.userCache.push($(this).text());
					}
				}
			});
		}
		if(this.userCache.length == 0) return;
		this.applyNick();
	},
	applyNick: function(){
		var a = $("input.channel_input:visible").val();
		a = a.substr(0, a.lastIndexOf(" ") + 1);
		if(a == ""){
			$("input.channel_input:visible").val(a+this.userCache[this.index]+config.tabnickchar+String.fromCharCode(160));
		}else{
			$("input.channel_input:visible").val(a+this.userCache[this.index]+String.fromCharCode(160));
		}
		this.index++;
		if(this.index > this.userCache.length - 1) this.index = 0;
	},
	reset: function(ctrl,key){
		this.index = 0;
		this.userCache = [];
		if($("input.channel_input:visible").val().indexOf("\u00A0") > -1){
			$("input.channel_input:visible").val( $("input.channel_input:visible").val().replace(/\u00A0/g, " ") );
		}
	}
}

