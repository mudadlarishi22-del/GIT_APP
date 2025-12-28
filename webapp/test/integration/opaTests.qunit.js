/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["gitapp/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
