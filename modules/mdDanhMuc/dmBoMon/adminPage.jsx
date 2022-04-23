import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createDmBoMon, getDmBoMonPage, updateDmBoMon, deleteDmBoMon} from './redux';
import { getDmDonViAll} from 'modules/mdDanhMuc/dmDonVi/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormSelect} from 'view/component/AdminPage';

class EditModal extends AdminModal {
    DonViTable = [];

    componentDidMount() {
        this.props.getDataSelect(items => {
            if (items) {
                this.DonViTable = [];
                items.forEach(item => this.DonViTable.push({ 'id': item.ma, 'text': item.ten }));
            }
        });

    }

    onShow = (item) => {
        let { ma, ten, tenTiengAnh, maDv, qdThanhLap, qdXoaTen, kichHoat, ghiChu } = item ? item : { ma: '', ten: '', tenTiengAnh: '', maDv: '', qdThanhLap: '', qdXoaTen: '', kichHoat: false, ghiChu: '' };
        this.setState({ma, item});
        this.ten.value(ten ? ten : '');
        this.maDv.value(maDv);
        this.tenTiengAnh.value(tenTiengAnh ? tenTiengAnh : '');
        this.qdThanhLap.value(qdThanhLap ? qdThanhLap : '');
        this.qdXoaTen.value(qdXoaTen ? qdXoaTen : '');
        this.ghiChu.value(ghiChu ? ghiChu : '');
        this.kichHoat.value(kichHoat);
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            tenTiengAnh: this.tenTiengAnh.value(), 
            maDv: this.maDv.value(),
            qdThanhLap: this.qdThanhLap.value(),
            qdXoaTen: this.qdXoaTen.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
            ghiChu: this.ghiChu.value(),
        };
        if (changes.ten == '') {
            T.notify('Tên đơn vị thuộc khoa bị trống', 'danger');
            this.ten.focus();
        } else if (changes.maDv == '') {
            T.notify('Mã đơn vị bị trống!', 'danger');
            this.maDv.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
        e.preventDefault();
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật đơn vị thuộc khoa' : 'Tạo mới đơn vị thuộc khoa',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên đơn vị thuộc khoa (tiếng Việt)' readOnly={readOnly} required/>
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenTiengAnh = e} label='Tên đơn vị thuộc khoa (tiếng Anh)' readOnly={readOnly} />
                <FormSelect className='col-md-12' ref={e => this.maDv = e} data={this.DonViTable} label='Mã đơn vị' required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.qdThanhLap = e} label='Quyết định thành lập' readOnly={readOnly} />
                <FormTextBox type='text' className='col-12' ref={e => this.qdXoaTen = e} label='Quyết định xóa tên' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} 
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
            </div>
        });
    }
}

class DmBoMonPage extends AdminPage {
    state = { searching: false };
    donViMapper = {};

    componentDidMount() {
        this.props.getDmDonViAll(items => {
            if (items) {
                this.donViMapper = {};
                items.forEach(item => this.donViMapper[item.ma] = item.ten);
            }
        });
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmBoMonPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmBoMonPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin', 'Bạn có chắc bạn muốn xóa đơn vị thuộc khoa này?', true, isConfirm => isConfirm && this.props.deleteDmBoMon(item.ma));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmBoMon', ['read', 'write', 'delete']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmBoMon && this.props.dmBoMon.page ?
        this.props.dmBoMon.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có dữ liệu đơn vị thuộc khoa';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                        <th style={{ width: '60%' }}>Bộ môn</th>
                        <th style={{ width: '40%' }}>Đơn vị</th>
                        <th style={{ width: 'auto'}} nowrap='true'>QĐ thành lập</th>
                        <th style={{ width: 'auto'}} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center'}} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='link' content={<b> {item.ten ? item.ten : ''} <br /> {item.tenTiengAnh ? item.tenTiengAnh : ''} </b>} 
                            className={item.qdXoaTen ? 'text-danger' : 'text-primary'} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={this.donViMapper && this.donViMapper[item.maDv] ? this.donViMapper[item.maDv] : ''} />
                        <TableCell type='text' content={item.qdThanhLap ? item.qdThanhLap : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission} 
                            onChanged={() => this.props.updateDmBoMon(item.ma, { kichHoat: Number(!item.kichHoat) })} />
                        <TableCell type='buttons' content={item} permission={permission} 
                            onEdit={() => this.modal.show(item)} onDelete={this.delete}></TableCell>
                    </tr>)
            });
        }
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục đơn vị thuộc khoa',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục đơn vị thuộc khoa'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} 
                    getPage={this.props.getDmBoMonPage} />
                <EditModal ref={e => this.modal = e} permission={permission} getDataSelect = {this.props.getDmDonViAll}
                    create={this.props.createDmBoMon} update={this.props.updateDmBoMon} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/dm-bo-mon/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmBoMon: state.danhMuc.dmBoMon, dmDonVi: state.danhMuc.dmDonVi });
const mapActionsToProps = { getDmDonViAll, createDmBoMon, getDmBoMonPage, updateDmBoMon, deleteDmBoMon };
export default connect(mapStateToProps, mapActionsToProps)(DmBoMonPage);