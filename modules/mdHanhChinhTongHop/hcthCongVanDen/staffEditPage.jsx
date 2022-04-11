import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormDatePicker, renderTable, FormTextBox, FormSelect, TableCell, FormRichTextBox, FormFileBox, FormCheckbox, renderComment, renderTimeline } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { createHcthCongVanDen, updateHcthCongVanDen, deleteFile, getCongVanDen, createChiDao, createPhanHoi, updateStatus, getPhanHoi, getHistory } from './redux';
import { SelectAdapter_DmDonViGuiCongVan } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo, getStaffPage } from 'modules/mdTccb/tccbCanBo/redux';
import { EditModal } from 'modules/mdDanhMuc/dmDonViGuiCv/adminPage';
import { createDmDonViGuiCv } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { SelectAdapter_DmChucVuV2 } from 'modules/mdDanhMuc/dmChucVu/redux';

const { action } = require('./constant.js');

const MA_CHUC_VU_HIEU_TRUONG = '001';


export const trangThaiSwitcher = {
    MOI: { id: 0, text: 'Mới' },
    CHO_DUYET: { id: 1, text: 'Chờ duyệt' },
    TRA_LAI_BGH: { id: 2, text: 'Trả lại' },
    CHO_PHAN_PHOI: { id: 3, text: 'Chờ phân phối' },
    TRA_LAI_HCTH: { id: 4, text: 'Trả lại (HCTH)' },
    DA_PHAN_PHOI: { id: 5, text: 'Đã phân phối' },
};

export const getTrangThaiText = (value) => {
    for (const key in trangThaiSwitcher)
        if (trangThaiSwitcher[key].id === value)
            return trangThaiSwitcher[key].text;
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
        case action.PUBLISH:
            return 'phân phối';
        case action.UPDATE_STATUS:
            return 'cập nhật trạng thái';
        default:
            return '';
    }
};

const actionColor = (value) => {
    switch (value) {
        case action.CREATE:
        case action.PUBLISH:
            return '#00a65a';
        case action.RETURN:
            return 'red';
        default:
            return 'blue';
    }
};

class PhanHoi extends React.Component {

    renderPhanHoi = (phanHoi) => {
        return renderComment({
            getDataSource: () => phanHoi,
            emptyComment: 'Chưa có phản hồi!',
            renderAvatar: (item) => <img src={item.image || '/img/avatar.png'} style={{ width: '48px', height: '48px', paddingTop: '5px', borderRadius: '50%' }} />,
            renderName: (item) => <>{item.chucVu ? item.chucVu + ' -' : ''} <span style={{ color: 'blue' }}>{item.ho?.normalizedName()} {item.ten?.normalizedName()}</span></>,
            renderTime: (item) => T.dateToText(item.ngayTao, 'dd/mm/yyyy HH:MM'),
            renderContent: (item) => item.noiDung
        });
    }

    canPhanHoi = () => true;

    onCreatePhanHoi = (e) => {
        e.preventDefault();
        const shcc = this.props?.system?.user?.shcc;
        const value = this.phanHoi.value();
        if (value) {
            this.props.createPhanHoi({
                key: this.props.congVan,
                canBoGui: shcc,
                noiDung: value,
                ngayTao: new Date().getTime(),
            }, () => this.props.getPhanHoi(this.props.congVan, () => this.phanHoi.value('')));
        }
    }


    render() {
        const phanHoi = this.props.hcthCongVanDen?.item?.phanHoi || [];
        return (
            <div className='tile'>
                <div className='form-group'>
                    <h3 className='tile-title' style={{ flex: 1 }}>Phản hồi</h3>
                    <div className='tile-body row'>
                        <div className='col-md-12'>
                            {
                                this.renderPhanHoi(phanHoi)
                            }
                        </div>
                        {
                            this.props.canPhanHoi && (<>
                                <FormRichTextBox type='text' className='col-md-12' ref={e => this.phanHoi = e} label='Thêm phản hồi' />
                                <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type='submit' className='btn btn-primary' onClick={this.onCreatePhanHoi}>
                                        Gửi
                                    </button>
                                </div>
                            </>)
                        }
                    </div>
                </div>
            </div>
        );
    }
}

class StaffEditPage extends AdminPage {
    listFileRefs = {};

    quyenChiDaoRef = {};

    state = {
        id: null,
        listFile: [],
        newChiDao: [],
        chiDao: [],
        phanHoi: [],
        user: {},
        shcc: null,
        chucVu: null,
        changed: false
    }


