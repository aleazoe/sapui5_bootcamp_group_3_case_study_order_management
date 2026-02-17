sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("sapips.training.ordermanagement.controller.OrderMainView", {
        onInit() {
        },

        onPressOrderItem: function (oEvent) {
            var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
            var oBindingContext = oItem.getBindingContext();
            var sOrderId = oBindingContext.getProperty("OrderID");

            var oRouter = this.getOwnerComponent().getRouter();

            oRouter.navTo("RouteDetailPage", {
                orderID: encodeURIComponent(sOrderId)
            });
        }
    });
});
