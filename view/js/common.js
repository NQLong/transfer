import io from 'socket.io-client';
import dateformat from 'dateformat';
import routeMatcherLib from './routematcher.js';
import './sweetalert.min.js';
import FileSaver from 'file-saver';

const T = {
    FileSaver,
    rootUrl: window.location.protocol + '//' + window.location.hostname, // rootUrl: 'https://hcmussh.edu.vn',
    sexes: ['Nam', 'Nữ'],
    component: { '<empty>': null },
    pageTypes: [
        '<empty>',
        'all news',
        'all events',
        'all divisions',
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
    numberDisplay: number => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),

    // Libraries ----------------------------------------------------------------------------------
    routeMatcher: routeMatcherLib.routeMatcher,

    notify: (message, type) => $.notify({ message }, { type, placement: { from: 'bottom' }, z_index: 2000 }),

    alert: (text, icon, button, timer) => {
        let options = {};
        if (icon) {
            if (typeof icon == 'boolean') {
                options.button = icon;
                options.icon = 'success';
                if (timer) options.timer = timer;
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
        swal(options);
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

    confirm3: (title, html, icon, buttonDanger, buttonSuccess, done) => {
        var content = document.createElement('div');
        content.innerHTML = html;
        'Bạn có muốn <b>ghi đè</b> dữ liệu đang có bằng dữ liệu mới không?<br>Nếu không rõ, hãy chọn <b>Không ghi đè</b>!';
        swal({
            icon, title, content,
            dangerMode: true,
            buttons: {
                cancel: { text: 'Huỷ', value: null, visible: true },
                confirm: { text: buttonDanger, value: true },
                false: { text: buttonSuccess, value: false }
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
    }
};

T.socket = T.debug ? io() : io.connect(T.rootUrl, { secure: true });

T.language = texts => {
    let lg = window.location.pathname.includes('/en')
        || window.location.pathname.includes('/news-en')
        || window.location.pathname.includes('/article') ? 'en' : 'vi';
    if (lg == null || (lg != 'vi' && lg != 'en')) lg = 'vi';
    return texts ? (texts[lg] ? texts[lg] : '') : lg;
};
T.language.next = () => {
    let language = window.location.pathname.includes('/en')
        || window.location.pathname.includes('/news-en')
        || window.location.pathname.includes('/article') ? 'en' : 'vi';
    // const language = T.cookie('language');
    return (language == null || language == 'en') ? 'vi' : 'en';
};
T.language.current = () => {
    const language = T.cookie('language');
    return (language == null || language == 'en') ? 'en' : 'vi';
};
T.language.switch = () => {
    const language = T.language.next();
    T.cookie('language', language);
    return { language };
};
T.language.parse = (text, getAll) => {
    let obj = {};
    try { obj = JSON.parse(text) } catch { };
    if (obj.vi == null) obj.vi = text;
    if (obj.en == null) obj.en = text;
    return getAll ? obj : obj[T.language()];
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

['get', 'post', 'put', 'delete'].forEach(method => T[method] = (url, data, success, error) => {
    if (typeof data === 'function') {
        error = success;
        success = data;
    }
    $.ajax({
        url: T.url(url),
        data,
        type: method.toUpperCase(),
        success: data => success && success(data),
        error: data => {
            console.error('Ajax (' + method + ' => ' + url + ') has error. Error:', data);
            error && error(data)
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

//Array prototype -----------------------------------------------------------------------------------------------------
Array.prototype.contains = function (...pattern) {
    return pattern.reduce((result, item) => result && this.includes(item), true);
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