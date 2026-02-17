sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History"
], (Controller, Filter, FilterOperator, History) => {
    "use strict";

    return Controller.extend("sapips.training.ordermanagement.controller.DetailView", {
        onInit: function () {
            this.getOwnerComponent()
                .getRouter()
                .getRoute("RouteDetailPage")
                .attachPatternMatched(this._onMatched, this);
        },

        onProductsUpdateFinished: function (oEvent) {
            var oTable = oEvent.getSource();
            var iTotalItems = oTable.getBinding("items").getLength();

            if (typeof iTotalItems === "number") {
                oTable.setHeaderText("Product (" + iTotalItems + ")");
            } 

        },

        onPressEdit: function () {
            var sOrderId = this._orderId;

            var oRouter = this.getOwnerComponent().getRouter();

            oRouter.navTo("RouteEditPage", {
                orderID: encodeURIComponent(sOrderId)
            });
        },

        onPressCancel: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            var oRouter = this.getOwnerComponent().getRouter();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                oRouter.navTo("RouteOrderMainView", {}, true);
            }
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

            this._orderId = sOrderId;
            this._filterProductsByOrderID(sOrderId);
        },
        
        _filterProductsByOrderID: function (sOrderId) {
            var oTable = this.getView().byId("productOrderTable");

            if (sOrderId) {
                var aFilter = [
                    new Filter("OrderID", FilterOperator.EQ, sOrderId)
                ];
            }

            var oBindingContext = oTable.getBinding("items");
            oBindingContext.filter(aFilter);
        }
    });
});