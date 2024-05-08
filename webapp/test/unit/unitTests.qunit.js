/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comsofttek/aca20241qer/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
