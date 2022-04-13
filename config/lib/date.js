module.exports = app => {

    Date.prototype.yyyymmdd = function() {
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

        numberNgayNghi: (start, end, danhSachNgayLe = []) => { //Số ngày nghỉ trong khoảng [start, end]
            let result = 0;
            while (end >= start && result <= 30) {
                let positionDay = start.getDay();
                if (positionDay == 0 || positionDay == 6) {
                    //thứ bảy, chủ nhật
                    //TODO: thêm ngày lễ
                } else {
                    let isNgayLe = false;
                    for (let idx = 0; idx < danhSachNgayLe.length; idx++) {
                        let ngayLeDate = new Date(danhSachNgayLe[idx]);
                        if (ngayLeDate.getFullYear() == start.getFullYear() && ngayLeDate.getMonth() == start.getMonth() && ngayLeDate.getDate() == start.getDate()) {
                            isNgayLe = true;
                            break;
                        }
                    }
                    result += isNgayLe ? 0 : 1;
                }
                start.setDate(start.getDate() + 1);
            }
            if (result > 30) { //Case: Quá nhiều ngày nghỉ
                return -1; 
            }
            return result;
        }
    };
};