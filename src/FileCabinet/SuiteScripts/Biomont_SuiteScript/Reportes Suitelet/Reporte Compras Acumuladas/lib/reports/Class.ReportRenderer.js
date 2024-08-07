/**
 * @NApiVersion 2.1
 */
define(['../data/Lib.Basic', 'N'],

    function (Basic, N) {

        const { file, render } = N;

        /******************/

        class ReportRenderer {

            constructor(template) {
                let templateName = Basic.TEMPLATE[template];
                let basicFormat = `<#assign context =data.context?eval/>`
                let templateFormat = file.load('../../freemarker/' + templateName).getContents();

                this.renderer = render.create();
                this.renderer.templateContent = basicFormat + '' + templateFormat;
                this.data = {}
            }

            addInput(key, value) {
                this.data[key] = value;
            }

            print() {
                let context = this.data;
                this.renderer.addCustomDataSource({
                    alias: 'data',
                    format: render.DataSource.OBJECT,
                    data: { context: JSON.stringify(context) }
                })
                return this.renderer.renderAsString();
            }
        }

        return ReportRenderer

    });
