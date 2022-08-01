import io from 'socket.io-client';
import dateformat from 'dateformat';
import routeMatcherLib from './routematcher.js';
import './sweetalert.min.js';
import FileSaver from 'file-saver';

const T = {
    title: title => {
        document.title = title && title != '' ? `${document.notification || ''} ${title} | USSH-VNUHCM` : 'USSH-VNUHCM';
    },
    FileSaver,
    rootUrl: window.location.protocol + '//' + window.location.hostname, // rootUrl: 'https://hcmussh.edu.vn',
    sexes: ['Nam', 'Nữ'],
    component: { '<empty>': null },
    pageTypes: [
        '<empty>',
        'all news',
        'all events',
        'all divisions',
        'all companies',
        'carousel',
        'last events',
        'last news',
        'feature',
        'video',
        'admission',
        'notification',
        'gallery',
        'content',
        'contact',
        'tin tức chung',
        'thư viện'
    ],
    defaultPageSize: 50,
    defaultUserPageSize: 21,
    defaultUserSidebarSize: 3,
    newsFeedPageSize: 10,
    eventFeedPageSize: 5,

    randomPassword: length => Math.random(new Date()).toString(36).slice(2).slice(-length),

    debug: (location.hostname === 'localhost' || location.hostname === '127.0.0.1'),

    isHCMUSSH: email => email.endsWith('@hcmussh.edu.vn'),

    ready: (pathname, done) => $(document).ready(() => setTimeout(() => {
        if (pathname == undefined) {
            done = null;
            pathname = window.location.pathname;
        } else if (typeof pathname == 'function') {
            done = pathname;
            pathname = window.location.pathname;
        }

        done && done();

        $('ul.app-menu > li').removeClass('is-expanded');
        $('ul.app-menu a.active').removeClass('active');
        let menuItem = $(`a.app-menu__item[href='${pathname}']`);
        if (menuItem.length != 0) {
            menuItem.addClass('active');
            // setTimeout(() => $('.app-sidebar').animate({ scrollTop: menuItem.offset().top - menuItem.parent().parent().offset().top }), 200);
        } else {
            menuItem = $(`a.treeview-item[href='${pathname}']`);
            if (menuItem.length != 0) {
                menuItem.addClass('active');
                menuItem.parent().parent().parent().addClass('is-expanded');
                // setTimeout(() => $('.app-sidebar').animate({ scrollTop: menuItem.offset().top - menuItem.parent().parent().offset().top }), 200);
            }
        }
        // Update user url
        const userUrl = window.location.pathname;
        if (userUrl.startsWith('/user')) T.cookie('userUrl', userUrl);

    }, 500)),

    url: (url) => url + (url.indexOf('?') === -1 ? '?t=' : '&t=') + new Date().getTime(),

    download: (url, name) => {
        let link = document.createElement('a');
        link.target = '_blank';
        link.download = name;
        link.href = url;
        link.click();
    },

    getCookiePage: (cookieName, key) => {
        const pageData = T.storage(cookieName);
        return (pageData && pageData[key]) ? pageData[key] : '';
    },

    cookie: (cname, cvalue, exdays) => {
        if (cvalue === undefined) {
            const name = cname + '=';
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i].trimStart();
                if (c.indexOf(name) === 0) {
                    try {
                        return JSON.parse(c.substring(name.length, c.length));
                    } catch {
                        return {};
                    }
                }
            }
            return {};
        } else {
            let d = new Date();
            d.setTime(d.getTime() + ((exdays === undefined ? 60 : exdays) * 24 * 60 * 60 * 1000));
            document.cookie = cname + '=' + JSON.stringify(cvalue) + ';expires=' + d.toUTCString() + ';path=/';
        }
    },
    storage: (cname, cvalue) => {
        if (cvalue != null) {
            window.localStorage.setItem(cname, JSON.stringify(cvalue));
        } else {
            try {
                return JSON.parse(window.localStorage.getItem(cname)) || {};
            } catch {
                return {};
            }
        }
    },

    pageKeyName: {
        pageNumber: 'N',
        pageSize: 'S',
        pageCondition: 'C',
        filter: 'F',
        advancedSearch: 'A'
    },

    getCookiePageCondition: cookieName => {
        const pageData = T.storage(cookieName);
        return pageData && pageData[T.pageKeyName.pageCondition] ? pageData[T.pageKeyName.pageCondition] : '';
    },
    initPage: (cookieName) => {
        let initData = T.storage(cookieName);
        if (initData[T.pageKeyName.pageNumber] == null) initData[T.pageKeyName.pageNumber] = 1;
        if (initData[T.pageKeyName.pageSize] == null) initData[T.pageKeyName.pageSize] = 50;
        if (initData[T.pageKeyName.pageCondition] == null) initData[T.pageKeyName.pageCondition] = '';
        if (initData[T.pageKeyName.filter] == null) initData[T.pageKeyName.filter] = '%%%%%%%%';
        if (initData[T.pageKeyName.advancedSearch] == null) initData[T.pageKeyName.advancedSearch] = false;
        T.storage(cookieName, initData);
    },

    updatePage: (cookieName, pageNumber, pageSize, pageCondition, filter, advancedSearch) => {
        const updateStatus = {}, oldStatus = T.storage(cookieName);
        updateStatus[T.pageKeyName.pageNumber] = pageNumber ? pageNumber : oldStatus[T.pageKeyName.pageNumber];
        updateStatus[T.pageKeyName.pageSize] = pageSize ? pageSize : oldStatus[T.pageKeyName.pageSize];
        updateStatus[T.pageKeyName.pageCondition] = pageCondition != null || pageCondition == '' ? pageCondition : oldStatus[T.pageKeyName.pageCondition];
        updateStatus[T.pageKeyName.filter] = filter ? filter : oldStatus[T.pageKeyName.filter];
        updateStatus[T.pageKeyName.advancedSearch] = advancedSearch != null ? advancedSearch : oldStatus[T.pageKeyName.advancedSearch];
        T.storage(cookieName, updateStatus);
        return {
            pageNumber: updateStatus[T.pageKeyName.pageNumber],
            pageSize: updateStatus[T.pageKeyName.pageSize],
            pageCondition: updateStatus[T.pageKeyName.pageCondition],
            filter: updateStatus[T.pageKeyName.filter],
            advancedSearch: updateStatus[T.pageKeyName.advancedSearch]
        };
    },

    onResize: () => {
        const marginTop = 6 + $('header').height(),
            marginBottom = 6 + $('footer').height();
        $('.site-content').css('margin', marginTop + 'px 0 ' + marginBottom + 'px 0');
    },

    validateEmail: email => (/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i).test(String(email).toLowerCase()),

    dateToText: (date, format) => dateformat(date, format ? format : 'dd/mm/yyyy HH:MM:ss'),
    numberDisplay: (number, replaceValue = '.') => {
        const decimalSplitter = replaceValue == '.' ? ',' : '.';
        let [integer, decimal] = number.toString().split('.');
        if (!decimal) [integer, decimal] = number.toString().split(',');
        return `${integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, replaceValue)}${decimal ? decimalSplitter : ''}${decimal || ''}`
    },

    // Libraries ----------------------------------------------------------------------------------
    routeMatcher: routeMatcherLib.routeMatcher,

    notify: (message, type) => $.notify({ message }, { type, placement: { from: 'bottom' }, z_index: 2000 }),

    alert: (text, icon, button, timer) => {
        let options = {}, done = null;
        if (icon) {
            if (typeof icon == 'boolean') {
                options.button = icon;
                options.icon = 'success';
                if (typeof timer == 'number') options.timer = timer;
                else if (typeof timer == 'function') done = timer;
            } else if (typeof icon == 'number') {
                options.timer = icon;
                options.icon = 'success';
            } else {
                options.icon = icon;
            }

            if (button != undefined) {
                if (typeof button == 'number') {
                    options.timer = options.button;
                    options.button = true;
                } else {
                    options.button = button;
                    if (timer) options.timer = timer;
                }
            } else {
                options.button = true;
            }
        } else {
            options.icon = 'success';
            options.button = true;
        }
        options.text = text;
        done ? swal(options).then(done) : swal(options);
    },

    confirm: (title, html, icon, dangerMode, done) => {
        if (typeof icon == 'function') {
            done = icon;
            icon = 'warning';
            dangerMode = false;
        } else if (typeof icon == 'boolean') {
            done = dangerMode;
            dangerMode = icon;
            icon = 'warning';
        } else if (typeof dangerMode == 'function') {
            done = dangerMode;
            dangerMode = false;
        }
        var content = document.createElement('div');
        content.innerHTML = html;
        swal({ icon, title, content, dangerMode, buttons: { cancel: true, confirm: true }, }).then(done);
    },

    confirmLoading: (title, text, successText = 'Thành công', failText = 'Thất bại', icon, buttonText, content, done) => {
        swal({
            title,
            text,
            icon,
            content,
            closeOnClickOutside: false,
            closeOnEsc: false,
            dangerMode: true,
            buttons: {
                cancel: 'Hủy',
                confirm: buttonText,
                // closeModal: false,
            },
        })
            .then((value) => {
                if (value) {
                    swal({
                        title: "Loading",
                        text: "Vui lòng giữ nguyên trang",
                        icon: "warning",
                        button: null,
                    });
                    done(value).then((data) => {
                        swal({
                            title: data.success ? successText : failText,
                            text: data.success ? data.success : data.error.message,
                            icon: data.success ? "success" : "error",
                            button: null,
                            timer: 3000
                        });
                    });
                }
            });
    },

    randomHexColor: () => {
        let n = (Math.random() * 0xfffff * 1000000).toString(16);
        return '#' + n.slice(0, 6);
    },

    mobileDisplay: mobile => mobile ? (mobile.length == 10 ? mobile.toString().replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3') : mobile.toString().replace(/(\d{3})(\d{4})(\d{4})/, '($1) $2 $3')) : '',

    confirm3: (title, html, icon, buttonDanger, buttonSuccess, done) => {
        var content = document.createElement('div');
        content.innerHTML = html;
        'Bạn có muốn <b>ghi đè</b> dữ liệu đang có bằng dữ liệu mới không?<br>Nếu không rõ, hãy chọn <b>Không ghi đè</b>!';
        swal({
            icon, title, content,
            dangerMode: true,
            buttons: {
                cancel: { text: 'Huỷ', value: null, visible: true },
                false: { text: buttonDanger, value: false },
                confirm: { text: buttonSuccess, value: true }
            }
        }).then(done)
    },

    dateFormat: { format: 'dd/mm/yyyy hh:ii', autoclose: true, todayBtn: true },
    birthdayFormat: { format: 'dd/mm/yyyy', autoclose: true, todayBtn: true },
    formatDate: str => {
        try {
            let [strDate, strTime] = str.split(' '),
                [date, month, year] = strDate.split('/'),
                [hours, minutes] = strTime ? strTime.split(':') : [0, 0];
            return new Date(year, month - 1, date, hours, minutes);
        } catch (ex) {
            return null;
        }
    },

    tooltip: (timeOut = 250) => {
        $(function () {
            setTimeout(() => {
                $(`[data-toggle='tooltip']`).tooltip();
            }, timeOut);
        });
    },
    invertAsMap: obj => {
        const retMap = new Map();
        Object.keys(obj).forEach(key => {
            retMap.set(obj[key], key);
        });
        return retMap;
    },

    filter: (data, condition) => data.filter(item => Object.keys(condition).every(key => item[key] === condition[key])),

    pickBy: obj => Object.entries(obj).reduce((a, [k, v]) => (v == null ? a : (a[k] = v, a)), {}),

    createAjaxAdapter: (url, parseData, parseResponse) => {
        if (parseResponse == undefined) {
            parseResponse = parseData;
            parseData = {};
        }
        return ({
            ajax: true,
            url,
            data: parseData,
            processResults: response => ({ results: parseResponse(response) }),
        });
    },
    linkNewsDetail: (item) => {
        const language = T.language();
        if (language == 'vi' && item.link) {
            return ('/tin-tuc/' + item.link);
        } else if (language == 'vi' && !item.link) {
            return ('/news/item/' + item.id);
        } else if (language == 'en' && item.linkEn) {
            return ('/article/' + item.linkEn);
        } else if (language == 'en' && !item.linkEn) {
            return ('/news-en/item/' + item.id);
        }
    },


    //JSON Operate---------------------------------------------------------------------------------------------
    stringify: (value, defaultValue = '') => {
        try {
            return JSON.stringify(value);
        } catch (exception) {
            T.notify(`Lỗi stringify: ${exception}, đặt theo giá trị mặc định: ${defaultValue}`, 'danger');
            return defaultValue;
        }
    },

    parse: (value, defaultValue = {}) => {
        try {
            return JSON.parse(value);
        } catch (exception) {
            T.notify(`Lỗi parse: ${exception}, đặt theo giá trị mặc định: ${defaultValue}`, 'danger');
            return defaultValue;
        }
    },

    isObject: (value) => value && value.constructor == ({}).constructor,

    // TIME Operation ----------------------------------
    monthDiff: (d1, d2) => { //Difference in Months between two dates
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    },

    dayDiff: (d1, d2) => { //Difference in Days between two dates
        let result = d2.getTime() - d1.getTime();
        return Math.floor(result / (1000 * 60 * 60 * 24));
    },

    numberNgayNghi: (start, end, yearCalc, danhSachNgayLe = []) => { //Số ngày nghỉ trong khoảng [start, end] ở năm yearCalc (nếu tồn tại)
        if (yearCalc) {
            let startDateOfYear = new Date(yearCalc, 0, 1, 0, 0, 0, 0);
            let endDateOfYear = new Date(yearCalc, 11, 31, 23, 59, 59, 999);
            if (start <= startDateOfYear) start = startDateOfYear;
            if (endDateOfYear <= end) end = endDateOfYear;
        }
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        danhSachNgayLe.sort();
        let result = 0, idNgayLe = 0;
        while (end >= start && result <= 70) {
            let positionDay = start.getDay();
            if (positionDay == 0 || positionDay == 6) {
                //thứ bảy, chủ nhật
            } else {
                // kiểm tra ngày lễ
                while (idNgayLe < danhSachNgayLe.length && new Date(danhSachNgayLe[idNgayLe]) < start) idNgayLe++;
                if (idNgayLe < danhSachNgayLe.length) {
                    let ngayLeDate = new Date(danhSachNgayLe[idNgayLe]);
                    if (ngayLeDate.getFullYear() == start.getFullYear() && ngayLeDate.getMonth() == start.getMonth() && ngayLeDate.getDate() == start.getDate()) {
                        // do nothing
                    } else result += 1;
                } else result += 1;
            }
            start = start.nextDate();
        }
        if (result > 70) { //Case: Quá nhiều ngày nghỉ
            return -1;
        }
        return result;
    }
}


