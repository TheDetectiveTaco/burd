var config = {
	animation:200,
	scrollback: 150,
	highlights: [ "%n", "quack" ],
	networks: [
		{
			server: { host: "znc.haxed.net", port: 8080 },
			nick: "beta",
			altNick: "beta2",
			user: "sfw444f",
			realName: "Jim Bob",
			commands: ["JOIN #test"],
			SSL: false,
			reconnect: true,
			startup: false,
			auth: {
				type: "none"/* sasl_plain nickserv server_password */
			}
		}
	]
}


