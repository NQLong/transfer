import React from 'react';
import { connect } from 'react-redux';
import {
    getHcthCongVanDiPage,
    getHcthCongVanDiAll,
    createHcthCongVanDi,
    updateHcthCongVanDi,
    deleteHcthCongVanDi,
    getHcthCongVanDiSearchPage,
    deleteFile,
    getCongVanDi,
    createPhanHoi,
    createHistory,
    // getHistory
} from './redux';
import { Link } from 'react-router-dom';
import {
    AdminPage,
    FormDatePicker,
    renderTable,
    FormRichTextBox,
    FormSelect,
    TableCell,
    FormCheckbox,
    FormFileBox,
    FormTextBox,
    renderComment,
    renderTimeline
} from 'view/component/AdminPage';
import {
    SelectAdapter_DmDonVi,
    SelectAdapter_DmDonViFilter,
} from 'modules/mdDanhMuc/dmDonVi/redux';
import {
    SelectAdapter_DmDonViGuiCongVan
} from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import {
    SelectAdapter_DmLoaiCongVan
} from 'modules/mdDanhMuc/dmLoaiCongVan/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { getSoCongVan } from './adminPage';
const { action } = require('../constant.js');
// import { getSoCongVan } from './adminPage'

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
        default:
            return '';
    }
};

const actionColor = (value) => {
    switch (value) {
        case action.CREATE:
        case action.ACCEPT:
        case action.APPROVE:
            return '#00a65a';
        case action.RETURN:
            return 'red';
        default:
            return 'blue';
    }
};

const statusToAction = (before, after) => {
    switch (before) {
        case '1':
        case '4':
            if (before == after) {
                return action.UPDATE;
            }
            return action.SEND;
        case '2':
            if (after == '4')
                return action.RETURN;
            else
                return action.ACCEPT;
        case '3':
            if (after == '4')
                return action.RETURN;
            else
                return action.APPROVE;
        case '5':
            return action.READ;
        default:
            return '';
    }
};
class AdminEditPage extends AdminPage {
    listFileRefs = {};

