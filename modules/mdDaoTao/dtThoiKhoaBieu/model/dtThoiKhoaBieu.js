// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtThoiKhoaBieu.foo = () => { };
    const MAX_DEVIANT = 10, DATE_UNIX = 24 * 60 * 60 * 1000;

    /**
     * Period: Tiết
     * Room: Phòng
     * Subject: Môn học
     * 
     * Condition: 
     */

    const range = (start, stop, step = 1) => Array(stop - start).fill(start).map((x, y) => x + y * step);

    const adjustCurrentStatusRoom = (currentStatus) => {
        let data = {};
        currentStatus.forEach(item => {
            data[item.phong] = data[item.phong] || {};
            data[item.phong][item.thu] = data[item.phong][item.thu] || [];
            data[item.phong][item.thu] = [...new Set([...data[item.phong][item.thu], ...range(Number(item.tietBatDau), Number(item.tietBatDau) + Number(item.soTietBuoi))])];
        });
        return data;
    };

    const bestFit = (hocPhan, listRooms, currentStatus) => {
        let { soLuongDuKien, thu, tietBatDau, soTietBuoi } = hocPhan,
            sizeResult = 10000000, roomResult = null;
        thu = parseInt(thu);
        tietBatDau = parseInt(tietBatDau);
        soLuongDuKien = parseInt(soLuongDuKien);
        soTietBuoi = parseInt(soTietBuoi);

        for (let room of listRooms) {
            let { ten, sucChua } = room;
            sucChua = parseInt(sucChua);
            let condition = sucChua + MAX_DEVIANT >= soLuongDuKien && sucChua <= sizeResult && (!currentStatus[ten] || !currentStatus[ten][thu] || !currentStatus[ten][thu].includes(tietBatDau));
            if (condition) {
                sizeResult = sucChua;
                roomResult = { phong: ten, sucChua };
            }
        }
        if (roomResult) {
            let { phong: ten } = roomResult;
            if (!currentStatus[ten]) {
                currentStatus[ten] = {
                    [thu]: range(tietBatDau, soTietBuoi + tietBatDau)
                };
            } else if (!currentStatus[ten][thu]) {
                currentStatus[ten][thu] = range(tietBatDau, soTietBuoi + tietBatDau);
            } else {
                currentStatus[ten][thu] = [...new Set([...currentStatus[ten][thu], ...range(tietBatDau, soTietBuoi + tietBatDau)])];
            }
        }
        return roomResult;
    };

    const calculateEndDate = (hocPhan, listNgayLe = []) => {
        let { soTietLyThuyet, soTietThucHanh, soBuoiTuan, soTietBuoi, ngayBatDau, thu } = hocPhan,
            tongTiet = parseInt(soTietLyThuyet) + parseInt(soTietThucHanh),
            soTuan = Math.ceil(tongTiet / (soTietBuoi * soBuoiTuan));
        let ngayKetThuc = ngayBatDau + soTuan * 7 * DATE_UNIX;
        for (let ngayLe of listNgayLe) {
            if (ngayLe > ngayBatDau && ngayLe <= ngayKetThuc && new Date(ngayLe).getDay() == thu - 1) ngayKetThuc += 7 * DATE_UNIX;
        }
        if (isNaN(ngayKetThuc)) ngayKetThuc = '';
        return ngayKetThuc;
    };

    // Start: new auto generate schedule functions
    app.model.dtThoiKhoaBieu.autoGenSched = async (req, res) => {
        try {
            let { config, listConfig } = req.body,
                { listPhongKhongSuDung, thuTietMo } = listConfig || {};

            // Section 1: Gen thời gian.
            let currentStatus = [];
            const dataScheduleAuto = await app.model.dtThoiKhoaBieu.getDataGenerateSchedule(config, thuTietMo, currentStatus);
            // Section 2: Auto gen phòng theo sức chứa và số lượng dự kiến, đồng thời tính toán ngày kết thúc
            currentStatus = adjustCurrentStatusRoom(currentStatus);

            const currentYear = new Date().getFullYear();
            let listNgayLe = await app.model.dmNgayLe.getAll({
                statement: 'ngay >= :startDateOfYear and ngay <= :endDateOfYear',
                parameter: {
                    startDateOfYear: new Date(currentYear, 0, 1).setHours(0, 0, 0, 1),
                    endDateOfYear: new Date(currentYear, 11, 31).setHours(23, 59, 59, 999)
                }
            });
            listNgayLe = listNgayLe.map(item => {
                return new Date(item.ngay).setHours(0, 0, 0);
            });

            const dataRoomAndEndDateAuto = await getDataRoomAndEndDate(dataScheduleAuto, listPhongKhongSuDung, currentStatus, config, listNgayLe);
            const data = Object.values(dataRoomAndEndDateAuto);
            for (const hocPhan of data) {
                let id = hocPhan.id;
                delete hocPhan.id;
                await app.model.dtThoiKhoaBieu.update({ id }, hocPhan);
            }
            res.end();
        } catch (error) {
            console.error(`Lỗi sinh thời khoá biểu: ${error}`);
            res.send({ error });
        }
    };

    const intersectMany = (arrays) => arrays.reduce((prev, cur) => prev.filter(Set.prototype.has, new Set(cur)), arrays[0]);

    app.model.dtThoiKhoaBieu.getDataGenerateSchedule = async (req, res) => {
        try {
            // 1.1: Config data theo loại hình, bậc.
            let { config, timeConfig } = req.body.data;
            let dataFree = await app.model.dtThoiKhoaBieu.getFree(JSON.stringify(config));
            let { hocphandaxep: dataCurrent, hocphantheoidnganh: hocPhanTheoIdNganh, rows: dataCanGen,
                // currentstatusroom: currRoom
            } = dataFree;
            let hocPhanDaXep = {};
            dataCurrent.forEach(hocPhan => {
                hocPhanDaXep[hocPhan.id] = hocPhan;
            });
            // 1.2: Config data thứ, tiết.
            const setAvailable = () => {
                for (const ele of timeConfig) {
                    if (!ele.listDonVi) {
                        hocPhanTheoIdNganh.forEach(idNganh => {
                            idNganh.available = ele.thuTietMo;
                        });
                    } else {
                        ele.listDonVi = ele.listDonVi.map(item => parseInt(item));
                        hocPhanTheoIdNganh.forEach(idNganh => {
                            if ((idNganh.khoa && ele.listDonVi.includes(idNganh.khoa)) || (idNganh.khoaCn && ele.listDonVi.includes(idNganh.khoaCn))) {
                                idNganh.available = ele.thuTietMo;
                            }
                        });
                    }
                }
            };

            setAvailable();

            let dataReturn = [];
            hocPhanLoop: for (let hocPhan of dataCanGen) {
                let { id, loaiMonHoc, soTietBuoi } = hocPhan;
                if (!loaiMonHoc) {
                    // Môn bắt buộc
                    let listNganh = hocPhanTheoIdNganh.filter(item => item.idThoiKhoaBieu.includes(id));
                    let thoiGianRanhChung = intersectMany(listNganh.map(item => item.available));
                    if (hocPhan.tietBatDau) {
                        if (!isValidPeriod(hocPhan.tietBatDau, soTietBuoi)) continue hocPhanLoop;
                        else {
                            let dataThoiGian = thoiGianRanhChung.filter(item => item.split('_')[1] == hocPhan.tietBatDau);
                            if (dataThoiGian.length == 0) {
                                setAvailable();
                                listNganh = hocPhanTheoIdNganh.filter(item => item.idThoiKhoaBieu.includes(id));
                                thoiGianRanhChung = intersectMany(listNganh.map(item => item.available));
                                dataThoiGian = thoiGianRanhChung.filter(item => item.split('_')[1] == hocPhan.tietBatDau);
                                hocPhanTheoIdNganh.forEach(idNganh => {
                                    idNganh.available = dataThoiGian;
                                });
                            }
                            // console.log(dataThoiGian);
                            let thuTiet = dataThoiGian.sample(),
                                [thu, tietBatDau] = thuTiet.split('_');
                            dataReturn.push({ ...hocPhan, thu, tietBatDau });
                            let toRemove = new Set(Array.from({ length: soTietBuoi }, (_, i) => i + 1).map(tiet => `${thu}_${tiet}`));
                            for (let idNganh of listNganh) {
                                idNganh.available = idNganh.available.filter(tietThu => !toRemove.has(tietThu));
                            }
                        }
                    } else {
                        thuTietLoop: for (const thuTiet of thoiGianRanhChung) {
                            if (!thuTiet) {
                                continue hocPhanLoop;
                            }
                            else {
                                let [thu, tietBatDau] = thuTiet.split('_');
                                if (isValidPeriod(tietBatDau, soTietBuoi) == undefined) continue hocPhanLoop;
                                else if (isValidPeriod(tietBatDau, soTietBuoi) == false) continue thuTietLoop;
                                else {
                                    tietBatDau = parseInt(tietBatDau);
                                    thu = parseInt(thu);
                                    dataReturn.push({ ...hocPhan, thu, tietBatDau });
                                    let toRemove = new Set(Array.from({ length: soTietBuoi }, (_, i) => i + 1).map(tiet => `${thu}_${tiet}`));
                                    for (let idNganh of listNganh) {
                                        idNganh.available = idNganh.available.filter(tietThu => !toRemove.has(tietThu));
                                    }
                                    break thuTietLoop;
                                }
                            }
                        }
                    }
                } else {
                    let dataTietThu = hocPhanTheoIdNganh.find(item => item.idThoiKhoaBieu.includes(id)).available;
                    if (hocPhan.tietBatDau) {
                        if (!isValidPeriod(hocPhan.tietBatDau, hocPhan.soTietBuoi)) continue hocPhanLoop;
                        else {
                            let dataThoiGian = dataTietThu.filter(item => item.split('_')[1] == hocPhan.tietBatDau);
                            let thuTiet = dataThoiGian.sample(),
                                [thu, tietBatDau] = thuTiet.split('_');
                            dataReturn.push({ ...hocPhan, thu, tietBatDau });
                        }
                    } else {
                        whileRandom: while (true) {
                            let thuTiet = dataTietThu.sample(),
                                [thu, tietBatDau] = thuTiet.split('_');
                            if (!isValidPeriod(tietBatDau, hocPhan.soTietBuoi)) continue whileRandom;
                            else {
                                dataReturn.push({ ...hocPhan, thu, tietBatDau });
                                break whileRandom;
                            }
                        }
                    }
                }
            }
            res.send({ dataReturn });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    };

    app.model.dtThoiKhoaBieu.getDataRoomAndEndDate = async (req, res) => {
        try {
            let { config, listData, listRoom } = req.body.data;
            let dataFree = await app.model.dtThoiKhoaBieu.getFree(JSON.stringify({ ...config, listRoom: listRoom.map(item => item.ten).toString() }));
            let { currentstatusroom: currRoom } = dataFree;
            const currentYear = new Date().getFullYear();
            let listNgayLe = await app.model.dmNgayLe.getAll({
                statement: 'ngay >= :startDateOfYear and ngay <= :endDateOfYear',
                parameter: {
                    startDateOfYear: new Date(currentYear, 0, 1).setHours(0, 0, 0, 1),
                    endDateOfYear: new Date(currentYear, 11, 31).setHours(23, 59, 59, 999)
                }
            });
            listNgayLe = listNgayLe.map(item => {
                return new Date(item.ngay).setHours(0, 0, 0);
            });
            let currentStatus = adjustCurrentStatusRoom(currRoom);
            let dataReturn = [];

            for (let hocPhan of listData) {
                let roomResult = bestFit(hocPhan, listRoom, currentStatus) || {};
                let ngayKetThuc = calculateEndDate({ ...hocPhan, ngayBatDau: parseInt(config.ngayBatDau) }, listNgayLe);
                dataReturn.push({ ...hocPhan, ...roomResult, ngayKetThuc, ngayBatDau: parseInt(config.ngayBatDau) });
            }
            res.send({ dataReturn });
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    };

    const getDataRoomAndEndDate = async (dataGen, listPhongKhongSuDung, currentStatus, config, listNgayLe) => {
        let { ngayBatDau, maCoSo } = config;
        ngayBatDau = parseInt(ngayBatDau);
        let listToaNha = await app.model.dmToaNha.getAll({ coSo: maCoSo, kichHoat: 1 }, 'ma');
        listToaNha = listToaNha.map(item => item.ma);
        let listPhong = await app.model.dmPhong.getAll({
            statement: 'kichHoat = 1 AND (:listPhongKhongSuDung IS NULL OR ten NOT IN (:listPhongKhongSuDung)) AND toaNha IN (:listToaNha)',
            parameter: { listPhongKhongSuDung: listPhongKhongSuDung ? listPhongKhongSuDung.join(',') : null, listToaNha }
        }, 'ten,sucChua', 'sucChua DESC');

        for (let [key, hocPhan] of Object.entries(dataGen)) {
            let roomResult = bestFit(hocPhan, listPhong, currentStatus) || {};
            let ngayKetThuc = calculateEndDate({ ...hocPhan, ngayBatDau }, listNgayLe);
            dataGen[key] = app.clone(hocPhan, roomResult, { ngayBatDau, ngayKetThuc });
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