T.socket = T.debug ? io('http://localhost:7012', { transports: ['websocket'] }) : io(T.rootUrl, { secure: true, transports: ['websocket'] });

// Language
let languages = ['vi', 'en'];
T.language = texts => {
    let lg = 'vi', pathname = window.location.pathname, query = new URLSearchParams(window.location.search);
    const lang = query.get('lang');

    if (pathname.endsWith('/en') || pathname.startsWith('/news-en') || pathname.startsWith('/article')) {
        lg = 'en';
    } else if (lang && languages.includes(lang.toLowerCase())) {
        lg = lang.toLowerCase();
    }

    return texts ? (texts[lg] ? texts[lg] : '') : lg;
};

T.language.setLanguages = _languages => {
    languages = _languages && Array.isArray(_languages) && _languages.length ? _languages : ['vi', 'en'];
};

T.language.next = () => {
    const lg = T.language();
    if (!lg) return languages[0];
    let index = languages.indexOf(lg);
    if (index == -1) index = 0; // No language
    else index++; // Next language
    if (index >= languages.length) index -= languages.length; // If larger than length, reset
    return languages[index];
};

T.language.current = () => {
    const lg = T.language();
    return lg ? lg : languages[0];
};

T.language.switch = () => {
    const language = T.language.next();
    return { language };
};

