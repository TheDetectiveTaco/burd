var mainWin = null;
var main_settings = [];
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main_window/main.html', {
    'bounds': {
      'width': 630,
      'height': 400
    },
	'id': "mainwindow",
	'minWidth': 630,
	'minHeight': 390
  }, function( e ){
  });

});
