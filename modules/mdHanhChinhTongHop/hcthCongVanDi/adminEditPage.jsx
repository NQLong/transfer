import React from 'react';
import { connect } from 'react-redux';
import { getHcthCongVanDiPage, getHcthCongVanDiAll, createHcthCongVanDi, updateHcthCongVanDi, deleteHcthCongVanDi, getHcthCongVanDiSearchPage, deleteFile, getCongVanDi, createPhanHoi, getHistory, updateStatus, getPhanHoi, readCongVanDi, publishingCongVanDi } from './redux';
import { Link } from 'react-router-dom';
import { EditModal } from 'modules/mdDanhMuc/dmDonViGuiCv/adminPage';
import { FormCheckbox, AdminPage, FormDatePicker, renderTable, FormRichTextBox, FormSelect, TableCell, FormFileBox, FormTextBox, renderComment, renderTimeline } from 'view/component/AdminPage';
import {
    SelectAdapter_DmDonVi,
    SelectAdapter_DmDonViFilter,
} from 'modules/mdDanhMuc/dmDonVi/redux';
import {
    SelectAdapter_DmDonViGuiCongVan,
    createDmDonViGuiCv
} from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import {
    SelectAdapter_DmLoaiCongVan
} from 'modules/mdDanhMuc/dmLoaiCongVan/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { YeuCauKy, YeuCauKyModal } from '../hcthCongVanTrinhKy/component';
import { createCongVanTrinhKy, deleteCongVanTrinhKy, updateCongVanTrinhKy } from '../hcthCongVanTrinhKy/redux';
const { action, trangThaiCongVanDi, CONG_VAN_DI_TYPE, loaiCongVan } = require('../constant.js');

const listTrangThai = {
    '1': {
        status: 'Nháp',
        color: 'red'
    },
    '6': {
        status: 'Xem xét',
        color: 'green'
    },
    '2': {
        status: 'Chờ kiểm tra',
        color: 'blue'
    },
    '3': {
        status: 'Chờ duyệt',
        color: 'blue'
    },
    '4': {
        status: 'Trả lại',
        color: 'red'
    },
    '5': {
        status: 'Đã xem xét',
        color: 'green'
    },
    '7': {
        status: 'Đã duyệt',
        color: 'green'
    },
    '8': {
        status: 'Chờ phân phối',
        color: 'green'
    },
    '9': {
        status: 'Chờ ký',
        color: 'green'
    },
    '10': {
        status: 'Đã phân phối',
        color: 'green'
    },
    '11': {
        status: 'Trả lại (Đơn vị)',
        color: 'red'
    },
    '12': {
        status: 'Trả lại (HCTH)',
        color: 'red'
    }
};

const getTrangThaiText = (value) => {
    for (const key in trangThaiCongVanDi) {
        if (trangThaiCongVanDi[key].id === value) {
            return trangThaiCongVanDi[key].text;
        }
    }
    return '';
};


const actionToText = (value) => {
    switch (value) {
        case action.CREATE:
            return 'tạo';
        case action.UPDATE:
            return 'cập nhật';
        case action.RETURN:
            return 'trả lại';
        case action.APPROVE:
            return 'duyệt';
        case action.ACCEPT:
            return 'chấp nhận';
        case action.READ:
            return 'đọc';
        case action.SEND:
            return 'gửi';
        case action.VIEW:
            return 'xem';
        case action.ADD_SIGN_REQUEST:
            return 'thêm 1 yêu cầu trình ký ở';
        case action.REMOVE_SIGN_REQUEST:
            return 'xoá 1 yêu cầu trình ký ở';
        case action.UPDATE_SIGN_REQUEST:
            return 'cập nhật 1 yêu cầu trình ký ở';
        case action.WAIT_SIGN:
            return 'chuyển trạng thái sang chờ ký tại';
        case action.DISTRIBUTE:
            return 'đã phân phối';
        default:
            return '';
    }
};

const actionColor = (value) => {
    switch (value) {
        case action.CREATE:
        case action.ACCEPT:
        case action.APPROVE:
        case action.UPDATE_SIGN_REQUEST:
            return '#00a65a';
        case action.RETURN:
        case action.REMOVE_SIGN_REQUEST:
            return 'red';
        case action.ADD_SIGN_REQUEST:
        case action.VIEW:
            return '#28a745';
        default:
            return 'blue';
    }
};

class AdminEditPage extends AdminPage {
    listFileRefs = {};

    state = {
        id: null,
        listFile: [],
        newPhanHoi: [],
        phanHoi: [],
        listDonViQuanLy: [],
        maDonVi: [],
        isLoading: true,
        historySortType: 'DESC',
        laySoTuDong: true
    };

