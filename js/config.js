var appVersion = "0.6.2";
var appURL = "http://burdirc.haxed.net/";
var cryptoKey = "Pizza";
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
	checkForUpdates: true,
	textPrefixes: true,
	tabnickchar: ":",
	fontSize: "15px",
	theme: "default.css",
	logs: {
		enabled: true,
		path: "%dataPath%/logs"
	},
	userCommands: [
		{ command: "action", action: "me &2" },
		{ command: "m", action: "msg &2" },
		{ command: "banlist", action: "quote MODE %c +b" },
		{ command: "sv", action: "echo You're using Burd %v" },
		{ command: "wii", action: "whois &2 &2" }
	],
	highlights: [ "%n" ],
	CTCP: {
		version: "Burd IRC http://haxed.net/burdirc",
		rateLimit: 1
	},
	ignores:[
		{type: "regex", value: "^quack123$"},
		{type: "user", value: "faketestnick!*@*"}
	],
	sounds: { highlight: true, pm: true, notice: true },
	showChannelMedia: true,
	mediaWhiteList: [
		
	],
	fileUploadService: {
		uri: "https://arxius.io/",
		fileParam: "file",
		miscParams: ["apikey=10101010101010", "example=test"]
	},
	networks: []
}


