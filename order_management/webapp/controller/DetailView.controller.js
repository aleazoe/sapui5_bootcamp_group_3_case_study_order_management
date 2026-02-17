sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("sapips.training.ordermanagement.controller.DetailView", {
        onInit: function () {
            this.getOwnerComponent()
                .getRouter()
                .getRoute("RouteDetailPage")
                .attachPatternMatched(this._onMatched, this);
        },

        _onMatched: function (oEvent) {
            const sOrderId = oEvent.getParameter("arguments").orderID;
            
            const sPath = "/Orders('" + sOrderId +"')";

            var oForm = this.getView().byId("orderDetailForm");
            oForm.bindElement({
                path: sPath,
                parameters: {
                expand: "ToReceivingPlant,ToDeliveringPlant"
                }
            });
            
        }
    });
});