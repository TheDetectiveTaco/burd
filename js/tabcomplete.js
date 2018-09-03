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
		if(a.substr(0,1) == "/"){
			$("input.channel_input:visible").val(a+this.userCache[this.index]);
		}else{
			$("input.channel_input:visible").val(a+this.userCache[this.index]+config.tabnickchar);
		}
		this.index++;
		if(this.index > this.userCache.length - 1) this.index = 0;
	},
	reset: function(){
		this.index = 0;
		this.userCache = [];
	}
}

