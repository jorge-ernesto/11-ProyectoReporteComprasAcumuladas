/**
 * @NApiVersion 2.1
 */
define(['N', './Lib.Helper'],

    function (N, Helper) {

        const { search } = N;

        /******************/

        const DATA = {
            Report: {
                'COMPRAS_ACUMULADAS': 1,
                'COMPRAS_ACUMULADAS_XLS': 2
            }
        }

        const TEMPLATE = {
            1: 'ComprasAcumuladas_Detallada.html',
            2: 'ComprasAcumuladas_Detallada.ftl'
        }

        /******************/

        class CustomSearch {

            constructor(type) {
                this.searchObject = {
                    type: type,
                    columns: [],
                    filters: []
                }
                this.settings = {}
            }

            updateFilters(filters) {
                this.searchObject.filters = Array.isArray(filters) ? filters : [];
            }

            pushColumn(context) {
                this.searchObject.columns.push(context);
            }

            addSetting(key, value) {
                this.settings[key] = value;
            }

            execute(callback) {
                // Declarar search
                let searchObject = this.searchObject;
                let settings = this.settings;

                // Crear search
                let searchContext = search.create(searchObject);

                // Cantidad de registros en search
                if (settings.count === true) {
                    let count = searchContext.runPaged().count;
                    Helper.error_log('count', count)
                }

                // Recorrer search - con mas de 4000 registros
                let pageData = searchContext.runPaged({ pageSize: 1000 }); // El minimo de registros que se puede traer por pagina es 50, pondremos 1000 para que en el caso existan 4500 registros, hayan 5 paginas como maximo y no me consuma mucha memoria

                pageData.pageRanges.forEach(function (pageRange) {
                    var myPage = pageData.fetch({ index: pageRange.index });
                    myPage.data.forEach((row) => {

                        // Simular devolver getValue y getText
                        let currentRow = {
                            data: {},
                            getValue: function (id) {
                                return currentRow.data[id].value;
                            },
                            getText: function (id) {
                                return currentRow.data[id].text;
                            }
                        };

                        // Obtener informacion
                        let { columns } = row;
                        // Helper.error_log('columns', columns);

                        // Columns tiene los campos solicitados en la busqueda
                        columns.forEach((currentColumn, i) => {
                            let id = undefined;

                            if (settings.type === 'indice')
                                id = i;
                            else if (settings.type === 'label')
                                id = currentColumn.label;
                            else if (settings.type === 'name')
                                id = currentColumn.name;

                            let value = row.getValue(currentColumn);
                            let text = row.getText(currentColumn);
                            currentRow.data[id] = { value, text };
                        });

                        callback(currentRow); // El callback es todo un problema, pero lo entiendo medianamente
                    });
                });
            }
        }

        return {
            DATA,
            TEMPLATE,
            CustomSearch
        }

    });
