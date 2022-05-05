// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtThoiKhoaBieu.foo = () => { };
    const MAX_DEVIANT = 20;

    /**
     * Lesson: Tiết
     * Room: Phòng
     * Subject: Môn học
     * 
     * Condition: 
     */
    app.model.dtThoiKhoaBieu.init = async (done) => {
        const listDays = [2, 3, 4, 5, 6, 7];
        const thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
        let { hocKy, nam } = thoiGianMoMon;
        app.model.dtThoiKhoaBieu.getAll({ hocKy, nam }, '*', 'soLuongDuKien DESC', (error, lisSubjectsOfSemester) => {
            if (error) {
                return error;
            } else {
                app.model.dmCaHoc.getAll({ maCoSo: 2, kichHoat: 1 }, 'ten', 'ten', (error, listLessons) => {
                    if (error) {
                        return error;
                    } else {
                        app.model.dmPhong.getAll({ kichHoat: 1 }, 'ten,sucChua', 'sucChua DESC', async (error, listRooms) => {
                            if (error) {
                                return error;
                            } else {
                                let data = await getDataGenerateSchedule(lisSubjectsOfSemester, listDays, listLessons, listRooms);
                                if (data.error) done(data);
                                else {
                                    let dataArray = Object.keys(data.data);
                                    const update = (index = 0) => {
                                        if (index == dataArray.length) {
                                            done({ success: 'Tạo thời khóa biểu thành công' });
                                        } else {
                                            let id = dataArray[index],
                                                changes = data.data[id];
                                            app.model.dtThoiKhoaBieu.update({ id }, changes, (error, item) => {
                                                if (error || !item) done({ error: 'Lỗi khi tạo thời khóa biểu' });
                                                else update(index + 1);
                                            });
                                        }
                                    };
                                    update();
                                }
                            }
                        });
                    }
                });
            }
        });
    };

    const getDataGenerateSchedule = (lisSubjectsOfSemester, listDays, listLessons, listRooms) => new Promise(resolve => {
        let data = {}, dataNganh = {};
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
                nganhBox = dataNganh[subject.maNganh];
            lessonLoop: for (let lesson of listLessons) {
                let isValid = isValidLesson(parseInt(lesson.ten), parseInt(subject.soTiet));
                if (isValid == undefined) {
                    setRoomForSubject(index + 1, list);
                } else if (isValid == false) {
                    continue;
                }
                else
                    for (let day of listDays) {
                        //Nếu môn học là bắt buộc
                        if (subject.loaiMonHoc == 0) {
                            /**
                             * Check lịch cho sinh viên có thể đăng ký được tất cả các môn bắt buộc
                             *    - Nếu ngành mở hơn 1 môn bắt buộc:
                             */
                            if (Object.keys(nganhBox).length > 1) {
                                /**
                                 *  - Check các môn bắt buộc còn lại xem có trùng lịch hay không
                                 *      + Nếu trùng và môn đó chỉ mở 1 lớp thì phải thay đổi
                                 */
                                let currentTime = { thu: day, tietBatDau: subject.tietBatDau, tietKetThuc: parseInt(lesson.ten) + parseInt(subject.soTiet) - 1 };

                                let nganhBoxExceptCurrentSubject = Object.keys(nganhBox).filter(maMonHoc => maMonHoc != subject.maMonHoc);
                                for (let maMonHoc of nganhBoxExceptCurrentSubject) {
                                    if (nganhBox[maMonHoc].length == 1 && nganhBox[maMonHoc].some(ma => {
                                        let monKhac = nganhBox[ma];
                                        if (currentTime.thu == monKhac.thu && ((currentTime.tietBatDau >= monKhac.tietBatDau && currentTime.tietBatDau <= monKhac.tietKetThuc) || (currentTime.tietBatDau <= monKhac.tietBatDau && currentTime.tietKetThuc <= monKhac.tietKetThuc))) return false;
                                    })) {
                                        continue lessonLoop;
                                    }
                                }
                            }
                        }
                        let listRoomsAvailable = [];
                        for (let room of listRooms) {
                            if (app.model.dtThoiKhoaBieu.isAvailabledRoom(room.ten, lisSubjectsOfSemester, {
                                tietBatDau: parseInt(lesson.ten), soTiet: parseInt(subject.soTiet), day
                            })) listRoomsAvailable.push(room);
                        }
                        let roomResult = app.model.dtThoiKhoaBieu.bestFit(subject, listRoomsAvailable);
                        if (roomResult) {
                            data[subject.id] = { tietBatDau: parseInt(lesson.ten), thu: day, phong: roomResult.ten, sucChua: roomResult.sucChua };
                            subject.loaiMonHoc == 0 && dataNganh[subject.maNganh][subject.maMonHoc].push({ thu: day, tietBatDau: parseInt(lesson.ten), tietKetThuc: parseInt(lesson.ten) + parseInt(subject.soTiet) - 1 });
                            let newList = lisSubjectsOfSemester.map(item => {
                                if (item.id == subject.id) {
                                    item.tietBatDau = parseInt(lesson.ten);
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
                else if ((timeAtPresentOfRoomId && tietBatDau >= timeAtPresentOfRoomId.tietBatDau && tietBatDau <= timeAtPresentOfRoomId.tietKetThuc) || (tietBatDau <= timeAtPresentOfRoomId.tietBatDau && tietKetThuc <= timeAtPresentOfRoomId.tietKetThuc)) return false;
            }
        }
    };

    const isValidLesson = (tietBatDau, soTiet) => {
        /**
         * Sáng 5 tiết: từ 1 tới 5
         * Chiều 4 tiết: từ 6 tới 9
         */

        //Case 1: Nếu số tiết >= 6 => Undefinded
        if (soTiet >= 6) return undefined;

        //Case 2: Nếu số tiết = 5 mà bắt đầu trong buổi chiều => False
        else if (soTiet == 5 && tietBatDau > 5) return false;

        //Case 3: Nếu số tiết >= 4 mà bắt đầu từ tiết 3,4,5,7,8,9 => False
        else if (soTiet >= 4 && tietBatDau != 6 && tietBatDau >= 3) return false;

        //Case _
        return true;
    };

    // const isValidTime = (lesson, )

    app.model.dtThoiKhoaBieu.bestFit = (monHoc, listRooms) => {
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
};