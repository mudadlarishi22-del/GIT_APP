sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, JSONModel) => {
    "use strict";

    return Controller.extend("gitapp.controller.View1", {
        onInit() {
            // Initialize model for database data
            const oModel = new JSONModel({
                databaseData: [],
                connectionStatus: "Not Connected"
            });
            this.getView().setModel(oModel, "dbModel");

            // In a real implementation, you would get service credentials like this:
            // const serviceCredentials = this.getOwnerComponent().getManifestEntry("/sap.cloud/serviceBindings/postgresDB");
            // Then use these credentials to connect to your backend API
        },

        onTestConnection() {
            // This demonstrates how you would connect to a backend service
            // In reality, this would call your backend API endpoint

            MessageToast.show("Database connection test initiated");

            // Mock data to demonstrate the concept
            const mockData = [
                { ID: 1, Name: "Sample Entry 1" },
                { ID: 2, Name: "Sample Entry 2" }
            ];

            const oModel = this.getView().getModel("dbModel");
            oModel.setProperty("/databaseData", mockData);
            oModel.setProperty("/connectionStatus", "Mock Connection Successful");

            MessageToast.show("Mock database data loaded");
        },

        onRefreshData() {
            // In a real implementation, this would fetch fresh data from the backend
            MessageToast.show("Data refresh would call backend API here");

            // For demonstration, we'll just show the connection status
            const oModel = this.getView().getModel("dbModel");
            const currentStatus = oModel.getProperty("/connectionStatus");
            MessageToast.show(`Current status: ${currentStatus}`);
        },

        onAddData() {
            // In a real implementation, this would send data to the backend
            const oModel = this.getView().getModel("dbModel");
            const currentData = oModel.getProperty("/databaseData") || [];

            const newEntry = {
                ID: currentData.length + 1,
                Name: `New Entry ${currentData.length + 1}`
            };

            currentData.push(newEntry);
            oModel.setProperty("/databaseData", currentData);

            MessageToast.show("New data added (mock)");
        }
    });
});