sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment"
], (Controller, Filter, FilterOperator, History, Fragment) => {
    "use strict";

    return Controller.extend("com.training.group3ordermanagement.controller.DetailView", {
        onInit: function () {
            this.getOwnerComponent()
                .getRouter()
                .getRoute("RouteDetailPage")
                .attachPatternMatched(this._onMatched, this);

            this.getView().setModel( new sap.ui.model.json.JSONModel({
                "isEdit": false
            }), "vm")
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
                oRouter.navTo("RouteOrderMainPage", {}, true);
            }
        },

        onProductsUpdateFinished: function (oEvent) {
            var oTableTitle = this.getView().byId("productOrderTableTitle");
            var iTotalItems = oEvent.getSource().getBinding("items").getLength();

            if (typeof iTotalItems === "number") {
                oTableTitle.setText("Product (" + iTotalItems + ")");
            } 

        },

        _onMatched: function (oEvent) {
            const sOrderId = oEvent.getParameter("arguments").orderID;
            
            const sPath = "/Orders('" + sOrderId +"')";

            var oPage = this.getView().byId("detailDynamicPageId");
            oPage.bindElement({
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