/**
 * @NApiVersion 2.1
 */
define(['N'],

    function (N) {

        const { runtime, email, file } = N;

        function error_log(title, data) {
            throw `${title} -- ${JSON.stringify(data)}`;
        }

        function email_log(title, data) {
            let user = runtime.getCurrentUser();
            email.send({
                author: user.id,
                recipients: user.id,
                subject: title,
                body: `<pre>${JSON.stringify(data)}</pre>`,
            })
        }

        function decimalAdjust(type, value, exp) {
            // Si el exp no está definido o es cero...
            if (typeof exp === 'undefined' || +exp === 0) {
                return Math[type](value);
            }
            value = +value;
            exp = +exp;
            // Si el valor no es un número o el exp no es un entero...
            if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
                return NaN;
            }
            // Shift
            value = value.toString().split('e');
            value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
            // Shift back
            value = value.toString().split('e');
            return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
        }

        // Decimal round
        if (!Math.round10) {
            Math.round10 = function (value, exp) {
                return decimalAdjust('round', value, exp);
            };
        }
        // Decimal floor
        if (!Math.floor10) {
            Math.floor10 = function (value, exp) {
                return decimalAdjust('floor', value, exp);
            };
        }
        // Decimal ceil
        if (!Math.ceil10) {
            Math.ceil10 = function (value, exp) {
                return decimalAdjust('ceil', value, exp);
            };
        }

        /******************/

        // Convertir valores nulos en un objeto JavaScript a string - Al parecer FreeMarker no acepta valores nulos
        function convertObjectValuesToStrings(obj) {
            for (const key in obj) {
                if (obj[key] === null) {
                    obj[key] = '';
                } else if (typeof obj[key] === 'number') {
                    obj[key] = obj[key];
                    // obj[key] = obj[key].toString();
                } else if (typeof obj[key] === 'object') {
                    // Si el valor es un objeto, llamamos recursivamente a la función
                    convertObjectValuesToStrings(obj[key]);
                }
            }
            return obj;
        }

        // Convertir formato de fecha '14/07/2023' -> '2023-07-14'
        function convertFormatDate(date) {
            const day = date.substring(0, 2);
            const month = date.substring(3, 5);
            const year = date.substring(6, 10);

            return `${year}-${month}-${day}`;
        }

        /******************/

        function getDefaultStyle() {
            let style = file.load('../../assets/styles.css').url;
            return `<link rel="stylesheet" href="${style}">`;
        }

        return { error_log, email_log, convertObjectValuesToStrings, convertFormatDate, getDefaultStyle }

    });
