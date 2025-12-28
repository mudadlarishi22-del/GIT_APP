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
                connectionStatus: "Not Connected",
                isLoading: false
            });
            this.getView().setModel(oModel, "dbModel");

            // Load initial data
            this.onRefreshData();
        },

        _getBackendUrl() {
            // Get the backend service URL from manifest or use relative path for local development
            try {
                const backendService = this.getOwnerComponent().getManifestEntry("/sap.cloud/serviceBindings/gitapp-backend-api");
                return backendService.url;
            } catch (e) {
                // For local development, use relative path
                return "";
            }
        },

        async _callBackendAPI(endpoint, method = "GET", data = null) {
            const oModel = this.getView().getModel("dbModel");
            oModel.setProperty("/isLoading", true);

            const baseUrl = this._getBackendUrl();
            const url = `${baseUrl}/api${endpoint}`;

            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (data && (method === "POST" || method === "PUT")) {
                options.body = JSON.stringify(data);
            }

            try {
                const response = await fetch(url, options);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || `HTTP ${response.status}`);
                }

                return result;
            } catch (error) {
                console.error("API call failed:", error);
                throw error;
            } finally {
                oModel.setProperty("/isLoading", false);
            }
        },

        async onTestConnection() {
            try {
                const result = await this._callBackendAPI("/health");
                const oModel = this.getView().getModel("dbModel");
                oModel.setProperty("/connectionStatus", "Connected to Backend");
                MessageToast.show("Backend connection successful");
            } catch (error) {
                const oModel = this.getView().getModel("dbModel");
                oModel.setProperty("/connectionStatus", "Connection Failed");
                MessageToast.show(`Connection failed: ${error.message}`);
            }
        },

        async onRefreshData() {
            try {
                const result = await this._callBackendAPI("/data");
                const oModel = this.getView().getModel("dbModel");
                oModel.setProperty("/databaseData", result.data || []);
                oModel.setProperty("/connectionStatus", "Data Loaded Successfully");
                MessageToast.show(`Loaded ${result.data?.length || 0} records`);
            } catch (error) {
                const oModel = this.getView().getModel("dbModel");
                oModel.setProperty("/connectionStatus", "Failed to Load Data");
                MessageToast.show(`Failed to load data: ${error.message}`);
            }
        },

        async onAddData() {
            try {
                const oModel = this.getView().getModel("dbModel");
                const currentData = oModel.getProperty("/databaseData") || [];

                // Generate next ID
                const nextId = currentData.length > 0 ? Math.max(...currentData.map(item => item.ID)) + 1 : 1;
                const newEntry = {
                    id: nextId,
                    name: `New Entry ${nextId}`
                };

                await this._callBackendAPI("/data", "POST", newEntry);

                // Refresh data to show the new entry
                await this.onRefreshData();
                MessageToast.show("New data added successfully");
            } catch (error) {
                MessageToast.show(`Failed to add data: ${error.message}`);
            }
        },

        async onDeleteData(oEvent) {
            try {
                const oContext = oEvent.getSource().getBindingContext("dbModel");
                const oData = oContext.getObject();
                const id = oData.ID;

                await this._callBackendAPI(`/data/${id}`, "DELETE");

                // Refresh data to remove the deleted entry
                await this.onRefreshData();
                MessageToast.show("Record deleted successfully");
            } catch (error) {
                MessageToast.show(`Failed to delete record: ${error.message}`);
            }
        }
    });
});