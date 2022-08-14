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
        return data;
    };

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
            const dataScheduleAuto = await getDataGenerateSchedule(config, thuTietMo);
            const currentStatus = await app.model.dtThoiKhoaBieu.getCurrentStatusRooms();
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
            // Section 2: Auto gen phòng theo sức chứa và số lượng dự kiến, đồng thời tính toán ngày kết thúc
            const dataRoomAndEndDateAuto = await getDataRoomAndEndDate(dataScheduleAuto, listPhongKhongSuDung, currentStatus, config.ngayBatDau, listNgayLe);
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

    const getDataGenerateSchedule = async (config, thuTietMo) => {
        // 1.1: Config data theo loại hình, bậc.
        let dataFree = await app.model.dtThoiKhoaBieu.getFree(JSON.stringify(config));
        let { rows: dataCanGen, hocphandaxep: dataCurrent, hocphantheoidnganh: hocPhanTheoIdNganh } = dataFree;
        let hocPhanDaXep = {};
        dataCurrent.forEach(hocPhan => {
            hocPhanDaXep[hocPhan.id] = hocPhan;
        });
        // 1.2: Config data thứ, tiết.
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
        hocPhanTheoIdNganh.forEach(idNganh => {
            idNganh.available = dataTietThu;
            dataCurrent.forEach(hocPhan => {
                if (idNganh.idThoiKhoaBieu.includes(hocPhan.id)) {
                    let { thu, tietBatDau, soTietBuoi } = hocPhan, dataDaXep = new Set();
                    Array.from({ length: parseInt(soTietBuoi) }, (_, i) => i).forEach(i => dataDaXep.add(`${thu}_${tietBatDau + i}`));
                    idNganh.available = dataTietThu.filter(item => !dataDaXep.has(item));
                }
            });
        });

        let dataReturn = {};
        hocPhanLoop: for (let hocPhan of dataCanGen) {
            let { id, loaiMonHoc, soTietBuoi } = hocPhan;
            if (!loaiMonHoc) {
                // Môn bắt buộc
                let listNganh = hocPhanTheoIdNganh.filter(item => item.idThoiKhoaBieu.includes(id));
                const thoiGianRanhChung = intersectMany(listNganh.map(item => item.available));
                thuTietLoop: for (const thuTiet of thoiGianRanhChung) {
                    if (!thuTiet) {
                        continue hocPhanLoop;
                    }//TODO: Reset nếu vẫn đang trong scope maMonHocGlobal
                    else {
                        let [thu, tietBatDau] = thuTiet.split('_');
                        if (isValidPeriod(tietBatDau, soTietBuoi) == undefined) continue hocPhanLoop;
                        else if (isValidPeriod(tietBatDau, soTietBuoi) == false) continue thuTietLoop;
                        else {
                            tietBatDau = parseInt(tietBatDau);
                            thu = parseInt(thu);
                            dataReturn[id] = { thu, tietBatDau, ...hocPhan };
                            let toRemove = new Set(Array.from({ length: soTietBuoi }, (_, i) => i + 1).map(tiet => `${thu}_${tiet}`));
                            for (let idNganh of listNganh) {
                                idNganh.available = idNganh.available.filter(tietThu => !toRemove.has(tietThu));
                            }
                            break thuTietLoop;
                        }
                    }
                }
            } else {
                let thuTiet = dataTietThu.sample(),
                    [thu, tietBatDau] = thuTiet.split('_');
                dataReturn[id] = { thu, tietBatDau, ...hocPhan };
            }
        }
        return dataReturn;
    };

    const getDataRoomAndEndDate = async (dataGen, listPhongKhongSuDung, currentStatus, ngayBatDau, listNgayLe) => {
        ngayBatDau = parseInt(ngayBatDau);
        let listPhong = await app.model.dmPhong.getAll({
            statement: 'kichHoat = 1 AND (:listPhongKhongSuDung IS NULL OR ten NOT IN (:listPhongKhongSuDung))',
            parameter: { listPhongKhongSuDung: listPhongKhongSuDung ? listPhongKhongSuDung.join(',') : null }
        }, 'ten,sucChua', 'sucChua DESC');

        for (let [key, hocPhan] of Object.entries(dataGen)) {
            let roomResult = bestFit(hocPhan, listPhong, currentStatus);
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