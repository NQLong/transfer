import React from 'react';
import { AdminPage, AdminModal, FormCheckbox, FormRichTextBox, FormSelect, FormTextBox, renderComment, renderTable, TableCell, FormTabs, renderTimeline, FormFileBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';
import { Link } from 'react-router-dom';
import { SelectAdapter_FwCanBo, SelectAdapter_FwCanBoByDonVi } from 'modules/mdTccb/tccbCanBo/redux';
const { vaiTro, loaiLienKet, trangThaiNhiemVu} = require('../constant');
const vaiTroSelector = Object.keys(vaiTro).map(key => ({ id: key, text: vaiTro[key].text }));

export class RefreshStatusModal extends AdminModal {

    componentDidMount() {
        T.ready(() => this.onShown(() => this.phanHoi.focus()));
    }

    onShow = (item) => {
        this.setState({ item});
        this.phanHoi.value('');
    }

    onSubmit = (e) => {
        if (this.phanHoi.value() !== '') {
            const { shccCanBoNhan, tenCanBoNhan, hoCanBoNhan } = this.state.item;
            this.props.onSave({
                id: this.props.nhiemVuId,
                phanHoi: this.phanHoi.value(),
                shccCanBoNhan,
                tenCanBoNhan,
                hoCanBoNhan
            }, () => {
                this.modal.hide();
                this.phanHoi.value('');
            });
        } else {
            T.notify('Vui lòng nhập lý do !', 'danger');
            this.ten.focus();
        }
        // const changes = {
        //     ten: this.ten.value(),
        //     tenVietTat: this.tenVietTat.value(),
        //     kichHoat: this.kichHoat.value() ? 1 : 0,
        // };
        // if (changes.ten == '') {
        //     T.notify('Tên đơn vị công văn bị trống!', 'danger');
        //     this.ten.focus();
        // } else {
        //     this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        // }
        e.preventDefault();
    }

    render = () => {
        return this.renderModal({
            title: 'Nhập phản hồi',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.phanHoi = e} label='Nhập phản hồi'
                />
            </div>
        });
    }
}

export class CanBoNhan extends AdminPage {
    tinhTrangText = {
        READ: 'Đã đọc',
        COMPLETE: 'Đã hoàn thành',
    }

    tinhTrangColor = {
        READ: 'blue',
        COMPLETE: '#149414'
    }

    state = { ids: [], canBoNhan: [] };

    componentDidMount() {
        this.vaiTro?.value(vaiTro.PARTICIPANT.id);
    }

    getAdapter = () => {
        const
            currentPermissions = this.getCurrentPermissions();

        if (currentPermissions.some(item => ['hcth:manage', 'rectors:login'].includes(item)))
            return SelectAdapter_FwCanBo;
        else {
            const listDonVi = this.props.system?.user?.staff?.donViQuanLi || [];
            return SelectAdapter_FwCanBoByDonVi(listDonVi.map(item => item.maDonVi).toString() || this.props.system?.user?.staff.maDonVi);
        }
        // return SelectAdapter_FwCanBo;
    }

    canAdd = () => {
        const userPermission = this.getCurrentPermissions();

        if (this.props.trangThai !== trangThaiNhiemVu.DONG.id && (this.props.isCreator || userPermission.some(item => ['hcth:manage', 'rectors:login'].includes(item))))
            return true;

        const currentDonViNhan = this.props.hcthNhiemVu?.item?.donViNhan || [];
        const donViQuanLy = this.props.system?.user?.staff?.donViQuanLy || [];
        const isRelatedDepartmentManager = userPermission.includes('manager:write')
            && donViQuanLy.some(item => currentDonViNhan.some(item2 => item2.donViNhan == item.maDonVi));

        if (this.props.lienPhong && isRelatedDepartmentManager && this.props.trangThai !== trangThaiNhiemVu.DONG.id) return true;
        return false;
    }

    onDelete = (item) => {
        const deleteData = {
            id: item.id,
            nhiemVuId: this.props.target,
            shccCanBoNhan: item.shccCanBoNhan,
            shccNguoiTao: this.props.system?.user?.staff?.shcc,
            hoNguoiXoa: item.hoCanBoNhan,
            tenNguoiXoa: item.tenCanBoNhan
        };
        T.confirm('Xóa cán bộ tham gia', `Bạn có chắc bạn muốn xóa cán bộ ${(item.hoCanBoNhan + ' ' + item.tenCanBoNhan).trim().normalizedName()}?`, true,
            isConfirm => isConfirm && this.props.removeCanBoNhanNhiemVu(deleteData, () => {
                const currentCanBoNhan = this.props.hcthNhiemVu?.item?.canBoNhan || [];
                const currentId = currentCanBoNhan.map(item => item.id);
                this.props.getList({ ma: this.props.target, ids: currentId });
            })
        );
    }