    componentDidMount() {
        const hcthMenu = window.location.pathname.startsWith('/user/hcth');
        T.ready(hcthMenu ? '/user/hcth' : '/user', () => {
            const params = T.routeMatcher(hcthMenu ? '/user/hcth/cong-van-cac-phong/:id' : '/user/cong-van-cac-phong/:id').parse(window.location.pathname),
                user = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '', staff: {}, lastName: '', firstName: '', maDonVi: '' },
                { shcc, maDonVi } = user;

            let listDonViQuanLy = this.props.system && this.props.system.user.staff && this.props.system.user.staff.donViQuanLy ? this.props.system.user.staff.donViQuanLy : [];

            this.setState({
                id: params.id === 'new' ? null : params.id,
                isLoading: params.id === 'new' ? false : true,
                shcc,
                user,
                listDonViQuanLy: listDonViQuanLy.filter(item => item.isManager).map(item => item.maDonVi),
                maDonVi: [maDonVi]
            }, () => this.getData());
        });
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                routeMatcherUrl: '/user/hcth/cong-van-cac-phong/:id',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    <Link key={1} to='/user/hcth/cong-van-cac-phong'>Danh sách công văn đi</Link>,
                    this.state.id ? 'Cập nhật' : 'Tạo mới'
                ],
                backRoute: '/user/hcth/cong-van-cac-phong'
            };
        else
            return {
                routeMatcherUrl: '/user/cong-van-cac-phong/:id',
                readyUrl: '/user',
                breadcrumb: [
                    <Link key={0} to='/user/'>Trang cá nhân</Link>,
                    <Link key={1} to='/user/cong-van-cac-phong'>Danh sách công văn đi</Link>,
                    this.state.id ? 'Cập nhật' : 'Tạo mới'
                ],
                backRoute: '/user/cong-van-cac-phong'
            };
    }

    renderPhanHoi = (listPhanHoi) => {
        return renderComment({
            getDataSource: () => listPhanHoi,
            emptyComment: 'Chưa có phản hồi',
            renderAvatar: (item) => <img src={item.image || '/img/avatar.png'} style={{ width: '48px', height: '48px', paddingTop: '5px', borderRadius: '50%' }} />,
            renderName: (item) => <><span style={{ color: 'blue' }}>{item.ho?.normalizedName()} {item.ten?.normalizedName()}</span></>,
            renderTime: (item) => T.dateToText(item.ngayTao, 'dd/mm/yyyy HH:MM'),
            renderContent: (item) => item.noiDung
        });
    }

    onCreatePhanHoi = (e) => {
        e.preventDefault();
        if (this.phanHoi.value()) {
            const { shcc } = this.state;
            const newPhanHoi = {
                canBoGui: shcc,
                noiDung: this.phanHoi.value(),
                ngayTao: new Date().getTime(),
                key: parseInt(this.props.match.params.id),
                loai: CONG_VAN_DI_TYPE
            };
            this.props.createPhanHoi(newPhanHoi, () => this.getData());
        } else {
            T.notify('Nội dung phản hồi bị trống', 'danger');
            this.phanHoi.focus();
        }
    }

    renderHistory = (history) => renderTimeline({
        getDataSource: () => history,
        handleItem: (item) => ({
            className: item.hanhDong == action.RETURN ? 'danger' : '',
            component: <>
                <span className="time">{T.dateToText(item.thoiGian, 'dd/mm/yyyy HH:MM')}</span>
                <p><b style={{ color: 'blue' }}>{(item.ho?.normalizedName() || '') + ' '} {item.ten?.normalizedName() || ' '}</b> đã <b style={{ color: actionColor(item.hanhDong) }}> {actionToText(item.hanhDong)} </b> công văn này. </p>
            </>
        })
    })

    getData = () => {
        if (this.state.id) {
            const queryParams = new URLSearchParams(window.location.search);
            const nhiemVu = queryParams.get('nhiemVu');
            const context = { historySortType: this.state.historySortType };
            if (nhiemVu) context.nhiemVu = nhiemVu;
            this.setState({ isLoading: false });
            this.props.getCongVanDi(Number(this.state.id), context, (item) => this.setData(item));
        }
        else this.setData();
    }

    setData = (data = null) => {
        let { trichYeu, ngayGui, ngayKy, donViGui, donViNhan, canBoNhan, donViNhanNgoai, listFile = [], danhSachPhanHoi = [], trangThai, loaiCongVan, loaiVanBan, history = [], soDi, laySoTuDong = true, soCongVan = '' } = data ? data :
            { id: '', trichYeu: '', ngayGui: '', ngayKy: '', donViGui: '', donViNhan: '', canBoNhan: '', donViNhanNgoai: '', trangThai: '', loaiVanBan: '', loaiCongVan: 'TRUONG', soDi: '' };

        this.trichYeu.value(trichYeu);
        this.ngayGui.value(ngayGui);
        this.ngayKy.value(ngayKy);
        this.donViGui.value(donViGui);

        this.loaiVanBan.value(loaiVanBan);
        this.phanHoi?.value('');
        laySoTuDong = Boolean(laySoTuDong);
        this.setState({
            soDi,
            trangThai,
            donViGui,
            donViNhan,
            loaiCongVan,
            history,
            laySoTuDong,
            soCongVan,
            checkDonViGui: this.state.listDonViQuanLy.includes(donViGui),
            listFile, phanHoi: danhSachPhanHoi
        }, () => {
            this.loaiCongVan.value(loaiCongVan);
            this.trangThai?.value(trangThai || '');
            this.laySoTuDong?.value(this.state.laySoTuDong);
            this.soCongVan?.value(soCongVan);
            this.fileBox?.setData('hcthCongVanDiFile:' + (this.state.id ? this.state.id : 'new'));
            listFile.map((item, index) => this.listFileRefs[index]?.value(item.viTri) || '');
        });

        if (donViNhan) {
            donViNhan = donViNhan.split(',');
            this.donViNhan.value(donViNhan ? donViNhan : '');
        }

        if (donViNhanNgoai) {
            donViNhanNgoai = donViNhanNgoai.split(',');
            this.donViNhanNgoai.value(donViNhanNgoai ? donViNhanNgoai : '');
        }

        if (canBoNhan) {
            canBoNhan = canBoNhan.split(',');
            this.canBoNhan.value(canBoNhan ? canBoNhan : '');
        }
    }

    onSuccess = (response) => {
        if (response.error) T.notify(response.error, 'danger');
        else if (response.item) {
            let listFile = this.state.listFile.length ? [...this.state.listFile] : [];
            listFile.push(response.item);
            let linkCongVan = '[]';
            try {
                linkCongVan = JSON.stringify(listFile);
            } catch (exception) {
                T.notify(exception, 'danger');
                return;
            }
            this.state.id && this.props.updateHcthCongVanDi(this.state.id, { linkCongVan });
            this.setState({ listFile });
        }
    }

    deleteFile = (e, index, item) => {
        e.preventDefault();
        const { id: fileId, ten: file } = item;
        T.confirm('Tập tin đính kèm', 'Bạn có chắc muốn xóa tập tin đính kèm này, tập tin sau khi xóa sẽ không thể khôi phục lại được', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteFile(this.state.id ? this.state.id : null, fileId, file, () => {
                let listFile = [...this.state.listFile];
                listFile.splice(index, 1);
                this.setState({ listFile });
            })
        );
    }

    onViTriChange = (e, index) => {
        e.preventDefault();
        let listFile = [...this.state.listFile];
        listFile[index].viTri = this.listFileRefs[index].value() || '';
        setTimeout(() => this.setState({ listFile }), 500);
    }

    getValue = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    getValidatedData = () => {
        const changes = {
            trichYeu: this.trichYeu.value(),
            ngayGui: Number(this.ngayGui.value()),
            ngayKy: Number(this.ngayKy.value()),
            loaiCongVan: this.loaiCongVan.value(),
            donViGui: this.donViGui.value(),
            donViNhan: this.getValue(this.donViNhan) ? this.donViNhan.value() : [],
            canBoNhan: this.getValue(this.canBoNhan) ? this.canBoNhan.value().toString() : '',
            donViNhanNgoai: this.getValue(this.donViNhanNgoai) ? this.donViNhanNgoai.value() : [],
            loaiVanBan: this.loaiVanBan.value() ? this.loaiVanBan.value().toString() : '',
            fileList: this.state.listFile || [],
            laySoTuDong: Number(this.laySoTuDong?.value()),
            soCongVan: this.soCongVan?.value() || null,
            trangThai: this.state.trangThai
        };
        console.log(changes);
        if (changes.loaiCongVan == loaiCongVan.TRUONG.id) changes.laySoTuDong = 1;
        if (!changes.donViGui) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.donViGui.focus();
        } else if (!changes.loaiCongVan) {
            T.notify('Loại công văn bị trống', 'danger');
        } else if (!changes.trichYeu) {
            T.notify('Trích yếu bị trống', 'danger');
            this.trichYeu.focus();
        } else if (!changes.soCongVan && !changes.laySoTuDong) {
            T.notify('Số công văn trống', 'danger');
            this.soCongVan?.focus();
        }
        else return changes;
        return null;
    }

    save = () => {
        const changes = this.getValidatedData();
        if (changes) {
            if (!this.state.trangThai) changes.trangThai = trangThaiCongVanDi.NHAP.id;
            if (this.state.id) {
                this.props.updateHcthCongVanDi(this.state.id, changes, this.getData);
            } else {
                changes.ngayTao = new Date().getTime();
                this.props.createHcthCongVanDi(changes, () => (window.location.pathname.startsWith('/user/hcth') ? this.props.history.push('/user/hcth/cong-van-cac-phong') : this.props.history.push('/user/cong-van-cac-phong')));
            }
        }
    }

    onChangeStatus = (status, done) => {
        let donViGui = this.donViGui.value();
        this.props.updateStatus({ id: this.state.id, trangThai: status, donViGui }, () => this.setState({ trangThai: status }, () => this.props.getHistory(this.state.id, () => done && done())));
    }

    onAcceptCvDi = (e) => {
        e.preventDefault();
        T.confirm('Thông báo', 'Bạn có chắc chắn muốn chấp nhận công văn này không ?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.onChangeStatus(trangThaiCongVanDi.CHO_DUYET.id, () => this.getData());
            }
        });
    }

    onApproveCvDi = (e) => {
        e.preventDefault();
        T.confirm('Thông báo', 'Bạn có chắc chắn muốn duyệt công văn này không', 'warning', true, isConfirm => {
            if (isConfirm) {
                const updateData = {
                    id: this.state.id,
                    donViGui: this.donViGui.value(),
                    trangThai: trangThaiCongVanDi.DA_DUYET.id,
                    isSend: true,
                    donViNhan: this.getValue(this.donViNhan) ? this.donViNhan.value() : [],
                    donViNhanNgoai: this.getValue(this.donViNhanNgoai) ? this.donViNhanNgoai.value() : [],
                };
                this.props.updateHcthCongVanDi(this.state.id, updateData, this.getData);
            }
        });
    }

    onDistribute = (e) => {
        e.preventDefault();
        T.confirm('Thông báo', 'Bạn có chắc chắn muốn bắt đầu ký và phân phối công văn này không ?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.onChangeStatus(trangThaiCongVanDi.CHO_KY.id, () => this.getData());
            }
        });
    }


    onReturnCvDi = (e) => {
        e.preventDefault();
        let newTrangThai;
        if (this.state.trangThai == trangThaiCongVanDi.XEM_XET.id) newTrangThai = trangThaiCongVanDi.TRA_LAI_PHONG.id;
        if (this.state.trangThai == trangThaiCongVanDi.CHO_PHAN_PHOI.id) newTrangThai = trangThaiCongVanDi.TRA_LAI_HCTH.id;

        if ([trangThaiCongVanDi.CHO_KIEM_TRA.id, trangThaiCongVanDi.CHO_DUYET.id].includes(this.state.trangThai)) newTrangThai = trangThaiCongVanDi.TRA_LAI.id;
        T.confirm('Thông báo', 'Bạn có chắc chắn muốn trả lại công văn này không ?', 'warning', true, isConfirm => {
            if (isConfirm) {
                if (this.phanHoi.value()) {
                    const { shcc } = this.state;
                    const newPhanHoi = {
                        canBoGui: shcc,
                        noiDung: this.phanHoi.value(),
                        ngayTao: new Date().getTime(),
                        key: parseInt(this.props.match.params.id),
                        loai: CONG_VAN_DI_TYPE
                    };
                    this.props.createPhanHoi(newPhanHoi, () => this.props.getPhanHoi(this.state.id, () => this.onChangeStatus(newTrangThai, () => this.getData())));
                } else {
                    T.notify('Bạn cần thêm lý do trả lại', 'danger');
                    this.phanHoi.focus();
                }
            }
        });
    }

    onReadCvDi = () => {
        T.confirm('Thông báo', 'Bạn có muốn xác nhận là đã đọc công văn này không ?', 'warning', true, isConfirm => {
            if (isConfirm) {

                this.props.readCongVanDi({ id: this.state.id, shcc: this.state.shcc }, () => this.props.getHistory(this.state.id, () => this.getData()));
            }
        });
    }

    onSend = (e) => {
        e.preventDefault();
        let newTrangThai;
        T.confirm('Thông báo', 'Bạn có chắc chắn muốn gửi công văn này đi không ?', 'warning', true, isConfirm => {
            if (isConfirm) {
                if (this.state.loaiCongVan == 'TRUONG') {
                    newTrangThai = trangThaiCongVanDi.CHO_KIEM_TRA.id;
                    this.onChangeStatus(newTrangThai, () => this.getData());
                } else {
                    newTrangThai = trangThaiCongVanDi.DA_XEM_XET.id;
                    this.onChangeStatus(newTrangThai, () => this.getData());
                }
            }
        });
    }

    onSendDistribute = (e) => {
        e.preventDefault();
        const data = this.getValidatedData();
        if (data) {
            let newTrangThai = trangThaiCongVanDi.CHO_PHAN_PHOI.id;
            T.confirm('Thông báo', 'Bạn có chắc chắn muốn gửi công văn này đi không ?', 'warning', true, isConfirm => {
                if (isConfirm) {
                    this.setState({ trangThai: newTrangThai }, () => this.save());
                }
            });
        }
    }

    onCreateDonViNhanNgoai = (data, done) => {
        this.props.createDmDonViGuiCv(data, ({ error, item }) => {
            if (!error) {
                const { id } = item;
                this.donViGui?.value(id);
                done && done({ error, item });
            }
            this.donViGuiNhanModal.hide();
        });
    }

    // canCreateSignRequest = () => {
    //     const hcthCongVanDiPermission = this.getUserPermission('hcthCongVanDi', ['manage']);
    //     return hcthCongVanDiPermission && hcthCongVanDiPermission.manage;
    // }
    onInspect = (e) => {
        e.preventDefault();
        const data = this.getValidatedData();
        if (data) {
            let newTrangThai = trangThaiCongVanDi.XEM_XET.id;
            T.confirm('Hoàn thiện công văn', 'Bạn có chắc bạn đã hoàn thiện công văn này?', true, isConfirm => {
                if (isConfirm) {
                    this.setState({ trangThai: newTrangThai }, () => this.save());
                }
            });
        }
    }


    tableListFile = (data, id, permission, canAddFile) => renderTable({
        getDataSource: () => data,
        stickyHead: false,
        emptyTable: 'Chưa có file công văn nào!',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Tên tập tin</th>
                <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Vị trí</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => {
            const
                timeStamp = item.thoiGian,
                originalName = item.ten,
                linkFile = `/api/hcth/cong-van-cac-phong/download/${id || 'new'}/${originalName}`;
            const canCreateSignRequest = this.getUserPermission('hcthCongVanDi', ['manage']).manage;
            return (
                <tr key={item.id}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ wordBreak: 'break-all' }} content={<>
                        <a href={linkFile} download>{originalName}</a>
                    </>
                    } />
                    <TableCell content={(
                        permission.write && canAddFile ? <FormTextBox type='text' placeholder='Nhập vị trí' style={{ marginBottom: 0 }} ref={e => this.listFileRefs[index] = e} onChange={e => this.onViTriChange(e, index)} /> : item.viTri
                    )} />
                    <TableCell style={{ textAlign: 'center' }} content={T.dateToText(timeStamp, 'dd/mm/yyyy HH:MM')} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onDelete={
                        canAddFile ? e => this.deleteFile(e, index, item) : null}>
                        {canCreateSignRequest && <a className='btn btn-success' title='Tạo yêu cầu ký' style={{ color: 'white' }} onClick={e => { e.preventDefault(); this.yeuCauKyModal.show(item); }}>
                            <i className='fa fa-lg fa-pencil' />
                        </a>}
                        <a className='btn btn-info' href={linkFile} download title='Tải về'>
                            <i className='fa fa-lg fa-download' />
                        </a>
                    </TableCell>
                </tr>
            );
        }
    });

    checkNotDonVi = () => {
        return this.state.id && ((this.state.listDonViQuanLy.length != 0 && !this.state.checkDonViGui) || (this.state.listDonViQuanLy.length == 0 && (this.state.maDonVi != this.state.donViGui)));
    }

    canReadComment = () => {
        return this.state.id && (this.state.trangThai != trangThaiCongVanDi.NHAP.id);
    }

    canSend = () => {
        let canEditTrangThai = [trangThaiCongVanDi.XEM_XET.id, trangThaiCongVanDi.TRA_LAI.id].includes(this.state.trangThai);
        let permission = this.getUserPermission('hcthCongVanDi', ['manage']).manage || (this.getUserPermission('donViCongVanDi', ['manage']).manage);

        return this.state.id && canEditTrangThai && permission && !this.checkNotDonVi();
    }

    canAccept = () => {
        return this.state.id && this.state.trangThai == trangThaiCongVanDi.CHO_KIEM_TRA.id && this.getUserPermission('hcthCongVanDi', ['manage']).manage && this.state.user.maDonVi == '29';
    }

    canApprove = () => {
        return this.state.id && this.state.trangThai == trangThaiCongVanDi.CHO_DUYET.id && this.getUserPermission('rectors', ['login']).login;
    }

    canDistribute = () => {
        let checkStatus = (this.state.trangThai == trangThaiCongVanDi.CHO_PHAN_PHOI.id),
            hcthManagePermission = this.getUserPermission('hcthCongVanDi', ['manage']),
            checkPermission = hcthManagePermission.manage;
        return this.state.id && checkStatus && checkPermission && this.state.user.maDonVi == '29';
    }

    canAddFile = () => {
        return (!this.state.id || [trangThaiCongVanDi.NHAP.id, trangThaiCongVanDi.TRA_LAI.id, trangThaiCongVanDi.TRA_LAI_PHONG.id, trangThaiCongVanDi.TRA_LAI_HCTH.id, trangThaiCongVanDi.CHO_PHAN_PHOI.id].includes(this.state.trangThai)) && !this.checkNotDonVi();
    }

    canSeeNumber = () => {
        return this.state.id && [trangThaiCongVanDi.DA_DUYET.id, trangThaiCongVanDi.DA_XEM_XET.id, trangThaiCongVanDi.CHO_KY.id, trangThaiCongVanDi.DA_PHAN_PHOI.id].includes(this.state.trangThai);
    }

    canReadOnly = () => {
        let checkTrangThai = ![trangThaiCongVanDi.NHAP.id, trangThaiCongVanDi.TRA_LAI.id, trangThaiCongVanDi.TRA_LAI_PHONG.id, trangThaiCongVanDi.TRA_LAI_HCTH.id, trangThaiCongVanDi.DA_XEM_XET.id, ''].includes(this.state.trangThai);
        let checkCondition = this.state.id && !this.getUserPermission('hcthCongVanDi', ['read', 'write', 'delete']).write && (this.state.listDonViQuanLy.length == 0);

        return checkTrangThai || checkCondition || this.checkNotDonVi();
    }

    canCheckRead = () => {
        let checkRead = true;
        if (this.state.trangThai == trangThaiCongVanDi.DA_PHAN_PHOI.id) {
            if (this.getUserPermission('hcth', ['login', 'manage']).login && !this.state.donViNhan.includes('29')) {
                checkRead = false;
            } else if (this.getUserPermission('rectors', ['login']).login && !this.state.donViNhan.includes('68')) {
                checkRead = false;
            } else if (this.state.checkDonViGui) {
                checkRead = false;
            }
            if (this.state.history.some(o => ((o.shcc == this.state.shcc) && (o.hanhDong == 'READ')))) {
                checkRead = false;
            }
        } else {
            checkRead = false;
        }
        return checkRead;
    }

    canReturn = () => {
        let permissionReturnXemXet = this.getUserPermission('hcthCongVanDi', ['manage']).manage || (this.getUserPermission('donViCongVanDi', ['manage']).manage),
            permissionReturnChoPhanPhoi = this.getUserPermission('hcthCongVanDi', ['manage']).manage;
        if (this.state.id && permissionReturnXemXet && !this.checkNotDonVi() && (this.state.trangThai == trangThaiCongVanDi.XEM_XET.id)) return true;

        if (this.state.id && permissionReturnChoPhanPhoi && this.state.trangThai == trangThaiCongVanDi.CHO_PHAN_PHOI.id && this.state.user.maDonVi == '29') return true;
        return ((this.state.trangThai == trangThaiCongVanDi.CHO_KIEM_TRA.id) && this.getUserPermission('hcthCongVanDi', ['manage']).manage && this.state.user.maDonVi == '29') || ((this.state.trangThai == trangThaiCongVanDi.CHO_DUYET.id) && this.getUserPermission('rectors', ['login']).login);
    }

    onChangeHistorySort = (e) => {
        e.preventDefault();
        const current = this.state.historySortType,
            next = current == 'DESC' ? 'ASC' : 'DESC';
        this.setState({ historySortType: next }, () => this.props.getHistory(this.state.id, { historySortType: this.state.historySortType }));
    }

    canInspect = () => {
        let canEditTrangThai = [trangThaiCongVanDi.NHAP.id, trangThaiCongVanDi.TRA_LAI_PHONG.id].includes(this.state.trangThai);
        let permission = this.getUserPermission('hcthCongVanDi', ['manage']).manage || (this.getUserPermission('donViCongVanDi', ['manage']).manage) || (this.getUserPermission('donViCongVanDi', ['edit']).edit);
        return this.state.id && canEditTrangThai && permission && !this.checkNotDonVi();
    }

    canSendDistribute = () => {
        let canSendTrangThai = (this.state.trangThai == trangThaiCongVanDi.TRA_LAI_HCTH.id);
        // Kiểm tra coi user có shcc hay không?
        let permission = this.getUserPermission('hcthCongVanDi', ['manage']).manage || (this.getUserPermission('donViCongVanDi', ['manage']).manage) || (this.getUserPermission('donViCongVanDi', ['edit']).edit && (this.state.user?.shcc == this.props.hcthCongVanDi?.item?.nguoiTao));
        return this.state.id && canSendTrangThai && permission && !this.checkNotDonVi();
    }

    canPublish = () => {
        const congVan = this.props.hcthCongVanDi?.item || {};
        let permission = this.getUserPermission('hcthCongVanDi', ['manage']).manage || (this.getUserPermission('donViCongVanDi', ['manage']).manage) || (this.getUserPermission('donViCongVanDi', ['edit']).edit);
        if (congVan.loaiCongVan == loaiCongVan.DON_VI.id) {
            return (
                this.state.id && this.state.trangThai == trangThaiCongVanDi.DA_XEM_XET.id && (
                    permission && !this.checkNotDonVi()
                ));
        } else {
            // công văn trường
            return this.state.id && this.state.trangThai == trangThaiCongVanDi.DA_DUYET.id && (
                //TODO: check quyền ở đây
                permission && !this.checkNotDonVi()
            );
        }
    }

    onPublishing = () => {
        // let newTrangThai;
        T.confirm('Cập nhật công văn đi', 'Công văn sẽ được cập nhật trạng thái, vui lòng xác nhận lại các trường dữ liệu và số công văn được nhập trong file công văn?', 'warning', true, isConfirm => {
            if (isConfirm) {
                // if (this.state.trangThai == trangThaiCongVanDi.DA_DUYET)
                this.props.publishingCongVanDi(this.state.id, () => this.props.getHistory(this.state.id, () => this.getData()));
            }
        });
    }

    onChangeLoaiCongVan = (item) => {
        this.setState({loaiCongVan: item.id}, () => {
            this.laySoTuDong?.value(this.state.laySoTuDong);
        });
    }

    render = () => {
        const permission = this.getUserPermission('hcthCongVanDi', ['read', 'write', 'delete']),
            isNew = !this.state.id,
            hcthManagePermission = this.getUserPermission('hcthCongVanDi', ['manage']),
            unitManagePermission = this.getUserPermission('donViCongVanDi', ['manage']),
            dmDonViGuiCvPermission = this.getUserPermission('dmDonViGuiCv', ['read', 'write', 'delete']),
            buttons = [],
            // chuyên viên soạn thảo
            unitEditPermission = this.getUserPermission('donViCongVanDi', ['edit']),
            { breadcrumb, backRoute } = this.getSiteSetting();

        const titleText = !isNew ? 'Cập nhật' : 'Tạo mới';
        // const listTrangThaiCv = Object.keys(listTrangThai).map(item =>
        // ({
        //     id: item,
        //     text: listTrangThai[item].status
        // }));

        const lengthDv = this.state.listDonViQuanLy.length;

        const soCongVan = this.props.hcthCongVanDi?.item?.soCongVan;
        const loaiCongVanArr = Object.values(loaiCongVan);

        const loading = (
            <div className='overlay tile' style={{ minHeight: '120px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className='m-loader mr-4'>
                    <svg className='m-circular' viewBox='25 25 50 50'>
                        <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                    </svg>
                </div>
                <h4 className='l-text'>Đang tải...</h4>
            </div>);

        if (this.canAccept()) {
            buttons.push({ className: 'btn-success', icon: 'fa-check', onClick: this.onAcceptCvDi });
        } else if (this.canApprove()) {
            buttons.push({ className: 'btn-success', icon: 'fa-check', onClick: this.onApproveCvDi });
        } 
        if (this.canPublish()) {
            buttons.push({ className: 'btn-success', icon: 'fa-envelope', onClick: this.onPublishing });
        }

        this.canInspect() && buttons.push({ className: 'btn-success', icon: 'fa-solid fa-paper-plane', onClick: this.onInspect });
        this.canSend() && buttons.push({ className: 'btn-success', icon: 'fa-solid fa-paper-plane', onClick: this.onSend });
        this.canDistribute() && buttons.push({ className: 'btn-primary', icon: 'fa-solid fa-paper-plane', onClick: this.onDistribute });
        this.canSendDistribute() && buttons.push({ className: 'btn-primary', icon: 'fa-check', onClick: this.onSendDistribute });

        if (this.canCheckRead()) {
            buttons.push({ className: 'btn-success', icon: 'fa-solid fa-eye', onClick: this.onReadCvDi });
        }
        console.log(this.state);

        return this.renderPage({
            icon: 'fa fa-caret-square-o-right',
            title: 'Công văn đi',
            breadcrumb,
            content: this.state.isLoading ? loading : (<>
                <div className='tile'>
                    <div className='clearfix'>
                        <div className='d-flex justify-content-between'>
                            <h3 className='tile-title'>{titleText}</h3>
                        </div>

                    </div>
                    <div className='tile-body row'>
                        {this.state.loaiCongVan != loaiCongVan.TRUONG.id && <FormCheckbox isSwitch readOnly={this.canReadOnly() || (this.state.trangThai == trangThaiCongVanDi.DA_XEM_XET.id)} className={'col-md-12'} label='Lấy số tự động' ref={e => this.laySoTuDong = e} onChange={value => this.setState({ laySoTuDong: value })} />}
                        {
                            (!this.state.laySoTuDong || (this.canSeeNumber() && soCongVan)) &&
                            <FormTextBox readOnly={this.canReadOnly() || this.state.laySoTuDong} type='text' className='col-md-12' ref={e => this.soCongVan = e} label='Số công văn' required={!this.state.laySoTuDong} />
                        }
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayGui = e} label='Ngày gửi' readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có ngày gửi' />
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayKy = e} label='Ngày ký' readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có ngày ký' />
                        
                        {this.state.id && <span className='form-group col-md-12'>Trạng thái: <b style={{ color: this.state.trangThai ? listTrangThai[this.state.trangThai].color : ''}}>{getTrangThaiText(this.state.trangThai)}</b></span>}

                        <FormSelect className='col-md-12' ref={e => this.donViGui = e} label='Đơn vị gửi' readOnly={this.canReadOnly()} data={SelectAdapter_DmDonViFilter(lengthDv != 0 ? this.state.listDonViQuanLy : this.state.maDonVi)} placeholder="Chọn đơn vị gửi" required readOnlyEmptyText='Chưa có đơn vị gửi' />
                        <FormSelect className='col-md-6' disabled={this.canReadOnly() || this.state.trangThai == trangThaiCongVanDi.DA_XEM_XET.id} label='Loại công văn' placeholder='Chọn loại công văn' ref={e => this.loaiCongVan = e} data={loaiCongVanArr} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có loại công văn' onChange={value => this.onChangeLoaiCongVan(value)} required />
                        <FormSelect className='col-md-6' allowClear={true} label='Loại văn bản' placeholder='Chọn loại văn bản' ref={e => this.loaiVanBan = e} data={SelectAdapter_DmLoaiCongVan} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có loại văn bản' />
                        <FormSelect multiple={true} className='col-md-12' label='Đơn vị nhận' placeholder='Chọn đơn vị nhận' ref={e => this.donViNhan = e} data={SelectAdapter_DmDonVi} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có đơn vị nhận' />
                        <FormSelect multiple={true} className='col-md-12' label={(<span onClick={(e) => e.stopPropagation()}>
                            <span style={{ marginRight: '2px' }}>Đơn vị nhận bên ngoài</span>
                            {!this.canReadOnly() && <>
                                (
                                <Link to='#' onClick={() => this.donViGuiNhanModal.show(null)}>Nhấn vào đây để thêm</Link>
                                ) </>
                            }
                        </span>)} placeholder='Chọn đơn vị nhận bên ngoài' ref={e => this.donViNhanNgoai = e} data={SelectAdapter_DmDonViGuiCongVan} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có đơn vị nhận' />
                        <FormSelect multiple={true} className='col-md-12' label='Cán bộ nhận' placeholder='Cán bộ nhận' ref={e => this.canBoNhan = e} data={SelectAdapter_FwCanBo} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có cán bộ nhận' />
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.trichYeu = e} label='Trích yếu' readOnly={this.canReadOnly()} required readOnlyEmptyText=': Chưa có trích yếu' />
                    </div>
                </div>

                {this.canReadComment() &&
                    <div className='tile'>
                        <div className='form-group'>
                            <h3 className='tile-title'>Phản hồi</h3>
                            <div className='tile-body row'>
                                <div className='col-md-12'>
                                    {
                                        this.renderPhanHoi(this.props.hcthCongVanDi?.item?.phanHoi)
                                    }
                                </div>
                                <FormRichTextBox type='text' className='col-md-12 mt-3' ref={e => this.phanHoi = e} label='Thêm phản hồi' />
                                <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                    <button type='submit' className='btn btn-primary mr-2' onClick={this.onCreatePhanHoi}>
                                        Thêm
                                    </button>
                                    {this.canReturn() && <button type='submit' className='btn btn-danger' onClick={this.onReturnCvDi}>
                                        Trả lại
                                    </button>}
                                </div>
                            </div>
                        </div>
                    </div>}

                <div className="tile">
                    <div className="form-group">
                        <h3 className='tile-title'>Danh sách công văn</h3>
                        <div className='tile-body row'>
                            <div className={'form-group ' + (this.canAddFile() ? 'col-md-8' : 'col-md-12')}>
                                {this.tableListFile(this.state.listFile, this.state.id, permission, this.canAddFile())}
                            </div>
                            {this.canAddFile() && <FormFileBox className='col-md-4' ref={e => this.fileBox = e} label='Tải lên tập tin công văn' postUrl='/user/upload' uploadType='hcthCongVanDiFile' userData='hcthCongVanDiFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.onSuccess} />}
                        </div>
                    </div>
                </div>

                {!isNew && <YeuCauKy hcthCongVanDi={this.props.hcthCongVanDi} deleteCongVanTrinhKy={this.props.deleteCongVanTrinhKy} id={this.state.id} permission={permission} {...this.props} onEditVanBanTrinhKy={(e, item) => { e.preventDefault(); this.yeuCauKyModal.show(item); }} />}

                {!isNew &&
                    <div className="tile">
                        <h3 className='tile-title'><i className={`btn fa fa-sort-amount-${this.state.historySortType == 'DESC' ? 'desc' : 'asc'}`} onClick={this.onChangeHistorySort} /> Lịch sử</h3>
                        {this.renderHistory(this.props.hcthCongVanDi?.item?.history)}
                    </div>
                }
                <EditModal ref={e => this.donViGuiNhanModal = e} permissions={dmDonViGuiCvPermission} create={this.onCreateDonViNhanNgoai} />
                <YeuCauKyModal ref={e => this.yeuCauKyModal = e} create={this.props.createCongVanTrinhKy} update={this.props.updateCongVanTrinhKy} {...this.props} congVanId={this.state.id} onSubmitCallback={() => { this.props.getHistory(this.state.id, { historySortType: this.state.historySortType }); }}
                />
            </>),
            backRoute,
            onSave: ([trangThaiCongVanDi.NHAP.id, trangThaiCongVanDi.TRA_LAI.id, trangThaiCongVanDi.TRA_LAI_HCTH.id, trangThaiCongVanDi.TRA_LAI_PHONG.id, trangThaiCongVanDi.DA_XEM_XET.id, ''].includes(this.state.trangThai)) && (((unitManagePermission && unitManagePermission.manage) || (hcthManagePermission && hcthManagePermission.manage) || (unitEditPermission && unitEditPermission.edit)) && !this.checkNotDonVi()) ? this.save : null,
            buttons
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi, phanHoi: state.hcth.hcthPhanHoi });
const mapActionsToProps = { getHcthCongVanDiAll, getHcthCongVanDiPage, createHcthCongVanDi, updateHcthCongVanDi, deleteHcthCongVanDi, getHcthCongVanDiSearchPage, deleteFile, getCongVanDi, createPhanHoi, getHistory, updateStatus, getPhanHoi, createDmDonViGuiCv, readCongVanDi, createCongVanTrinhKy, deleteCongVanTrinhKy, updateCongVanTrinhKy, publishingCongVanDi };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);