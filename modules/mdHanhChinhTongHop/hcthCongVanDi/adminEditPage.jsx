import React from 'react';
import { connect } from 'react-redux';
import { getHcthCongVanDiPage, getHcthCongVanDiAll, createHcthCongVanDi, updateHcthCongVanDi, deleteHcthCongVanDi, getHcthCongVanDiSearchPage, deleteFile, getCongVanDi, createPhanHoi, getHistory, updateStatus, getPhanHoi, readCongVanDi } from './redux';
import { Link } from 'react-router-dom';
import { EditModal } from 'modules/mdDanhMuc/dmDonViGuiCv/adminPage';
import { AdminPage, FormDatePicker, renderTable, FormRichTextBox, FormSelect, TableCell, FormFileBox, FormTextBox, renderComment, renderTimeline } from 'view/component/AdminPage';
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
import { FileHistoryModal } from './component';
import { createCongVanTrinhKy, deleteCongVanTrinhKy, updateCongVanTrinhKy } from '../hcthCongVanTrinhKy/redux';
const { action, trangThaiCongVanDi, CONG_VAN_DI_TYPE, loaiCongVan } = require('../constant.js');
import FileBox from 'view/component/FileBox';

const listTrangThai = {
    '1': {
        status: 'Mới',
        color: 'red'
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
        status: 'Đã gửi',
        color: 'green'
    },
    '6': {
        status: 'Đã đọc',
        color: 'green'
    },
    '7': {
        status: 'Đã duyệt',
        color: 'green'
    }
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
        case action.ADD_SIGN_REQUEST:
            return 'thêm 1 yêu cầu trình ký ở';
        case action.REMOVE_SIGN_REQUEST:
            return 'xoá 1 yêu cầu trình ký ở';
        case action.UPDATE_SIGN_REQUEST:
            return 'cập nhật 1 yêu cầu trình ký ở';
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
            return '#28a745';
        default:
            return 'blue';
    }
};

class AdminEditPage extends AdminPage {
    constructor(props) {
        super(props);
        this.updateFileRef = React.createRef();
    }

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
                    <Link key={1} to='/user/hcth/cong-van-cac-phong'>Danh sách công văn các phòng</Link>,
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
                    <Link key={1} to='/user/cong-van-cac-phong'>Danh sách công văn các phòng</Link>,
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
        let { trichYeu, ngayGui, ngayKy, donViGui, donViNhan, canBoNhan, donViNhanNgoai, listFile = [], danhSachPhanHoi = [], trangThai, loaiCongVan, loaiVanBan, history = [], soDi } = data ? data :
            { id: '', trichYeu: '', ngayGui: '', ngayKy: '', donViGui: '', donViNhan: '', canBoNhan: '', donViNhanNgoai: '', trangThai: '', loaiVanBan: '', loaiCongVan: 'TRUONG', soDi: '' };

        this.trichYeu.value(trichYeu);
        this.ngayGui.value(ngayGui);
        this.ngayKy.value(ngayKy);
        this.donViGui.value(donViGui);

        this.loaiVanBan.value(loaiVanBan);
        this.phanHoi?.value('');

