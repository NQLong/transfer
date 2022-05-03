// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtThoiKhoaBieu.foo = () => { };
    const MAX_DEVIANT = 20;

    app.model.dtThoiKhoaBieu.init = async (done) => {
        const listDays = [2, 3, 4, 5, 6, 7];
        const thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
        let { hocKy, nam } = thoiGianMoMon;
        app.model.dtThoiKhoaBieu.getAll({ hocKy, nam }, '*', 'soLuongDuKien DESC', (error, listSubjectsOfSem) => {
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
                                let data = await generateSchedule(listSubjectsOfSem, listDays, listLessons, listRooms);
                                if (data.error) done(data);
                                else {
                                    let dataArray = Object.keys(data);
                                    const update = (index = 0) => {
                                        if (index == dataArray.length) {
                                            done({ success: 'Tạo thời khóa biểu thành công' });
                                        } else {
                                            let id = dataArray[index],
                                                changes = data[id];
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

    const generateSchedule = (listSubjectsOfSem, listDays, listLessons, listRooms) => new Promise(resolve => {
        let data = {};
        const setRoomForSubject = (index, list) => {
            let danhSachKhongPhong = list.filter(subject => !subject.phong);
            if (index >= danhSachKhongPhong.length) {
                Object.keys(data).length ? resolve(data) : resolve({ error: 'Các môn học đều đã có thời khóa biểu!' });
            }
            let subject = danhSachKhongPhong[index];
            for (let lesson of listLessons) {
                let isValid = isValidLesson(parseInt(lesson.ten), parseInt(subject.soTiet));
                if (isValid == undefined) {
                    setRoomForSubject(index + 1, list);
                } else if (isValid == false) {
                    continue;
                }
                else for (let day of listDays) {
                    let listRoomsAvailable = [];
                    for (let room of listRooms) {
                        if (app.model.dtThoiKhoaBieu.isAvailabledRoom(room.ten, listSubjectsOfSem, {
                            tietBatDau: parseInt(lesson.ten), soTiet: parseInt(subject.soTiet), day
                        })) listRoomsAvailable.push(room);
                    }
                    let roomResult = app.model.dtThoiKhoaBieu.bestFit(subject, listRoomsAvailable);
                    if (roomResult) {
                        data[subject.id] = { tietBatDau: parseInt(lesson.ten), thu: day, phong: roomResult.ten, sucChua: roomResult.sucChua };
                        let newList = listSubjectsOfSem.map(item => {
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
        setRoomForSubject(0, listSubjectsOfSem);
    });

    app.model.dtThoiKhoaBieu.isAvailabledRoom = (room, listSubjectsOfSem, condition) => {
        let { tietBatDau, soTiet, day } = condition, tietKetThuc = tietBatDau + soTiet - 1;

        let listPresentStatus = listSubjectsOfSem.filter(subject => subject.phong == room && subject.thu == day).map(subject => subject = { tietBatDau: subject.tietBatDau, tietKetThuc: subject.tietBatDau + subject.soTiet - 1 });

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