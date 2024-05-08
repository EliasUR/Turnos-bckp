sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, MessageToast) {
        "use strict";
        var thisControler;
        return BaseController.extend("com.softtek.aca20241qer.controller.Main", {
            //Private Methods
            _onPatternMatched: function (oEvent) {
                let navId = this.getView().getDomRef().getElementsByClassName("sapMITH")[0].id
                let iconTabHeader = this.byId(navId);
                iconTabHeader.setSelectedKey("Home");

                var oTile = this.byId("logo");
                var showLogo = function() {
                    if (window.innerWidth <= 580) {
                        oTile.setVisible(false);
                    } else {
                        oTile.setVisible(true);
                    }
                }
                showLogo();
                window.addEventListener("resize", showLogo);

            },
            
            onInit: function () {
                thisControler = this;
                this.loadViewModel(false, false);
                this.getRouter().getRoute("RouteMain").attachPatternMatched(this._onPatternMatched, this);
            },
            onShowLogoMessage: function () {
                MessageToast.show("Está lindo el logo?");
            },
            onShowWellcomeMessage: function () {
                MessageToast.show("Bienvenido!!, esto no es un boton ;)");
            },
        });
    });
