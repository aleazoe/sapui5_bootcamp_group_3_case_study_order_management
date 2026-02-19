sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",

], (Controller, Filter, FilterOperator, Fragment, History, MessageBox) => {
    "use strict";

    return Controller.extend("com.training.group3ordermanagement.controller.EditView", {
        onInit: function () {
            this.getOwnerComponent()
                .getRouter()
                .getRoute("RouteEditPage")
                .attachPatternMatched(this._onMatched, this);

            this.getView().setModel(new sap.ui.model.json.JSONModel({
                isEdit: true
            }), "vm")

            var oModel = this.getOwnerComponent().getModel();
            oModel.setDeferredGroups(["dialogGroup"]);
            oModel.setChangeGroups({
                "Products": { groupId: "dialogGroup", changeSetId: "dialogChanges" }
            });


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

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            var oRouter = this.getOwnerComponent().getRouter();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                oRouter.navTo("DetailView", {}, true);
            }
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

        keyToStatus: function (sKey) {
            if (!sKey) return "";
            const s = String(sKey).trim().toLowerCase();

            if (s == 'createdKey') return "Created";
            if (s == 'releasedKey') return "Released";
            if (s == 'partialCompleteKey') return "Partially Completed";
            if (s == 'deliveredKey') return "Delivered";
        },

        onPressDeleteProduct: function (oEvent) {
            let oTextBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            let oTable = this.byId("productOrderTable");
            let aSelectedItems = oTable.getSelectedItems();

            // No items selected from the table 
            if (aSelectedItems.length === 0) {
                MessageBox.error(oTextBundle.getText("message.NoItems"));
                return;
            }

            let oModel = this.getOwnerComponent().getModel();
            let iCount = aSelectedItems.length;

            MessageBox.confirm(
                (iCount === 1 ? oTextBundle.getText("message.SingleItem", [iCount]) : oTextBundle.getText("message.MultipleItems", [iCount])),
                {
                    actions: [MessageBox.Action.YES,
                    MessageBox.Action.NO],

                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.YES) {

                            // Delete selected items
                            aSelectedItems.forEach(function (oItem) {
                                let sPath = oItem.getBindingContext().getPath();
                                // oModel.remove(sPath, { groupId: "dialogGroup" });
                                oModel.remove(sPath);
                            });

                            oTable.removeSelections(true);
                        }
                    }
                }
            );
        },

        onPressAddProduct: function (oEvent) {
            var oView = this.getView();

            var oBindingContext = oView.byId("editDynamicPageId").getBindingContext();
            var iDeliveringPlant = oBindingContext.getProperty("DeliveringPlantID");

            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.training.group3ordermanagement.fragment.ProductDialog",
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
            var aSelectedProducts = oEvent.getParameter("selectedContexts") || [];
            if (!aSelectedProducts.length) { return; }

            var oModel = this.getOwnerComponent().getModel();

            // Existing rows in the table (avoid duplicates)
            var oTable = this.getView().byId("productOrderTable");
            var oQtyDialog = this.getView().byId("productQtyDialog");
            var aExisting = oTable.getItems().map(it => it.getBindingContext().getProperty("ProductID"));
            var setExisting = new Set(aExisting);

            aSelectedProducts.forEach(oProdCtx => {
                var sProductId = oProdCtx.getProperty("ProductID");
                var fUnitPrice = oProdCtx.getProperty("UnitPrice"); // from Product entity
                var iQuantity = oQtyDialog.getValue();

                if (setExisting.has(sProductId)) {
                    // skip duplicates
                    return;
                }

                var oProductOrder = {
                    OrderID: this._orderId,
                    ProductID: sProductId,
                    Quantity: iQuantity,
                    UnitPrice: fUnitPrice
                }

                oModel.create("/OrderDetails", oProductOrder, { groupId: "dialogGroup" });

            });
            oTable.getBinding("items").refresh(true);

        },

        onPressSaveEdit: function (oEvent) {
            const that = this;
            var oModel = this.getOwnerComponent().getModel();
            var sOrderId = this._orderId;
            // oModel.submitChanges({groupId: "dialogGroup"})

            var oForm = this.getView().getModel();
            var sOrderPath = oForm.createKey("/Orders", {
                    OrderID: this._orderId
                });

            var sStatus = this.keyToStatus(this.getView().byId("statusEditSel").getSelectedKey());
            oModel.update(sOrderPath, {Status: sStatus}, { groupId: "dialogGroup" });


            sap.m.MessageBox.confirm("Are you sure you want to save these changes?", {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function (sAction) {
                    if (sAction === sap.m.MessageBox.Action.YES) {
                        oModel.submitChanges({
                            groupId: "dialogGroup",
                            success: () => {
                                sap.m.MessageBox.success("The Order " + sOrderId + " has been successfully updated",{
                                    onClose: function () {
                                        // oModel.update(sOrderPath, {Status: sStatus});
                                        that.onNavBack();
                                    }
                                });
                            },
                            error: function () {
                                sap.m.MessageBox.error("Save failed");
                            }
                        });
                    }
                }
            });

        },

        onPressCancelEdit: function (oEvent) {
            const that = this;
            var oModel = this.getOwnerComponent().getModel();
            oModel.resetChanges(["dialogGroup"]); // cancels queued create/update/delete

            sap.m.MessageBox.confirm("Are you sure you want to cancel the changes done in the page?", {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function (sAction) {
                    if (sAction === sap.m.MessageBox.Action.YES) {
                        oModel.resetChanges(["dialogGroup"]); // cancels queued create/update/delete
                        that.onNavBack();
                    }
                }
            });
        }
    });
});