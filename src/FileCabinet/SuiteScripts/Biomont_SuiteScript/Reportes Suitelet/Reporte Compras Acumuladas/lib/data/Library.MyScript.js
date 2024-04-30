// SuiteScript en el navegador

/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['N'],

    function (N) {

        const { log } = N;

        /******************/

        /*
        require(['N/search'], function (Search) {
            search = Search;
        });
        search;

        function createAccountingPeriodMonth() {

            let result = [];

            search.create({
                type: 'accountingperiod',
                filters:
                    [
                        ["isquarter", "is", "F"],
                        "AND",
                        ["isyear", "is", "F"],
                        'AND',
                        ["isadjust", "is", "F"]
                    ],
                columns: [
                    { name: 'startdate', sort: 'DESC', label: 'start' },
                    { name: 'internalid', label: 'id' },
                    { name: "periodname", label: "Name" }
                ]
            }).run().each(node => {
                let { columns } = node;
                result.push({
                    id: node.getValue(columns[1]),
                    text: node.getValue(columns[2])
                });
                return true;
            });
            return result;
        }
        */

        return { adjuntarArchivo, actualizarFechaInicioDepreciacion }

    });