        this.setState({
            soDi,
            trangThai,
            donViGui,
            donViNhan,
            loaiCongVan,
            history,
            checkDonViGui: this.state.listDonViQuanLy.includes(donViGui),
            listFile, phanHoi: danhSachPhanHoi
        }, () => {
            this.loaiCongVan.value(loaiCongVan);
            this.trangThai?.value(trangThai || '');
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
            trangThai: this.state.trangThai
        };
        if (!changes.donViGui) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.donViGui.focus();
        } else if (!changes.loaiCongVan) {
            T.notify('Loại công văn bị trống', 'danger');
        } else if (!changes.trichYeu) {
            T.notify('Trích yếu bị trống', 'danger');
        }
        else return changes;
        return null;
    }

    save = () => {
        const changes = this.getValidatedData();
        if (changes) {
            if (!this.state.trangThai) changes.trangThai = trangThaiCongVanDi.MOI.id;
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

    onReturnCvDi = (e) => {
        e.preventDefault();
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
                    this.props.createPhanHoi(newPhanHoi, () => this.props.getPhanHoi(this.state.id, () => this.onChangeStatus(trangThaiCongVanDi.TRA_LAI.id, () => this.getData())));
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
        const data = this.getValidatedData();
        if (data) {
            let newTrangThai;
            T.confirm('Thông báo', 'Bạn có chắc chắn muốn gửi công văn này đi không ?', 'warning', true, isConfirm => {
                if (isConfirm) {
                    if (this.state.loaiCongVan == 'TRUONG') {
                        newTrangThai = trangThaiCongVanDi.CHO_KIEM_TRA.id;
                        this.setState({ trangThai: newTrangThai }, () => this.save());
                    } else {
                        newTrangThai = trangThaiCongVanDi.DA_GUI.id;
                        this.onChangeStatus(newTrangThai, () => this.getData());
                    }
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

    onUpdateFile = (e, id) => {
        e.preventDefault();
        this.setState({
            updateFileId: id
        }, () => {
            this.updateFileRef.current.uploadInput.click();
        });
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
            const itemDetail = item.danhSachCapNhat.length > 0 ? item.danhSachCapNhat[0] : item;
            const
                timeStamp = itemDetail.thoiGian,
                originalName = itemDetail.ten,
                linkFile = `/api/hcth/cong-van-cac-phong/download/${id || 'new'}/${itemDetail.tenFile}`;
            const canCreateSignRequest = this.getUserPermission('hcthCongVanDi', ['manage']).manage;
            return (
                <tr key={itemDetail.id}>
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
                        {
                            this.state.id &&
                            <>
                                <a className='btn btn-primary' title='Cập nhật' onClick={e => this.onUpdateFile(e, item.id)}>
                                    <i className='fa fa-lg fa-retweet' />
                                </a>
                                <a className='btn btn-warning' title='Lịch sử' onClick={() => this.historyFileMoal.show(item)}>
                                    <i className='fa fa-lg fa-history' />
                                </a>
                            </>
                        }
                    </TableCell>
                </tr>
            );
        }
    });

    checkNotDonVi = () => {
        return this.state.id && ((this.state.listDonViQuanLy.length != 0 && !this.state.checkDonViGui) || (this.state.listDonViQuanLy.length == 0 && (this.state.maDonVi != this.state.donViGui)));
    }

    canReadComment = () => {
        return this.state.id && (this.state.trangThai != trangThaiCongVanDi.MOI.id);
    }

    canSend = () => {
        let canEditTrangThai = [trangThaiCongVanDi.MOI.id, trangThaiCongVanDi.TRA_LAI.id].includes(this.state.trangThai);
        let permission = this.getUserPermission('hcthCongVanDi', ['manage']).manage || (this.getUserPermission('donViCongVanDi', ['manage']).manage);

        return this.state.id && canEditTrangThai && permission && !this.checkNotDonVi();
    }

    canAccept = () => {
        return this.state.id && this.state.trangThai == '2' && this.getUserPermission('hcthCongVanDi', ['manage']).manage;
    }

    canApprove = () => {
        return this.state.id && this.state.trangThai == '3' && this.getUserPermission('rectors', ['login']).login;
    }

    canAddFile = () => {
        return (!this.state.id || [trangThaiCongVanDi.MOI.id, trangThaiCongVanDi.TRA_LAI.id].includes(this.state.trangThai)) && !this.checkNotDonVi();
    }

    canSeeNumber = () => {
        return this.state.id && [trangThaiCongVanDi.DA_DUYET.id, trangThaiCongVanDi.DA_GUI.id].includes(this.state.trangThai);
    }

    canReadOnly = () => {
        let checkTrangThai = ![trangThaiCongVanDi.MOI.id, trangThaiCongVanDi.TRA_LAI.id, ''].includes(this.state.trangThai);
        let checkCondition = this.state.id && !this.getUserPermission('hcthCongVanDi', ['read', 'write', 'delete']).write && (this.state.listDonViQuanLy.length == 0);

        return checkTrangThai || checkCondition || this.checkNotDonVi();
    }

    canCheckRead = () => {
        let checkRead = true;
        if (this.state.trangThai == trangThaiCongVanDi.DA_GUI.id) {
            if (this.getUserPermission('hcth', ['login', 'manage']).login && !this.state.donViNhan.includes('29')) {
                checkRead = false;
            } else if (this.getUserPermission('rectors', ['login']).login && !this.state.donViNhan.includes('68')) {
                checkRead = false;
            } else if (this.state.checkDonViGui) {
                checkRead = false;
            }
        } else {
            checkRead = false;
        }
        return checkRead;
    }

    canReturn = () => {
        return ((this.state.trangThai == trangThaiCongVanDi.CHO_KIEM_TRA.id) && this.getUserPermission('hcthCongVanDi', ['manage']).manage) || ((this.state.trangThai == trangThaiCongVanDi.CHO_DUYET.id) && this.getUserPermission('rectors', ['login']).login);
    }

    onChangeHistorySort = (e) => {
        e.preventDefault();
        const current = this.state.historySortType,
            next = current == 'DESC' ? 'ASC' : 'DESC';
        this.setState({ historySortType: next }, () => this.props.getHistory(this.state.id, { historySortType: this.state.historySortType }));
    }

    render = () => {
        const permission = this.getUserPermission('hcthCongVanDi', ['read', 'write', 'delete']),
            isNew = !this.state.id,
            hcthManagePermission = this.getUserPermission('hcthCongVanDi', ['manage']),
            unitManagePermission = this.getUserPermission('donViCongVanDi', ['manage']),
            dmDonViGuiCvPermission = this.getUserPermission('dmDonViGuiCv', ['read', 'write', 'delete']),
            buttons = [],
            { breadcrumb, backRoute } = this.getSiteSetting();

        const titleText = !isNew ? 'Cập nhật' : 'Tạo mới';
        const listTrangThaiCv = Object.keys(listTrangThai).map(item =>
        ({
            id: item,
            text: listTrangThai[item].status
        }));

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


        if (this.canSend()) {
            buttons.push({ className: 'btn-success', icon: 'fa-solid fa-paper-plane', onClick: this.onSend });
        } else if (this.canAccept()) {
            buttons.push({ className: 'btn-success', icon: 'fa-check', onClick: this.onAcceptCvDi });
        } else if (this.canApprove()) {
            buttons.push({ className: 'btn-success', icon: 'fa-check', onClick: this.onApproveCvDi });
        } else if (this.canCheckRead()) {
            buttons.push({ className: 'btn-success', icon: 'fa-solid fa-bookmark', onClick: this.onReadCvDi });
        }

        const listFile = this.state.listFile;

        let groupListFile = [];

        listFile.forEach((item) => {
            if (!item.capNhatFileId) {
                groupListFile.push({ ...item, danhSachCapNhat: [item] });
            } else {
                const updateFileId = groupListFile.findIndex(file => file.id === item.capNhatFileId);
                let oldDanhSachCapNhat = groupListFile[updateFileId].danhSachCapNhat;

                oldDanhSachCapNhat.unshift(item);

                groupListFile[updateFileId].danhSachCapNhat = oldDanhSachCapNhat;
            }

        });

        return this.renderPage({
            icon: 'fa fa-caret-square-o-right',
            title: 'Công văn các phòng',
            breadcrumb,
            content: this.state.isLoading ? loading : (<>
                <div className='tile'>
                    <div className='clearfix'>
                        <div className='d-flex justify-content-between'>
                            <h3 className='tile-title'>{titleText}</h3>

                            {!isNew && (
                                <div className='pr-0'>
                                    <FormSelect className='col-md-12' ref={e => this.trangThai = e} label='Trạng thái' readOnly={true} data={listTrangThaiCv} required />
                                </div>
                            )}
                        </div>

                    </div>
                    <div className='tile-body row'>
                        {
                            this.canSeeNumber() && soCongVan &&
                            <FormTextBox type='text' className='col-md-12' readOnlyEmptyText={soCongVan} label='Số công văn' readOnly={true} />
                        }
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayGui = e} label='Ngày gửi' readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có ngày gửi' />
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayKy = e} label='Ngày ký' readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có ngày ký' />
                        <FormSelect className='col-md-12' ref={e => this.donViGui = e} label='Đơn vị gửi' readOnly={this.canReadOnly()} data={SelectAdapter_DmDonViFilter(lengthDv != 0 ? this.state.listDonViQuanLy : this.state.maDonVi)} placeholder="Chọn đơn vị gửi" required readOnlyEmptyText='Chưa có đơn vị gửi' />
                        <FormSelect className='col-md-6' label='Loại công văn' placeholder='Chọn loại công văn' ref={e => this.loaiCongVan = e} data={loaiCongVanArr} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có loại công văn' onChange={value => this.setState({ loaiCongVan: value.id })} required />
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
                                {this.tableListFile(groupListFile, this.state.id, permission, this.canAddFile())}
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
                <YeuCauKyModal ref={e => this.yeuCauKyModal = e} create={this.props.createCongVanTrinhKy} update={this.props.updateCongVanTrinhKy} {...this.props} congVanId={this.state.id} onSubmitCallback={() => { this.props.getHistory(this.state.id, { historySortType: this.state.historySortType }); }} />
                <FileBox ref={this.updateFileRef} postUrl='/user/upload'
                    uploadType='hcthCongVanDiUpdateFile'
                    userData={`hcthCongVanDiUpdateFile:${this.state.id}:${this.state.updateFileId}`} style={{ display: 'none' }}
                    success={this.onSuccess} ajax={true} />
                <FileHistoryModal ref={e => this.historyFileMoal = e} data={groupListFile} fileId={this.state.updateFileId} isShowSubmit={false} />
            </>),
            backRoute,
            onSave: (this.state.trangThai == '' || this.state.trangThai == '1' || this.state.trangThai == '4') && ((unitManagePermission && unitManagePermission.manage) || (hcthManagePermission && hcthManagePermission.manage) && !this.checkNotDonVi()) ? this.save : null,
            buttons
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi, phanHoi: state.hcth.hcthPhanHoi });
const mapActionsToProps = {
    getHcthCongVanDiAll,
    getHcthCongVanDiPage,
    createHcthCongVanDi,
    updateHcthCongVanDi,
    deleteHcthCongVanDi,
    getHcthCongVanDiSearchPage,
    deleteFile,
    getCongVanDi,
    createPhanHoi,
    getHistory,
    updateStatus,
    getPhanHoi,
    createDmDonViGuiCv,
    readCongVanDi,
    createCongVanTrinhKy,
    deleteCongVanTrinhKy,
    updateCongVanTrinhKy
};
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);