    updatePermission = (e, item, vaiTroMoi) => {
        e.preventDefault();
        const updateData = {
            id: item.id,
            nhiemVuId: this.props.target,
            shccCanBoNhan: item.shccCanBoNhan,
            shccNguoiTao: this.props.system.user.staff.shcc,
            hoCanBo: item.hoCanBoNhan,
            tenCanBo: item.tenCanBoNhan,
            vaiTroMoi
        };
        T.confirm('Thay đổi quyền cán bộ', `Bạn có chắc bạn muốn thay đổi quyền cán bộ ${(item.hoCanBoNhan + ' ' + item.tenCanBoNhan).trim().normalizedName()} thành ${vaiTro[vaiTroMoi].text}?`, true,
            isConfirm => isConfirm && this.props.updateCanBoNhanNhiemVu(updateData, () => {
                const currentCanBoNhan = this.props.hcthNhiemVu?.item?.canBoNhan || [];
                const currentId = currentCanBoNhan.map(item => item.id);
                this.props.getList({ ma: this.props.target, ids: currentId });
            }));
    }

    refreshTrangThai = (e) => {
        // T.confirm('', `Bạn có chắc bạn muốn thay đổi quyền cán bộ ${(item.hoCanBoNhan + ' ' + item.tenCanBoNhan).trim().normalizedName()} thành ${vaiTro[vaiTroMoi].text}?`, true,
        //     isConfirm => isConfirm && this.props.updateCanBoNhanNhiemVu(updateData, () => {
        //         const currentCanBoNhan = this.props.hcthNhiemVu?.item?.canBoNhan || [];
        //         const currentId = currentCanBoNhan.map(item => item.id);
        //         this.props.getList({ ma: this.props.target, ids: currentId });
        //     }));
        this.showModal(e);
    }

    canBoNhanData = () => {
        let listCanBoNhan = this.props.target && this.props.hcthNhiemVu?.item?.canBoNhan ? this.props.hcthNhiemVu?.item?.canBoNhan : [];
        let listHistory = this.props.hcthNhiemVu?.item?.history || [];
        let listCanBoNhanWithStatus = listCanBoNhan.map(canBo => {
            let lastHistory = listHistory.find(history => history.shcc == canBo.shccCanBoNhan);
            return ({
                ...canBo,
                trangThai: lastHistory?.hanhDong || ''
            });
        });
        return listCanBoNhanWithStatus;
    }

