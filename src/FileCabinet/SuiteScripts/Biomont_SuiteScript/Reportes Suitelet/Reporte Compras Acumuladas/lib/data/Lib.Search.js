/**
 * @NApiVersion 2.1
 */
define(['./Lib.Basic', './Lib.Helper', 'N'],

    function (Basic, Helper, N) {

        const { search, format } = N;

        /******************/

        function createAccountingPeriodYear() {

            let result = [];
            let currentDate = format.format({ type: format.Type.DATE, value: new Date() });

            search.create({
                type: 'accountingperiod',
                filters:
                    [
                        ["isyear", "is", "T"],
                        'AND',
                        ['startdate', 'onorbefore', currentDate]
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

        function createAccountingPeriodMonth() {

            let result = [];
            let years = createAccountingPeriodYear();
            let yearsId = years.map(year => year.id);

            search.create({
                type: 'accountingperiod',
                filters:
                    [
                        ["parent", "anyof"].concat(yearsId),
                        "AND",
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

        /******************/

        function getDataComprasAcumuladas(subsidiary, periods) {

            // Declarar variables
            let resultTransaction = [];

            // Filtro de subsidiary
            let array_where_subsidiary = ["subsidiary", "anyof", "@NONE@"];
            if (subsidiary != '') {
                array_where_subsidiary = ["subsidiary", "anyof", subsidiary];
            }

            // Filtro de periodo
            let array_where_date = ["accountingperiod.internalid", "anyof", "@NONE@"];
            if (Array.isArray(periods) && periods[0] != '') {
                array_where_date = ["accountingperiod.internalid", "anyof"].concat(periods);
            }

            // Declarar search
            // Agregar tipo
            let transactionQuery = new Basic.CustomSearch('transaction');

            // Agregar columnas
            transactionQuery.pushColumn({
                name: "internalid",
                label: "ID INTERNO"
            });
            transactionQuery.pushColumn({
                name: "number",
                join: "account",
                sort: search.Sort.ASC,
                label: "CUENTA (NUMERO)"
            });
            transactionQuery.pushColumn({
                name: "description",
                join: "account",
                label: "CUENTA (DESCRIPCION)"
            });
            transactionQuery.pushColumn({ name: "type", label: "TIPO" });
            transactionQuery.pushColumn({
                name: "trandate",
                sort: search.Sort.ASC,
                label: "FECHA"
            });
            transactionQuery.pushColumn({ name: "tranid", label: "NUMERO DE DOCUMENTO" });
            transactionQuery.pushColumn({
                name: "formulatext",
                formula: "NVL({vendor.entityid}, {vendorline.entityid})",
                label: "NOMBRE"
            });
            transactionQuery.pushColumn({
                name: "formulanumeric",
                formula: "{amount}*-1",
                label: "IMPORTE"
            });
            transactionQuery.pushColumn({
                name: "formulanumeric",
                formula: "{fxamount}",
                label: "IMPORTE (MONEDA EXTRANJERA)"
            });
            transactionQuery.pushColumn({ name: "exchangerate", label: "TIPO CAMBIO" });
            transactionQuery.pushColumn({ name: "item", label: "ARTÍCULO" });
            transactionQuery.pushColumn({
                name: "displayname",
                join: "item",
                label: "ARTÍCULO: NOMBRE PARA MOSTRAR"
            });
            transactionQuery.pushColumn({
                name: "custitem_ns_pe_unit_med",
                join: "item",
                label: "ARTÍCULO: NS PE UNIDAD MEDIDA"
            });
            transactionQuery.pushColumn({
                name: "formulanumeric",
                formula: "ABS({quantity})",
                label: "CANTIDAD"
            });
            transactionQuery.pushColumn({ name: "custbody_ns_pe_oper_type", label: "NS TIPO OPERACION" });
            transactionQuery.pushColumn({ name: "memo", label: "Nota" });
            transactionQuery.pushColumn({ name: "createdfrom", label: "CREADO DESDE" });
            transactionQuery.pushColumn({ name: "custcol24", label: "BIO_CAM_NRO_DOCUMENTO_DIARIO" });
            transactionQuery.pushColumn({ name: "custbody_bio_cam_recepcion_factura", label: "FACTURA DE COMPRA" });
            transactionQuery.pushColumn({ name: "postingperiod", label: "PERIODO" });
            transactionQuery.pushColumn({ name: "typecode", label: "Código de tipo" });

            // Agregar filtros
            transactionQuery.updateFilters([
                ["account.number", "is", "60991111"],
                "AND",
                ["amount", "notequalto", "0.00"],
                "AND",
                array_where_subsidiary,
                "AND",
                array_where_date
            ]);

            // Cantidad de registros en search
            // transactionQuery.addSetting('count', true);

            // Buscar por indice o label en busqueda
            transactionQuery.addSetting('type', 'indice');

            // Crear y recorrer search
            transactionQuery.execute(node => {

                let id_interno = node.getValue(0);
                let cuenta_numero = node.getValue(1);
                let cuenta_descripcion = node.getValue(2);
                let tipo_codigo = node.getValue(3);
                let tipo_nombre = node.getText(3);
                let fecha = node.getValue(4);
                let numero_documento = node.getValue(5);
                let nombre = node.getValue(6);
                let importe = node.getValue(7);
                let importe_me = node.getValue(8);
                let tipo_cambio = node.getValue(9);
                let articulo = node.getValue(10);
                let articulo_codigo = node.getText(10);
                let articulo_nombre_mostrar = node.getValue(11);
                let articulo_ns_pe_unidad_medida = node.getValue(12);
                let articulo_ns_pe_unidad_medida_nombre = node.getText(12);
                let cantidad = node.getValue(13);
                let ns_tipo_operacion = node.getValue(14);
                let ns_tipo_operacion_nombre = node.getText(14);
                let nota = node.getValue(15);
                let creado_desde = node.getValue(16);
                let creado_desde_nombre = node.getText(16);
                let documento_diario = node.getValue(17);
                let factura_compra = node.getValue(18);
                let factura_compra_nombre = node.getText(18);
                let periodo = node.getValue(19);
                let periodo_nombre = node.getText(19);

                resultTransaction.push({
                    id_interno: id_interno,
                    cuenta_numero: cuenta_numero,
                    cuenta_descripcion: cuenta_descripcion,
                    tipo: { codigo: tipo_codigo, nombre: tipo_nombre },
                    fecha: fecha,
                    numero_documento: numero_documento,
                    nombre: nombre,
                    importe: importe,
                    importe_me: importe_me,
                    tipo_cambio: tipo_cambio,
                    articulo: { id: articulo, codigo: articulo_codigo },
                    articulo_nombre_mostrar: articulo_nombre_mostrar,
                    articulo_ns_pe_unidad_medida: { id: articulo_ns_pe_unidad_medida, nombre: articulo_ns_pe_unidad_medida_nombre },
                    cantidad: cantidad,
                    ns_tipo_operacion: { id: ns_tipo_operacion, nombre: ns_tipo_operacion_nombre },
                    nota: nota,
                    creado_desde: { id: creado_desde, nombre: creado_desde_nombre },
                    documento_diario: documento_diario,
                    factura_compra: { id: factura_compra, nombre: factura_compra_nombre },
                    periodo: { id: periodo, nombre: periodo_nombre },
                });
            });

            // Helper.error_log('getDataComprasAcumuladas', resultTransaction);
            return resultTransaction;
        }

        function getDataDetalleInventario(subsidiary, periods) {

            // Declarar variables
            let resultTransaction = [];

            // Filtro de subsidiary
            let array_where_subsidiary = ["transaction.subsidiary", "anyof", "@NONE@"];
            if (subsidiary != '') {
                array_where_subsidiary = ["transaction.subsidiary", "anyof", subsidiary];
            }

            // Declarar search
            // Agregar tipo
            let transactionQuery = new Basic.CustomSearch('inventorydetail');

            // Agregar columnas
            transactionQuery.pushColumn({
                name: "type",
                join: "item",
                label: "Tipo de artículo"
            });
            transactionQuery.pushColumn({
                name: "type",
                join: "transaction",
                sort: search.Sort.ASC,
                label: "Tipo de transacción"
            });
            transactionQuery.pushColumn({
                name: "trandate",
                join: "transaction",
                sort: search.Sort.ASC,
                label: "Fecha"
            });
            transactionQuery.pushColumn({
                name: "internalid",
                join: "transaction",
                label: "ID interno"
            });
            transactionQuery.pushColumn({
                name: "tranid",
                join: "transaction",
                label: "Número de documento"
            });
            transactionQuery.pushColumn({
                name: "formulanumeric",
                formula: "{transaction.amount}*-1",
                label: "Importe"
            });
            transactionQuery.pushColumn({
                name: "formulanumeric",
                formula: "{transaction.fxamount}",
                label: "Importe (moneda extranjera)"
            });
            transactionQuery.pushColumn({
                name: "exchangerate",
                join: "transaction",
                label: "Exchange Rate"
            });
            transactionQuery.pushColumn({ name: "item", label: "Artículo" });
            transactionQuery.pushColumn({
                name: "displayname",
                join: "item",
                label: "Nombre para mostrar"
            });
            transactionQuery.pushColumn({
                name: "custitem_ns_pe_unit_med",
                join: "item",
                label: "NS PE Unidad Medida"
            });
            transactionQuery.pushColumn({
                name: "formulanumeric",
                formula: "ABS({transaction.quantity})",
                label: "Cantidad"
            });

            // Agregar filtros
            transactionQuery.updateFilters([
                ["transaction.type", "anyof", "ItemRcpt"],
                "AND",
                ["transaction.amount", "notequalto", "0.00"],
                "AND",
                array_where_subsidiary
            ]);

            // Cantidad de registros en search
            // transactionQuery.addSetting('count', true);

            // Buscar por indice o label en busqueda
            transactionQuery.addSetting('type', 'indice');

            // Crear y recorrer search
            transactionQuery.execute(node => {

                let tipo_articulo = node.getValue(0);
                let tipo_transaccion = node.getValue(1);
                let fecha = node.getValue(2);
                let id_interno = node.getValue(3);
                let numero_documento = node.getValue(4);
                let importe = node.getValue(5);
                let importe_me = node.getValue(6);
                let tipo_cambio = node.getValue(7);
                let articulo = node.getValue(8);
                let articulo_codigo = node.getText(8);
                let articulo_nombre_mostrar = node.getValue(9);
                let articulo_ns_pe_unidad_medida = node.getValue(10);
                let articulo_ns_pe_unidad_medida_nombre = node.getText(10);
                let cantidad = node.getValue(11);

                resultTransaction.push({
                    tipo_articulo: tipo_articulo,
                    tipo_transaccion: tipo_transaccion,
                    fecha: fecha,
                    id_interno: id_interno,
                    numero_documento: numero_documento,
                    importe: importe,
                    importe_me: importe_me,
                    tipo_cambio: tipo_cambio,
                    articulo: { id: articulo, codigo: articulo_codigo },
                    articulo_nombre_mostrar: articulo_nombre_mostrar,
                    articulo_ns_pe_unidad_medida: { id: articulo_ns_pe_unidad_medida, nombre: articulo_ns_pe_unidad_medida_nombre },
                    cantidad: cantidad,
                });
            });

            // Helper.error_log('getDataDetalleInventario', resultTransaction);
            return resultTransaction;
        }

        return { createAccountingPeriodYear, createAccountingPeriodMonth, getDataComprasAcumuladas, getDataDetalleInventario }

    });
