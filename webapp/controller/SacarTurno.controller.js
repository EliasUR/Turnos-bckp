sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/core/library',
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator, coreLibrary, MessageToast, MessageBox) {
        "use strict";
        var thisControler;
        var ValueState = coreLibrary.ValueState;
        return BaseController.extend("com.softtek.aca20241qer.controller.SacarTurno", {
            //private Methods
            _onPatternMatched: function (oEvent) {
                let sMedico = oEvent.getParameter("arguments").LegajoMedico;
                let sEsp = oEvent.getParameter("arguments").IdEspecialidad;
                let navId = this.getView().getDomRef().getElementsByClassName("sapMITH")[0].id
                let iconTabHeader = this.byId(navId);
                iconTabHeader.setSelectedKey("NewTurno");
                let showBackBtn = function() {
                    if (window.innerWidth <= 800) {
                        thisControler.getView().getModel("viewModel").setProperty("/backBtn", false);
                    } else {
                        thisControler.getView().getModel("viewModel").setProperty("/backBtn", true);
                    }
                }
                showBackBtn();
                window.addEventListener("resize", showBackBtn);
                this._setWizard(sMedico, sEsp);
            },
            _setWizard: function (medico, especialidad) {
                var oWizard = this.byId("wizardTurnos");
                oWizard.discardProgress(oWizard.getSteps()[0]);
                if (medico == "Nuevo") {
                    oWizard.goToStep(oWizard.getSteps()[0]);
                } else {
                    oWizard.nextStep();
                    oWizard.nextStep();
                }

                let oModel = new JSONModel({
                    "LegajoMedico": medico == "Nuevo" ? "" : medico,
                    "IdEspecialidad": especialidad == "Turno" ? "" : especialidad,
                    "NombrePaciente": "",
                    "DniPaciente": "",
                    "HoraTurno": "",
                    "FechaTurno": ""
                });
                oModel.setDefaultBindingMode("TwoWay");
                this.getView().setModel(oModel, "Turno");
            },

            onInit: function () {
                thisControler = this;
                this.loadViewModel(true, false);
                this.wizard = this.getView().byId("wizardTurnos");
                this.getRouter().getRoute("SacarTurno").attachPatternMatched(this._onPatternMatched, this);
            },

            onSelectedEsp: function (oEvent) {
                var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

                if (!sSelectedKey && sValue) {
                    oValidatedComboBox.setValueState(ValueState.Error);
                    oValidatedComboBox.setValueStateText("Opción inválida");
                } else {
                    oValidatedComboBox.setValueState(ValueState.None); 
                    let step = this.wizard.mAggregations._progressNavigator.getCurrentStep()
                    let progress = this.wizard.getProgress();
                    if (step == progress) {
                        this.wizard.nextStep();
                    }
                    this.getView().byId("doctores").getBinding("items").filter(new Filter("IdEspecialidad", FilterOperator.EQ, sSelectedKey));
                }
            },
            onSelectedMedico: function (oEvent) {
                var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

                if (!sSelectedKey && sValue) {
                    oValidatedComboBox.setValueState(ValueState.Error);
                    oValidatedComboBox.setValueStateText("Opción inválida");
                } else {
                    oValidatedComboBox.setValueState(ValueState.None); 
                    let step = this.wizard.mAggregations._progressNavigator.getCurrentStep()
                    let progress = this.wizard.getProgress();
                    if (step == progress) {
                        this.wizard.nextStep();
                    }
                    let today = new Date();
                    this.getView().byId("fecha").setMinDate(today);
                }
            },
            onSelectedDateTime: function (oEvent) {
                let fecha = this.getView().byId("fecha").getSelectedDates()[0].getStartDate()
                let fechaFormateada = this.formatDate(fecha);
                this.getView().getModel("Turno").setProperty("/FechaTurno", fechaFormateada);
                this.wizard.nextStep();
            },
            onSave: function (oEvent) {
                let oEntry = oEvent.getSource().getModel("Turno").getData();
                var oDataModel = this.getView().getModel();
                oDataModel.create("/TurnoSet", oEntry, {
                    success: function (oResponse) {
                        var result = oResponse?.results;
                        thisControler.getOwnerComponent().getModel().refresh(true, true);
                        thisControler.onBack();
                        MessageToast.show("Turno Asignado Correctamente.");
                    },
                    error: function (oError) {
                        let steps = thisControler.wizard.getSteps()
                        thisControler.wizard.invalidateStep(steps[2]);
                        thisControler.wizard.goToStep(steps[2]);
                        MessageBox.error("El horario seleccionado no está disponible, elija otro por favor.");
                    }
                });
            }
                
        });
    });