    componentDidMount() {
        T.ready('/user/hcth', () => {
            const params = T.routeMatcher('/user/hcth/cong-van-den/:id').parse(window.location.pathname),
                user = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '', staff: {}, lastName: '', firstName: '' },
                { shcc, staff, image } = user;
            this.setState({
                id: params.id === 'new' ? null : params.id,
                shcc,
                image,
                chucVu: null,
                user
            }, () => this.getData());
            // fetch chuc vu
            if (staff && staff.listChucVu?.length > 0)
                SelectAdapter_DmChucVuV2.fetchOne(staff.listChucVu[0].maChucVu, (item) => this.setState({ chucVu: item.text }));
            //fetch list banGiamHieu to render quyen chi dao
            this.props.getStaffPage(1, 100, '', { listDonVi: '68' }, (page) => {
                this.setState({ banGiamHieu: page.list }, () => this.setQuyenChiDao());
            });
        });
    }

    renderHistory = (history) => renderTimeline({
        getDataSource: () => history,
        handleItem: (item) => ({
            className: item.hanhDong == action.RETURN ? 'danger' : '',
            component: <>
                <span className='time'>{T.dateToText(item.thoiGian, 'dd/mm/yyyy HH:MM')}</span>
                <p><b style={{ color: 'blue' }}>{(item.ho?.normalizedName() || '') + ' '} {item.ten?.normalizedName() || ''}</b> đã <b style={{ color: actionColor(item.hanhDong) }}>{actionToText(item.hanhDong)}</b> công văn này.</p>
            </>
        })
    })

    canChiDao = () => true;

    renderChiDao = (readOnly) => {
        const canChiDao = this.canChiDao();
        return (<div className='tile-body row'>
            <div className='col-md-12'>
                {
                    renderComment({
                        getDataSource: () => this.state.chiDao,
                        emptyComment: 'Chưa có chỉ đạo',
                        renderAvatar: (item) => <img src={item.image || '/img/avatar.png'} style={{ width: '48px', height: '48px', paddingTop: '5px', borderRadius: '50%' }} />,
                        renderName: (item) => <>{item.chucVu ? item.chucVu + ' -' : ''} <span style={{ color: 'blue' }}>{item.ho?.normalizedName()} {item.ten?.normalizedName()}</span></>,
                        renderTime: (item) => T.dateToText(item.thoiGian, 'dd/mm/yyyy HH:MM'),
                        renderContent: (item) => item.chiDao
                    })
                }
            </div>
            {
                canChiDao && (<>
                    <FormRichTextBox type='text' className='col-md-12' ref={e => this.chiDao = e} label='Thêm chỉ đạo' readOnly={readOnly && !canChiDao} />
                    <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type='submit' className='btn btn-primary' onClick={this.onCreateChiDao}>
                            Gửi
                        </button>
                    </div>
                </>)
            }
        </div>);
    }

    renderQuyenChiDao = (list, permission) => {
        return (this.state.banGiamHieu && this.state.banGiamHieu.length > 0 && this.state.banGiamHieu.sort(this.sortByChucVuChinh).map((item, index) => {
            if (item.maChucVuChinh == MA_CHUC_VU_HIEU_TRUONG || (!permission.write && list.includes(item.shcc))) {
                return <span key={index} className='col-md-3 form-group'><b>{item.chucVuChinh}</b> - <b style={{ color: 'blue' }}>{item.ho?.normalizedName()} {item.ten?.normalizedName()}</b></span>;
            }
            else if (permission.write)
                return <FormCheckbox
                    key={index} isSwitch ref={e => this.quyenChiDaoRef[item.shcc] = e} onChange={(value) => this.changeQuyenChiDao(item.shcc, value)} label={
                        list.includes(item.shcc) ?
                            <><b>{item.chucVuChinh}</b> - <b style={{ color: 'blue' }}>{item.ho?.normalizedName()} {item.ten?.normalizedName()}</b></> :
                            `${item.chucVuChinh} - ${item.ho ? item.ho.normalizedName() + ' ' : ''}${item.ten?.normalizedName()}`} className='col-md-3 form-group' />;
            else return null;
        }));
    }


    setQuyenChiDao = () => {
        const { banGiamHieu } = this.state;
        if (banGiamHieu && banGiamHieu.length > 0) {
            banGiamHieu.map((item) => {
                this.quyenChiDaoRef[item.shcc]?.value(item.maChucVuChinh == MA_CHUC_VU_HIEU_TRUONG || this.state.quyenChiDao?.includes(item.shcc));
            });
        }
    }

    getData = () => {
        if (this.state.id) {
            this.props.getCongVanDen(Number(this.state.id), (item) => this.setData(item));
        }
        else this.setData();
    }

    setChange = () => this.setState({ changed: true })

    setData = (data = null) => {
        let { ngayCongVan, ngayNhan, ngayHetHan, soCongVan, donViGui, donViNhan, canBoNhan, trichYeu, listFile = [], quyenChiDao, danhSachChiDao = [], trangThai = 0, history = [] } = data ? data :
            { ngayCongVan: '', ngayNhan: '', ngayHetHan: '', soCongVan: '', donViGui: '', donViNhan: '', canBoNhan: '', trichYeu: '', quyenChiDao: '' };
        if (donViNhan) {
            donViNhan = donViNhan.split(',');
        }
        if (canBoNhan) {
            canBoNhan = canBoNhan.split(',');
        }
        if (quyenChiDao) {
            quyenChiDao = quyenChiDao.split(',');
        }
        this.ngayCongVan.value(ngayCongVan || '');
        this.ngayNhan.value(ngayNhan || '');
        this.ngayHetHan.value(ngayHetHan || '');
        this.soCongVan.value(soCongVan ? soCongVan : '');
        this.donViGui.value(donViGui || '');
        this.donViNhan.value(donViNhan ? donViNhan : '');
        this.canBoNhan.value(canBoNhan ? canBoNhan : '');
        this.trichYeu.value(trichYeu || '');
        this.chiDao?.value('');
        this.setState({ listFile, chiDao: danhSachChiDao, quyenChiDao: quyenChiDao || [], trangThai, history }, () => {
            listFile.map((item, index) => this.listFileRefs[index]?.value(item.viTri));
            this.setQuyenChiDao();
        });
        this.fileBox?.setData('hcthCongVanDenFile:' + (this.state.id ? this.state.id : 'new'));
    }


    changeQuyenChiDao = (shcc, value) => {
        const quyenChiDao = [...(this.state.quyenChiDao || [])];
        if (value) {
            quyenChiDao.push(shcc);
            this.setState({ quyenChiDao, changed: true });
        } else {
            this.setState({ quyenChiDao: quyenChiDao.filter((item) => item !== shcc), changed: true });
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
            this.state.id && this.props.updateHcthCongVanDen(this.state.id, { linkCongVan });
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
            }));
    }

    onViTriChange = (e, index) => {
        e.preventDefault();
        let listFile = [...this.state.listFile];
        listFile[index].viTri = this.listFileRefs[index].value() || '';
        this.setState({ listFile, changed: true });
    }

    tableListFile = (data, id, permission) => renderTable({
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
                linkFile = `/api/hcth/cong-van-den/download/${id || 'new'}/${originalName}`;
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ wordBreak: 'break-all' }} content={<>
                        <a href={linkFile} download>{originalName}</a>
                    </>
                    } />
                    <TableCell content={(
                        permission.write ? <FormTextBox type='text' placeholder='Nhập vị trí' style={{ marginBottom: 0 }} ref={e => this.listFileRefs[index] = e} onChange={e => this.onViTriChange(e, index)} /> : item.viTri
                    )} />
                    <TableCell style={{ textAlign: 'center' }} content={T.dateToText(timeStamp, 'dd/mm/yyyy HH:MM')} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onDelete={e => this.deleteFile(e, index, item)}>
                        <a className='btn btn-info' href={linkFile} download title='Tải về'>
                            <i className='fa fa-lg fa-download' />
                        </a>
                    </TableCell>
                </tr>
            );
        }
    });

    save = () => {
        const changes = {
            ngayCongVan: Number(this.ngayCongVan.value()),
            ngayNhan: Number(this.ngayNhan.value()),
            ngayHetHan: Number(this.ngayHetHan.value()),
            soCongVan: this.soCongVan.value(),
            donViGui: this.donViGui.value(),
            donViNhan: this.donViNhan.value().toString() || null,
            canBoNhan: this.canBoNhan.value().toString() || null,
            quyenChiDao: this.state.quyenChiDao.toString() || null,
            trichYeu: this.trichYeu.value(),
            chiDao: this.state.newChiDao,
            fileList: this.state.listFile || [],
            trangThai: this.state.trangThai,
        };
        if (!changes.ngayCongVan) {
            T.notify('Ngày công văn bị trống', 'danger');
            this.ngayCongVan.focus();
        } else if (!changes.ngayNhan) {
            T.notify('Ngày nhận công văn bị trống', 'danger');
            this.ngayNhan.focus();
        } else if (!changes.donViGui || (Array.isArray(changes.donViGui) && changes.donViGui.length === 0)) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.maDonViGuiCV.focus();
        } else if (!changes.trichYeu) {
            T.notify('Trích yếu công văn bị trống', 'danger');
            this.trichYeu.focus();
        } else if (changes.ngayNhan < changes.ngayCongVan) {
            T.notify('Ngày nhận công văn trước ngày công văn', 'danger');
            this.ngayNhan.focus();
        } else if (changes.ngayHetHan && changes.ngayHetHan < changes.ngayCongVan) {
            T.notify('Ngày công văn hết hạn trước ngày công văn', 'danger');
            this.ngayNhan.focus();
        }
        else {
            // this.setState({ changed: false });
            if (this.state.id) {
                this.props.updateHcthCongVanDen(this.state.id, changes, this.getData);
            } else {
                this.props.createHcthCongVanDen(changes, () => this.props.history.push('/user/hcth/cong-van-den'));
            }
        }
    }

    onCreateDonviGui = (data, done) => {
        this.props.createDmDonViGuiCv(data, ({ error, item }) => {
            if (!error) {
                const { id } = item;
                this.donViGui?.value(id);
                done && done({ error, item });
            }
            this.modal.hide();
        });
    }

    onCreateChiDao = (e) => {
        e.preventDefault();
        if (this.chiDao.value()) {
            const { shcc } = this.state;
            const newChiDao = {
                canBo: shcc,
                chiDao: this.chiDao.value(),
                thoiGian: new Date().getTime(),
                congVan: this.state.id,
            };
            if (this.state.id) {
                this.props.createChiDao(newChiDao, () => this.getData());
            }
            else
                this.setState({
                    'newChiDao': [...this.state.newChiDao, newChiDao],
                    chiDao: [...this.state.chiDao, {
                        ...newChiDao,
                        chucVu: this.state.chucVu,
                        ho: this.state.user.lastName,
                        ten: this.state.user.firstName,
                        image: this.state.image,
                    }]
                }, () => this.chiDao?.value(''));
        }
    }

    unSaveMessage = 'Các thay đổi của bạn chưa được lưu. '

    onFinish = (e) => {
        e.preventDefault();
        const newState = [trangThaiSwitcher.MOI.id, trangThaiSwitcher.TRA_LAI_BGH.id].includes(this.state.trangThai) ? trangThaiSwitcher.CHO_DUYET.id : trangThaiSwitcher.CHO_PHAN_PHOI.id;
        T.confirm('Hoàn thiện công văn', 'Bạn có chắc bạn đã hoàn thiện công văn này công văn này?', true,
            isConfirm => isConfirm && this.onChangeStatus(newState));

    }


    onReturn = (e, status) => {
        e.preventDefault();
        T.confirm('Trả lại công văn', 'Bạn có chắc bạn muốn trả lại công văn này?', true,
            isConfirm => isConfirm && this.onChangeStatus(status));
    }

    onAprrove = (e) => {
        e.preventDefault();
        T.confirm('Duyệt công văn', 'Bạn có chắc bạn muốn duyệt công văn này?', true,
            isConfirm => isConfirm && this.onChangeStatus(trangThaiSwitcher.CHO_PHAN_PHOI.id));
    }

    onPublish = (e) => {
        e.preventDefault();
        T.confirm('Phân phối công văn', 'Bạn có chắc bạn muốn phân phối công văn này?', true,
            isConfirm => isConfirm && this.onChangeStatus(trangThaiSwitcher.DA_PHAN_PHOI.id));
    }

    onChangeStatus = (status) => {
        this.props.updateStatus({ id: this.state.id, trangThai: status }, () => this.setState({ trangThai: status }, () => this.props.getHistory(this.state.id)));
    }

    sortByChucVuChinh = (a, b) => a.maChucVuChinh == MA_CHUC_VU_HIEU_TRUONG ? -1 : b.maChucVuChinh == MA_CHUC_VU_HIEU_TRUONG ? 1 : 0;

    getItem = () => this.props.hcthCongVanDen && this.props.hcthCongVanDen.item ? this.props.hcthCongVanDen.item : {};

    getUserDonViQuanLy = () => this.props.system?.user?.staff?.donViQuanLy || [];

    isRelated = () => {
        const currentPermission = this.getCurrentPermissions();
        let { maDonViNhan, maCanBoNhan } = this.getItem();
        maDonViNhan = maDonViNhan?.split(',') || [];
        maCanBoNhan = maCanBoNhan?.split(',') || [];
        return currentPermission.includes('rectors:login') || currentPermission.includes('hcth:login') || this.getUserDonViQuanLy().find(item => maDonViNhan.includes(item.maDonVi)) || maCanBoNhan.includes(this.state.shcc);
    }

    onCreatePhanHoi = (e) => {
        e.preventDefault();
        const value = this.phanHoi.value();
        if (value) {
            this.props.createPhanHoi({
                key: this.state.id,
                canBoGui: this.state.shcc,
                noiDung: value,
                ngayTao: new Date().getTime(),
            }, () => this.getData());
        }
    }

    canPublish = () => {
        return this.state.id && this.getUserPermission('hcth', ['manage']).manage && this.state.trangThai == trangThaiSwitcher.CHO_PHAN_PHOI.id;
    }

    canApprove = () => {
        const quyenChiDao = this.props.hcthCongVanDen?.item?.quyenChiDao || '';
        return this.state.id && (this.getUserPermission('president', ['login']).login || quyenChiDao.split(',').includes(this.state.shcc)) && this.state.trangThai == trangThaiSwitcher.CHO_DUYET.id;
    }

    render() {
        const permission = this.getUserPermission('hcthCongVanDen', ['read', 'write', 'delete']),
            dmDonViGuiCvPermission = this.getUserPermission('dmDonViGuiCv', ['read', 'write', 'delete']),
            readOnly = !permission.write,
            isNew = !this.state.id,
            presidentPermission = this.getUserPermission('president', ['login']),
            hcthStaffPermission = this.getUserPermission('hcth', ['login', 'manage']),
            criticalStatus = [trangThaiSwitcher.TRA_LAI_BGH.id, trangThaiSwitcher.TRA_LAI_HCTH.id]
            ;

        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Công văn đến',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                <Link key={1} to='/user/hcth/cong-van-den'>Danh sách Công văn đến</Link>,
                isNew ? 'Tạo mới' : 'Cập nhật'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>{!this.state.id ? 'Tạo mới công văn đến' : 'Cập nhật công văn đến'}</h3>
                    <div className='tile-body row'>
                        <FormTextBox onChange={this.setChange} type='text' className='col-md-2' ref={e => this.soDen = e} label='Số đến' readOnlyEmptyText='Chưa có' readOnly={readOnly} />
                        <FormTextBox onChange={this.setChange} type='text' className='col-md-2' ref={e => this.soCongVan = e} label='Mã số CV' readOnlyEmptyText='Chưa có' readOnly={readOnly} />
                        <FormSelect onChange={this.setChange} className='col-md-8' ref={e => this.donViGui = e} label={(<>
                            Đơn vị gửi công văn
                            {!readOnly && <>
                                (
                                <Link to='#' onClick={() => this.modal.show(null)}>Nhấn vào đây để thêm</Link>
                                )
                            </>
                            }
                        </>)} data={SelectAdapter_DmDonViGuiCongVan} placeholder='Đơn vị gửi công văn' readOnly={readOnly} required />
                        <FormDatePicker onChange={this.setChange} type='date-mask' className='col-md-4' ref={e => this.ngayCongVan = e} label='Ngày CV' readOnlyEmptyText='Chưa có ngày công văn' readOnly={readOnly} required />
                        <FormDatePicker onChange={this.setChange} type='date-mask' className='col-md-4' ref={e => this.ngayNhan = e} label='Ngày nhận' readOnlyEmptyText='Chưa có ngày nhận' readOnly={readOnly} required />
                        <FormDatePicker onChange={this.setChange} type='date-mask' className='col-md-4' ref={e => this.ngayHetHan = e} readOnlyEmptyText='Chưa có ngày hết hạn' label='Ngày hết hạn' readOnly={readOnly} />
                        <FormRichTextBox onChange={this.setChange} type='text' className='col-md-12' ref={e => this.trichYeu = e} label='Trích yếu' readOnly={readOnly} required />
                        {this.state.id && <span className='form-group col-md-12'>Tình trạng: <b style={{ color: criticalStatus.includes(this.state.trangThai) ? 'red' : 'blue' }}>{getTrangThaiText(this.state.trangThai)}</b></span>}
                        <FormSelect onChange={this.setChange} multiple={true} className='col-md-12' ref={e => this.donViNhan = e} label='Đơn vị nhận công văn' data={SelectAdapter_DmDonVi} readOnly={readOnly} readOnlyEmptyText='Chưa có đơn vị nhận' />
                        <FormSelect onChange={this.setChange} multiple={true} className='col-md-12' ref={e => this.canBoNhan = e} label='Cán bộ nhận công văn' data={SelectAdapter_FwCanBo} readOnly={readOnly} />
                        <span className='col-md-12 form-group'>Cán bộ chỉ đạo :</span>
                        {
                            this.renderQuyenChiDao(this.state.quyenChiDao || [], { write: hcthStaffPermission.login || presidentPermission.login })
                        }

                        <div className='col-md-12'
                            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}
                        >
                            {
                                this.state.id && hcthStaffPermission.login && [trangThaiSwitcher.MOI.id, trangThaiSwitcher.TRA_LAI_BGH.id, trangThaiSwitcher.TRA_LAI_HCTH.id].includes(this.state.trangThai) && (<>
                                    <button type='submit' className='btn btn-primary' onClick={this.onFinish}>
                                        Hoàn thiện
                                    </button>
                                </>)
                            }
                            {
                                this.state.id && (!readOnly || presidentPermission.login) && !hcthStaffPermission.login && (<>
                                    <button type='submit' className='btn btn-primary' onClick={this.save}>
                                        Lưu
                                    </button>
                                </>)
                            }
                        </div>

                    </div>
                </div>
                <div className='tile'>
                    <div className='form-group'>
                        <div className='form-group' style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                            <h3 className='tile-title' style={{ flex: 1 }}>Chỉ đạo</h3>
                            {
                                this.canPublish() && <>
                                    <button type='submit' className='btn btn-success' onClick={this.onPublish}>
                                        Duyệt
                                    </button>
                                    <button type='submit' className='btn btn-danger' onClick={(e) => this.onReturn(e, trangThaiSwitcher.TRA_LAI_HCTH.id)}>
                                        Trả lại
                                    </button>
                                </>
                            }
                            {this.canApprove() && <>
                                <button type='submit' className='btn btn-success' onClick={this.onAprrove}>
                                    Duyệt
                                </button>
                                <button type='submit' className='btn btn-danger' onClick={(e) => this.onReturn(e, trangThaiSwitcher.TRA_LAI_BGH.id)}>
                                    Trả lại
                                </button>
                            </>
                            }
                        </div>
                        {this.renderChiDao(readOnly)}
                    </div>
                </div>
                {this.state.id && <PhanHoi {...this.props} canPhanHoi={this.isRelated()} congVan={this.state.id} />}
                <div className='tile'>
                    <div className='form-group'>
                        <h3 className='tile-title'>Danh sách công văn</h3>
                        <div className='tile-body row'>
                            <div className={'form-group ' + (readOnly ? 'col-md-12' : 'col-md-8')}>
                                {this.tableListFile(this.state.listFile, this.state.id, permission)}
                            </div>
                            {!readOnly && <FormFileBox className='col-md-4' ref={e => this.fileBox = e} label='Tải lên tập tin công văn' postUrl='/user/upload' uploadType='hcthCongVanDenFile' userData='hcthCongVanDenFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.onSuccess} />}
                        </div>
                    </div>
                </div>
                {this.state.id && (<div className='tile'>
                    <h3 className='tile-title'> Lịch sử</h3>
                    {this.renderHistory(this.props.hcthCongVanDen?.item?.history)}
                </div>)}
                <EditModal ref={e => this.modal = e}
                    permissions={dmDonViGuiCvPermission}
                    create={this.onCreateDonviGui}
                />
            </>,
            backRoute: '/user/hcth/cong-van-den',
            onSave: (permission && permission.write) && (!this.state.id || hcthStaffPermission.login) ? this.save : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongVanDen: state.hcth.hcthCongVanDen });
const mapActionsToProps = {
    createHcthCongVanDen,
    updateHcthCongVanDen,
    getCongVanDen,
    deleteFile,
    createDmDonViGuiCv,
    getStaffPage,
    createChiDao,
    createPhanHoi,
    updateStatus,
    getPhanHoi,
    getHistory,
};
export default connect(mapStateToProps, mapActionsToProps)(StaffEditPage);