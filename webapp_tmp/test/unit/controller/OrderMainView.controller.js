/*global QUnit*/

sap.ui.define([
	"sapips/training/ordermanagement/controller/OrderMainView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("OrderMainView Controller");

	QUnit.test("I should test the OrderMainView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
