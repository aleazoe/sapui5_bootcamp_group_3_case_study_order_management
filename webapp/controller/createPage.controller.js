sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox"
], (Controller, MessageToast, History, MessageBox) => {
    "use strict";

    return Controller.extend("com.training.group3ordermanagement.controller.createPage", {
        onInit: function () {
        },

        // This function will be called once Save button in the footer is pressed
        onPressSave: function () {
            if (!this.oSaveDialog) {
                this.oSaveDialog = this.loadFragment({
                    name: "com.training.group3ordermanagement.fragment.SaveDialog"
                });
            }

            // open dialog to confirm /save the changes made
            this.oSaveDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        // This function will be called once Save button in the Save Dialog box is clicked
        onSaveDialog: function () {
            var oTextBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            var oInputRplant = this.getView().byId("idInptRplant");
            var oInputDplant = this.getView().byId("idInptDplant");
            var oInputRplantValue = oInputRplant.getValue();
            var oInputDplantValue = oInputDplant.getValue();

            // Check if receiving plant and delivering plant is blank
            if (oInputRplantValue === "" || oInputDplantValue === ""){
                // set value state to Error
                oInputRplant.setValueState("Error");
                oInputDplant.setValueState("Error");
            } else {
                oInputRplant.setValueState("None");
                oInputDplant.setValueState("None");

                MessageBox.success(
                    oTextBundle.getText("saveSuccessMsg"),
                    {
                        actions: [sap.m.MessageBox.Action.OK],
                        onClose: function (sAction) {
                            if (sAction === sap.m.MessageBox.Action.OK) {
                                document.activeElement?.blur?.();
                                this._oCreateDialog.close()
                                // calls the navigate function
                                this._navigateBack();
                            }
                        }.bind(this)
                    }
                );
            }
        },

        fnDisplayMsg: function (sMsg){
            MessageToast.show(sMsg);
        },
        
        // This function will be called once Close in the dialog box is clicked
        onCloseDialog: function (oEvent) {
            var oSource = oEvent.getSource();     // the button
            var oDialog = oSource.getParent();    
            while (oDialog && !oDialog.isA("sap.m.Dialog")) {
                oDialog = oDialog.getParent();
            }
            oDialog && oDialog.close();
        },

        onPressCancel: function () {
            if (!this.oCancelDialog) {
                this.oCancelDialog = this.loadFragment({
                    name: "com.training.group3ordermanagement.fragment.CancelDialog"
                });
            }

            // open dialog to confirm and cancel the changes made
            this.oCancelDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onCancelDialog: function () {
            var oTextBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this.fnDisplayMsg(oTextBundle.getText("cancelMsg"));
            // calls the navigate function
            this._navigateBack();
        }, 

        // This function is called when Save/ Cancel is clicked from the dialog box
        _navigateBack: function () {
            var oHistory = History.getInstance();
            var oRouter = this.getOwnerComponent().getRouter();
            // navigate back to the order main page
            if (oHistory.getPreviousHash() !== undefined) {
                window.history.go(-1);
            } else {
                oRouter.navTo("RouteOrderMainPage", {}, true);
            }
        },

        onBtnPressDeleteOrder: function () {
            let oTextBundle    = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            let oTable         = this.byId("idProductOrdr");
            let aSelectedItems = oTable.getSelectedItems();

            // No items selected from the table 
            if (aSelectedItems.length === 0) {
                MessageBox.error( oTextBundle.getText("message.NoItems") );
                return;
            }
            
            let oModel = this.getOwnerComponent().getModel();
            let iCount = aSelectedItems.length;

            MessageBox.confirm(
                (iCount === 1 ? oTextBundle.getText("message.SingleItem",[iCount]) : oTextBundle.getText("message.MultipleItems",[iCount])),
                {
                    actions: [MessageBox.Action.YES, 
                              MessageBox.Action.NO],

                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.YES) {

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
        }
    });
});