T.language.parse = (text, getAll, parseLanguages) => {
    let obj = {};
    try { obj = JSON.parse(text); } catch (e) { obj = {}; }
    const objLength = Object.keys(obj).length;
    (parseLanguages && Array.isArray(parseLanguages) ? parseLanguages : languages).forEach(language => {
        if (obj[language] == null && !objLength) obj[language] = text;
    });
    if (typeof getAll == 'string' && (parseLanguages && Array.isArray(parseLanguages) ? parseLanguages : languages).includes(getAll)) {
        return obj[getAll];
    } else {
        return getAll ? obj : obj[T.language()];
    }
};

T.language.getMonth = () => ({
    vi: ['Tháng một', 'Tháng hai', 'Tháng ba', 'Tháng tư', 'Tháng năm', 'Tháng sáu', 'Tháng bảy', 'Tháng tám', 'Tháng chín', 'Tháng mười', 'Tháng mười một', 'Tháng mười hai'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
}[T.language()]);


T.get2 = x => ('0' + x).slice(-2);

T.socket.on('connect', () => {
    if (T.connected === 0) {
        T.connected = true;
    } else if (T.debug) {
        location.reload();
    }
});

if (T.debug) {
    T.connected = 0;
    T.socket.on('reconnect_attempt', attemptNumber => T.connected = -attemptNumber);
    T.socket.on('debug', type => (type === 'reload') && location.reload());
}

const getOracleErrorMessage = errorNum => {
    if (Number.isInteger(errorNum)) {
        switch (errorNum) {
            case 1:
                return 'ORA-00001: Unique constraint violated.';
            case 904:
                return 'ORA-00904: Invalid identifier.';
            case 942:
                return 'ORA-00942: Table or view does not exist.';
            case 1438:
                return 'ORA-01438: Value larger than specified precision allows for this column.';
            case 1722:
                return 'ORA-01722: Invalid number.';
            case 3113:
                return 'ORA-03113: End-of-file on communication channel';
            case 3114:
                return 'ORA-03114: Not Connected to Oracle';
            case 6550:
                return 'ORA-06550: Invalid block of PL/SQL code';
            case 12899:
                return 'ORA-12899: Value too large';
            default:
                return 'ORA-' + errorNum;
        }
    } else return null;
};

['get', 'post', 'put', 'delete'].forEach(method => T[method] = (url, data, success, error) => {
    if (typeof data === 'function') {
        error = success;
        success = data;
    }
    $.ajax({
        url: T.url(url),
        data,
        type: method.toUpperCase(),
        success: response => {
            if (response.error) {
                if (typeof response.error === 'string') response.error = {
                    message: response.error
                };
                else if (response.error.constructor === ({}).constructor) {
                    if (response.error.errorNum) response.error.message = getOracleErrorMessage(response.error.errorNum);
                }
            }
            success && success(response);
        },
        error: (jqXHR, textStatus, errorThrown) => {
            const data = {
                error: {}
            };
            if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
                if (typeof jqXHR.responseJSON.error === 'string') data.error.message = jqXHR.responseJSON.error;
                else if (jqXHR.responseJSON.error.errorNum) data.error.message = getOracleErrorMessage(jqXHR.responseJSON.error.errorNum);
            } else if (jqXHR.responseText) data.error.message = jqXHR.responseText;
            else if (jqXHR.readyState == 4) {
                if (jqXHR.status === 401) data.error.message = 'Không thể truy cập tài nguyên, vui lòng đăng nhập lại.';
                if (jqXHR.status === 403) data.error.message = 'Không thể truy cập tài nguyên.';
                if (jqXHR.status === 404) data.error.message = 'Không tìm thấy tài nguyên.';
                if (jqXHR.status < 500) data.error.message = 'Yêu cầu bị lỗi!';
                data.error.message = 'Server gặp lỗi. Hãy liên hệ logngười quản trị trang web.';
            } else if (jqXHR.readyState == 0) data.error.message = 'Mạng có vấn đề, xin hãy kiểm tra lại đường truyền.';
            else data.error.message = errorThrown;
            console.error('Ajax (' + method + ' => ' + url + ') has error. Error:', data.error.message || jqXHR);
            error && error(data);
        }
    })
});


