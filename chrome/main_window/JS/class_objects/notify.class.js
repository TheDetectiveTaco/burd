var notifications = {
	callbacks: [],
	remove: function( e ){
		for( var i in this.callbacks ){
			if( this.callbacks[i].id == e ){
				this.callbacks.splice( i, 1 );
				chrome.notifications.clear( e );
				return;
			}
		}
	},
	clear: function(){
		for( var i in this.callbacks ){
			chrome.notifications.clear( this.callbacks[i].id );
		}
		this.callbacks = [];
	},
	create: function( e ){
		//{ title: "a message", message: "hi", callback: function(){} }

		//if( ui.focused ) return; /* don't show notifications if window is focused */

		var id = random.guid();
		chrome.notifications.create(id, {
			type: "basic",
			message: e.message,
			iconUrl: "../images/mdl/black/ic_notifications_black_24px.svg",
			title: e.title,
			isClickable: true
		});
		this.callbacks.push({id: id, callback: e.callback, data: e});
	},
	click: function( e ){
		for( var i in this.callbacks ){
			if( this.callbacks[i].id == e ) this.callbacks[i].callback( this.callbacks[i] );
		}
		this.remove( e );
	}
}
chrome.notifications.onClicked.addListener(function(e){
	notifications.click( e );
});