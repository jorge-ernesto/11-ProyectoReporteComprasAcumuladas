/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N'],

    function (N) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {

        }

        function exportToExcel() {

            const xlsHref = window.location.href + '&xls=T';

            const a = document.createElement('a');
            a.href = xlsHref;

            // Añade el enlace al documento y haz clic en él para descargar
            document.body.appendChild(a);
            a.click();

            // Limpia el objeto URL y elimina el enlace
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }

        return {
            pageInit: pageInit,
            exportToExcel: exportToExcel
        };

    });
