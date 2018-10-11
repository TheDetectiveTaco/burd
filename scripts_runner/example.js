/*
	name: "Cocktography",
	version: "0.0.1",
	description: "Cocktography support for burdirc"
*/

IRC.on("dataIn", (e) => {
	/* e = {networkID, data} */
	console.log(e.data);
	//GUI.insertUserMessage();
});

IRC.on("dataOut", (e) => {
	/* e = {networkID, data} */
	console.log("SENT:" + e.data);
});