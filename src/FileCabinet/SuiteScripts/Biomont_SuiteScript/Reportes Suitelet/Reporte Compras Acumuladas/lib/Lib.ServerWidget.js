/**
 * @NApiVersion 2.1
 */
define(['N', './data/Lib.Dao', './data/Lib.Basic', './data/Lib.Helper', './data/Lib.Search'],

    function (N, DAO, Basic, Helper, Search) {

        const { log, redirect, runtime } = N;
        const { serverWidget } = N.ui;

        /******************/

        var formContext = {
            dao: null,
            form: null,
            params: {}
        }

        const SUITELET_RECORD = {
            title: 'custpage_report_title',
            groups: {
                main: 'custpage_report_group_criteria_1',
                criteria: 'custpage_report_group_criteria_2'
            },
            fields: {
                subsidiary: 'custpage_report_criteria_subsidiary',
                accounting_period: 'custpage_report_criteria_accounting_period',
            },
            buttons: {
                generate: 'custpage_report_button_visualize',
                exportXLS: 'custpage_report_button_export_xls',
                exportCSV: 'custpage_report_button_export_csv'
            }
        }

        function setInput(params) {
            // Recibir datos - multiselect 'Periodo Contable'
            if (params['accounting_period']) {
                params['accounting_period'] = params['accounting_period'].split('|'); // '307|306|305' -> ['307','306','305']
            }

            log.debug('Input.Report', params);
            formContext.params = params;
        }

        function selectedReport() {
            log.debug('selectedReport', formContext.params.report);
            return Number(formContext.params.report);
        }

        /**
         * description : Create Basic Form, add buttons and client script
         */
        function createReportForm() {

            formContext.dao = new DAO();
            formContext.form = serverWidget.createForm({
                title: formContext.dao.get(SUITELET_RECORD.title)
            });

            formContext.form.addSubmitButton({
                label: formContext.dao.get(SUITELET_RECORD.buttons.generate)
            });

            formContext.form.clientScriptModulePath = '../Bio.ClientScript.ReporteComprasAcumuladas'

            // formContext.form.addButton({
            //     id: SUITELET_RECORD.buttons.exportXLS,
            //     label: formContext.dao.get(SUITELET_RECORD.buttons.exportXLS),
            //     functionName: 'exportToExcel()'
            // });
        }

        /**
         * description : create criteria Fields
         */
        function createCriteriaGroup() {

            // Criteria Group
            let group = formContext.form.addFieldGroup({
                id: SUITELET_RECORD.groups.criteria,
                label: formContext.dao.get(SUITELET_RECORD.groups.criteria),
            });

            // Subsidiary Field
            let subsidiaryField = formContext.form.addField({
                id: SUITELET_RECORD.fields.subsidiary,
                label: formContext.dao.get(SUITELET_RECORD.fields.subsidiary),
                type: 'select',
                source: 'subsidiary',
                container: SUITELET_RECORD.groups.criteria
            });
            subsidiaryField.updateBreakType({ breakType: 'STARTCOL' })
            subsidiaryField.isMandatory = true;

            if (formContext.params.subsidiary) {
                subsidiaryField.defaultValue = formContext.params.subsidiary;
            }

            // Accouting Period Field
            let accountingPeriodField = formContext.form.addField({
                id: SUITELET_RECORD.fields.accounting_period,
                label: formContext.dao.get(SUITELET_RECORD.fields.accounting_period),
                type: 'multiselect',
                container: SUITELET_RECORD.groups.criteria
            });
            accountingPeriodField.updateBreakType({ breakType: 'STARTCOL' })
            accountingPeriodField.isMandatory = true;
            // accountingPeriodField.updateDisplaySize({ height: 10, width: 280 });

            // accountingPeriodField.addSelectOption({ value: '', text: '' });
            Search.createAccountingPeriodMonth().forEach(node => {
                accountingPeriodField.addSelectOption({ value: node.id, text: node.text });
            });
            if (formContext.params.accounting_period) {
                accountingPeriodField.defaultValue = formContext.params.accounting_period;
            }
        }

        /**
         * Create HTML Container Field
         */
        function createViewerModel(htmlReport) {

            let viewerModelField = formContext.form.addField({
                id: 'custpage_report_viewer_html',
                label: ' ',
                type: 'inlinehtml'
            });
            viewerModelField.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
            });

            let htmlContainer = new String();
            htmlContainer = htmlContainer.concat(Helper.getDefaultStyle());
            htmlContainer = htmlContainer.concat(htmlReport);
            viewerModelField.defaultValue = htmlContainer;
        }

        /**
         * Return form
         */
        function getForm() {
            return formContext.form;
        }

        /**
         * Redirect to the same suitelet
         */
        function loadReportForm(params) {

            let getParams = {};
            for (var x in SUITELET_RECORD.fields) {
                let value = params[SUITELET_RECORD.fields[x]];
                if (value) {
                    getParams[x] = value;
                }
            }
            getParams['report'] = 1;

            // Enviar datos - multiselect 'Periodo Contable'
            if (getParams['accounting_period']) {
                getParams['accounting_period'] = getParams['accounting_period'].split('\u0005').join('|'); // '307\u0005306\u0005305' -> '307|306|305'
            }

            redirect.toSuitelet({
                scriptId: runtime.getCurrentScript().id,
                deploymentId: runtime.getCurrentScript().deploymentId,
                parameters: getParams
            });
        }

        return {
            setInput,
            selectedReport,
            createReportForm,
            createCriteriaGroup,
            createViewerModel,
            getForm,
            loadReportForm
        }

    });
