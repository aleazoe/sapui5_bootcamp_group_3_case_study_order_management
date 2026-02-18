sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
], (Controller, Filter, FilterOperator, Fragment) => {
    "use strict";

    return Controller.extend("sapips.training.ordermanagement.controller.EditView", {
        onInit: function () {
            this.getOwnerComponent()
                .getRouter()
                .getRoute("RouteEditPage")
                .attachPatternMatched(this._onMatched, this);

            this.getView().setModel(new sap.ui.model.json.JSONModel({
                isEdit: true
            }), "vm")

        },

        _onMatched: function (oEvent) {
            const sOrderId = oEvent.getParameter("arguments").orderID;

            const sPath = "/Orders('" + sOrderId + "')";

            var oPage = this.getView().byId("editDynamicPageId");
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
        },

        onSelectionChange: function (oEvent) {
            var oTable = oEvent.getSource();
            var oTableTitle = this.getView().byId("productOrderTableTitle");
            var iTotalItems = oTable.getSelectedItems().length;

            if (typeof iTotalItems === "number") {
                oTableTitle.setText("Product (" + iTotalItems + ")");
            }
        },

        statusToKey: function (sStatus) {
            if (!sStatus) return "";

            const s = String(sStatus).trim().toLowerCase();

            if (s == 'created') return 'createdKey';
            if (s == 'released') return 'releasedKey';
            if (s == 'partially completed') return 'partialCompleteKey';
            if (s == 'delivered') return 'deliveredKey';
        },

        onPressAddProduct: function (oEvent) {
            var oView = this.getView();

            var oBindingContext = oView.byId("editDynamicPageId").getBindingContext();
            const iDeliveringPlant = oBindingContext.getProperty("DeliveringPlantID");

            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "sapips.training.ordermanagement.fragment.ProductDialog",
                    controller: this
                }).then(function (oDialog) {
                    oDialog.setModel(oView.getModel());
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }


            this._pDialog.then(function (oDialog) {
                // Configuration
                oDialog.getBinding("items").filter([]);
                oDialog.setMultiSelect(true);

                var oBinding = oDialog.getBinding("items");

                // Defensive: if binding isn't created yet, 
                // force it by calling getBinding after dialog is in DOM
                if (!oBinding) {
                    oDialog.open();        // crete binding
                    oDialog.close();       // close immediately
                } else {

                    if (iDeliveringPlant !== undefined && iDeliveringPlant !== null && iDeliveringPlant !== "") {
                        var aFilter = [
                            new Filter("DeliveringPlantID", FilterOperator.EQ, iDeliveringPlant)
                        ];

                        // Show busy while fetching new filtered results
                        oDialog.setBusy(true);

                        // Wait for the new data, then open
                        oBinding.attachEventOnce("dataReceived", function () {
                            oDialog.setBusy(false);
                            oDialog.open();
                        });

                        // Trigger request
                        oBinding.filter(aFilter, "Application");
                    }
                }
            });

        },

        onSearchProduct: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter({
                path: "ProductName",
                operator: FilterOperator.Contains,
                value1: sValue,
                caseSensitive: false
            });
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },

        onDialogClose: function (oEvent) {
            var aProducts = oEvent.getParameter("selectedContexts");

            oEvent.getSource().getBinding("items").filter([]);
        },

        onProductDialogConfirm: function (oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts") || [];
            if (!aContexts.length) { return; }

            var oModel = this.getView().getModel();

            // Get OrderID from the view binding context
            // const oOrderCtx = oView.getBindingContext();
            // const sOrderId = oOrderCtx.getProperty("OrderID");
            var sOrderId = this._orderId;

            // Existing rows in the table (avoid duplicates)
            const oTable = this.getView().byId("productOrderTable");
            const aExisting = oTable.getItems().map(it => it.getBindingContext().getProperty("ProductID"));
            const setExisting = new Set(aExisting);

            aContexts.forEach(oProdCtx => {
                const sProductId = oProdCtx.getProperty("ProductID");
                const fUnitPrice = oProdCtx.getProperty("UnitPrice"); // from Product entity

                if (setExisting.has(sProductId)) {
                    // Option: skip duplicates OR show message
                    // sap.m.MessageToast.show(`Product ${sProductId} already added`);
                    return;
                }

                // Create a pending OrderDetail entry (not saved yet)
                oModel.create("/OrderDetails", {
                    properties: {
                        OrderID: '012204',
                        ProductID: sProductId,
                        Quantity: 0,           // required user input
                        UnitPrice: fUnitPrice  // optional prefill
                    },
                    success: function (data) {},
                    error: function (data) {}
                });

                // this.getView().byId("productOrderTable").setBindingContext(oEntryCtx);

                // If your table is bound to /OrderDetails, the created entry will appear
                // once the binding refreshes (often automatic). If not:
                oTable.getBinding("items").refresh();
            });

            // Close and reset search
            // const oDialog = oEvent.getSource();
            // oDialog.setSearchValue("");
            // oDialog.close();

            // Optional: scroll to end and focus the last quantity input
            // setTimeout(() => this._focusLastQuantityInput(), 0);
        },
    });
});