    state = {
        id: null,
        listFile: [],
        newPhanHoi: [],
        phanHoi: [],
        noiBo: 1,
        listDonViQuanLy: [],
        maDonVi: [],
        isLoading: true
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
                loai: 'DI'
            };
            this.props.createPhanHoi(newPhanHoi, () => this.getData());
        } else {
            T.notify('Nội dung phản hồi bị trống', 'danger');
            this.phanHoi.focus();
        }
    }

    onCreateHistory = (value) => {
        const { shcc } = this.state;
        const newHistory = {
            loai: 'DI',
            key: this.state.id ? this.state.id : null,
            shcc: shcc,
            hanhDong: statusToAction(this.state.trangThai ? this.state.trangThai : '', value),
            thoiGian: new Date().getTime(),
            trangThai: value ? value : ''
        };
        this.props.createHistory(newHistory);
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
            this.setState({ isLoading: false });
            this.props.getCongVanDi(Number(this.state.id), (item) => this.setData(item));
        }
        else this.setData();
    }

    setData = (data = null) => {
        let { id, trichYeu, ngayGui, ngayKy, donViGui, donViNhan, canBoNhan, donViNhanNgoai, listFile = [], danhSachPhanHoi = [], trangThai, loaiCongVan, noiBo, laySo, history = [], soDi } = data ? data :
            { id: '', trichYeu: '', ngayGui: '', ngayKy: '', donViGui: '', donViNhan: '', canBoNhan: '', donViNhanNgoai, trangThai: '', loaiCongVan: '', noiBo: 1, laySo: 1, soDi: '' };

        this.trichYeu.value(trichYeu);
        this.ngayGui.value(ngayGui);
        this.ngayKy.value(ngayKy);
        this.donViGui.value(donViGui);
        this.loaiCongVan.value(loaiCongVan ? parseInt(loaiCongVan) : '');
        this.phanHoi?.value('');

        this.setState({
            soDi,
            noiBo,
            trangThai,
            id,
            donViGui,
            donViNhan,
            laySo,
            history
        }, () => {
            this.noiBo.value(this.state.noiBo);
            this.laySo.value(this.state.laySo);
            this.trangThai?.value(trangThai || '');
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

        this.setState({ listFile, phanHoi: danhSachPhanHoi }, () => {
            listFile.map((item, index) => this.listFileRefs[index]?.value(item.viTri) || '');
        });
        this.fileBox?.setData('hcthCongVanDiFile:' + (this.state.id ? this.state.id : 'new'));

        this.setState({ checkDonViGui: this.state.listDonViQuanLy.includes(this.state.donViGui) });
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
            donViGui: this.donViGui.value(),
            donViNhan: this.state.noiBo && this.getValue(this.donViNhan) ? this.donViNhan.value() : [],
            noiBo: Number(this.getValue(this.noiBo)),
            laySo: Number(this.getValue(this.laySo)),
            canBoNhan: this.state.noiBo && this.getValue(this.canBoNhan) ? this.canBoNhan.value().toString() : '',
            donViNhanNgoai: !this.state.noiBo && this.getValue(this.donViNhanNgoai) ? this.donViNhanNgoai.value().toString() : '',
            loaiCongVan: this.loaiCongVan.value() ? this.loaiCongVan.value().toString() : '',
            fileList: this.state.listFile || [],
            trangThai: this.state.trangThai,
        };
        if (!changes.trichYeu) {
            T.notify('Trích yếu bị trống', 'danger');
            this.trichYeu.focus();
        } else if (!changes.donViGui) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.donViGui.focus();
        } else if (!this.state.laySo && !this.state.noiBo) {
            T.notify('Loại công văn ra ngoài cần phải lấy số', 'danger');
        } else return changes;
        return null;
    }

    save = () => {
        const changes = this.getValidatedData();

        if (changes) {
            if (!this.state.trangThai) changes.trangThai = '1';
            if (this.state.id) {
                if (changes.trangThai == '1' || changes.trangThai == '4') {
                    this.onCreateHistory(changes.trangThai);
                }
                this.props.updateHcthCongVanDi(this.state.id, changes, this.getData);
            } else {
                this.props.createHcthCongVanDi(changes, () => this.props.history.push('/user/hcth/cong-van-cac-phong'));
            }
        }
    }

    onAcceptCvDi = () => {
        T.confirm('Thông báo', 'Bạn có chắc chắn muốn chấp nhận công văn này không ?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.onCreateHistory('3');
                this.setState({ trangThai: '3' }, () => this.save());
            }
        });
    }

    onApproveCvDi = () => {
        T.confirm('Thông báo', 'Bạn có chắc chắn muốn duyệt công văn này không', 'warning', true, isConfirm => {
            if (isConfirm) {
                const updateData = {
                    id: this.state.id,
                    donViGui: this.donViGui.value(),
                    loaiCongVan: this.loaiCongVan.value() ? this.loaiCongVan.value() : '',
                    trangThai: '7',
                    isSend: true,
                    donViNhan: this.state.noiBo && this.getValue(this.donViNhan) ? this.donViNhan.value() : [],
                    donViNhanNgoai: !this.state.noiBo && this.getValue(this.donViNhanNgoai) ? this.donViNhanNgoai.value().toString() : '',
                };
                this.onCreateHistory('7');
                this.props.updateHcthCongVanDi(this.state.id, updateData, this.getData);
            }
        });
    }

    onReturnCvDi = () => {
        T.confirm('Thông báo', 'Bạn có chắc chắn muốn trả lại công văn này không ?', 'warning', true, isConfirm => {
            if (isConfirm) {
                if (this.phanHoi.value()) {
                    const { shcc } = this.state;
                    const newPhanHoi = {
                        canBoGui: shcc,
                        noiDung: this.phanHoi.value(),
                        ngayTao: new Date().getTime(),
                        key: parseInt(this.props.match.params.id),
                        loai: 'DI'
                    };
                    this.onCreateHistory('4');
                    this.props.createPhanHoi(newPhanHoi, () => {
                        this.setState({ trangThai: '4' }, () =>
                            this.props.updateHcthCongVanDi(this.state.id, this.getValidatedData(), this.getData));
                    });
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
                this.onCreateHistory('6');
                this.setState({ trangThai: '6' }, () => this.save());
            }
        });
    }

    onSend = () => {
        const data = this.getValidatedData();
        if (data) {
            T.confirm('Thông báo', 'Bạn có chắc chắn muốn gửi công văn này đi không ?', 'warning', true, isConfirm => {
                if (isConfirm) {
                    if (this.state.laySo) {
                        this.onCreateHistory('2');
                        this.setState({ trangThai: '2' }, () => this.save());
                    } else {
                        this.onCreateHistory('5');
                        this.setState({ trangThai: '5' }, () => this.save());
                    }
                }
            });
        }
    }

    tableListFile = (data, id, permission, addFile) => renderTable({
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
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ wordBreak: 'break-all' }} content={<>
                        <a href={linkFile} download>{originalName}</a>
                    </>
                    } />
                    <TableCell content={(
                        permission.write && addFile ? <FormTextBox type='text' placeholder='Nhập vị trí' style={{ marginBottom: 0 }} ref={e => this.listFileRefs[index] = e} onChange={e => this.onViTriChange(e, index)} /> : item.viTri
                    )} />
                    <TableCell style={{ textAlign: 'center' }} content={T.dateToText(timeStamp, 'dd/mm/yyyy HH:MM')} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onDelete={
                        addFile ? e => this.deleteFile(e, index, item) : null}>
                        <a className='btn btn-info' href={linkFile} download title='Tải về'>
                            <i className='fa fa-lg fa-download' />
                        </a>
                    </TableCell>
                </tr>
            );
        }
    });

    canAccept = () => {
        return this.state.id && this.state.trangThai == '2' && this.getUserPermission('hcth', ['login', 'manage']).manage;
    }

    canApprove = () => {
        return this.state.id && this.state.trangThai == '3' && this.getUserPermission('president', ['login']).login;
    }

    addFile = () => {
        return (!this.state.id || this.state.trangThai == '1' || this.state.trangThai == '4');
    }

    render = () => {
        const permission = this.getUserPermission('hcthCongVanDi', ['read', 'write', 'delete']),
            isNew = !this.state.id,
            presidentPermission = this.getUserPermission('president', ['login']),
            hcthStaffPermission = this.getUserPermission('hcth', ['login', 'manage']),
            unitManagePermission = this.getUserPermission('donViCongVanDi', ['manage']);

        const titleText = !isNew ? 'Cập nhật' : 'Tạo mới';
        const listTrangThaiCv = Object.keys(listTrangThai).map(item =>
        ({
            id: item,
            text: listTrangThai[item].status
        }));

        let lengthDv = this.state.listDonViQuanLy.length;

        let readPhanHoi = !isNew || !this.state.trangThai == '1';
        let addPhanHoi = (this.state.trangThai == '1' || this.state.trangThai == '2' || this.state.trangThai == '3' || this.state.trangThai == '4' || this.state.trangThai == '5');

        let readTrangThai = (this.state.trangThai == '2' || this.state.trangThai == '3' || this.state.trangThai == '5' || this.state.trangThai == '6' || this.state.trangThai == '7');

        let checkDonViGui = this.state.checkDonViGui;

        let read = false;
        if (!isNew) {
            if (!permission.write && (lengthDv == 0)) {
                read = true;
            }
        }

        const readCondition = (read || readTrangThai);

        let checkDaDoc = true;
        if (this.state.trangThai === '5') {
            if (hcthStaffPermission.login && !this.state.donViNhan.includes('29')) {
                checkDaDoc = false;
            } else if (presidentPermission.login && !this.state.donViNhan.includes('68')) {
                checkDaDoc = false;
            } else if (checkDonViGui) {
                checkDaDoc = false;
            }
        } else {
            checkDaDoc = false;
        }

        const tenVietTatDonViGui = this.props.hcthCongVanDi?.item?.tenVietTatDonViGui;
        const tenVietTatLoaiCongVanDi = this.props.hcthCongVanDi?.item?.tenVietTatLoaiCongVan ? this.props.hcthCongVanDi.item.tenVietTatLoaiCongVan.tenVietTat : null;

        const loading = (
            <div className='overlay tile' style={{ minHeight: '120px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className='m-loader mr-4'>
                    <svg className='m-circular' viewBox='25 25 50 50'>
                        <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                    </svg>
                </div>
                <h4 className='l-text'>Đang tải...</h4>
            </div>);

        return this.renderPage({
            icon: 'fa fa-caret-square-o-right',
            title: 'Công văn giữa các phòng',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp </Link>,
                <Link key={1} to='/user/hcth/cong-van-cac-phong'>Công văn giữa các phòng</Link>,
                !isNew ? 'Cập nhật' : 'Tạo mới'
            ],
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
                            this.state.trangThai == '7' &&
                            <FormTextBox type='text' className='col-md-12' readOnlyEmptyText={getSoCongVan(this.state.soDi, tenVietTatDonViGui, tenVietTatLoaiCongVanDi)} label='Số công văn' readOnly={true} />
                        }
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayGui = e} label='Ngày gửi' readOnly={readCondition} readOnlyEmptyText='Chưa có ngày gửi' />
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayKy = e} label='Ngày ký' readOnly={readCondition} readOnlyEmptyText='Chưa có ngày ký' />
                        <FormSelect className='col-md-12' ref={e => this.donViGui = e} label='Đơn vị gửi' readOnly={readCondition ? 1 : 0} data={SelectAdapter_DmDonViFilter(lengthDv != 0 ? this.state.listDonViQuanLy : this.state.maDonVi)} required readOnlyEmptyText='Chưa có đơn vị gửi' />
                        <FormCheckbox isSwitch className='col-md-6 form-group' ref={e => this.noiBo = e} label='Công văn nội bộ' readOnly={readCondition} onChange={value => this.setState({ noiBo: value })}></FormCheckbox>
                        <FormCheckbox isSwitch className='col-md-6 form-group' ref={e => this.laySo = e} label='Công văn lấy số' readOnly={readCondition} onChange={value => this.setState({ laySo: value })}></FormCheckbox>
                        {this.state.noiBo ? <FormSelect multiple={true} className='col-md-12' label='Đơn vị nhận' placeholder='Đơn vị nhận' ref={e => this.donViNhan = e} data={SelectAdapter_DmDonVi} readOnly={readCondition} readOnlyEmptyText='Chưa có đơn vị nhận' /> : null}
                        {!this.state.noiBo ? <FormSelect multiple={true} className='col-md-12' label='Đơn vị nhận' placeholder='Đơn vị nhận' ref={e => this.donViNhanNgoai = e} data={SelectAdapter_DmDonViGuiCongVan} readOnly={readCondition} readOnlyEmptyText='Chưa có đơn vị nhận' /> : null}
                        {this.state.noiBo ? <FormSelect multiple={true} className='col-md-12' label='Cán bộ nhận' placeholder='Cán bộ nhận' ref={e => this.canBoNhan = e} data={SelectAdapter_FwCanBo} readOnly={readCondition} readOnlyEmptyText='Chưa có cán bộ nhận' /> : null}
                        <FormSelect className='col-md-12' allowClear={true} label='Loại công văn' placeholder='Chọn loại công văn' ref={e => this.loaiCongVan = e} data={SelectAdapter_DmLoaiCongVan} readOnly={readCondition} readOnlyEmptyText='Chưa có loại công văn' />
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.trichYeu = e} label='Trích yếu' readOnly={readCondition} required readOnlyEmptyText=': Chưa có trích yếu' />
                    </div>
                    <div className='tile-body row d-flex justify-content-end'>
                        {this.canAccept() && <button className='btn btn-success mr-2' type='button' onClick={this.onAcceptCvDi}>Chấp nhận</button>
                        }
                        {this.canApprove() && <button className='btn btn-success mr-2' type='button' onClick={this.onApproveCvDi}>Duyệt</button>
                        }
                        {checkDaDoc &&
                            <button className='btn btn-success mr-2' type='submit' onClick={this.onReadCvDi}>
                                Đã đọc
                            </button>}
                    </div>
                </div>

                {!isNew && readPhanHoi &&
                    <div className='tile'>
                        <div className='form-group'>
                            <h3 className='tile-title'>Phản hồi</h3>
                            <div className='tile-body row'>
                                <div className='col-md-12'>
                                    {
                                        this.renderPhanHoi(this.props.hcthCongVanDi?.item?.phanHoi)
                                    }
                                </div>
                                {addPhanHoi &&
                                    <>
                                        <FormRichTextBox type='text' className='col-md-12 mt-3' ref={e => this.phanHoi = e} label='Thêm phản hồi' />
                                        <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                            <button type='submit' className='btn btn-primary mr-2' onClick={this.onCreatePhanHoi}>
                                                Thêm
                                            </button>
                                            {((this.state.trangThai == '2' && hcthStaffPermission && hcthStaffPermission.login) ||
                                                (this.state.trangThai == '3' && presidentPermission && presidentPermission.login))
                                                && <button type='submit' className='btn btn-danger' onClick={this.onReturnCvDi}>
                                                    Trả lại
                                                </button>}
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    </div>}

                <div className="tile">
                    <div className="form-group">
                        <h3 className='tile-title'>Danh sách công văn đi</h3>
                        <div className='tile-body row'>
                            <div className={'form-group ' + (this.addFile() ? 'col-md-8' : 'col-md-12')}>
                                {this.tableListFile(this.state.listFile, this.state.id, permission, this.addFile())}
                            </div>
                            {this.addFile() && <FormFileBox className='col-md-4' ref={e => this.fileBox = e} label='Tải lên tập tin công văn' postUrl='/user/upload' uploadType='hcthCongVanDiFile' userData='hcthCongVanDiFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.onSuccess} />}
                        </div>
                    </div>
                </div>

                {!isNew &&
                    <div className="tile">
                        <h3 className="tile-title">Lịch sử</h3>
                        {this.renderHistory(this.props.hcthCongVanDi?.item?.history)}
                    </div>
                }

            </>),
            backRoute: window.location.pathname.startsWith('/user/hcth') ? '/user/hcth/cong-van-cac-phong' : '/user/cong-van-cac-phong',
            onSave: (this.state.trangThai == '' || this.state.trangThai == '1' || this.state.trangThai == '4') && ((unitManagePermission && unitManagePermission.manage) || (hcthStaffPermission && hcthStaffPermission.login)) ? this.save : null,
            buttons: !readTrangThai && (hcthStaffPermission.login || (unitManagePermission.manage && lengthDv != 0)) && !isNew && [{ className: 'btn-success', icon: 'fa-check', onClick: this.onSend }],
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
    createHistory,
    // getHistory
};
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);