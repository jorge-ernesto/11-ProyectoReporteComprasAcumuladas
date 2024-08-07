/**
 * @NApiVersion 2.1
 */
define(['./Lib.Helper', 'N'],

    function (Helper, N) {

        function getDataComprasAcumuladas_Completo(dataComprasAcumuladas, dataDetalleInventario) {

            // Declarar variables
            let resultTransaction = [];

            // Recorrer Compras Acumuladas
            dataComprasAcumuladas.forEach((value_ca, key_ca) => {

                // No es Recepción de artículo
                if (value_ca.tipo.codigo != 'ItemRcpt') {

                    resultTransaction.push({
                        id_interno: value_ca.id_interno,
                        cuenta_numero: value_ca.cuenta_numero,
                        cuenta_descripcion: value_ca.cuenta_descripcion,
                        tipo: { codigo: value_ca.tipo.codigo, nombre: value_ca.tipo.nombre },
                        fecha: value_ca.fecha,
                        numero_documento: value_ca.numero_documento,
                        nombre: value_ca.nombre,

                        // Campos que en Compras Acumuladas para el tipo de documento "Recepción de artículo" no obtiene la informacion detallada
                        importe: value_ca.importe,
                        importe_me: value_ca.importe_me,
                        tipo_cambio: value_ca.tipo_cambio,
                        articulo: { id: value_ca.articulo.id, codigo: value_ca.articulo.codigo },
                        articulo_nombre_mostrar: value_ca.articulo_nombre_mostrar,
                        articulo_ns_pe_unidad_medida: { id: value_ca.articulo_ns_pe_unidad_medida.id, nombre: value_ca.articulo_ns_pe_unidad_medida.nombre },
                        cantidad: value_ca.cantidad,

                        ns_tipo_operacion: value_ca.ns_tipo_operacion,
                        nota: value_ca.nota,
                        creado_desde: { id: value_ca.creado_desde.id, nombre: value_ca.creado_desde.nombre },
                        documento_diario: value_ca.documento_diario,
                        factura_compra: { id: value_ca.factura_compra.id, nombre: value_ca.factura_compra.nombre },
                        periodo: { id: value_ca.periodo.id, nombre: value_ca.periodo.nombre },
                    });
                } else if (value_ca.tipo.codigo == 'ItemRcpt') { // Es Recepción de artículo

                    // Recorrer Detalle de Inventario
                    dataDetalleInventario.forEach((value_di, key_di) => {

                        // Obtener Recepción de artículo del Detalle de Inventario
                        if (value_ca.id_interno == value_di.id_interno) {

                            resultTransaction.push({
                                id_interno: value_ca.id_interno,
                                cuenta_numero: value_ca.cuenta_numero,
                                cuenta_descripcion: value_ca.cuenta_descripcion,
                                tipo: { codigo: value_ca.tipo.codigo, nombre: value_ca.tipo.nombre },
                                fecha: value_ca.fecha,
                                numero_documento: value_ca.numero_documento,
                                nombre: value_ca.nombre,

                                // Campos que en Compras Acumuladas para el tipo de documento "Recepción de artículo" no obtiene la informacion detallada
                                importe: value_di.importe,
                                importe_me: value_di.importe_me,
                                tipo_cambio: value_di.tipo_cambio,
                                articulo: { id: value_di.articulo.id, codigo: value_di.articulo.codigo },
                                articulo_nombre_mostrar: value_di.articulo_nombre_mostrar,
                                articulo_ns_pe_unidad_medida: { id: value_di.articulo_ns_pe_unidad_medida.id, nombre: value_di.articulo_ns_pe_unidad_medida.nombre },
                                cantidad: value_di.cantidad,

                                ns_tipo_operacion: value_ca.ns_tipo_operacion,
                                nota: value_ca.nota,
                                creado_desde: { id: value_ca.creado_desde.id, nombre: value_ca.creado_desde.nombre },
                                documento_diario: value_ca.documento_diario,
                                factura_compra: { id: value_ca.factura_compra.id, nombre: value_ca.factura_compra.nombre },
                                periodo: { id: value_ca.periodo.id, nombre: value_ca.periodo.nombre },
                            });
                        }
                    });
                }
            });

            return resultTransaction;
        }

        function getReporteFreeMarker(dataReporte) {

            // Procesar reporte
            let fDecimal = 2;
            dataReporte.forEach((value, key) => {
                dataReporte[key]['fecha'] = Helper.convertFormatDate(value.fecha);
                dataReporte[key]['importe'] = Math.round10(value.importe, -fDecimal).toFixed(fDecimal);
                dataReporte[key]['importe_me'] = Math.round10(value.importe_me, -fDecimal).toFixed(fDecimal);
            });

            // Convertir valores nulos en un objeto JavaScript a string - Al parecer FreeMarker no acepta valores nulos
            dataReporte = Helper.convertObjectValuesToStrings(dataReporte);

            return dataReporte;
        }

        return { getDataComprasAcumuladas_Completo, getReporteFreeMarker }

    });