    tableCanBoNhan = () => renderTable({
        getDataSource: this.canBoNhanData,
        stickyHead: false,
        emptyTable: 'Chưa có cán bộ tham gia!',
        loadingOverlay: false,
        loadingClassName: 'd-flex justify-content-center',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SHCC</th>
                <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Vai trò</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Người tạo</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Trạng thái</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),

        renderRow: (item, index) => {
            const isAdder = this.props.system?.user?.shcc == item.shccNguoiTao;
            const permissions = {
                delete: this.props.trangThai !== trangThaiNhiemVu.DONG.id && (this.props.isCreator || isAdder || this.props.isManager)
            };
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.shccCanBoNhan} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', fontWeight: 'bold', color: 'blue' }} content={(item.hoCanBoNhan + ' ' + item.tenCanBoNhan).trim().normalizedName()} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', color: vaiTro[item.vaiTro]?.color || 'blue' }} content={vaiTro[item.vaiTro]?.text} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(item.hoNguoiTao + ' ' + item.tenNguoiTao).trim().normalizedName()} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', color: this.tinhTrangColor[item.trangThai], fontWeight: 'bold' }} content={this.tinhTrangText[item.trangThai]} />
                    <TableCell type='buttons' permission={permissions} onDelete={() => this.onDelete(item)} >
                        {(this.props.isManager || this.props.isCreator) && <a className='btn btn-primary' title='Phản hồi' onClick={() => this.modal.show(item)}>
                            <i className='fa fa-lg fa-refresh' />
                        </a>}
                        {item.vaiTro == vaiTro.PARTICIPANT.id && this.props.trangThai !== trangThaiNhiemVu.DONG.id && (this.props.isManager || this.props.isCreator) && <a className='btn btn-info' title='Cấp quyền quản trị viên' onClick={(e) => this.updatePermission(e, item, vaiTro.MANAGER.id)}>
                            <i className='fa fa-lg fa-user-plus' />
                        </a>}
                        {item.vaiTro == vaiTro.MANAGER.id && this.props.trangThai !== trangThaiNhiemVu.DONG.id && (this.props.isManager || this.props.isCreator) && <a className='btn btn-warning' title='Xóa quyền quản trị viên' onClick={(e) => this.updatePermission(e, item, vaiTro.PARTICIPANT.id)}>
                            <i className='fa fa-lg fa-user-times' />
                        </a>}
                    </TableCell>
                </tr>
            );
        }
    });

    onSubmit = () => {
        const shccs = this.canBoNhan.value();
        const vaiTro = this.vaiTro.value();
        const currentCanBoNhan = this.props.hcthNhiemVu?.item?.canBoNhan || [];
        const currentId = currentCanBoNhan.map(item => item.id);
        const currentShcc = currentCanBoNhan.map(item => item.shccCanBoNhan);
        const leapShcc = shccs.find(item => currentShcc.includes(item));
        const nguoiTao = this.props.system?.user?.staff?.shcc;
        if (shccs.length == 0) {
            T.notify('Chưa chọn cán bộ', 'danger');
            this.canBoNhan.focus();
        } else if (!vaiTro) {
            T.notify('Chưa chọn vai trò cán bộ', 'danger');
            this.vaiTro.focus();
        }
        else if (leapShcc) {
            T.notify(`Cán bộ (${leapShcc}) đã có trong danh sách tham gia!`, 'danger');
        }
        else {
            this.props.create(this.props.target, nguoiTao, shccs, vaiTro, (items) => {
                this.canBoNhan.clear();
                this.props.getList({ ma: this.props.target, ids: [...currentId, ...items.map(item => item.id)] });
            });
        }
    }

    getRoleData = () => {
        return (this.props.isCreator || !this.props.target) ? vaiTroSelector : [{ id: vaiTro.PARTICIPANT.id, text: vaiTro.PARTICIPANT.text }];
    }


    render() {
        return (
            <div className='tile'>
                <div className='form-group'>
                    <h3 className='tile-title'>Cán bộ tham gia nhiệm vụ</h3>
                    <div className='tile-body row'>
                        {this.canAdd() && (<div className='col-md-12 row'>
                            <FormSelect className='col-md-6' multiple={true} ref={e => this.canBoNhan = e} data={this.getAdapter()} placeholder='Chọn cán bộ tham gia' />
                            <FormSelect className='col-md-3' ref={e => this.vaiTro = e} data={this.getRoleData()} placeholder='Vai trò cán bộ' />
                            <button type='button' className='btn btn-primary col-md-3 form-group' onClick={this.onSubmit}>
                                <i className='fa fa-plus'></i> Thêm nhân viên
                            </button>
                        </div>)
                        }
                        <div className='col-md-12' style={{ maxHeight: '50vh', overflowY: 'auto', paddingLeft: '10px' }}>
                            {this.tableCanBoNhan(this.props.isCreator)}
                        </div>
                    </div>
                </div>
                <RefreshStatusModal ref={e => this.modal = e} onSave={this.props.refreshCanBoNhanStatus} nhiemVuId={this.props.target}/>
            </div>
        );
    }
}

const getYearRange = (from, to) => {
    if (!to)
        to = from + 1;
    return [new Date(`${from}-01-01`).getTime(), new Date(`${to}-01-01`).getTime()];
};