$(() => {
    $(window).resize(T.onResize);
    setTimeout(T.onResize, 100);
});

T.ftcoAnimate = () => {
    $('.ftco-animate').waypoint(function (direction) {
        if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
            $(this.element).addClass('item-animate');
            setTimeout(function () {
                $('body .ftco-animate.item-animate').each(function (k) {
                    const el = $(this);
                    setTimeout(function () {
                        var effect = el.data('animate-effect');
                        if (effect === 'fadeIn') {
                            el.addClass('fadeIn ftco-animated');
                        } else if (effect === 'fadeInLeft') {
                            el.addClass('fadeInLeft ftco-animated');
                        } else if (effect === 'fadeInRight') {
                            el.addClass('fadeInRight ftco-animated');
                        } else {
                            el.addClass('fadeInUp ftco-animated');
                        }
                        el.removeClass('item-animate');
                    }, k * 50, 'easeInOutExpo');
                });

            }, 100);
        }
    }, { offset: '95%' });
};

T.numberToVnText = (so) => {
    const doc1so = (so) => {
        let arr_chuhangdonvi = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
        let resualt = '';
        resualt = arr_chuhangdonvi[so];
        return resualt;
    };

    const doc2so = (so) => {
        so = so.replace(' ', '');
        let arr_chubinhthuong = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
        let arr_chuhangdonvi = ['mươi', 'mốt', 'hai', 'ba', 'bốn', 'lăm', 'sáu', 'bảy', 'tám', 'chín'];
        let arr_chuhangchuc = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
        let resualt = '';
        let sohangchuc = so.substr(0, 1);
        let sohangdonvi = so.substr(1, 1);
        resualt += arr_chuhangchuc[sohangchuc];
        if (sohangchuc == 1 && sohangdonvi == 1)
            resualt += ' ' + arr_chubinhthuong[sohangdonvi];
        else if (sohangchuc == 1 && sohangdonvi > 1)
            resualt += ' ' + arr_chuhangdonvi[sohangdonvi];
        else if (sohangchuc > 1 && sohangdonvi > 0)
            resualt += ' ' + arr_chuhangdonvi[sohangdonvi];

        return resualt;
    };

    const doc3so = (so) => {
        let resualt = '';
        let arr_chubinhthuong = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
        let sohangtram = so.substr(0, 1);
        let sohangchuc = so.substr(1, 1);
        let sohangdonvi = so.substr(2, 1);
        resualt = arr_chubinhthuong[sohangtram] + ' trăm';
        if (sohangchuc == 0 && sohangdonvi != 0)
            resualt += ' linh ' + arr_chubinhthuong[sohangdonvi];
        else if (sohangchuc != 0)
            resualt += ' ' + doc2so(sohangchuc + ' ' + sohangdonvi);
        return resualt;
    };

    const docsonguyen = (so) => {
        let result = '';
        if (so != undefined) {
            let arr_So = [{ ty: '' }, { trieu: '' }, { nghin: '' }, { tram: '' }];
            let sochuso = so.length;
            for (let i = (sochuso - 1); i >= 0; i--) {
                if ((sochuso - i) <= 3) {
                    if (arr_So['tram'] != undefined)
                        arr_So['tram'] = so.substr(i, 1) + arr_So['tram'];
                    else arr_So['tram'] = so.substr(i, 1);

                }
                else if ((sochuso - i) > 3 && (sochuso - i) <= 6) {
                    if (arr_So['nghin'] != undefined)
                        arr_So['nghin'] = so.substr(i, 1) + arr_So['nghin'];
                    else arr_So['nghin'] = so.substr(i, 1);
                }
                else if ((sochuso - i) > 6 && (sochuso - i) <= 9) {
                    if (arr_So['trieu'] != undefined)
                        arr_So['trieu'] = so.substr(i, 1) + arr_So['trieu'];
                    else arr_So['trieu'] = so.substr(i, 1);
                }
                else {
                    if (arr_So.ty != undefined)
                        arr_So.ty = so.substr(i, 1) + arr_So.ty;
                    else arr_So.ty = so.substr(i, 1);
                }
            }

            if (arr_So['ty'] > 0)
                result += doc(arr_So['ty']) + ' tỷ';
            if (arr_So['trieu'] > 0) {
                if (arr_So['trieu'].length >= 3 || arr_So['ty'] > 0)
                    result += ' ' + doc3so(arr_So['trieu']) + ' triệu';
                else if (arr_So['trieu'].length >= 2)
                    result += ' ' + doc2so(arr_So['trieu']) + ' triệu';
                else result += ' ' + doc1so(arr_So['trieu']) + ' triệu';
            }
            if (arr_So['nghin'] > 0) {
                if (arr_So['nghin'].length >= 3 || arr_So['trieu'] > 0)
                    result += ' ' + doc3so(arr_So['nghin']) + ' nghìn';
                else if (arr_So['nghin'].length >= 2)
                    result += ' ' + doc2so(arr_So['nghin']) + ' nghìn';
                else result += ' ' + doc1so(arr_So['nghin']) + ' nghìn';
            }
            if (arr_So['tram'] > 0) {
                if (arr_So['tram'].length >= 3 || arr_So['nghin'] > 0)
                    result += ' ' + doc3so(arr_So['tram']);
                else if (arr_So['tram'].length >= 2)
                    result += ' ' + doc2so(arr_So['tram']);
                else result += ' ' + doc1so(arr_So['tram']);
            }
        }
        return result;
    };

    const doc = (so) => {
        let kytuthapphan = ',';
        let result = '';
        if (so != undefined) {
            so = ' ' + so + ' ';
            so = so.trim();
            let cautrucso = so.split(kytuthapphan);
            if (cautrucso[0] != undefined) {
                result += docsonguyen(cautrucso[0]);
            }
            if (cautrucso[1] != undefined) {
                result += ' phẩy ' + docsonguyen(cautrucso[1]);
            }
        }

        return result;
    };

    return doc(so);
};


