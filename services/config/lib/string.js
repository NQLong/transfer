module.exports = app => {
    String.prototype.upFirstChar = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    String.prototype.replaceAll = function (search, replacement) {
        return this.replace(new RegExp(search, 'g'), replacement);
    };

    app.randomPassword = (length) => Math.random().toString(36).slice(-length);

    app.toEngWord = (str) => {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ/g, 'd');
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
        str = str.replace(/Đ/g, 'D');
        return str;
    };

    app.numberDisplay = (number, replaceValue = '.') => {
        const decimalSplitter = replaceValue == '.' ? ',' : '.';
        let [integer, decimal] = number.toString().split('.');
        if (!decimal) [integer, decimal] = number.toString().split(',');
        return `${integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, replaceValue)}${decimal ? decimalSplitter : ''}${decimal || ''}`;
    };


    const mapper = {
        'aù': 'á', 'aø': 'à', 'aû': 'ả', 'aõ': 'ã', 'aï': 'ạ',
        'aê': 'ă', 'aé': 'ắ', 'aè': 'ằ', 'aú': 'ẳ', 'aü': 'ẵ', 'aë': 'ặ',
        'aâ': 'â', 'aá': 'ấ', 'aà': 'ầ', 'aå': 'ẩ', 'aã': 'ẫ', 'aä': 'ậ',
        'eù': 'é', 'eø': 'è', 'eû': 'ẻ', 'eõ': 'ẽ', 'eï': 'ẹ',
        'eâ': 'ê', 'eá': 'ế', 'eà': 'ề', 'eå': 'ể', 'eã': 'ễ', 'eä': 'ệ',
        'où': 'ó', 'oø': 'ò', 'oû': 'ỏ', 'oõ': 'õ', 'oï': 'ọ',
        'oâ': 'ô', 'oá': 'ố', 'oà': 'ồ', 'oå': 'ổ', 'oã': 'ỗ', 'oä': 'ộ',
        'ô': 'ơ', 'ôù': 'ớ', 'ôø': 'ờ', 'ôû': 'ở', 'ôõ': 'ỡ', 'ôï': 'ợ',
        'uù': 'ú', 'uø': 'ù', 'uû': 'ủ', 'uõ': 'ũ', 'uï': 'ụ',
        'ö': 'ư', 'öù': 'ứ', 'öø': 'ừ', 'öû': 'ử', 'öõ': 'ữ', 'öï': 'ự',
        'yù': 'ý', 'yø': 'ỳ', 'yû': 'ỷ', 'yõ': 'ỹ', 'î': 'ỵ',
        'í': 'í', 'ì': 'ì', 'æ': 'ỉ', 'ó': 'ĩ', 'ò': 'ị',
        'ñ': 'đ',
    };
    Object.keys(mapper).forEach(key => mapper[key.toUpperCase()] = mapper[key].toUpperCase());
    String.prototype.toUnicode = function () {
        let str = this, index = 0;
        while (index < str.length) {
            const ch1 = str.substring(index, index + 1);
            const ch2 = str.substring(index, index + 2);
            if (ch2.length == 2 && mapper[ch2]) {
                str = str.substring(0, index) + mapper[ch2] + str.substring(index + 2);
                index += 2;
            } else if (ch1.length == 1 && mapper[ch1]) {
                str = str.substring(0, index) + mapper[ch1] + str.substring(index + 1);
                index += 1;
            } else {
                index += 1;
            }
        }
        return str;
    };
};