export class PhanHoi extends React.Component {

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
                key: this.props.target,
                canBoGui: shcc,
                noiDung: value,
                loai: 'NHIEM_VU',
                ngayTao: new Date().getTime(),
            }, () => this.props.getPhanHoi(this.props.target, () => { this.phanHoi.value(''); }));
        }
    }


    render() {
        const phanHoi = this.props.hcthNhiemVu?.item?.phanHoi || [];
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
                            this.props.trangThai !== trangThaiNhiemVu.DONG.id ?
                                <>
                                    <FormRichTextBox type='text' className='col-md-12 mt-2' ref={e => this.phanHoi = e} placeholder='Thêm phản hồi' />
                                    <div className='col-md-12 d-flex justify-content-end'>
                                        <button type='submit' className='btn btn-primary' onClick={this.onCreatePhanHoi}>
                                            Gửi
                                        </button>
                                    </div>
                                </> : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

class CongVanDenSelector extends React.Component {
    itemRef = {}
    state = { ids: [] }

    changeSearch = (e) => {
        e?.preventDefault && e.preventDefault();
        const
            { pageNumber = 1, pageSize = 25 } = this.props.hcthNhiemVu?.cvdPage || {},
            searchTerm = this.search.value(),
            year = this.year.value(),
            [fromTime, toTime] = year && Number.isInteger(Number(year)) ? getYearRange(Number(year)) : [],
            currentLienKet = this.props.hcthNhiemVu?.item?.lienKet?.filter(item => item.loaiB == loaiLienKet.CONG_VAN_DEN.id) || [],
            filter = { fromTime, toTime, hasIds: 0, excludeIds: currentLienKet.map(item => item.keyB).toString() };

        if (this.tabs.selectedTabIndex() == 1) {
            filter.ids = this.state.ids.toString();
            filter.hasIds = 1;
        }
        this.setState({ filter }, () => this.getPage(pageNumber, pageSize, searchTerm, this.setItem));
    }

    setItem = () => {
        this.state.ids.forEach(id => this.itemRef[id]?.value(true));
    }

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getCongVanDenSelector(pageNumber, pageSize, pageCondition, this.state.filter, (data) => {
            this.setItem(); done(data);
        });
    }

    handleToggleItem = (item, value) => {
        if (value) {
            this.setState({ ids: [...this.state.ids, item.id] });
        }
        else {
            this.setState({ ids: this.state.ids.filter(id => id != item.id) });
        }
    }

    getSelected = () => this.state.ids


    resetSearch = (e) => {
        e.preventDefault();
        this.year.value('');
        this.search.value('');
        this.changeSearch();
    }

    render() {
        const { pageNumber = 1, pageSize = 25, pageTotal = 0, totalItem = 0, pageCondition = '', list = null } = this.props.hcthNhiemVu?.cvdPage || {};
        const table = renderTable({
            loadingOverlay: false,
            loadingClassName: 'd-flex justify-content-center',
            getDataSource: () => list,
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}></th>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số CV</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số đến</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Đơn vị gửi</th>
                <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Trích yếu</th>
            </tr>,
            renderRow: (item, index) => {
                return (<tr key={item.id}>
                    <TableCell style={{}} content={<FormCheckbox ref={e => this.itemRef[item.id] = e} onChange={(value) => this.handleToggleItem(item, value)} />} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<Link to={`/user/cong-van-den/${item.id}`} target='_blank' rel='noopener noreferrer' >{item.soCongVan || 'Chưa có số'}</Link>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soDen} />
                    <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: '100%' }} content={item.tenDonViGuiCV} />
                    <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: '100%' }} content={item.trichYeu} />
                </tr>);
            }
        });

        const TAB_ID = 'CongVanDenSelector';
        const tabs = [{ title: 'Danh sách' }, { title: 'Đã chọn' }];
        return (<div className='col-md-12' >
            <div className='form-group row' onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}>
                <FormTextBox type='text' label='Tìm kiếm' ref={e => this.search = e} className='col-md-8' />
                <FormTextBox type='year' label='Năm' ref={e => this.year = e} className='col-md-4' />
                <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type='submit' className='btn btn-danger' onClick={this.resetSearch}>
                        <i className='fa fa-lg fa-times-circle-o' />Hủy tìm kiếm
                    </button>
                    <button type='submit' className='btn btn-success' onClick={(e) => { e.preventDefault(); this.changeSearch(); }}>
                        <i className='fa fa-lg fa-search' />Tìm kiếm
                    </button>
                </div>
                <FormTabs className='col-md-12' style={tabs.length == 1 ? { display: 'none' } : {}} ref={e => this.tabs = e} tabs={tabs} id={TAB_ID} onChange={this.changeSearch} />
                <div className='col-md-12' style={{ maxHeight: '40vh', overflowY: 'scroll', padding: '10px 10px 10px 10px' }}>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '50px', position: 'static', marginTop: '10px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </div>
        </div>);
    }
}

