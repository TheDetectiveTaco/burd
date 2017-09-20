var HTMLParser = {
	emojiPattern: /([\uD800-\uDBFF][\uDC00-\uDFFF])/g,
	html: {
		/**/userQuitText: '<div class="message quit-message"><div class="time">[%time%]</div><div class="name">&lsaquo;- <b>%nick%</b></div><div class="message-text">(%onick%) has quit (%message%)</div><div style="height:1px;clear:both;">&nbsp;</div></div>',
		
		/**/userLeftText: '<div class="message part-message"><div class="time">[%time%]</div><div class="name">&lsaquo;- <b>%nick%</b></div><div class="message-text">(%onick%) has left (%message%)</div><div style="height:1px;clear:both;">&nbsp;</div></div>',
		
		/**/userJoinedText: '<div class="message join-message"><div class="time">[%time%]</div><div class="name">-&rsaquo; <b>%nick%</b></div><div class="message-text">(%onick%) has joined</div><div style="height:1px;clear:both;">&nbsp;</div></div>',
		
		/**/addUserImage: '<img src="images/placeholder.gif" guid="%guid%" style="max-width:90%;max-height:400px"><div class="image-meta"><a href="%link%">%link%</a> [<a href="removeimg:%guid%">remove</a>]</div>',
		
		/**/addUserText: '<div class="message %style%"><div class="time">[%time%]</div><div class="name" tooltip="%onick%">&lsaquo;<b class="menu-nick" style="color:%color%">%nick%</b>&rsaquo;</div><div class="message-text">%message%</div><div style="height:1px;clear:both;">&nbsp;</div></div>',
		
		/**/addUserNotice: '<div class="message"><div class="time">[%time%]</div><div class="name"><b class="notice">* NOTICE:</b></div><div class="message-text"><div class="notice-text">%message%</div><div class="notice-meta">from <b>%nick%</b> to <b>%to%</b></div></div><div style="height:1px;clear:both;">&nbsp;</div></div>',
		
		/**/addActionText: '<div class="message action-message"><div class="time">[%time%]</div><div class="name">&nbsp;*&nbsp;<b onick="%onick%" class="menu-nick">%nick%</b>&nbsp;</div><div class="message-text">%message%</div><div style="height:1px;clear:both;">&nbsp;</div></div>',
		
		/**/addText: '<div class="message"><div class="time">[%time%]</div><div class="name">-&rsaquo;</div><div class="message-text">%message%</div><div style="height:1px;clear:both;">&nbsp;</div></div>',
		
		/**/addInfo: '<div class="message info"><div class="time">[%time%]</div><div class="name">&nbsp;</div><div class="message-text">%message%</div><div style="height:1px;clear:both;">&nbsp;</div></div>'
		
	},
	stringify: function( e ) {
		e = e.replace(/\&/ig, "&amp;");
		e = e.replace(/\</ig, "&lt;");
		return e;
	},
	parseAttr: function( e ) {
		return e.replace(/\"/ig, "&quot;").replace(/\'/ig, "&apos;");
	},
	linkify: function(inputText) {


		/* http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links */
		var replacedText, replacePattern1, replacePattern2, replacePattern3;
		replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
		replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

		replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

		if(replacedText.indexOf("<a")<0){
			replacePattern3 = /([#][#&!\.\_a-zA-Z1-9]{1,50})/gi;
			replacedText = replacedText.replace(replacePattern3, '<a href="channel:$1">$1</a>');
		}
		


		return replacedText;
	},
	parse: function( d, e ){
		/*
			HTMLParser.parse( HTMLObject, { time: "12:12:12", message: "your mom"  } )
		*/
		
		for( var i in e ) {
			var re = new RegExp( "\\%" + i + "\\%" , "ig" );
			d = d.replace( re, e[i] );
		}
		return d;
	}
}