export default T;

String.prototype.getText = function () {
    return T.language.parse(this);
};

String.prototype.viText = function () {
    return T.language.parse(this, true).vi;
};

String.prototype.replaceAll = function (search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.upFirstChar = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.lowFirstChar = function () {
    return this[0].toLowerCase() + this.slice(1);
}

String.prototype.normalizedName = function () {
    let convertToArray = this.toLowerCase().split(' ');
    let result = convertToArray.map(function (val) {
        return val.replace(val.charAt(0), val.charAt(0).toUpperCase());
    });
    return result.join(' ');
}

String.prototype.getFirstLetters = function () {
    const firstLetters = this
        .toUpperCase()
        .split(' ')
        .map(word => word[0])
        .join('');
    return firstLetters;
}
//Array prototype -----------------------------------------------------------------------------------------------------
Array.prototype.contains = function (...pattern) {
    return pattern.reduce((result, item) => result && this.includes(item), true);
};

Array.prototype.groupBy = function (key) {
    return this.reduce(
        (result, item) => ({
            ...result,
            [item[key]]: [...(result[item[key]] || []), item,],
        }),
        {},
    );
};

Date.prototype.getText = function () {
    return T.language.getMonth()[this.getMonth()] + ' ' + T.get2(this.getDate()) + ', ' + this.getFullYear() + ' ' + T.get2(this.getHours()) + ':' + T.get2(this.getMinutes());
};
Date.prototype.getDateText = function () {
    return T.language.getMonth()[this.getMonth()] + ' ' + T.get2(this.getDate()) + ', ' + this.getFullYear();
};
Date.prototype.strNgay = function () {
    return T.get2(this.getDate()) + '/' + T.get2(this.getMonth() + 1) + '/' + this.getFullYear();
};
Date.prototype.getTimeText = function () {
    return T.get2(this.getHours()) + ':' + T.get2(this.getMinutes());
};
Date.prototype.getShortText = function () {
    return this.getFullYear() + '/' + T.get2(this.getMonth() + 1) + '/' + T.get2(this.getDate()) + ' ' + T.get2(this.getHours()) + ':' + T.get2(this.getMinutes());
};
Date.prototype.ddmmyyyy = function () {
    return this.getDate() ? (T.get2(this.getDate()) + '/' + T.get2(this.getMonth() + 1) + '/' + this.getFullYear()) : '';
};
Date.prototype.mmyyyy = function () {
    return this.getDate() ? (T.get2(this.getMonth() + 1) + '/' + this.getFullYear()) : '';
};
Date.prototype.roundDate = function () {
    this.setHours(0, 0, 0, 0);
    return this;
};
Date.prototype.roundMonth = function () {
    this.setHours(0, 0, 0, 0);
    return this;
};
Date.prototype.roundYear = function () {
    this.setHours(0, 0, 0, 0);
    return this;
};
Date.prototype.nextDate = function (n = 1) {
    this.setDate(this.getDate() + n);
    return this;
};
Date.newDate = function (n = 0) {
    let date = new Date();
    date.setDate(date.getDate() + n);
    return date;
};
Date.nextYear = function (n = 1) {
    let nextYear = new Date().roundDate();
    nextYear.setFullYear(nextYear.getFullYear() + n);
    return nextYear;
};
Date.lastYear = function (n = 1) {
    let lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - n);
    return lastYear;
};
Date.getDateInputDefaultMin = function () {
    return 0;
};
Date.getDateInputDefaultMax = function () {
    return Date.nextYear().roundDate().getTime();
};

(function () {
    // https://stackoverflow.com/questions/20989458/select2-open-dropdown-on-focus
    $(document).on('focus', '.select2-selection.select2-selection--single', function (e) {
        $(this).closest('.select2-container').siblings('select:enabled').select2('open');
    });
    $('select.select2').on('select2:closing', function (e) {
        $(e.target).data('select2').$selection.one('focus focusin', function (e) {
            e.stopPropagation();
        });
    });
})()