class CongVanDiSelector extends React.Component {
    itemRef = {}
    state = { ids: [] }

    changeSearch = (e) => {
        e?.preventDefault && e.preventDefault();
        const
            { pageNumber = 1, pageSize = 25 } = this.props.hcthNhiemVu?.cvdPage || {},
            searchTerm = this.search.value(),
            year = this.year.value(),
            [fromTime, toTime] = year && Number.isInteger(Number(year)) ? getYearRange(Number(year)) : [],
            currentLienKet = this.props.hcthNhiemVu?.item?.lienKet?.filter(item => item.loaiB == loaiLienKet.CONG_VAN_DI.id) || [],
            filter = { fromTime, toTime, hasIds: 0, excludeIds: currentLienKet.map(item => item.keyB).toString() };
        if (this.tabs.selectedTabIndex() == 1) {
            filter.ids = this.state.ids.toString();
            filter.hasIds = 1;
        }
        this.setState({ filter }, () => this.getPage(pageNumber, pageSize, searchTerm, this.setItem));
    }

    setItem = () => {
        this.state.ids.forEach(id => this.itemRef[id]?.value(true));
    }

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getCongVanCacPhongSelector(pageNumber, pageSize, pageCondition, this.state.filter, (data) => {
            this.setItem(); done(data);
        });
    }

    handleToggleItem = (item, value) => {
        if (value) {
            this.setState({ ids: [...this.state.ids, item.id] });
        }
        else {
            this.setState({ ids: this.state.ids.filter(id => id != item.id) });
        }
    }

    getSelected = () => this.state.ids


    resetSearch = (e) => {
        e?.preventDefault && e.preventDefault();
        this.year.value('');
        this.search.value('');
        this.changeSearch();
    }

    render() {
        const { pageNumber = 1, pageSize = 25, pageTotal = 0, totalItem = 0, pageCondition = '', list = null } = this.props.hcthNhiemVu?.cvcpPage || {};
        const table = renderTable({
            loadingOverlay: false,
            loadingClassName: 'd-flex justify-content-center',
            getDataSource: () => list,
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}></th>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày gửi</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Đơn vị gửi</th>
                <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Trích yếu</th>
            </tr>,
            renderRow: (item, index) => {
                return (<tr key={item.id}>
                    <TableCell style={{}} content={<FormCheckbox ref={e => this.itemRef[item.id] = e} onChange={(value) => this.handleToggleItem(item, value)} />} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<Link to={`/user/cong-van-cac-phong/${item.id}`} target='_blank' rel='noopener noreferrer' >{item.soDi || 'Chưa có số'}</Link>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayGui, 'dd/mm/yyyy')} />

                    <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: '100%' }} content={item.tenDonViGui} />
                    <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: '100%' }} content={item.trichYeu} />
                </tr>);
            }
        });

        const TAB_ID = 'CongVanDiSelector';
        const tabs = [{ title: 'Danh sách' }, { title: 'Đã chọn' }];
        return (<div className='col-md-12' >
            <div className='form-group row' onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}>
                <FormTextBox label='Tìm kiếm' ref={e => this.search = e} className='col-md-8' />
                <FormTextBox label='Năm' ref={e => this.year = e} className='col-md-4' />
                <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type='submit' className='btn btn-danger' onClick={this.resetSearch}>
                        <i className='fa fa-lg fa-times-circle-o' />Hủy tìm kiếm
                    </button>
                    <button type='submit' className='btn btn-success' onClick={this.changeSearch}>
                        <i className='fa fa-lg fa-search' />Tìm kiếm
                    </button>
                </div>
                <FormTabs className='col-md-12' style={tabs.length == 1 ? { display: 'none' } : {}} ref={e => this.tabs = e} tabs={tabs} id={TAB_ID} onChange={this.changeSearch} />
                <div className='col-md-12' style={{ maxHeight: '40vh', overflowY: 'scroll', padding: '10px 10px 10px 10px' }}>
                    {table}
                </div>
                < Pagination style={{ marginLeft: '50px', position: 'static', marginTop: '10px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </div>
        </div>);
    }
}

export class LienKetModal extends AdminModal {
    congVanDenRef = {}

    state = {};

