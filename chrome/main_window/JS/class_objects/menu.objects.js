/* Menu Objects */
var menu = {
	switcherObject: function( e ) {
		var sock = getSocketByID( e.parent().parent().attr( "socket" ) );
		var currentChannel = base64.decode( $( "div.channel:visible" ).attr( "channel" ) );
		var selectedChannel = base64.decode( e.attr( "channel" ) );
		var title = e.text();
		var r = [
				{
					name: "<div style=\"font-weight:bold;\">" + HTMLParser.stringify( e.text() ) + "</div>",
					enabled:true,
					icon: false,
					subMenu: false,
					callback: function(){}
				},
				{
					name: "-"
				},
				{
					name: "Close",
					enabled:true,
					icon: '../../images/mdl/white/ic_speaker_notes_off_white_24px.svg',
					subMenu: false,
					key: "Esc",
					callback: function(){
						switch( e.attr( "type" ) ){
							case "0":
								/* network console */
								ui.ask.show( "Closing the network console will remove all items related to the server, are you sure you want to do this?", function( a ){
									if( a ){
										//sock.send( "QUIT :Burd IRC ( haxed.net )" );
										channel.remove.server( sock );
									}
								});
								break;
								
							case "1":
								/* channel */
								switcher.find( e.parent().parent().attr( "socket" ), base64.decode( e.attr("channel") ) ).close();
								sock.send( "PART " + base64.decode( e.attr("channel") ) + " :" + app.versionString );
								break;
								
							default:
								switcher.find( e.parent().parent().attr( "socket" ), base64.decode( e.attr("channel") ) ).close();
								break;
						}
					}
				}
			];
			if ( e.attr( "type" ) == "0" ) {
				/* network console */
				r.push(
					{
						name: "-"
					},
					{
						name: "Send a PM...",
						enabled:true,
						icon: '../../images/mdl/white/ic_person_white_24px.svg',
						subMenu: false,
						callback: function(){
							ui.input.show("Type a nick to start a PM with", "", "../../images/mdl/white/ic_person_white_24px.svg", function(e){
								if( e == "" ) return;
								channel.create( "pm", { socketID: sock.socketID, user: e + "!_@_"} );
							});
						}
					},
					{
						name: "Join a Channel...",
						enabled:true,
						icon: '../../images/mdl/white/ic_people_white_24px.svg',
						subMenu: false,
						callback: function(){
							ui.input.show("Type a channel name to join", "#", "../../images/mdl/white/ic_people_white_24px.svg", function(e){
								if( e == "" ) return;
								sock.send( "JOIN " + e );
							});
						}
					},
					{
						name: "Change Nick...",
						enabled:true,
						icon: '../../images/mdl/white/ic_mode_edit_white_24px.svg',
						subMenu: false,
						callback: function(){
							ui.input.show("Type a new nick", "", "../../images/mdl/white/ic_mode_edit_white_24px.svg", function(e){
								if( e == "" ) return;
								sock.send( "NICK " + e );
							});
						}
					},
					{
						name: "Set Away...",
						enabled:true,
						icon: '../../images/mdl/white/ic_notifications_paused_white_24px.svg',
						subMenu: false,
						callback: function(){
							ui.input.show("Type a new away message (blank to clear)", "", "../../images/mdl/white/ic_notifications_paused_white_24px.svg", function(e){
								sock.send( "AWAY :" + e );
							});
						}
					}
				);
			}else if ( e.attr( "type" ) == "1" ) {
				/* channel */
				r.push(
					{
						name: "Rejoin",
						enabled:true,
						icon: '../../images/mdl/white/ic_sync_white_24px.svg',
						subMenu: false,
						callback: function(){
							sock.send( "PART " + selectedChannel );
							sock.send( "JOIN " + selectedChannel );
						}
					},
					{
						name: "-"
					},
					{
						name: "Invite User...",
						enabled:true,
						icon: '../../images/mdl/white/ic_person_add_white_24px.svg',
						subMenu: false,
						callback: function(){
							ui.input.show( "Enter the nick to invite", "", "../../images/mdl/white/ic_person_add_white_24px.svg", function(e){
								if( e ) {
									sock.send("INVITE " + e + " " + selectedChannel );
									channel.current( sock.socketID ).add.info("Invited " + e + " to join " + selectedChannel );
								}
							});
						}
					},
					{
						name: "Change Topic...",
						enabled:true,
						icon: '../../images/mdl/white/ic_mode_edit_white_24px.svg',
						subMenu: false,
						callback: function(){
							ui.input.show( "Edit channel topic", channel.find( sock.socketID, selectedChannel ).obj.find( "div.channel-topic" ).text(), "../../images/mdl/white/ic_mode_edit_white_24px.svg", function(e){
								if( e ) {
									sock.send( "TOPIC " + selectedChannel + " :" + e );
									channel.find( sock.socketID, selectedChannel )
								}
							});
						}
					},
					{
						name: "-"
					},
					{
						name: "Set Modes",
						enabled:true,
						icon: '../../images/mdl/white/ic_assistant_photo_white_24px.svg',
						subMenu: [
							{
								name: "Invite Only",
								enabled:true,
								icon: false,
								subMenu: false,
								callback: function(){
									sock.send("MODE " + selectedChannel + " +i" );
								}
							},
							{
								name: "Moderated",
								enabled:true,
								icon: false,
								subMenu: false,
								callback: function(){ sock.send("MODE " + selectedChannel + " +m" ); }
							},
							{
								name: "Secret",
								enabled:true,
								icon: false,
								subMenu: false,
								callback: function(){ sock.send("MODE " + selectedChannel + " +s" ); }
							},
							{
								name: "Lock Topic",
								enabled:true,
								icon: false,
								subMenu: false,
								callback: function(){ sock.send("MODE " + selectedChannel + " +t" ); }
							}
						],
						callback: function(){
						}
					}
					
				);
			}else if ( e.attr( "type" ) == "2" ) {
				/* a user */
				r.push(
					{
						name: "-"
					},
					{
						name: "Whois",
						enabled:true,
						icon: '../../images/mdl/white/ic_folder_shared_white_24px.svg',
						subMenu: false,
						callback: function(){
							sock.send( "WHOIS " + selectedChannel );
						}
					},
					{
						name: "Ignore",
						enabled:true,
						icon: '../../images/mdl/white/ic_notifications_off_white_24px.svg',
						subMenu: false,
						callback: function(){
							sock.send( "WHOIS " + selectedChannel );
						}
					},
					{
						name: "Copy Information",
						enabled:true,
						icon: '../../images/mdl/white/ic_content_copy_white_24px.svg',
						subMenu: [
							{
								name: "Nickname",
								enabled:true,
								icon: false,
								subMenu: false,
								callback: function(){
									whoCaptureState = 1;
									sock.send( "WHO " + selectedChannel );
								}
							},
							{
								name: "Username",
								enabled:true,
								icon: false,
								subMenu: false,
								callback: function(){
									whoCaptureState = 2;
									sock.send( "WHO " + selectedChannel );
								}
							},
							{
								name: "Hostmask",
								enabled:true,
								icon: false,
								subMenu: false,
								callback: function(){
									whoCaptureState = 3;
									sock.send( "WHO " + selectedChannel );
								}
							}
						],
						callback: function(){}
					}
				);
			}
		return r;
	},
	chatUser: function( user, sockID ){
		var currentChannel = base64.decode( $( "div.channel:visible" ).attr( "channel" ) );
		return [
			{
				name: "<div style=\"font-weight:bold;\">" + HTMLParser.stringify( user ) + "</div>",
				enabled:true,
				icon: false,
				subMenu: false,
				callback: function(){
				
				}
			},
			{
				name: "-"
			},
			{
				name: "Send a Message",
				enabled:true,
				icon: '../../images/mdl/white/ic_person_white_24px.svg',
				subMenu: false,
				callback: function(){
					channel.create( "pm", { socketID: sockID, user: user} );
					switcher.find( sockID, user  ).show();
				}
			},
			{
				name: "Whois",
				enabled:true,
				icon: '../../images/mdl/white/ic_folder_shared_white_24px.svg',
				subMenu: false,
				callback: function(){
					getSocketByID( sockID ).send( "WHOIS " + user );
				}
			},
			{
				name: "Ignore",
				enabled:true,
				icon: '../../images/mdl/white/ic_notifications_off_white_24px.svg',
				subMenu: false,
				callback: function(){
					if( ignore.matchUser( user + "!*@*" ) ){
						parseInput( {object: $("div.channel:visible"), input: "/unignore " + user, socketID: sockID}  );
					}else{
						parseInput( {object: $("div.channel:visible"), input: "/ignore " + user, socketID: sockID}  );
					}
				}
			},
,
			{
				name: "Copy Information",
				enabled:true,
				icon: '../../images/mdl/white/ic_content_copy_white_24px.svg',
				subMenu: [
					{
						name: "Nickname",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							whoCaptureState = 1;
							getSocketByID( sockID ).send( "WHO " + user );
						}
					},
{
						name: "Username",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							whoCaptureState = 2;
							getSocketByID( sockID ).send( "WHO " + user );
						}
					},
					{
						name: "Hostmask",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							whoCaptureState = 3;
							getSocketByID( sockID ).send( "WHO " + user );
						}
					}
				],
				callback: function(){}
			},
			{
				name: "-"
			},
			{
				name: "CTCP",
				enabled:true,
				icon: '../../images/mdl/white/ic_compare_arrows_white_24px.svg',
				subMenu: [
					{
						name: "Version",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							getSocketByID( sockID ).send( "PRIVMSG " + user + " :\x01VERSION\x01" );
						}
					},
{
						name: "Ping",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							getSocketByID( sockID ).send( "PRIVMSG " + user + " :\x01PING " + Date.now() + "\x01" );
						}
					},
					{
						name: "Time",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							getSocketByID( sockID ).send( "PRIVMSG " + user + " :\x01TIME\x01" );
						}
					},
					{
						name: "Slap",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							//getSocketByID( sockID ).send( "PRIVMSG " + currentChannel + (" :{1}ACTION slaps " + user + " around a bit with an electric eel!{1}").replace(/\{1\}/g, String.fromCharCode(1)) );
							$("input.user-input:visible").val( "/me slaps " + user + " around a bit with an electric eel!" ).focus();
							$("body").trigger( $.Event( 'keydown', { key: "Enter" } ) );
						}
					},
					{
						name: "Custom",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							$("input.user-input:visible").val( "/ctcp " + user + " " ).focus();
						}
					}
				],
				callback: function(){
				
				}
			},
			{
				name: "-"
			},
			{
				name: "Operator Actions",
				enabled:true,
				icon: '../../images/mdl/white/ic_gavel_white_24px.svg',
				subMenu: [
					{
						name: "Give op (+o)",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							getSocketByID( sockID ).send( "MODE " + currentChannel + " +o " + user );
						}
					},
{
						name: "Remove op (-o)",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							getSocketByID( sockID ).send( "MODE " + currentChannel + " -o " + user );
						}
					},
					{ name: "-" },
					{
						name: "Give voice (+v)",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							getSocketByID( sockID ).send( "MODE " + currentChannel + " +v " + user );
						}
					},
					
					{
						name: "Remove voice (-v)",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							getSocketByID( sockID ).send( "MODE " + currentChannel + " -v " + user );
						}
					},
					{ name: "-" },
					{
						name: "Kick user",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							getSocketByID( sockID ).send( "KICK " + currentChannel + " " + user );
						}
					},
					{
						name: "Kick/Ban user",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							whoCaptureState = 5;
							getSocketByID( sockID ).send( "WHO " + user );
							getSocketByID( sockID ).send( "KICK " + currentChannel + " " + user );
						}
					},
					{ name: "-" },
					{
						name: "Ban user (*!*@domain)",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							whoCaptureState = 4;
							getSocketByID( sockID ).send( "WHO " + user );
						}
					},
					{
						name: "Ban user (*!user@domain)",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){
							whoCaptureState = 5;
							getSocketByID( sockID ).send( "WHO " + user );
						}
					}
				],
				callback: function(){
				
				}
			}
		]
	},
	usersHere: function(){
		var sock = getSocketByID( $( "div.channel:visible" ).attr( "socket" ) );
		var lists = ["b"];
		var rMenu = [];
		if( sock.serverProperties().CHANMODES != undefined ){
			lists = sock.serverProperties().CHANMODES.split(",")[0].split("");
		}
		for( var i in lists ){
			var item = lists[i];
			rMenu.push({
				name: "View +" + item + " list",
				enabled:true,
				icon: false,
				subMenu: false,
				callback: function(e){
					var m = e.name.split(" ")[1];
					sock.send( "MODE " + base64.decode( $("div.channel:visible").attr("channel") ) + " " + m );
				}
			});
		}
		return rMenu;
	},
	addToChat: function(){
		var i = $("input.user-input:visible");
		return [
			{
				name: "Add emoji",
				enabled:true,
				icon: "../../images/mdl/white/ic_insert_emoticon_white_24px.svg",
				subMenu: false,
				callback: function(){
					$("div#smile").fadeIn( settings.ui.animation );
					$("div#smile").css("top", ($("div.smile:visible").position().top-150) + "px");
					$("div#smile").css("left", ($("div.smile:visible").position().left-250) + "px");
				}
			},
			{
				name: "Add Bold",
				enabled:true,
				icon: "../../images/mdl/white/ic_format_bold_white_24px.svg",
				subMenu: false,
				callback: function(){
					i.val( i.val() + "\u0002" ).focus();
				}
			},
			{
				name: "Add Italic",
				enabled:true,
				icon: "../../images/mdl/white/ic_format_italic_white_24px.svg",
				subMenu: false,
				callback: function(){
					i.val( i.val() + "\x1D" ).focus();
				}
			},
			{
				name: "Add Underline",
				enabled:true,
				icon: "../../images/mdl/white/ic_format_underlined_white_24px.svg",
				subMenu: false,
				callback: function(){
					i.val( i.val() + "\x1F" ).focus();
				}
			},
			{
				name: "Add color",
				enabled:true,
				icon: "../../images/mdl/white/ic_format_color_text_white_24px.svg",
				subMenu: [
					{
						name: "White",
						enabled:true,
						icon: "../../images/colors/white.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u00030" ).focus() }
					},
					{
						name: "Black",
						enabled:true,
						icon: "../../images/colors/black.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u00031" ).focus() }
					},
					{
						name: "Navy",
						enabled:true,
						icon: "../../images/colors/navy.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u00032" ).focus() }
					},
					{
						name: "Green",
						enabled:true,
						icon: "../../images/colors/green.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u00033" ).focus() }
					},
					{
						name: "Red",
						enabled:true,
						icon: "../../images/colors/red.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u00034" ).focus() }
					},
					{
						name: "Brown",
						enabled:true,
						icon: "../../images/colors/brown.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u00035" ).focus() }
					},
					{
						name: "Purple",
						enabled:true,
						icon: "../../images/colors/purple.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u00036" ).focus() }
					},
					{
						name: "Orange",
						enabled:true,
						icon: "../../images/colors/orange.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u00037" ).focus() }
					},
					{
						name: "Yellow",
						enabled:true,
						icon: "../../images/colors/yellow.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u00038" ).focus() }
					},
					{
						name: "Light Green",
						enabled:true,
						icon: "../../images/colors/lightgreen.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u00039" ).focus() }
					},
					{
						name: "Teal",
						enabled:true,
						icon: "../../images/colors/teal.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u000310" ).focus() }
					},
					{
						name: "Aqua",
						enabled:true,
						icon: "../../images/colors/aqua.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u000311" ).focus() }
					},
					{
						name: "Blue",
						enabled:true,
						icon: "../../images/colors/blue.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u000312" ).focus() }
					},
					{
						name: "Pink",
						enabled:true,
						icon: "../../images/colors/pink.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u000313" ).focus() }
					},
					{
						name: "Gray",
						enabled:true,
						icon: "../../images/colors/gray.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u000314" ).focus() }
					},
					{
						name: "Light gray",
						enabled:true,
						icon: "../../images/colors/lightgray.png",
						subMenu: false,
						callback: function(){ i.val( i.val() + "\u000315" ).focus() }
					}
					
				],
				callback: function(){}
			}
		]
	},
	hamburger: function(){
		var sock = $( "div.channel:visible" ).attr( "socket" );
		return [
			{
				name: "Network List...",
				key: "Ctrl+N",
				enabled:true,
				icon: "../../images/mdl/white/ic_view_list_white_24px.svg",
				subMenu: false,
				callback: function(){
					ui.html.show( "network_list" );
				}
			},

			{
				name: "-"
			},

			{
				name: "Settings...",
				key: "Ctrl+S",
				enabled:true,
				icon: "../../images/mdl/white/ic_settings_white_24px.svg",
				subMenu: false,
				callback: function(){
					ui.html.show( "settings_window" );
				}
			},
			
			{
				name: "-"
			},

			
			{
				name: "New Private Message...",
				enabled:true,
				icon: "../../images/mdl/white/ic_person_white_24px.svg",
				subMenu: false,
				callback: function(){
					ui.input.show("Type a nick to start a PM with", "", "../../images/mdl/white/ic_person_white_24px.svg", function(e){
						if( e == "" ) return;
						channel.create( "pm", { socketID: sock, user: e + "!_@_"} );
					});
				}
			},

			{
				name: "New Channel...",
				enabled:true,
				icon: "../../images/mdl/white/ic_people_white_24px.svg",
				subMenu: false,
				callback: function(){
					ui.input.show("Type a channel name to join", "#", "../../images/mdl/white/ic_people_white_24px.svg", function(e){
						if( e == "" ) return;
						var s = getSocketByID( sock );
						if( s ) {
							s.send( "JOIN " + e );
						}
					});
				}
			},

			{
				name: "-"
			},

			{
				name: "Scripts",
				enabled:true,
				icon: "../../images/mdl/white/ic_extension_white_24px.svg",
				subMenu: [
					{
						name: "Load script",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){}
					},
					{
						name: "Remove script...",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){}
					},
					{
						name: "-"
					}
				],
				callback: function(){}
			},
			{
				name: "-"
			},
			{
				name: "Help",
				enabled:true,
				icon: "../../images/mdl/white/ic_local_hospital_white_24px.svg",
				subMenu: [
					{
						name: "About...",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){ ui.html.show( "about" ); }
					},
					{
						name: "Keyboard Shortcuts...",
						enabled:true,
						icon: false,
						subMenu: false,
						callback: function(){ ui.html.show( "shortcuts" ); }
					}
				],
				callback: function(){}
			}
		];
	},

	savedNetworks: function(){
		return [
			{
				name: "-"
			},
			{
				name: "Save this",
				enabled:true,
				icon: false,
				subMenu: false,
				callback: function(){}
			}
		];
	},
	
	Help: [
		{
			name: "About...",
			enabled:true,
			icon: "images/menu_icons/info.png",
			subMenu: false,
			key: "Ctrl+M",
			callback: function(){
				ui.html.show( "about" );
			}
		},
		{
			name: "Keyboard Shortcuts...",
			enabled:true,
			icon: "images/menu_icons/key_k.png",
			subMenu: false,
			key: "",
			callback: function(){
			
			}
		}
	],
	
	IRC: [
		{
			name: "New Network...",
			enabled:true,
			icon: "images/menu_icons/network_list.png",
			subMenu: false,
			key: "Ctrl+N",
			callback: function(){
				ui.html.show( "network_list" );
			}
		},
		{
			name: "Scripts...",  enabled:true,
			icon: "images/menu_icons/script.png",
			subMenu: false,
			key: false,
			callback: function(){
				ui.scripts.show();
			}
		},
		{
			name: "Quit",  enabled:true,
			icon: "images/menu_icons/disconnect.png",
			subMenu: false,
			key: "Ctrl+Q",
			callback: function(){
			
			}
		},
		{ name: "-" }
	]
}