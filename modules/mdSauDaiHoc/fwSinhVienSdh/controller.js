module.exports = app => {
    const menuSvSdh = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7501: { title: 'Sinh viên', link: '/user/sau-dai-hoc/sinh-vien' }
        }
    };

    app.permission.add(
        { name: 'svSdh:manage', menu: menuSvSdh },
        { name: 'svSdh:write' },
        { name: 'svSdh:delete' }
    );

    app.get('/user/sau-dai-hoc/sinh-vien', app.permission.check('svSdh:manage'), app.templates.admin);
    app.get('/user/sv-sdh/upload', app.permission.check('svSdh:manage'), app.templates.admin);
    app.get('/user/sv-sdh/item/:mssv', app.permission.check('svSdh:write'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleStudentSdh', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && ['34', '37'].includes(staff.maDonVi)) {
            app.permissionHooks.pushUserPermission(user, 'svSdh:manage', 'svSdh:write', 'svSdh:delete');
            resolve();
        } else resolve();
    }));
    //API----------------------------------------------------------------------------------------------------------------

    app.get('/api/sv-sdh/page/:pageNumber/:pageSize', app.permission.check('svSdh:manage'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { listFaculty, listFromCity, listEthnic, listNationality, listReligion, listTinhTrangSinhVien, gender } = (req.query.filter && req.query.filter != '%%%%%%%%%%%%%%%%%%') ? req.query.filter : { listFaculty: null, listFromCity: null, listEthnic: null, listNationality: null, listReligion: null, listTinhTrangSinhVien: null, gender: null };

        app.model.fwSinhVienSdh.searchPage(pageNumber, pageSize, listFaculty, listFromCity, listEthnic, listNationality, listReligion, listTinhTrangSinhVien, gender, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = req.query.condition;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/sv-sdh/:mssv', app.permission.check('svSdh:manage'), (req, res) => {
        const mssv = req.params.mssv;
        app.model.fwSinhVienSdh.get({ ma: mssv }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/sv-sdh', app.permission.check('svSdh:write', (req, res) => {
        const data = req.body.data;
        app.model.fwSinhVienSdh.create(data, (error, item) => {
            res.send({ error, item });
        });
    }));

    app.put('/api/sv-sdh', app.permission.check('svSdh:write', (req, res) => {
        const mssv = req.body.msssv,
            data = req.body.data;
        app.model.fwSinhVienSdh.update({ ma: mssv }, data, (error, item) => {
            res.send({ error, item });
        });
    }));

    app.delete('/api/sv-sdh', app.permission.check('svSdh:delete'), (req, res) => {
        app.model.fwSinhVienSdh.delete({ ma: req.body.mssv }, (error) => res.send({ error }));
    });

    app.post('/api/sv-sdh/multiple', app.permission.check('svSdh:write'), (req, res) => {
        const data = req.body.data;
        let gioiTinhMapping = {}, quocGiaMapping = {}, danTocMapping = {}, tonGiaoMapping = {}, tinhTpMapping = {}, huyenMapping = {}, xaMapping = {}, donViMapping = {}, nganhSdhMapping = {},
            bacDaoTaoMapping = {}, heDaoTaoMapping = {}, tinhTrangMapping = {}, canBoMapping = {};

        new Promise(resolve => {
            app.model.dmGioiTinh.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => gioiTinhMapping[JSON.parse(item.ten).vi.toLowerCase()] = item.ma);
                resolve();
            });
        }).then(() => new Promise(resolve => {
            app.model.dmQuocGia.getAll((error, items) => {
                (items || []).forEach(item => quocGiaMapping[item.tenQuocGia.toLowerCase()] = item.maCode);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmDanToc.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => danTocMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmTonGiao.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => tonGiaoMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmTinhThanhPho.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => tinhTpMapping[item.ten.toLowerCase().replace('tỉnh', '').replace('thành phố', '').trim()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmQuanHuyen.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => huyenMapping[item.tenQuanHuyen.toLowerCase()] = item.maQuanHuyen);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmPhuongXa.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => xaMapping[item.tenPhuongXa.toLowerCase()] = item.maPhuongXa);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmDonVi.getAll((error, items) => {
                (items || []).forEach(item => donViMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmNganhSauDaiHoc.getAll((error, items) => {
                (items || []).forEach(item => nganhSdhMapping[item.ten.toLowerCase()] = item.maNganh);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmHocSdh.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => bacDaoTaoMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmSvLoaiHinhDaoTao.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => heDaoTaoMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmTinhTrangSinhVien.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => tinhTrangMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.canBo.getAll({ kichHoat: 1 }, (error, items) => {
                (items || []).forEach(item => item.ho && item.ten ? canBoMapping[item.ho.toLowerCase() + ' ' + item.ten.toLowerCase()] = item.shcc : '');
                resolve();
            });
        })).then(() => {
            let errors = [];
            const getGvhd = (gvhd) => {
                let gvhdString = gvhd.replaceAll('PGS.TS', '').replaceAll('PGS.TS.', '').replaceAll('TS.', '').replaceAll('TS', '').replaceAll('GS.TS.', '').replaceAll('GS.TS', '');
                let listGvhd = [];
                if (gvhdString.includes('CBHD1:') && gvhdString.includes('CBHD2:')) {
                    let gvhd1 = gvhdString.substring(6, gvhdString.indexOf('CBHD2:')).trim().replaceAll(',', '').replaceAll(';', ''),
                        gvhd2 = gvhdString.substring(gvhdString.indexOf('CBHD2:') + 6).trim();
                    if (canBoMapping[gvhd1.toLowerCase()]) listGvhd.push(canBoMapping[gvhd1.toLowerCase()]);
                    if (canBoMapping[gvhd2.toLowerCase()]) listGvhd.push(canBoMapping[gvhd2.toLowerCase()]);
                } else if (gvhdString.includes(';') || gvhdString.includes(',')) {
                    let gvhdStringList;
                    if (gvhdString.includes(';')) gvhdStringList = gvhdString.split(';'); else gvhdStringList = gvhdString.split(',');
                    if (canBoMapping[gvhdStringList[0].trim().toLowerCase()]) listGvhd.push(canBoMapping[gvhdStringList[0].toLowerCase()]);
                    if (canBoMapping[gvhdStringList[1].trim().toLowerCase()]) listGvhd.push(canBoMapping[gvhdStringList[1].toLowerCase()]);
                } else {
                    if (canBoMapping[gvhdString.trim().toLowerCase()]) listGvhd.push(canBoMapping[gvhdString.trim().toLowerCase()]);
                }
                return JSON.stringify(listGvhd);
            };
            let result = [];
            const handleCreateItem = (index = 0) => {
                let item = data[index];

                if (index < data.length) {
                    new Promise(resolve => {
                        if (item.maNganh) {
                            app.model.dmNganhSauDaiHoc.get({ maNganh: item.maNganh }, (error, nganhSdh) => {
                                if (!error && !nganhSdh) {
                                    app.model.dmNganhSauDaiHoc.create({ maNganh: item.maNganh, ten: item.nganh, kichHoat: 1, maKhoa: item.maKhoa }, () => {
                                        resolve();
                                    });
                                } else resolve();
                            });
                        } else resolve();
                    }).then(() => {
                        app.model.fwSinhVienSdh.get({ ma: item.ma }, (error, svSdh) => {
                            // ma, ho, ten, gioiTinh, ngaySinh, danToc, tonGiao, quocTich, nguyenQuanMaTinh, hienTaiSoNha, hienTaiMaXa, hienTaiMaHuyen, hienTaiMaTinh, noiSinhSoNha, noiSinhMaXa, noiSinhMaHuyen, noiSinhMaTinh, maKhoa, maNganh, thuongTruSoNha, thuongTruMaXa, thuongTruMaHuyen, thuongTruMaTinh, namTuyenSinh, nienKhoa, bacDaoTao, chuongTrinhDaoTao, sdtCaNhan, sdtLienHe, email, coQuan, gvhd, tenDeTai, tinhTrang, heDaoTao
                            const newData = {
                                ho: item.ho,
                                ten: item.ten,
                                gioiTinh: item.gioiTinh ? item.gioiTinh == 'Nam' ? '01' : '02' : '',
                                ngaySinh: item.ngaySinh,
                                danToc: item.danToc && danTocMapping[item.danToc.toLowerCase()] ? danTocMapping[item.danToc.toLowerCase()] : '',
                                tonGiao: item.tonGiao && tonGiaoMapping[item.tonGiao.toLowerCase()] ? tonGiaoMapping[item.tonGiao.toLowerCase()] : '',
                                quocTich: item.quocTich && quocGiaMapping[item.quocTich.toLowerCase()] ? quocGiaMapping[item.quocTich.toLowerCase()] : '',
                                nguyenQuanMaTinh: item.nguyenQuan ? tinhTpMapping[item.nguyenQuan.toLowerCase().trim()] : '',
                                noiSinhMaTinh: item.noiSinh ? item.noiSinh.toLowerCase().includes('hcm') || item.noiSinh.toLowerCase().includes('hồ chí minh') ? tinhTpMapping['hồ chí minh'] : tinhTpMapping[item.noiSinh.toLowerCase().trim()] ? tinhTpMapping[item.noiSinh.toLowerCase().trim()] : '' : '',
                                maKhoa: item.khoa && donViMapping[item.khoa.toLowerCase()] ? donViMapping[item.khoa.toLowerCase()] : '',
                                maNganh: item.maNganh,
                                thuongTruSoNha: item.thuongTruSoNha ? item.thuongTruSoNha : '',
                                thuongTruMaXa: item.thuongTruXa && xaMapping[item.thuongTruXa.toLowerCase()] ? xaMapping[item.thuongTruXa.toLowerCase()] : '',
                                thuongTruMaHuyen: item.thuongTruHuyen && huyenMapping[item.thuongTruHuyen.toLowerCase()] ? huyenMapping[item.thuongTruHuyen.toLowerCase()] : '',
                                thuongTruMaTinh: item.thuongTruTinh && tinhTpMapping[item.thuongTruTinh.toLowerCase()] ? tinhTpMapping[item.thuongTruTinh.toLowerCase()] : '',
                                namTuyenSinh: item.namTuyenSinh,
                                nienKhoa: item.nienKhoa,
                                bacDaoTao: item.bacDaoTao && bacDaoTaoMapping[item.bacDaoTao.toLowerCase()] ? bacDaoTaoMapping[item.bacDaoTao.toLowerCase()] : '',
                                chuongTrinhDaoTao: item.chuongTrinhDaoTao,
                                sdtCaNhan: item.sdtCaNhan,
                                sdtLienHe: item.sdtLienHe,
                                email: item.email,
                                coQuan: item.tenCoQuan,
                                gvhd: item.gvhd ? getGvhd(item.gvhd) : '',
                                tenDeTai: item.tenDeTai,
                                tinhTrang: item.maTinhTrang,
                                heDaoTao: item.heDaoTao && heDaoTaoMapping[item.heDaoTao.toLowerCase()] ? heDaoTaoMapping[item.heDaoTao.toLowerCase()] : '',
                                hoTenCha: item.hoTenCha ? item.hoTenCha : '',
                                namSinhCha: item.namSinhCha ? item.namSinhCha : '',
                                ngheNghiepCha: item.ngheNghiepCha ? item.ngheNghiepCha : '',
                                sdtCha: item.sdtCha ? item.sdtCha : '',
                                hoTenMe: item.hoTenMe ? item.hoTenMe : '',
                                namSinhMe: item.namSinhMe ? item.namSinhMe : '',
                                ngheNghiepMe: item.ngheNghiepMe ? item.ngheNghiepMe : '',
                                sdtMe: item.sdtMe ? item.sdtMe : '',
                                sdtNguoiThan: item.sdtNguoiThan ? item.sdtNguoiThan : '',
                            };
                            if (svSdh) {
                                app.model.fwSinhVienSdh.update({ ma: item.ma }, newData, () => {
                                    handleCreateItem(index + 1);
                                });
                            } else {
                                newData.ma = item.ma;
                                app.model.fwSinhVienSdh.create(newData, () => {
                                    handleCreateItem(index + 1);
                                });
                            }

                        });
                    });
                } else {
                    res.send({ errors, result });
                }
            };
            handleCreateItem();
        });
    });
    // Hook--------------------------------------------------------------------------------------------------------------------------------------------------------
    app.uploadHooks.add('fwSinhVienSdhImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => fwSinhVienSdhImportData(req, fields, files, params, done), done, 'svSdh:write'));

    const fwSinhVienSdhImportData = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'fwSinhVienSdhImportData' && files.fwSinhVienSdhFile && files.fwSinhVienSdhFile.length > 0) {
            const srcPath = files.fwSinhVienSdhFile[0].path;
            let tinhTrangMapping = {};
            new Promise(resolve => {
                app.model.dmTinhTrangSinhVien.getAll({ kichHoat: 1 }, (error, items) => {
                    (items || []).forEach(item => tinhTrangMapping[item.ma] = item.ten);
                    resolve();
                });
            }).then(() => {
                app.excel.readFile(srcPath, workbook => {
                    if (workbook) {
                        const worksheet = workbook.getWorksheet(1), element = [], totalRow = worksheet.lastRow.number;
                        const handleUpload = (index = 2) => {
                            const value = worksheet.getRow(index).values;
                            if (value.length == 0 || index == totalRow + 1) {
                                app.fs.deleteFile(srcPath);
                                done({ element });
                            } else {
                                let data = {
                                    ma: value[1],
                                    ho: value[2] ? value[2].trim() : '',
                                    ten: value[3] ? value[3].trim() : '',
                                    gioiTinh: value[4],
                                    ngaySinh: value[5] ? new Date(value[5].split('/')[2], Number(value[5].split('/')[1]) - 1, value[5].split('/')[0]).getTime() : '',
                                    quocTich: value[6],
                                    danToc: value[7],
                                    tonGiao: value[8],
                                    noiSinh: value[9],
                                    nguyenQuan: value[10],
                                    thuongTruTinh: value[11],
                                    thuongTruHuyen: value[12],
                                    thuongTruXa: value[13],
                                    thuongTruSoNha: value[14],
                                    hienTai: value[15],
                                    maKhoa: value[19] ? value[19].result : '',
                                    khoa: value[20],
                                    maNganh: value[21],
                                    nganh: value[22],
                                    namTuyenSinh: value[23],
                                    nienKhoa: value[24],
                                    bacDaoTao: value[25],
                                    heDaoTao: value[26],
                                    chuongTrinhDaoTao: value[27],
                                    maTinhTrang: value[28],
                                    tinhTrang: value[28] ? tinhTrangMapping[value[28]] : '',
                                    sdtCaNhan: value[29],
                                    sdtLienHe: value[30],
                                    hoTenCha: value[31],
                                    namSinhCha: value[32],
                                    ngheNghiepCha: value[33],
                                    sdtCha: value[34],
                                    hoTenMe: value[35],
                                    namSinhMe: value[36],
                                    ngheNghiepMe: value[37],
                                    sdtMe: value[38],
                                    sdtNguoiThan: value[39],
                                    email: value[40],
                                    tenCoQuan: value[42],
                                    tenDeTai: value[43],
                                    gvhd: value[44]
                                };

                                element.push(data);
                                handleUpload(index + 1);
                            }
                        };
                        handleUpload();
                    } else {
                        app.fs.deleteFile(srcPath);
                        done({ error: 'Error' });
                    }
                });
            });

        }
    };
};