    onSubmit = (e) => {
        e && e.preventDefault();
        const data = {
            id: this.props.target,
            lienKet: this.lienKet?.getSelected() || [],
            loaiLienKet: this.loaiLienKet.value()
        };
        if (data.lienKet.length == 0) {
            T.notify('Chưa có liên kết', 'danger');
        }
        else {
            this.props.createLienKet(this.props.target, data, () => {
                this.hide(); this.loaiLienKet.value('');
            });
        }
    }


    render = () => {
        return this.renderModal({
            title: 'Tạo mới liên kết',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect className='col-md-4' ref={e => this.loaiLienKet = e} label='Loại liên kết' data={Object.keys(loaiLienKet).map(key => ({ id: loaiLienKet[key]?.id, text: loaiLienKet[key]?.text }))} onChange={(value) => this.setState({ loaiLienKet: value })} required />
                {
                    this.state.loaiLienKet?.id == loaiLienKet.CONG_VAN_DEN.id &&
                    <CongVanDenSelector {...this.props} ref={e => this.lienKet = e} />
                }
                {
                    this.state.loaiLienKet?.id == loaiLienKet.CONG_VAN_DI.id &&
                    <CongVanDiSelector {...this.props} ref={e => this.lienKet = e} />
                }
            </div>
        });
    }
}



