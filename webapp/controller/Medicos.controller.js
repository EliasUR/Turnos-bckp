sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
        "use strict";
        var thisControler;
        return BaseController.extend("com.softtek.aca20241qer.controller.Medicos", {
            //Private Methods
            _loadFilters: function (esp) {
                let oViewModel = new JSONModel({
                    Apellido: "",
                    Nombre: "",
                    Especialidad: esp == "All" ? "" : esp,
                })
                this.getView().setModel(oViewModel,"filters")
            },           
            _afterCloseDialog: function (oEvent) {
                oEvent.getSource().destroy();
                thisControler.oCreateFragment = null;
            },
            _onPatternMatched: function (oEvent) {
                let navId = this.getView().getDomRef().getElementsByClassName("sapMITH")[0].id
                let iconTabHeader = this.byId(navId);
                iconTabHeader.setSelectedKey("Medicos");
                let esp = oEvent.getParameter("arguments").IdEspecialidad
                this._loadFilters(esp);
                this.onSearch();
                let sideBarId = this.getView().getDomRef().getElementsByClassName("sapTntSideNavigation")[0].id
                let sideBar = this.byId(sideBarId);
                sideBar.setSelectedKey(esp == "All" ? "Medicos" : esp);

            },
            
            
            onInit: function () {
                thisControler = this;
                this.loadViewModel(false, true);
                this.getRouter().getRoute("Medicos").attachPatternMatched(this._onPatternMatched, this);
                
                var toolPage = this.byId("page");
                var showSideBar = function() {
                    if (window.innerWidth <= 1000) {
                        toolPage.setSideExpanded(false);
                        thisControler.getView().getModel("viewModel").setProperty("/menuBtn", false);
                    } else {
                        toolPage.setSideExpanded(true);
                        thisControler.getView().getModel("viewModel").setProperty("/menuBtn", true);
                    }
                }
                showSideBar();
                window.addEventListener("resize", showSideBar);
            },

            //NAV TURNOS
            onVerTurnos: function (oEvent) {
                let oContext = oEvent.getSource().getBindingContext();
                let legajo = oContext.getProperty("Legajo");
                let esp = oContext.getProperty("IdEspecialidad");
                this.getRouter().navTo("Turnos", {LegajoMedico: legajo, IdEspecialidad: esp});
            },

            //FILTERS
            onSearch: function () {
                let aFilters = [];
                let oModel = this.getView().getModel("filters");
                let fNombre = oModel.getProperty("/Nombre").toUpperCase();
                let fApellido = oModel.getProperty("/Apellido").toUpperCase();
                let fEspecialidad = oModel.getProperty("/Especialidad");  
                if(fApellido) {
                    aFilters.push(new Filter("Apellido", FilterOperator.Contains, fApellido))
                }
                if(fNombre) {
                    aFilters.push(new Filter("Nombre", FilterOperator.Contains, fNombre))
                }
                if(fEspecialidad) {
                    aFilters.push(new Filter("IdEspecialidad", FilterOperator.EQ, fEspecialidad))
                }
                this.getView().byId("tablaDeMedicos").getBinding("items").filter(aFilters, "Application");
            },
            onClearFilters: function () {
                this.getView().byId("tablaDeMedicos").getBinding("items").filter([], "Application");
                this._loadFilters();
            },
           
            //CREATE
            onCreate: function () {
                if (!this.oCreateFragment) {
                    this.oCreateFragment =
                        sap.ui.core.Fragment.load({
                            name: "com.softtek.aca20241qer.view.fragments.CreateMedico",
                            controller: thisControler
                        }).then(function (oDialog) {
                            thisControler.getView().addDependent(oDialog);
                            let oModel = new JSONModel({
                                "Legajo": "",
                                "Nombre": "",
                                "Apellido": "",
                                "IdEspecialidad": "",
                                "HoraDeIngreso": "00:00",
                                "HoraDeEgreso": "00:00"
                            });
                            oModel.setDefaultBindingMode("TwoWay");
                            oDialog.setModel(oModel, "Medico");
                            oDialog.attachAfterClose(thisControler._afterCloseDialog);
                            return oDialog;
                        }.bind(thisControler));
                }
                this.oCreateFragment.then(function (oDialog) {
                    oDialog.open();
                }.bind(thisControler));
            },
            onSaveCreate: function (oEvent) {
                // llamada al odata:
                let oEntry = oEvent.getSource().getModel("Medico").getData();
                var oDataModel = this.getView().getModel();
                oDataModel.create("/MedicoSet", oEntry, {
                    success: function (oResponse) {
                        var result = oResponse?.results;
                        MessageToast.show("Se ha añadido un nuevo medico correctamente");
                        thisControler.getOwnerComponent().getModel().refresh(true, true);
                        thisControler.onCerrarCreate();
                    },
                    error: function (oError) {
                        // manejar excepción del servicio
                        MessageBox.error("Rellene todos los campos y seleccione una especialidad existente.");
                    }
                });
            },
            onCerrarCreate: function (oEvent) {
                this.oCreateFragment.then(function (oDialog) {
                    oDialog.close();
                }.bind(this));
            },
            //DELETE
            onDelete: function (oEvent) {
                let oContext = oEvent.getSource().getBindingContext();
                let sPath = oContext.getPath();
                let medic =  oContext.getProperty("Apellido") + ", " + oContext.getProperty("Nombre");
                var oDataModel = this.getOwnerComponent().getModel();
                MessageBox.warning("Esta seguro que desea eliminar a " + medic, {
                    title: "Cuidado",
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if(sAction == "OK") {  
                            oDataModel.remove(`${sPath}`, {
                                success: function (oResponse) {
                                    MessageToast.show("Se ha eliminado correctamente");
                                    thisControler.getOwnerComponent().getModel().refresh(true, true);
                                },
                                error: function (oError) {
                                    MessageBox.error("No puede eliminar al Medico porque tiene turnos asignados");
                                }
                            });
                        } else {
                            MessageToast.show("Eliminacion abortada");
                        }
                    }
                });
            },
        });
    });
