sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/training/group3ordermanagement/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], (Controller, formatter, JSONModel, MessageBox, History) => {
    "use strict";

    return Controller.extend("com.training.group3ordermanagement.controller.OrderMainPage", {
        /*
         * Call formatter functions from formatter.js
        **/
        formatter: formatter,
        /*
         * This function is called before the view is displayed 
         * It sets the values for the Status field
        **/
        onInit() {
            let oTextBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            let oStatus = {
                Statuses: [ 
                    { key: "Created",             text: oTextBundle.getText("status.Created") },
                    { key: "Released",            text: oTextBundle.getText("status.Released") },
                    { key: "Partially Completed", text: oTextBundle.getText("status.PartiallyCompleted") },
                    { key: "Delivered",           text: oTextBundle.getText("status.Delivered") },
                ]};

            let oModel = new JSONModel(oStatus);
            this.getView().setModel(oModel, "status");
        },
        /*
         * This function is called when the Go button is clicked 
         * It filters the table based on Order Number, Creation Date and Status
        **/
        onBtnPressApplyFilter: function () {
            let oTable   = this.byId("idOrdersTable");
            let oBinding = oTable.getBinding("items");
            let aFilters = [];

            // Filter by Order Number
            let sOrderNo = this.byId("idOrdNoInpt").getValue();

            // Check if Order Number is not initial 
            if (sOrderNo) {
                aFilters.push(new sap.ui.model.Filter(
                    "OrderID",
                    sap.ui.model.FilterOperator.Contains,
                    sOrderNo
                ));
            }

            // Filter by Creation Date
            let oDateRange = this.byId("idCreDtDtRngSel");
            let dDateFrom  = oDateRange.getDateValue();
            let dDateTo    = oDateRange.getSecondDateValue();

            // Check if both Date From and Date To are not initial 
            if (dDateFrom && dDateTo) {
                // Convert dates to YYYY-MM-DD format
                let sDateFrom = dDateFrom.toISOString().slice(0,10);
                let sDateTo   = dDateTo.toISOString().slice(0,10);

                aFilters.push(new sap.ui.model.Filter({
                    path: "CreationDate",
                    operator: sap.ui.model.FilterOperator.BT,
                    value1: sDateFrom,
                    value2: sDateTo
                }));
            }

            // Filter by Status
            let sStatus = this.byId("idStatusComBox").getSelectedKey();

            // Check if Status is not initial 
            if (sStatus) {
                aFilters.push(new sap.ui.model.Filter(
                    "Status",
                    sap.ui.model.FilterOperator.EQ,
                    sStatus
                ));
            }

            // Apply filters
            oBinding.filter(aFilters);
        },
        /*
         * This function is called when the Clear button is clicked 
         * It clears the filters set on Order Number, Creation Date and Status and resets the table
        **/
        onBtnPressClearFilter: function () {
            // Clear Order Number
            this.byId("idOrdNoInpt").setValue("");

            // Clear Creation Date
            this.byId("idCreDtDtRngSel").setValue("");

            // Clear Status
            this.byId("idStatusComBox").setSelectedKey("");

            // Reset Table
            let oTable   = this.byId("idOrdersTable");
            let oBinding = oTable.getBinding("items");
            oBinding.filter([]);
        },
        /*
         * This function is called after the Orders table finishes loading or updating
         * It updates the table title based on the number of displayed orders
        **/
        onOrdersUpdateFinished: function (oEvent) {
            // Get the total number of orders 
            let iTotal = oEvent.getParameter("total");

            let oTextBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            let sTitle      = oTextBundle.getText("main.title.Orders");

            // Set the table title with the total number of orders
            if (iTotal > 0) {
                sTitle += " (" + iTotal + ")";
            }

            this.byId("idOrdersTtl").setText(sTitle);
        },
        /*
         * This function is called when the Delete button is clicked
         * It deletes the selected order(s) from the table
        **/
        onBtnPressDeleteOrder: function () {
            let oTextBundle    = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            let oTable         = this.byId("idOrdersTable");
            let aSelectedItems = oTable.getSelectedItems();

            // No items selected from the table 
            if (aSelectedItems.length === 0) {
                sap.m.MessageBox.error( oTextBundle.getText("message.NoItems") );
                return;
            }
            
            let oModel = this.getOwnerComponent().getModel();
            let iCount = aSelectedItems.length;

            sap.m.MessageBox.confirm(
                (iCount === 1 ? oTextBundle.getText("message.SingleItem",[iCount]) : oTextBundle.getText("message.MultipleItems",[iCount])),
                {
                    actions: [sap.m.MessageBox.Action.YES, 
                              sap.m.MessageBox.Action.NO],

                    onClose: function (sAction) {
                        if (sAction === sap.m.MessageBox.Action.YES) {

                            // Delete selected items
                            aSelectedItems.forEach(function (oItem) {
                                let sPath = oItem.getBindingContext().getPath();
                                oModel.remove(sPath);
                            });

                            oTable.removeSelections(true);
                        }
                    }
                }
            );
        },
        /*
        * This function is called when the Plus Icon (Create Button) is clicked
        * It navigates to the Create Page
        **/
        onBtnPressCreateOrder: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            var oRouter = this.getOwnerComponent().getRouter();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                // Navigate to Create Page
                oRouter.navTo("RouteCreatePage", {}, true);
            }
        }
    });
});