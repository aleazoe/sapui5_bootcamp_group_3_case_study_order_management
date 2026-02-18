sap.ui.define([
    "sap/ui/core/format/DateFormat",
], function (DateFormat) {
    "use strict";

    return {
        /*
         * This function is used to format the Creation Date field of the Orders table
         * It formats the creation date to the format dd MMM yyy
         * @param {string} sCreationDate - Creation Date
         * @return {string} oCreationDate - Formatted Creation Date 
        **/
        formatCreationDate: function(sCreationDate) {	
            // Check if Creation Date is not initial 
            if (sCreationDate) {
                let oCreationDate = new Date(sCreationDate);

                // Check if date is valid
                if (!isNaN(oCreationDate)) {
                    let oFormatter = DateFormat.getDateInstance({
                        pattern: "dd MMM yyyy"
                    });
                    return oFormatter.format(oCreationDate);
                } 
            } 
        },
        /*
         * This function is used to format the Receving Plant and Delivering Plant fields of the Orders table
         * It formats the receiving and delivering plant values to display the Plant ID and Plant Name
         * @param {integer} iPlantID - Plant ID
         * @param {string} sPlantName - Plant Name
         * @return {string} - Formatted plant value
        **/
        formatPlant: function (iPlantID, sPlantName) {
            // Check if Plant ID and Plant name are not initial
            if (iPlantID && sPlantName) {
                return iPlantID + " - " + sPlantName;
            }
        },
        /*
         * This function is used to format the Status field of the Orders table
         * It formats the status value by changing the text color 
         * @param {string} sStatus - Status
         * @return - Formatted text color
        **/
        formatStatusColor: function (sStatus) {
            switch (sStatus) {
                case "Released":
                    // Displayed in orange text
                    return "Warning";
                case "Partially Completed":
                    // Displayed in blue text
                    return "Information";
                case "Delivered":
                    // Displayed in green text
                    return "Success";
            }
        }
    };
});