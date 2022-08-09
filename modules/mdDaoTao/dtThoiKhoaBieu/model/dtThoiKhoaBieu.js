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

    const range = (start, stop, step = 1) => Array(stop - start).fill(start).map((x, y) => x + y * step);

    app.model.dtThoiKhoaBieu.getCurrentStatusRooms = async () => {
        let currentTKB = await app.model.dtThoiKhoaBieu.getAll({
            statement: 'ngayBatDau <= :now AND ngayKetThuc > :now AND phong IS NOT NULL AND thu IS NOT NULL AND tietBatDau IS NOT NULL',
            parameter: { now: Date.now() }
        }, 'phong,thu,tietBatDau,soTietBuoi', 'phong');
        let data = {};
        currentTKB.forEach(item => {
            data[item.phong] = data[item.phong] || {};
            data[item.phong][item.thu] = data[item.phong][item.thu] || [];
            data[item.phong][item.thu].push(...range(Number(item.tietBatDau), Number(item.tietBatDau) + Number(item.soTietBuoi)));
        });
        //Phong A thứ 2 từ tiết 1-4, thứ 3 từ tiết 6-8 --> data = { A: { 2: [1,2,3,4], 3: [6,7,8] } }
        return data;
    };

    app.model.dtThoiKhoaBieu.init = async (config, done) => {
        try {
            const listDays = [2, 3, 4, 5, 6, 7];
            let { bacDaoTao, loaiHinhDaoTao, ngayBatDau, listPhongKhongSuDung } = config,
                thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
            thoiGianMoMon = thoiGianMoMon.find(item => item.bacDaoTao == bacDaoTao && item.loaiHinhDaoTao == loaiHinhDaoTao);
            let { hocKy, nam } = thoiGianMoMon;
            const danhSachCanGen = await app.model.dtThoiKhoaBieu.getAll({ hocKy, nam, bacDaoTao, loaiHinhDaoTao, isMo: 1 }, '*', 'soLuongDuKien DESC');
            let listPeriods = await app.model.dmCaHoc.getAll({ maCoSo: 2, kichHoat: 1 }, 'ten', 'ten');
            listPeriods = listPeriods.map(item => parseInt(item.ten));

            let listRooms = await app.model.dmPhong.getAll({ kichHoat: 1 }, 'ten,sucChua', 'sucChua DESC');
            // Lọc phòng không sử dụng
            listRooms = listPhongKhongSuDung && listPhongKhongSuDung.length ? listRooms.filter(item => !listPhongKhongSuDung.includes(item.ten)) : listRooms;

            let data = await getDataGenerateSchedule(danhSachCanGen.filter(item => item.isMo), listDays, listPeriods, listRooms);
            if (data.error) done(data);
            else {
                let listNgayLe = await app.model.dmNgayLe.getAll({
                    statement: 'ngay >= :startDateOfYear and ngay <= :endDateOfYear',
                    parameter: {
                        startDateOfYear: new Date(nam, 0, 1).setHours(0, 0, 0, 1),
                        endDateOfYear: new Date(nam, 11, 31).setHours(23, 59, 59, 999)
                    }
                });
                listNgayLe = listNgayLe.map(item => {
                    item.ngay = new Date(item.ngay).setHours(0, 0, 0);
                    return item;
                });
                let dataArray = Object.keys(data.data);
                for (let index = 0; index < dataArray.length; index++) {
                    let id = dataArray[index],
                        changes = data.data[id];
                    // console.log(changes);
                    let startDate = new Date(parseInt(ngayBatDau)),
                        currentDay = startDate.getDay() + 1,
                        distance = changes.thu - currentDay;
                    if (distance < 0) distance += 7;
                    changes.ngayBatDau = new Date(startDate.getTime() + distance * DATE_UNIX).setHours(0, 0, 0);
                    if (listNgayLe.some(item => item.ngay == changes.ngayBatDau)) {
                        changes.ngayBatDau = changes.ngayBatDau + 7 * DATE_UNIX;
                    }
                    changes.ngayKetThuc = await app.model.dtThoiKhoaBieu.calculateEndDate(changes, listNgayLe);
                    await app.model.dtThoiKhoaBieu.update({ id }, changes);
                }
                done({ success: 'Sinh thời khóa biểu thành công!' });
            }
        } catch (error) {
            console.error(error);
            done({ error: error || 'Sinh thời khoá biểu thất bại!' });
        }
    };

    // const getDataGenerateSchedule = (listSubjects, listDays, listPeriods, listRooms) => new Promise(resolve => {
    //     let data = {}, dataNganh = {};
    //     // Tạo ra một object với key là mã ngành, value là 1 object nữa (key là mã môn, value là danh sách lịch của môn đó)
    //     // để kiểm tra nguyên tắc: số môn bắt buộc trong cùng 1 ngành có số lịch trùng nhau là ít nhất.
    //     Object.keys(listSubjects.groupBy('maNganh')).forEach(maNganh => {
    //         dataNganh[maNganh] = {};
    //         listSubjects.groupBy('maNganh')[maNganh]
    //             .filter(subject => subject.loaiMonHoc == 0)
    //             .map(item => item.maMonHoc)
    //             .sort()
    //             .filter((value, index, list) => !index || value != list[index - 1])
    //             .forEach(maMonHoc => dataNganh[maNganh][maMonHoc] = []);
    //     });
    //     const setRoomForSubject = (index, list) => {
    //         let danhSachKhongPhong = list.filter(subject => !subject.phong);
    //         if (index >= danhSachKhongPhong.length) {
    //             Object.keys(data).length ? resolve({ data, dataNganh }) : resolve({ error: 'Các môn học đều đã có thời khóa biểu!' });
    //         }
    //         let subject = danhSachKhongPhong[index],
    //             nganhBox = dataNganh[subject.maNganh];      //nganhBox = { abc: [ { tietBatDau, thu, phong } ], xyz: ... }
    //         lessonLoop: for (let period of listPeriods) {
    //             let startedPeriod = parseInt(period),
    //                 isValid = isValidPeriod(startedPeriod, parseInt(subject.soTietBuoi));
    //             if (isValid == undefined) {     // Nếu như số tiết không hợp lệ -> môn tiếp theo
    //                 setRoomForSubject(index + 1, list);

    //             } else if (isValid == false) {      // Nếu như số tiết không phù hợp -> tiết tiếp theo
    //                 continue;
    //             }
    //             else {
    //                 let day = parseInt(listDays.sample());      // Lấy 1 ngày bất kỳ
    //                 if (subject.loaiMonHoc == 0) {      // Nếu môn học là bắt buộc
    //                     /**x
    //                      * Check lịch cho sinh viên có thể đăng ký được tất cả các môn bắt buộc
    //                      *    - Nếu ngành mở hơn 1 môn bắt buộc:
    //                      */
    //                     if (Object.keys(nganhBox).length > 1) {
    //                         /**
    //                          *  - Check các môn bắt buộc còn lại xem có trùng lịch hay không
    //                          *      + Nếu trùng và môn đó chỉ mở 1 lớp thì phải thay đổi
    //                          */
    //                         let currentTime = {
    //                             thu: subject.thu || day,
    //                             tietBatDau: parseInt(subject.tietBatDau) || startedPeriod,
    //                             tietKetThuc: (parseInt(subject.tietBatDau) || startedPeriod) + parseInt(subject.soTietBuoi) - 1,
    //                             buoi: subject.buoi,
    //                             nhom: subject.nhom
    //                         };

    //                         // if (nganhBox[subject.maMonHoc].length) {
    //                         //     // Cùng môn, khác buổi, cùng nhóm mà cùng ngày thì continue
    //                         //     if (nganhBox[subject.maMonHoc].some(item => item.thu == currentTime.thu && item.buoi != currentTime.buoi && item.nhom == currentTime.nhom && isCoincidentTime(item, currentTime))) continue;

    //                         //     // Cùng môn, cùng buổi, khác nhóm mà cùng giờ thì continue
    //                         //     //TODO: Nếu như hết xếp được thì quay lại từ đầu.
    //                         //     else if (nganhBox[subject.maMonHoc].some(item => item.thu == currentTime.thu && item.buoi == currentTime.buoi && item.nhom != currentTime.nhom && isCoincidentTime(item, currentTime))) continue;
    //                         // }
    //                         let nganhBoxExceptCurrentSubject = Object.keys(nganhBox).filter(maMonHoc => maMonHoc != subject.maMonHoc);
    //                         for (let maMonHoc of nganhBoxExceptCurrentSubject) {
    //                             if (nganhBox[maMonHoc].length == 1 && nganhBox[maMonHoc].some(monKhac => {
    //                                 if (monKhac.thu && currentTime.thu == monKhac.thu && ((currentTime.tietBatDau >= monKhac.tietBatDau && currentTime.tietBatDau <= monKhac.tietKetThuc) || (currentTime.tietBatDau <= monKhac.tietBatDau && currentTime.tietKetThuc <= monKhac.tietKetThuc))) return false;
    //                             })) {
    //                                 continue lessonLoop;
    //                             }
    //                         }
    //                     }
    //                 }
    //                 let listRoomsAvailable = [];
    //                 for (let room of listRooms) {
    //                     if (app.model.dtThoiKhoaBieu.isAvailabledRoom(room.ten, listSubjects, {
    //                         tietBatDau: subject.tietBatDau || startedPeriod, soTietBuoi: parseInt(subject.soTietBuoi), day: subject.thu || day
    //                     })) listRoomsAvailable.push(room);
    //                 }
    //                 let roomResult = bestFit(subject, listRoomsAvailable);
    //                 if (roomResult) {
    //                     data[subject.id] = {
    //                         tietBatDau: subject.tietBatDau || startedPeriod,
    //                         thu: subject.thu || day,
    //                         phong: roomResult.ten,
    //                         sucChua: roomResult.sucChua,
    //                         maMonHoc: subject.maMonHoc,
    //                         soTietBuoi: subject.soTietBuoi,
    //                         nhom: subject.nhom,
    //                         buoi: subject.buoi
    //                     };
    //                     subject.loaiMonHoc == 0 && dataNganh[subject.maNganh][subject.maMonHoc].push({
    //                         thu: day,
    //                         tietBatDau: startedPeriod,
    //                         tietKetThuc: startedPeriod + parseInt(subject.soTietBuoi) - 1,
    //                         nhom: subject.nhom, buoi: subject.buoi
    //                     });
    //                     let newList = listSubjects.map(item => {
    //                         if (item.id == subject.id) {
    //                             item.tietBatDau = startedPeriod;
    //                             item.thu = day;
    //                             item.phong = roomResult.ten;
    //                             item.sucChua = roomResult.sucChua;
    //                             return item;
    //                         }
    //                         return item;
    //                     });
    //                     return setRoomForSubject(0, newList);
    //                 }
    //             }
    //         }
    //         setRoomForSubject(index + 1, list);
    //     };
    //     setRoomForSubject(0, listSubjects);
    // });

    // app.model.dtThoiKhoaBieu.isAvailabledRoom = (room, listSubjects, condition) => {
    //     let { tietBatDau, soTietBuoi, day } = condition, tietKetThuc = tietBatDau + soTietBuoi - 1;

    //     let listPresentStatus = listSubjects.filter(subject => subject.phong == room && subject.thu == day).map(subject => subject = { tietBatDau: subject.tietBatDau, tietKetThuc: subject.tietBatDau + subject.soTietBuoi - 1 });

    //     if (listPresentStatus.length == 0) return true;
    //     else {
    //         for (let timeAtPresentOfRoomId of listPresentStatus) {
    //             if (!timeAtPresentOfRoomId) return true;
    //             else if ((timeAtPresentOfRoomId && isCoincidentTime({ tietBatDau, tietKetThuc }, timeAtPresentOfRoomId))) return false;
    //         }
    //     }
    // };

    // const isCoincidentTime = (subjectA, subject) => {
    //     return ((subjectA.tietBatDau >= subject.tietBatDau && subjectA.tietBatDau <= subject.tietKetThuc) || (subjectA.tietBatDau <= subject.tietBatDau && subjectA.tietKetThuc <= subject.tietKetThuc));
    // };

    const bestFit = (hocPhan, listRooms, currentStatus) => {
        let { soLuongDuKien, thu, tietBatDau, soTietBuoi } = hocPhan,
            sizeResult = 10000000, roomResult = null;
        for (let room of listRooms) {
            let { ten, sucChua } = room,
                condition = sucChua + MAX_DEVIANT >= soLuongDuKien && sucChua <= sizeResult && (!currentStatus[ten] || !currentStatus[ten][thu] || !currentStatus[ten][thu].includes(tietBatDau));
            if (condition) {
                sizeResult = sucChua;
                roomResult = { phong: ten, sucChua };
                if (!currentStatus[ten]) {
                    currentStatus[ten] = {
                        [thu]: range(tietBatDau, soTietBuoi + tietBatDau)
                    };
                } else if (!currentStatus[ten][thu]) {
                    currentStatus[ten][thu] = range(tietBatDau, soTietBuoi + tietBatDau);
                } else {
                    currentStatus[ten][thu] = [...new Set([...currentStatus[ten][thu], ...range(tietBatDau, soTietBuoi + tietBatDau)])];
                }
                break;
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
                // console.log(tongTiet, soTietBuoi, soBuoiTuan);
                let ngayKetThuc = monHoc.ngayBatDau + soTuan * 7 * DATE_UNIX;
                for (let ngayLe of listNgayLe) {
                    if (ngayLe.ngay > monHoc.ngayBatDau && ngayLe.ngay <= ngayKetThuc && new Date(ngayLe.ngay).getDay() == monHoc.thu - 1) ngayKetThuc += 7 * DATE_UNIX;
                }
                if (!ngayKetThuc || ngayKetThuc == '' || isNaN(ngayKetThuc)) reject('Không tính được ngày kết thúc');
                resolve(ngayKetThuc);
            }
        });
    });

    // Start: new auto generate schedule functions
    app.model.dtThoiKhoaBieu.autoGenSched = async (req, res) => {
        try {
            let { config, listConfig } = req.body,
                { listPhongKhongSuDung, thuTietMo } = listConfig || {};

            // Section 1: Gen thời gian.
            const dataTietThuAutoGen = await getDataGenerateSchedule(config, thuTietMo);
            const currentStatus = await app.model.dtThoiKhoaBieu.getCurrentStatusRooms();
            // Section 2: Auto gen phòng theo sức chứa và số lượng dự kiến
            const dataPhongAutoGen = await getDateGenerateRoom(dataTietThuAutoGen, listPhongKhongSuDung, currentStatus);

            res.send({ dataTietThuAutoGen, dataPhongAutoGen });
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    };

    const intersectMany = (arrays) => arrays.reduce((prev, cur) => prev.filter(Set.prototype.has, new Set(cur)), arrays[0]);

    const getDataGenerateSchedule = async (config, thuTietMo) => {
        // 1.1: Config data theo loại hình, bậc.
        let dataFree = await app.model.dtThoiKhoaBieu.getFree(JSON.stringify(config));

        let { rows: dataCanGen, hocphandaxep: dataCurrent, hocphantheoidnganh: hocPhanTheoIdNganh } = dataFree;
        let hocPhanDaXep = {};
        dataCurrent.forEach(hocPhan => {
            hocPhanDaXep[hocPhan.id] = hocPhan;
        });

        // 1.2: Config data phòng, thứ, tiết.
        let dataTiet = await app.model.dmCaHoc.getAll({ maCoSo: 2, kichHoat: 1 }, 'ten', 'ten');
        dataTiet = dataTiet.map(item => parseInt(item.ten));
        const dataThu = [2, 3, 4, 5, 6, 7];

        const dataTietThu = [], fullDataTietThu = [];
        dataTiet.forEach(tiet => {
            dataThu.forEach(thu => {
                if ((thuTietMo || []).indexOf(`${thu}_${tiet}`) != -1) dataTietThu.push(`${thu}_${tiet}`);
                fullDataTietThu.push(`${thu}_${tiet}`);
            });
        });

        // 1.3: Config ngày rảnh của ID ngành (dành cho môn bắt buộc).
        hocPhanTheoIdNganh.forEach(hocPhan => {
            hocPhan.available = dataTietThu;
            if (hocPhanDaXep[hocPhan.idThoiKhoaBieu]) {
                let { thu, tietBatDau, soTietBuoi } = hocPhanDaXep[hocPhan.idThoiKhoaBieu], dataDaXep = new Set();
                Array.from({ length: parseInt(soTietBuoi) }, (_, i) => i).forEach(i => dataDaXep.add(`${thu}_${tietBatDau + i}`));
                hocPhan.available = dataTietThu.filter(item => !dataDaXep.has(item));
            }
        });

        let hocPhanTheoId = {},
            // maMonHocGlobal = '',
            dataReturn = {};
        hocPhanTheoId = hocPhanTheoIdNganh.groupBy('idThoiKhoaBieu');

        hocPhanLoop: for (let hocPhan of dataCanGen) {
            let { id, loaiMonHoc, soTietBuoi, maMonHoc, soLuongDuKien } = hocPhan;
            // maMonHocGlobal = maMonHoc;
            if (!loaiMonHoc) {
                // Môn bắt buộc
                let listIndexOfIdNganhCurrent = hocPhanTheoIdNganh.filter(item => item.idThoiKhoaBieu == id).map(item => hocPhanTheoIdNganh.indexOf(item));
                const thoiGianRanhChung = intersectMany(hocPhanTheoId[id].map(item => item.available));
                thuTietLoop: for (const thuTiet of thoiGianRanhChung) {
                    if (!thuTiet) {
                        continue hocPhanLoop;
                    }//TODO: Reset nếu vẫn đang trong scope maMonHoc
                    else {
                        let [thu, tietBatDau] = thuTiet.split('_');
                        if (isValidPeriod(tietBatDau, soTietBuoi) == undefined) continue hocPhanLoop;
                        else if (isValidPeriod(tietBatDau, soTietBuoi) == false) continue thuTietLoop;
                        else {
                            tietBatDau = parseInt(tietBatDau);
                            thu = parseInt(thu);
                            dataReturn[id] = { id, thu, tietBatDau, maMonHoc, soLuongDuKien, soTietBuoi };
                            // let data = { thu, tietBatDau, soTietBuoi, tietKetThuc: tietBatDau + soTietBuoi - 1 };
                            let toRemove = new Set(Array.from({ length: soTietBuoi }, (_, i) => i + 1).map(tiet => `${thu}_${tiet}`));
                            listIndexOfIdNganhCurrent.forEach(index => hocPhanTheoIdNganh[index].available = hocPhanTheoIdNganh[index].available.filter(tietThu => !toRemove.has(tietThu)));
                            break thuTietLoop;
                        }
                    }
                }
            } else {
                let thuTiet = dataTietThu.sample(),
                    [thu, tietBatDau] = thuTiet.split('_');
                dataReturn[id] = { id, thu, tietBatDau, maMonHoc, soLuongDuKien, soTietBuoi };
            }
        }
        return dataReturn;
    };

    const getDateGenerateRoom = async (dataGen, listPhongKhongSuDung, currentStatus) => {
        let listPhong = await app.model.dmPhong.getAll({
            statement: 'kichHoat = 1 AND (:listPhongKhongSuDung IS NULL OR ten NOT IN (:listPhongKhongSuDung))',
            parameter: { listPhongKhongSuDung }
        }, 'ten,sucChua', 'sucChua DESC');

        for (let [key, hocPhan] of Object.entries(dataGen)) {
            let roomResult = bestFit(hocPhan, listPhong, currentStatus);
            console.log(currentStatus);
            dataGen[key] = app.clone(hocPhan, roomResult, {});
        }
        return dataGen;
    };

    const isValidPeriod = (tietBatDau, soTietBuoi) => {
        /**
         * Sáng 5 tiết: từ 1 tới 5
         * Chiều 4 tiết: từ 6 tới 9
         */

        //Case 1: Nếu số tiết >= 6 => Undefinded
        if (soTietBuoi >= 6) return undefined;

        //Case 2: Nếu số tiết = 5 mà bắt đầu trong từ tiết 2 tới chiều => False
        else if (soTietBuoi == 5 && tietBatDau >= 2) return false;

        //Case 3: Nếu số tiết >= 4 mà bắt đầu từ tiết 3,4,5,7,8,9 => False
        else if (soTietBuoi >= 4 && tietBatDau != 6 && tietBatDau >= 3) return false;

        //Case _
        return true;
    };
};