import React from 'react';
import { connect } from 'react-redux';
import { createDmDonVi, getDmDonViPage, updateDmDonVi, deleteDmDonVi } from './redux';
import { getDmLoaiDonViAll, SelectAdapter_DmLoaiDonVi } from 'modules/mdDanhMuc/dmLoaiDonVi/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormImageBox, FormSelect, getValue } from 'view/component/AdminPage';
import { SelectAdapter_DmNgonNgu } from 'modules/mdDanhMuc/dmNgonNguTruyenThong/redux';

class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, tenTiengAnh, tenVietTat, qdThanhLap, qdXoaTen, maPl, ghiChu, kichHoat, duongDan, image, imageDisplay, imageDisplayTa, preShcc, homeLanguage } = item ? item : { ma: null, ten: '', tenTiengAnh: '', tenVietTat: '', qdThanhLap: '', qdXoaTen: '', maPl: '', ghiChu: '', kichHoat: true, duongDan: '', image: null, imageDisplay: null, imageDisplayTa: null, preShcc: null, homeLanguage: 'vi,en' };
        if (!homeLanguage) homeLanguage = 'vi,en';
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.loaiDonVi.value(maPl);
        this.tenTiengAnh.value(tenTiengAnh ? tenTiengAnh : '');
        this.tenVietTat.value(tenVietTat ? tenVietTat : '');
        this.qdThanhLap.value(qdThanhLap ? qdThanhLap : '');
        this.qdXoaTen.value(qdXoaTen ? qdXoaTen : '');
        this.ghiChu.value(ghiChu ? ghiChu : '');
        this.kichHoat.value(kichHoat);
        this.duongDan.value(duongDan ? duongDan : '');
        this.preShcc.value(preShcc || '');
        this.homeLanguage.value(homeLanguage.split(','));
        this.imageBox.setData('dmDonVi:' + (ma ? ma : 'new'), image ? image : '/img/avatar.png');
        this.imageBox1.setData('dmDonViImage:' + (ma ? ma : 'new'), imageDisplay ? imageDisplay : '/img/avatar.png');
        this.imageBox2.setData('dmDonViImageTA:' + (ma ? ma : 'new'), imageDisplayTa ? imageDisplayTa : '/img/avatar.png');
    }

    onSubmit = (e) => {
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            tenTiengAnh: this.tenTiengAnh.value(),
            qdThanhLap: this.qdThanhLap.value(),
            qdXoaTen: this.qdXoaTen.value(),
            maPl: this.loaiDonVi.value(),
            ghiChu: this.ghiChu.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
            duongDan: this.duongDan.value(),
            preShcc: this.preShcc.value(),
            homeLanguage: getValue(this.homeLanguage).join(',')
        };
        if (changes.ma == '') {
            T.notify('Mã đơn vị bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên đơn vị bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.preShcc && changes.preShcc.length != 3) {
            T.notify('Độ dài tiền tố mã thẻ cán bộ phải là 3!', 'danger');
            this.preShcc.value('');
            this.preShcc.focus();
        } else if (changes.preShcc == '') {
            T.notify('Tiền tố mã thẻ cán bộ không được trống!', 'danger');
            this.preShcc.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
        e.preventDefault();
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật đơn vị' : 'Tạo mới đơn vị',
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox type='number' className='col-md-6' ref={e => this.ma = e} label='Mã đơn vị' readOnly={this.state.ma ? true : readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.ten = e} label='Tên đơn vị' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-6' ref={e => this.tenTiengAnh = e} label='Tên tiếng Anh' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.tenVietTat = e} label='Tên viết tắt' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.qdThanhLap = e} label='Quyết định thành lập' readOnly={readOnly} />
                <FormSelect ref={e => this.loaiDonVi = e} className='col-md-6' data={SelectAdapter_DmLoaiDonVi} label='Loại đơn vị' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.qdXoaTen = e} label='Quyết định xóa tên' readOnly={readOnly} />
                <FormSelect className='col-md-12' ref={e => this.homeLanguage = e} label='Ngôn ngữ truyền thông' data={SelectAdapter_DmNgonNgu} readOnly={readOnly} multiple />
                <FormTextBox type='text' className='col-md-12' ref={e => this.duongDan = e} label='Đường dẫn' readOnly={readOnly} />
                <FormImageBox className='col-12' ref={e => this.imageBox = e}
                    postUrl='/user/upload' uploadType='DmDonViImage' label='Logo' />
                <FormImageBox className='col-md-6' ref={e => this.imageBox1 = e}
                    postUrl='/user/upload' uploadType='DmDonViImageDisplay' label='Hiện thị trang chủ' />
                <FormImageBox className='col-md-6' ref={e => this.imageBox2 = e}
                    postUrl='/user/upload' uploadType='DmDonViImageDisplayTA' label='Hiện thị trang Tiếng Anh' />
                <FormTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.preShcc = e} label='Tiền tố mã thẻ cán bộ (3 chữ số đầu)' readOnly={readOnly} required />
            </div>
        });
    }
}

class DmDonViPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmDonViPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmDonViPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmDonVi(item.ma, { ma: item.ma, kichHoat: item.kichHoat ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục đơn vị', 'Bạn có chắc bạn muốn xóa đơn vị này?', true, isConfirm =>
            isConfirm && this.props.deleteDmDonVi(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmDonVi', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmDonVi && this.props.dmDonVi.page ?
            this.props.dmDonVi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách đơn vị!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '50%' }}>Tên đơn vị</th>
                        <th style={{ width: '50%' }}>Tên tiếng Anh</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã PL</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={item.ma ? item.ma : ''} />
                        <TableCell type='link' content={item.ten ? item.ten : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='link' content={item.tenTiengAnh ? item.tenTiengAnh : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiDonVi ? item.tenLoaiDonVi.normalizedName() : ''} />
                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                            onChanged={() => this.changeActive(item)} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục đơn vị',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục đơn vị'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmDonViPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmDonVi} update={this.props.updateDmDonVi} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            // onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/don-vi/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmDonVi: state.danhMuc.dmDonVi });
const mapActionsToProps = { getDmDonViPage, createDmDonVi, updateDmDonVi, deleteDmDonVi, getDmLoaiDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(DmDonViPage);