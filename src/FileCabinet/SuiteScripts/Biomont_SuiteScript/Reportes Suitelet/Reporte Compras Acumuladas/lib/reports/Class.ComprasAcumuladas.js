/**
 * @NApiVersion 2.1
 */
define(['./Class.ReportRenderer', '../data/Lib.Basic', '../data/Lib.Search', '../data/Lib.Process', '../data/Lib.Helper', 'N'],

    function (ReportRenderer, Basic, Search, Process, Helper, N) {

        const { log } = N;

        /******************/

        class ComprasAcumuladas extends ReportRenderer {

            constructor(params) {
                // Enviamos template a ReportRenderer
                if (params.xls === 'T') {
                    super(Basic.DATA.Report.COMPRAS_ACUMULADAS_XLS);
                } else {
                    super(Basic.DATA.Report.COMPRAS_ACUMULADAS);
                }

                // Obtener parametros
                let { subsidiary, accounting_period } = params;

                // Debug
                // Helper.error_log('params', params);

                // Obtener datos para enviar
                let dataComprasAcumuladas = Search.getDataComprasAcumuladas(subsidiary, accounting_period);
                let dataDetalleInventario = Search.getDataDetalleInventario(subsidiary, accounting_period);
                let dataComprasAcumuladas_Completo = Process.getDataComprasAcumuladas_Completo(dataComprasAcumuladas, dataDetalleInventario);

                // Procesar reporte
                let dataReporte = Process.getReporteFreeMarker(dataComprasAcumuladas_Completo);

                // Debug
                // Helper.error_log('dataComprasAcumuladas', dataComprasAcumuladas);
                // Helper.error_log('dataDetalleInventario', dataDetalleInventario);
                // Helper.error_log('dataComprasAcumuladas_Completo', dataComprasAcumuladas_Completo);
                // Helper.error_log('dataReporte', dataReporte);

                // Enviar data a archivos HTML o Excel
                let titleDocument = 'Reporte Compras Acumuladas';
                this.addInput('name', titleDocument);
                this.addInput('transactions', dataReporte);
            }
        }

        return ComprasAcumuladas

    });
