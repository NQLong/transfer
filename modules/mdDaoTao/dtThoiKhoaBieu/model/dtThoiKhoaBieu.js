// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtThoiKhoaBieu.foo = () => { };

    app.model.dtThoiKhoaBieu.init = async (done) => {
        const listDays = [2, 3, 4, 5, 6, 7];
        const thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
        let { hocKy, nam } = thoiGianMoMon;
        app.model.dtThoiKhoaBieu.getAll({ hocKy, nam }, (error, listSubjectsOfSem) => {
            if (error) {
                return error;
            } else {
                app.model.dmCaHoc.getAll({ maCoSo: 2, kichHoat: 1 }, 'ten', 'ten', (error, listLessons) => {
                    if (error) {
                        return error;
                    } else {
                        app.model.dmPhong.getAll({ kichHoat: 1 }, async (error, listRooms) => {
                            if (error) {
                                return error;
                            } else {
                                let status = await generateSchedule(listSubjectsOfSem, listDays, listLessons, listRooms);
                                done(status);
                            }
                        });
                    }
                });
            }
        });
    };

    const generateSchedule = (listSubjectsOfSem, listDays, listLessons, listRooms) => new Promise(resolve => {
        let listSubjectsOfSem_noRoom = listSubjectsOfSem.filter(subject => !subject.phong);
        if (!listSubjectsOfSem_noRoom.length) resolve({ error: 'Các môn học đều đã có thời khóa biểu!' });
        const setRoomForSubject = (index = 0) => {
            if (index >= listSubjectsOfSem_noRoom.length) {
                resolve({ success: 'Tạo thời khóa biểu thành công!' });
                return;
            } //This 'return' belongs to recursive FUNCTION 'setRoomForSubject'
            let subject = listSubjectsOfSem_noRoom[index];
            for (let room of listRooms)
                for (let day of listDays)
                    for (let lesson of listLessons) {
                        let isValid = isValidLesson(parseInt(lesson.ten), parseInt(subject.soTiet));
                        if (isValid == undefined) {
                            return;
                        } else {
                            if (isValid && app.model.dtThoiKhoaBieu.isAvailabledRoom(room.ten, listSubjectsOfSem, {
                                tietBatDau: parseInt(lesson.ten), soTiet: parseInt(subject.soTiet), day
                            })) {
                                app.model.dtThoiKhoaBieu.update({ id: subject.id }, {
                                    tietBatDau: parseInt(lesson.ten), thu: day, phong: room.ten
                                }, () => {
                                    listSubjectsOfSem_noRoom = listSubjectsOfSem_noRoom.map(updatedSubject => {
                                        if (updatedSubject.id != subject.id) return updatedSubject;
                                        else {
                                            updatedSubject.tietBatDau = parseInt(lesson.ten);
                                            updatedSubject.thu = day;
                                            updatedSubject.phong = room.ten;
                                            return updatedSubject;
                                        }
                                    });
                                    setRoomForSubject(index + 1);
                                });
                                return; //This 'return' belongs to listRooms FOR LOOP
                            }
                        }
                    }
        };
        setRoomForSubject();
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

        //Case 1: Nếu số tiết > 6 => Undefinded
        if (soTiet >= 6) return undefined;

        //Case 2: Nếu số tiết = 5 mà bắt đầu trong buổi chiều => False
        else if (soTiet == 5 && tietBatDau > 5) return false;

        //Case 3: Nếu số tiết > 4 mà bắt đầu từ tiết 3,4,5,7,8,9 => False
        else if (soTiet > 4 && tietBatDau != 6 && tietBatDau >= 3) return false;

        //Case _
        return true;
    };
};