var appVersion = "0.03";
var config = {
	animation:200,
	scrollback: 150,
	showJoinMessages: true,
	showQuitMessages: true,
	showPartMessages: true,
	showKickMessages: true,
	showModeMessages: true,
	nickColors: true,
	textColors: true,
	logging: true,
	checkForUpdates: true,
	cryptoKey: "Pizza",
	userCommands: [
		{ command: "action", action: "me &2" },
		{ command: "m", action: "msg &2" },
		{ command: "banlist", action: "quote MODE %c +b" },
		{ command: "sv", action: "echo You're using Burd %v" },
		{ command: "wii", action: "whois &2 &2" }
	],
	highlights: [ "%n", "quack" ],
	CTCP: {
		version: "Burd IRC http://haxed.net/burd",
		rateLimit: 1
	},
	ignores:[
		{type: "regex", value: "^quack123$"},
		{type: "user", value: "test!*@*"}
	],
	sounds: { highlight: true, pm: true, notice: true },
	networks: [

	]
}


