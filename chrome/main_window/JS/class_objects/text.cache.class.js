var textCache = {
	cache: [],
	index: 0,
	scroll: function( up ){
		if ( this.cache.length == 0 ) return;
		if( up ) {
			this.index--;
			if( this.index < 0 ) this.index = this.cache.length - 1;
			$("input.user-input:visible").val( this.cache[ this.index ] );
		}else{
			this.index++;
			if( this.index > this.cache.length - 1 ) this.index = 0;
			$("input.user-input:visible").val( this.cache[ this.index ] );
		}
	},
	addText: function( t ){
		if( t == "" ) return;
		if( this.cache.length > 20 ) this.cache.splice( 0, 1 );
		this.cache.push( t );
	}
}