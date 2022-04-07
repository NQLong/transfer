import React from 'react';
import { connect } from 'react-redux';
import { getDmNgayLePage, createDmNgayLe, updateDmNgayLe, deleteDmNgayLe } from './redux';
import { Link } from 'react-router-dom';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { AdminPage, AdminModal, renderTable, TableCell, FormCheckbox, FormRichTextBox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    state = { active: true, id: '' };

    componentDidMount() {
    }

    onShow = (item) => {
        let { id, ngay, moTa, kichHoat } = item ? item : { id: 0, ngay: '', moTa: '', kichHoat: 1 };

        this.ngay.value(ngay);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat);
        this.setState({ active: kichHoat == 1, id: id });

    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ngay: this.ngay.value(),
                moTa: this.moTa.value(),
                kichHoat: this.state.active ? '1' : '0',
            };
        if (changes.ngay == '') {
            T.notify('Ngày lễ bị trống!', 'danger');
            this.ngay.focus();
        } else if (changes.moTa == '') {
            T.notify('Mô tả bị trống!', 'danger');
            this.moTa.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật ngày lễ' : 'Tạo mới ngày lễ',
            size: 'medium',
            body: <div className='row'>
                <FormDatePicker type='text' className='col-8' ref={e => this.ngay = e} label='Ngày' readOnly={this.state.ma ? true : readOnly} placeholder='Ngày' required />
                <FormRichTextBox rows='3' className='col-12' ref={e => this.moTa = e} label='Mô tả' readOnly={readOnly} placeholder='Mô tả' required/>
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmNgayLePage extends AdminPage {
    DayStrs = ['Chủ Nhật','Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy']
    componentDidMount() {
    
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmNgayLePage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmNgayLePage();
        });
    }

    getDay = (value) => {
        const d = new Date(value);
        // const day = d.getDay() === 0 ? 'Chủ Nhật' : `${d.getDay() + 1}`;
        return this.DayStrs[d.getDay()];
    }


    getFullDate = (value) =>{
        const d = new Date(value);
        const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
        const month = d.getMonth() + 1 < 10 ? `0${d.getMonth()+1}` : d.getMonth() + 1;
        const year = d.getFullYear();
        return `${date}/${month}/${year}`;
    }
 
    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa ngày lễ', 'Bạn có chắc bạn muốn xóa ngày lễ này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNgayLe(item.id));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmNgayLe', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNgayLe && this.props.dmNgayLe.page ?
            this.props.dmNgayLe.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };

        let table = renderTable({
            emptyTable: 'Không có dữ liệu ngày lễ',
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                        <th rowSpan='2' style={{ width: '20%',textAlign: 'center' }}>Thứ</th>
                        <th rowSpan='2' style={{ width: '30%', textAlign: 'center' }}>Ngày</th>
                        <th rowSpan='2' style={{ width: '50%', verticalAlign: 'left' }}>Mô tả</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }} nowrap='true'>Kích hoạt</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                    </tr>
                  
                </>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={this.getDay(item.ngay)} />
                    <TableCell type='text' style={{ textAlign: 'center' }}content={this.getFullDate(item.ngay)} />
                    <TableCell type='link' style={{ textAlign: 'left' }} content={item.moTa} onClick={() => this.modal.show(item)} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateDmNgayLe(item.id, { kichHoat: value ? 1 : 0, })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>)
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Ngày Lễ',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Ngày Lễ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmNgayLePage} />
                <EditModal ref={e => this.modal = e} permission={permission} getDataSelect={this.props.getDmDonViAll}
                    create={this.props.createDmNgayLe} update={this.props.updateDmNgayLe} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNgayLe: state.danhMuc.dmNgayLe, dmDonVi: state.danhMuc.dmDonVi });
const mapActionsToProps = { getDmDonViAll, getDmNgayLePage, createDmNgayLe, updateDmNgayLe, deleteDmNgayLe };
export default connect(mapStateToProps, mapActionsToProps)(DmNgayLePage);