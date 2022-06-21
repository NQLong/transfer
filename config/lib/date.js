module.exports = app => {

    Date.prototype.yyyymmdd = function () {
        return this.toISOString().slice(0, 10).replace(/-/g, '');
    };

    const get2 = (x) => ('0' + x).slice(-2);

    app.date = {
        dateFormat: (date) => {
            return get2(date.getMonth() + 1) + '/' + get2(date.getDate()) + '/' + date.getFullYear();
        },

        viDateFormat: (date) => {
            return get2(date.getDate()) + '/' + get2(date.getMonth() + 1) + '/' + date.getFullYear();
        },

        viTimeFormat: (date) => {
            return get2(date.getHours()) + ':' + get2(date.getMinutes());
        },

        dateTimeFormat: (date, format) => {
            if (format == 'yyyy') return date.getFullYear();
            else if (format == 'mm/yyyy') return get2(date.getMonth() + 1) + '/' + date.getFullYear();
            else if (format == 'dd/mm/yyyy') return get2(date.getDate()) + '/' + get2(date.getMonth() + 1) + '/' + date.getFullYear();
            else return '';
        },

        // TIME Operation ----------------------------------
        monthDiff: (d1, d2) => { //Difference in Months between two dates
            let months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth();
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        },

        dayDiff: (d1, d2) => { //Difference in Days between two dates
            let result = d2.getTime() - d1.getTime();
            return Math.floor(result / (1000 * 60 * 60 * 24));
        },

        fullFormatToDate: (string) => {
            let year = string.substring(0, 4);
            let month = string.substring(4, 6);
            let day = string.substring(6, 8);
            let hour = string.substring(8, 10);
            let minute = string.substring(10, 12);
            let second = string.substring(12, 14);
            return new Date(year, month - 1, day, hour, minute, second).getTime();
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
                start.setDate(start.getDate() + 1);
            }
            if (result > 70) { //Case: Quá nhiều ngày nghỉ
                return -1;
            }
            return result;
        }
    };

};