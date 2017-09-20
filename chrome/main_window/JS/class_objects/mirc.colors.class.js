/*	Parse MIRC colors by Matthew Ryan
	http://haxed.net/
*/
var colors = {
	strip: function( e ) {
		e = e.replace( /\u0003[0-9][0-9]?(,[0-9][0-9]?)?|\u0003/ig, "" );
		e = e.replace( /\u0002|\x1F|\x0F|\x11|\x1E/ig, "" );
		return e;
	},
	parse: function( e ) {
		if ( settings.channels.textColors ) {
			e = this.parseColors( e );
			e = this.parseBold( e );
			e = this.parseItalic( e );
			e = this.parseUnderline( e );
			e = this.parseStrike( e );
			e = this.parseMonospace( e );
		}
		e = this.strip( e );
		return e;
	},
	parseColors: function( e ) {
		/*  */
		var c = e.match( /\u0003[0-9][0-9]?(,[0-9][0-9]?)?/ig, "" );
		var newText = e;
		var colors = [ 
			"#FFFFFF","#000000","#000080",
			"#008000","#FF0000","#A52A2A",
			"#800080","#FFA500","#FFFF00",
			"#00FF00","#008080","#00FFFF",
			"#4169E1","#FF00FF","#808080",
			"#C0C0C0","transparent"
		];
		
		if ( c == null ) return e; /* no colors, no need to go on */
		
		var nt = 0;
		
		for ( var i in c ) {
			/* now lets loop the matches */
			var BG = 16;
			var FG = 16;
			var m = c[i].substr( 1 ).split( "," );
			if ( m.length == 2 ) BG = parseInt( m[1] );
			FG = parseInt( m[0] );
			if ( FG > 16 || BG > 16 || BG < 0 || FG < 0 ) return this.strip( e );
			BG = colors[BG];
			FG = colors[FG];
			newText = newText.replace( c[i], '<span style="color:' + FG + ';text-shadow:none;background:' + BG + '">' );
			nt += 1;
		}
		
		newText = newText.replace( /\u0003/g, "</span>" );
		var tnt = newText.match( /<\/span>/g );
		if ( tnt != null ) nt = nt - tnt.length;
		
		if ( nt < 0 ) return this.strip( e );
		
		while ( nt > 0 ) {
			nt -= 1;
			newText += "</span>";
		}
		
		if ( nt != 0 ) return this.strip( e );
		
		tnt = newText.match( /<\/?span/g );
		
		nt = 0;
		
		for ( var i in tnt ) {
			if ( tnt[i] == "<span" ) nt += 1;
			if ( tnt[i] == "</span" ) {
				if ( nt < 1 ) return this.strip( e );
				nt = nt - 1;
			}
		}

		return newText;
	},
	parseBold: function( e ) {
		var c = e.match( /\u0002/g, "" );
		var nt = 0;
		for ( var i in c ) {
			if ( nt == 0 ) {
				nt = 1;
				e = e.replace( /\u0002/, '<span style="font-weight:bold;text-shadow:none;">' );
			} else {
				nt = 0;
				e = e.replace( /\u0002/, '</span>' );
			}
		}
		if ( nt == 1 ) e += "</span>";
		return e;
	},
	parseItalic: function( e ) {
		var c = e.match( /\x1D/g, "" );
		var nt = 0;
		for ( var i in c ) {
			if ( nt == 0 ) {
				nt = 1;
				e = e.replace( /\x1D/, '<span style="font-style:italic;text-shadow:none;">' );
			} else {
				nt = 0;
				e = e.replace( /\x1D/, '</span>' );
			}
		}
		if ( nt == 1 ) e += "</span>";
		return e;
	},
	parseUnderline: function( e ) {
		var c = e.match( /\x1F/g, "" );
		var nt = 0;
		for ( var i in c ) {
			if ( nt == 0 ) {
				nt = 1;
				e = e.replace( /\x1F/, '<span style="text-decoration:underline;text-shadow:none;">' );
			} else {
				nt = 0;
				e = e.replace( /\x1F/, '</span>' );
			}
		}
		if ( nt == 1 ) e += "</span>";
		return e;
	},
	parseStrike: function( e ) {
		var c = e.match( /\x1E/g, "" );
		var nt = 0;
		for ( var i in c ) {
			if ( nt == 0 ) {
				nt = 1;
				e = e.replace( /\x1E/, '<span style="text-decoration: line-through;text-shadow:none;">' );
			} else {
				nt = 0;
				e = e.replace( /\x1E/, '</span>' );
			}
		}
		if ( nt == 1 ) e += "</span>";
		return e;
	},
	parseMonospace: function( e ) {
		var c = e.match( /\x11/g, "" );
		var nt = 0;
		for ( var i in c ) {
			if ( nt == 0 ) {
				nt = 1;
				e = e.replace( /\x11/, '<span style="font-family: Courier, Monaco, \'Ubuntu Mono\', monospace;">' );
			} else {
				nt = 0;
				e = e.replace( /\x11/, '</span>' );
			}
		}
		if ( nt == 1 ) e += "</span>";
		return e;
	}
}
