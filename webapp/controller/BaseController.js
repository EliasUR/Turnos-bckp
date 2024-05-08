sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, JSONModel, DateFormat) {
        "use strict";
        var that;
        return Controller.extend("com.softtek.aca20241qer.controller.BaseController", {
            loadViewModel: function (back, menu) {
                var sRootPath = jQuery.sap.getModulePath("com.softtek.aca20241qer");
                var sImagePath = sRootPath + "/img/logo.png";

                const oViewModel = new JSONModel({
                    backBtn: back,
                    menuBtn: menu,
                    logo: sImagePath
                });
                this.getView().setModel(oViewModel,"viewModel");
            },
            formatDate: function (date) {
                var ajustedDate = new Date(date)
                ajustedDate.setHours(ajustedDate.getHours() + 27);
                var oDateFormat = DateFormat.getDateTimeInstance({pattern: "yyyy-MM-dd'T'HH:mm:ss"});
                return oDateFormat.format(ajustedDate);
            },
            formatTime: function (time) {
                let hhmm = time.split(":");
                return "PT" + hhmm[0] + "H" + hhmm[1] + "M00S";
            },
            getRouter: function () {
                return this.getOwnerComponent().getRouter();
            },
            
            onBack: function () {
                var oHistory = History.getInstance();
                var oPrevHash = oHistory.getPreviousHash();
                if (oPrevHash !== undefined) {
                    window.history.go(-1);
                } else {
                    this.getRouter().navTo("RouteMain");
                }
            },
            onNavToHome: function () {
                this.getRouter().navTo("RouteMain");
            },
            onVerMedicos: function () {
                this.getRouter().navTo("Medicos", {IdEspecialidad: "All"});
            },
            onVerMedicosEsp: function (especialidad) {
                this.getRouter().navTo("Medicos", {IdEspecialidad: especialidad});
            },
            onSacarTurno: function () {
                this.getRouter().navTo("SacarTurno", {LegajoMedico: "Nuevo", IdEspecialidad: "Turno"});
            },
            onNuevoTurno: function (legajo, especialidad) {
                this.getRouter().navTo("SacarTurno", {LegajoMedico: legajo, IdEspecialidad: especialidad});
            },
            onItemSelect: function(oEvent) {
                var item = oEvent.getParameter('item').getKey();
                switch(item){
                    case "Back":
                        this.onBack();
                        break;
                    case "Home":
                        this.onNavToHome();
                        break;
                    case "NewTurno":
                        this.onSacarTurno();
                        break;
                    case "Medicos": 
                        this.onVerMedicos();
                        break;
                    default:
                        this.onVerMedicosEsp(item);
                        break;
                }
            },
            onMenuButtonPress: function() {
                var toolPage = this.byId("page");
    			toolPage.setSideExpanded(!toolPage.getSideExpanded());
            }
        });
    });
