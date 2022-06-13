// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtThoiKhoaBieu.foo = () => { };
    const MAX_DEVIANT = 20,
        DATE_UNIX = 24 * 60 * 60 * 1000;

    /**
     * Period: Tiết
     * Room: Phòng
     * Subject: Môn học
     * 
     * Condition: 
     */
    app.model.dtThoiKhoaBieu.init = async (ngayBatDau, done) => {
        const listDays = [2, 3, 4, 5, 6, 7];
        const thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
        let { hocKy, nam } = thoiGianMoMon;
        app.model.dtThoiKhoaBieu.getAll({ hocKy, nam, isMo: 1 }, '*', 'soLuongDuKien DESC', (error, lisSubjectsOfSemester) => {
            if (error) {
                return error;
            } else {
                app.model.dmCaHoc.getAll({ maCoSo: 2, kichHoat: 1 }, 'ten', 'ten', (error, listPeriods) => {
                    if (error) {
                        return error;
                    } else {
                        app.model.dmPhong.getAll({ kichHoat: 1 }, 'ten,sucChua', 'sucChua DESC', async (error, listRooms) => {
                            if (error) {
                                return error;
                            } else {
                                try {
                                    let data = await getDataGenerateSchedule(lisSubjectsOfSemester.filter(item => item.isMo), listDays, listPeriods, listRooms);
                                    if (data.error) done(data);
                                    else {
                                        app.model.dmNgayLe.getAll({
                                            statement: 'ngay >= :startDateOfYear and ngay <= :endDateOfYear',
                                            parameter: {
                                                startDateOfYear: new Date(nam, 0, 1).setHours(0, 0, 0, 1),
                                                endDateOfYear: new Date(nam, 11, 31).setHours(23, 59, 59, 999)
                                            }
                                        }, (error, listNgayLe) => {
                                            if (!error) {
                                                listNgayLe = listNgayLe.map(item => {
                                                    item.ngay = new Date(item.ngay).setHours(0, 0, 0);
                                                    return item;
                                                });
                                                let dataArray = Object.keys(data.data);
                                                const update = async (index = 0) => {
                                                    if (index == dataArray.length) {
                                                        done({ success: 'Tạo thời khóa biểu thành công' });
                                                    } else {
                                                        let id = dataArray[index],
                                                            changes = data.data[id];
                                                        let startDate = new Date(ngayBatDau),
                                                            currentDay = startDate.getDay() + 1,
                                                            distance = changes.thu - currentDay;
                                                        if (distance < 0) distance += 7;
                                                        changes.ngayBatDau = new Date(startDate.getTime() + distance * DATE_UNIX).setHours(0, 0, 0);
                                                        if (listNgayLe.some(item => item.ngay == changes.ngayBatDau)) {
                                                            changes.ngayBatDau = changes.ngayBatDau + 7 * DATE_UNIX;
                                                        }
                                                        changes.ngayKetThuc = await app.model.dtThoiKhoaBieu.calculateEndDate(changes, listNgayLe);
                                                        app.model.dtThoiKhoaBieu.update({ id }, changes, (error, item) => {
                                                            if (error || !item) done({ error: 'Lỗi khi tạo thời khóa biểu' });
                                                            else update(index + 1);
                                                        });
                                                    }
                                                };
                                                update();
                                            }
                                        });

                                    }
                                } catch (error) {
                                    done({ error });
                                }
                            }
                        });
                    }
                });
            }
        });
    };

    const getDataGenerateSchedule = (lisSubjectsOfSemester, listDays, listPeriods, listRooms) => new Promise(resolve => {
        let data = {}, dataNganh = {};
        // Tạo ra một object với key là mã ngành, value là 1 object nữa (key là mã môn, value là danh sách lịch của môn đó)
        // để kiểm tra nguyên tắc: số môn bắt buộc trong cùng 1 ngành có số lịch trùng nhau là ít nhất.
        Object.keys(lisSubjectsOfSemester.groupBy('maNganh')).forEach(maNganh => {
            dataNganh[maNganh] = {};
            lisSubjectsOfSemester.groupBy('maNganh')[maNganh]
                .filter(subject => subject.loaiMonHoc == 0)
                .map(item => item.maMonHoc)
                .sort()
                .filter((value, index, list) => !index || value != list[index - 1])
                .forEach(maMonHoc => dataNganh[maNganh][maMonHoc] = []);
        });
        const setRoomForSubject = (index, list) => {
            let danhSachKhongPhong = list.filter(subject => !subject.phong);
            if (index >= danhSachKhongPhong.length) {
                Object.keys(data).length ? resolve({ data, dataNganh }) : resolve({ error: 'Các môn học đều đã có thời khóa biểu!' });
            }
            let subject = danhSachKhongPhong[index],
                nganhBox = dataNganh[subject.maNganh];      //nganhBox = { abc: [ { tietBatDau, thu, phong } ], xyz: ... }
            lessonLoop: for (let period of listPeriods) {
                let startedPeriod = parseInt(period.ten),
                    isValid = isValidPeriod(startedPeriod, parseInt(subject.soTiet));

                if (isValid == undefined) {     // Nếu như số tiết không hợp lệ -> môn tiếp theo
                    setRoomForSubject(index + 1, list);

                } else if (isValid == false) {      // Nếu như số tiết không phù hợp -> tiết tiếp theo
                    continue;
                }
                else {
                    let day = parseInt(listDays.sample());      // Lấy 1 ngày bất kỳ
                    if (subject.loaiMonHoc == 0) {      // Nếu môn học là bắt buộc
                        /**
                         * Check lịch cho sinh viên có thể đăng ký được tất cả các môn bắt buộc
                         *    - Nếu ngành mở hơn 1 môn bắt buộc:
                         */
                        if (Object.keys(nganhBox).length > 1) {
                            /**
                             *  - Check các môn bắt buộc còn lại xem có trùng lịch hay không
                             *      + Nếu trùng và môn đó chỉ mở 1 lớp thì phải thay đổi
                             */
                            let currentTime = {
                                thu: subject.thu || day,
                                tietBatDau: parseInt(subject.tietBatDau) || startedPeriod,
                                tietKetThuc: (parseInt(subject.tietBatDau) || startedPeriod) + parseInt(subject.soTiet) - 1,
                                buoi: subject.buoi,
                                nhom: subject.nhom
                            };

                            if (nganhBox[subject.maMonHoc].length) {
                                // Cùng môn, khác buổi, cùng nhóm mà cùng ngày thì continue
                                if (nganhBox[subject.maMonHoc].some(item => item.thu == currentTime.thu && item.buoi != currentTime.buoi && item.nhom == currentTime.nhom && isCoincidentTime(item, currentTime))) continue;

                                // Cùng môn, cùng buổi, khác nhóm mà cùng giờ thì continue
                                //To-do: Nếu như hết xếp được thì quay lại từ đầu.
                                else if (nganhBox[subject.maMonHoc].some(item => item.thu == currentTime.thu && item.buoi == currentTime.buoi && item.nhom != currentTime.nhom && isCoincidentTime(item, currentTime))) continue;
                            }
                            let nganhBoxExceptCurrentSubject = Object.keys(nganhBox).filter(maMonHoc => maMonHoc != subject.maMonHoc);
                            for (let maMonHoc of nganhBoxExceptCurrentSubject) {
                                if (nganhBox[maMonHoc].length == 1 && nganhBox[maMonHoc].some(monKhac => {
                                    if (monKhac.thu && currentTime.thu == monKhac.thu && ((currentTime.tietBatDau >= monKhac.tietBatDau && currentTime.tietBatDau <= monKhac.tietKetThuc) || (currentTime.tietBatDau <= monKhac.tietBatDau && currentTime.tietKetThuc <= monKhac.tietKetThuc))) return false;
                                })) {
                                    continue lessonLoop;
                                }
                            }
                        }
                    }
                    let listRoomsAvailable = [];
                    for (let room of listRooms) {
                        if (app.model.dtThoiKhoaBieu.isAvailabledRoom(room.ten, lisSubjectsOfSemester, {
                            tietBatDau: subject.tietBatDau || startedPeriod, soTiet: parseInt(subject.soTiet), day: subject.thu || day
                        })) listRoomsAvailable.push(room);
                    }
                    let roomResult = bestFit(subject, listRoomsAvailable);
                    if (roomResult) {
                        data[subject.id] = { tietBatDau: subject.tietBatDau || startedPeriod, thu: subject.thu || day, phong: roomResult.ten, sucChua: roomResult.sucChua, maMonHoc: subject.maMonHoc, soTiet: subject.soTiet };
                        subject.loaiMonHoc == 0 && dataNganh[subject.maNganh][subject.maMonHoc].push({
                            thu: day,
                            tietBatDau: startedPeriod,
                            tietKetThuc: startedPeriod + parseInt(subject.soTiet) - 1,
                            nhom: subject.nhom, buoi: subject.buoi
                        });
                        let newList = lisSubjectsOfSemester.map(item => {
                            if (item.id == subject.id) {
                                item.tietBatDau = startedPeriod;
                                item.thu = day;
                                item.phong = roomResult.ten;
                                item.sucChua = roomResult.sucChua;
                                return item;
                            }
                            return item;
                        });
                        return setRoomForSubject(0, newList);
                    }
                }
            }
            setRoomForSubject(index + 1, list);
        };
        setRoomForSubject(0, lisSubjectsOfSemester);
    });

    app.model.dtThoiKhoaBieu.isAvailabledRoom = (room, lisSubjectsOfSemester, condition) => {
        let { tietBatDau, soTiet, day } = condition, tietKetThuc = tietBatDau + soTiet - 1;

        let listPresentStatus = lisSubjectsOfSemester.filter(subject => subject.phong == room && subject.thu == day).map(subject => subject = { tietBatDau: subject.tietBatDau, tietKetThuc: subject.tietBatDau + subject.soTiet - 1 });

        if (listPresentStatus.length == 0) return true;
        else {
            for (let timeAtPresentOfRoomId of listPresentStatus) {
                if (!timeAtPresentOfRoomId) return true;
                else if ((timeAtPresentOfRoomId && isCoincidentTime({ tietBatDau, tietKetThuc }, timeAtPresentOfRoomId))) return false;
            }
        }
    };

    const isValidPeriod = (tietBatDau, soTiet) => {
        /**
         * Sáng 5 tiết: từ 1 tới 5
         * Chiều 4 tiết: từ 6 tới 9
         */

        //Case 1: Nếu số tiết >= 6 => Undefinded
        if (soTiet >= 6) return undefined;

        //Case 2: Nếu số tiết = 5 mà bắt đầu trong từ tiết 2 tới chiều => False
        else if (soTiet == 5 && tietBatDau >= 2) return false;

        //Case 3: Nếu số tiết >= 4 mà bắt đầu từ tiết 3,4,5,7,8,9 => False
        else if (soTiet >= 4 && tietBatDau != 6 && tietBatDau >= 3) return false;

        //Case _
        return true;
    };

    const isCoincidentTime = (subjectA, subject) => {
        return ((subjectA.tietBatDau >= subject.tietBatDau && subjectA.tietBatDau <= subject.tietKetThuc) || (subjectA.tietBatDau <= subject.tietBatDau && subjectA.tietKetThuc <= subject.tietKetThuc));
    };

    const bestFit = (monHoc, listRooms) => {
        let { soLuongDuKien } = monHoc,
            sizeResult = 10000000, roomResult = null;
        for (let room of listRooms) {
            if (room.sucChua + MAX_DEVIANT >= soLuongDuKien && room.sucChua <= sizeResult) {
                sizeResult = room.sucChua;
                roomResult = room;
            }
        }
        return roomResult;
    };

    app.model.dtThoiKhoaBieu.calculateEndDate = (monHoc, listNgayLe) => new Promise((resolve, reject) => {
        app.model.dtDanhSachMonMo.get({ maMonHoc: monHoc.maMonHoc }, (error, item) => {
            if (error) {
                reject('Invalid Subject');
            } else {
                let { soTietLyThuyet, soTietThucHanh, soBuoiTuan, soTietBuoi } = item,
                    tongTiet = soTietLyThuyet + soTietThucHanh,
                    soTuan = Math.ceil(tongTiet / (soTietBuoi * soBuoiTuan));
                let ngayKetThuc = monHoc.ngayBatDau + soTuan * 7 * DATE_UNIX;
                for (let ngayLe of listNgayLe) {
                    if (ngayLe.ngay > monHoc.ngayBatDau && ngayLe.ngay <= ngayKetThuc && new Date(ngayLe.ngay).getDay() == monHoc.thu - 1) ngayKetThuc += 7 * DATE_UNIX;
                }
                if (!ngayKetThuc || ngayKetThuc == '' || isNaN(ngayKetThuc)) reject('Không tính được ngày kết thúc');
                resolve(ngayKetThuc);
            }
        });
    });
};