export class LienKet extends React.Component {

    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa liên kết', 'Bạn có chắc bạn muốn xóa liên kết này?', true,
            isConfirm => isConfirm && this.props.deleteLienKet(item.id, () => {
                this.props.getLienKet(this.props.target);
            }));
    }

    renderCongVanDenRow = (item, index, canDelete) => {
        return (<tr key={index}>
            <TableCell style={{ textAlign: 'right' }} content={index + 1} />
            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                <Link to={`/user/cong-van-den/${item.keyB}?nhiemVu=${item.keyA}`} target='_blank' rel='noopener noreferrer'>
                    {(item.soCongVanDen || 'Chưa có') + (item.soDen ? `(${item.soDen})` : '')}
                </Link>
            }
            />
            <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue' }} content={loaiLienKet[item.loaiB].text} />
            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                <div>
                    Ngày: <span>{item.ngayCongVan ? T.dateToText(item.ngayCongVan, 'dd/mm/yyyy') : 'Không có'}</span><br />
                    Ngày nhận: <span>{item.ngayNhan ? T.dateToText(item.ngayNhan, 'dd/mm/yyyy') : 'Không có'}</span>
                </div>
            } />
            <TableCell type='text' style={{}} content={item.trichYeuDen} />
            <TableCell type='buttons' permission={{ delete: canDelete }} onDelete={(e) => this.onDelete(e, item)}>
                <Link className='btn btn-primary' role='button' to={`/user/cong-van-den/${item.keyB}?nhiemVu=${item.keyA}`} target='_blank' rel='noopener noreferrer'>
                    <i className='fa fa-eye'></i>
                </Link>
            </TableCell>
        </tr>);
    }

    renderCongVanDiRow = (item, index, canDelete) => {
        return (<tr key={index}>
            <TableCell style={{ textAlign: 'right' }} content={index + 1} />
            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                <Link to={`/user/cong-van-cac-phong/${item.keyB}?nhiemVu=${item.keyA}`} target='_blank' rel='noopener noreferrer'>
                    {item.soDi || 'Chưa có'}
                </Link>
            }
            />
            <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue' }} content={loaiLienKet[item.loaiB].text} />
            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayGui, 'dd/mm/yyyy')} />
            <TableCell type='text' style={{}} content={item.trichYeuDi} />
            <TableCell type='buttons' permission={{ delete: canDelete }} onDelete={(e) => this.onDelete(e, item)}>
                <Link className='btn btn-primary' role='button' to={`/user/cong-van-cac-phong/${item.keyB}?nhiemVu=${item.keyA}`} target='_blank' rel='noopener noreferrer'>
                    <i className='fa fa-eye'></i>
                </Link>
            </TableCell>

        </tr>);
    }


    tableLienKet = (data) => {
        const sitePermission = this.props.sitePermission;
        return renderTable({
            getDataSource: () => data,
            stickyHead: false,
            emptyTable: 'Chưa có liên kết nào!',
            loadingOverlay: false,
            loadingClassName: 'd-flex justify-content-center',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Trích yếu</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                if (item.loaiB == loaiLienKet.CONG_VAN_DEN.id)
                    return this.renderCongVanDenRow(item, index, sitePermission.delete);
                else if (item.loaiB == loaiLienKet.CONG_VAN_DI.id)
                    return this.renderCongVanDiRow(item, index, sitePermission.delete);
            }
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    render() {
        return (<div className='tile'>
            <h3 className='tile-title'>Liên kết</h3>
            <div className='tile-body row'>
                <div className='col-md-12' style={{ maxHeight: '50vh', overflowY: 'auto', marginBottom: '10px' }}>
                    {this.tableLienKet(this.props.hcthNhiemVu?.item?.lienKet)}
                </div>
            </div>
            {this.props.sitePermission?.editGeneral && <div className='d-flex justify-content-end'>
                <button type='submit' className='btn btn-primary' onClick={(e) => this.showModal(e)}>
                    Thêm
                </button>
            </div>}
            <LienKetModal {...this.props} ref={e => this.modal = e} permission={this.props.permission} create={this.props.createLienKet} update={this.props.updateLienKet} get={this.props.getLienKet} permissions={this.props.currentPermissions} target={this.props.target} />
        </div>);
    }
}

export class History extends React.Component {
    actionText = {
        CREATE: 'tạo',
        READ: 'đọc',
        UPDATE: 'cập nhật',
        COMPLETE: 'hoàn thành',
        CLOSE: 'đóng',
        REOPEN: 'mở lại'
    }

    canBoNhanAction = {
        ADD_EMPLOYEES: 'ADD_EMPLOYEES',
        REMOVE_EMPLOYEE: 'REMOVE_EMPLOYEE',
        CHANGE_ROLE: 'CHANGE_ROLE'
    }

    actionColor = {
        CREATE: '#149414',
        COMPLETE: '#149414',
        READ: 'blue',
        UPDATE: 'blue',
        ADD_EMPLOYEES: '#28a745',
        REMOVE_EMPLOYEE: 'red',
        CHANGE_ROLE: '#007bff',
        CLOSE: 'red',
        REOPEN: '#149414'
    }

    roleName = {
        MANAGER: {
            text: 'quản trị viên',
            color: '#c9a536'
        },
        PARTICIPANT: {
            text: 'người tham gia',
            color: '#17a2b8'
        }
    }

    render = () => {
        let historyData = this.props.data?.map(item => item.ghiChu ? ({ ...item, ghiChu: JSON.parse(item.ghiChu) }) : ({ ...item }));
        const loginShcc = this.props.system?.user?.staff?.shcc;
        const renderChangeCanBoNhanContent = (action, item) => {
            switch (action) {
                case 'ADD_EMPLOYEES':
                    return <span><b style={{ color: 'blue' }}>{item.shcc !== loginShcc ? (item.ho?.normalizedName() || '') + ' ' + (item.ten?.normalizedName() || '') : 'Bạn'}</b> đã <b style={{ color: this.roleName[item.ghiChu.role].color }}>thêm {item.ghiChu.quantity} {this.roleName[item.ghiChu.role].text}</b> vào nhiệm vụ này.</span>;
                case 'REMOVE_EMPLOYEE':
                    return <span><b style={{ color: 'blue' }}>{item.shcc !== loginShcc ? (item.ho?.normalizedName() || '') + ' ' + (item.ten?.normalizedName() || '') : 'Bạn'}</b> đã <b style={{ color: this.actionColor[item.hanhDong] }}>xoá {item.ghiChu.name}</b> ra khỏi nhiệm vụ.</span>;
                case 'CHANGE_ROLE':
                    return <span><b style={{ color: 'blue' }}>{item.shcc !== loginShcc ? (item.ho?.normalizedName() || '') + ' ' + (item.ten?.normalizedName() || '') : 'Bạn'}</b> đã <b style={{ color: this.actionColor[item.hanhDong] }}>thay đổi vai trò của {item.ghiChu.name}</b> thành <b style={{ color: this.roleName[item.ghiChu.role].color }}>{this.roleName[item.ghiChu.role].text}</b>.</span>;
                default:
                    return null;
            }
        };
        return (<div className='tile'>
            <h3 className='tile-title'>Lịch sử</h3>
            <div className='tile-body row'>
                <div className='col-md-12' style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    {renderTimeline({
                        getDataSource: () => historyData,
                        handleItem: (item) => ({
                            // className: item.hanhDong == action.RETURN ? 'danger' : '',
                            component: <>
                                <span className='time'>{T.dateToText(item.thoiGian, 'dd/mm/yyyy HH:MM')}</span>
                                {
                                    item.hanhDong !== this.canBoNhanAction.ADD_EMPLOYEES && item.hanhDong !== this.canBoNhanAction.REMOVE_EMPLOYEE && item.hanhDong !== this.canBoNhanAction.CHANGE_ROLE ?
                                        <p><b style={{ color: 'blue' }}>{item.shcc !== loginShcc ? (item.ho?.normalizedName() || '') + ' ' + (item.ten?.normalizedName() || '') : 'Bạn'}</b> đã <b style={{ color: this.actionColor[item.hanhDong] }}>{this.actionText[item.hanhDong]}</b> nhiệm vụ này.</p> :
                                        <p>{renderChangeCanBoNhanContent(item.hanhDong, item)}</p>
                                }
                            </>
                        })
                    })}
                </div>
            </div>
        </div>);
    }
}
export class ListFiles extends React.Component {
    listFileRefs = {};

    componentDidUpdate() {
        this.props.files.map((item) => this.listFileRefs[item.id]?.value(item.viTri || ''));
        this.fileBox?.setData('hcthNhiemVuFile:' + (this.props.id ? this.props.id : 'new'));
    }

    onSuccess = (response) => {
        if (response.error) T.notify(response.error, 'danger');
        else if (response.item) {
            let listFile = this.props.files.length ? [...this.props.files] : [];
            listFile.push(response.item);
            this.props.updateListFile(listFile);
        }
    }

    onViTriChange = (e, id, index) => {
        e.preventDefault();
        let listFile = [...this.props.files];
        listFile[index].viTri = this.listFileRefs[id].value() || '';
        setTimeout(() => this.props.updateListFile(listFile), 500);
    }

    onDeleteFile = (e, index, item) => {
        e.preventDefault();
        const { id: fileId, ten: file } = item;
        T.confirm('Tập tin đính kèm', 'Bạn có chắc muốn xóa tập tin đính kèm này, tập tin sau khi xóa sẽ không thể khôi phục lại được', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteFile(this.props.id ? this.props.id : null, fileId, file, () => {
                let listFile = [...this.props.files];
                listFile.splice(index, 1);
                this.props.updateListFile(listFile);
            }));
    }
    tableListFile = (data, id, sitePermission) => renderTable({
        getDataSource: () => data,
        stickyHead: false,
        emptyTable: 'Chưa có tập tin nào!',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Tên tập tin</th>
                <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ghi chú</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => {
            const
                timeStamp = item.thoiGian,
                originalName = item.ten,
                linkFile = `/api/hcth/nhiem-vu/download/${id || 'new'}/${originalName}`;
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ wordBreak: 'break-all' }} content={<>
                        <a href={linkFile} download>{originalName}</a>
                    </>
                    } />
                    <TableCell content={(
                        sitePermission.editGeneral ? <FormTextBox type='text' placeholder='Nhập ghi chú' style={{ marginBottom: 0 }} ref={e => this.listFileRefs[item.id] = e} onChange={e => this.onViTriChange(e, item.id, index)} /> : item.viTri
                    )} />
                    <TableCell style={{ textAlign: 'center' }} content={T.dateToText(timeStamp, 'dd/mm/yyyy HH:MM')} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={{ delete: sitePermission.delete }} onDelete={!sitePermission.delete ? null : e => this.onDeleteFile(e, index, item)}>
                        <a className='btn btn-info' href={linkFile} download title='Tải về'>
                            <i className='fa fa-lg fa-download' />
                        </a>
                    </TableCell>
                </tr>
            );
        }
    });
    render() {
        const { id, sitePermission } = this.props;

        return (
            <div className='tile'>
                <div className='form-group'>
                    <h3 className='tile-title'>Danh sách tập tin</h3>
                    <div className='tile-body row'>
                        <div className={'form-group ' + (!sitePermission.editGeneral ? 'col-md-12' : 'col-md-8')}>
                            {this.tableListFile(this.props.files, id, sitePermission)}
                        </div>
                        {sitePermission.editGeneral && <FormFileBox className='col-md-4' ref={e => this.fileBox = e} label='Tải lên tập tin nhiệm vụ' postUrl='/user/upload' uploadType='hcthNhiemVuFile' userData='hcthNhiemVuFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.onSuccess} />}
                    </div>
                </div>
            </div>
        );
    }
}