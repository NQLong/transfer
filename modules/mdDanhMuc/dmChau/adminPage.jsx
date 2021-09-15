import React from 'react';
import { connect } from 'react-redux';
import { getDmChauAll, createDmChau, updateDmChau, deleteDmChau, getDmChauPage} from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox} from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: false }

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, territory, kichHoat } = item ? item : { ma: '', ten: '', territory: '', kichHoat: 1 };
        this.setState({ma, item});
        this.ma.value(ma);
        this.ten.value(ten);
        this.territory.value(territory);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(), 
            territory: this.territory.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.ma == '') {
            T.notify('Mã châu bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên châu bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.territory == '') {
            T.notify('Territory bị trống!', 'danger');
            this.territory.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
        e.preventDefault();
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);


    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật châu' : 'Tạo mới châu',
            body: <div className = 'row'>
               <FormTextBox type='text' className='col-md-6' ref={e => this.ma = e} label='Mã châu' 
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-6' ref={e => this.ten = e} label='Tên châu' 
                    readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-6' ref={e => this.territory = e} label='Territory' 
                    readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} 
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmChauPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmChauPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmChauPage();
        });
    }

    showModal = (e, item) => {
        e.preventDefault();
        this.modal.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Châu', 'Bạn có chắc bạn muốn xóa châu này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmChau(item.ma));
    };

    changeActive = item => this.props.updateDmChau(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmChau', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmChau && this.props.dmChau.page ?
            this.props.dmChau.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
    
        let table = 'Không có dữ liệu!';
            //items = this.props.dmChau && this.props.dmChau.items;
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                        <th style={{ width: '100%' }} nowrap='true'>Tên</th>
                        <th style={{ width: '100%' }} nowrap='true'>Territory</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma ? item.ma : ''} />
                        <TableCell type="link" content={item.ten ? item.ten : ''} onClick={e => this.edit(e, item)} />
                        <TableCell type='text' content={item.territory ? item.territory : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={() => this.props.updateDmChau(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={e => this.edit(e, item)}
                            onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Châu',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Châu'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} 
                    getPage={this.props.getDmBoMonPage} />
                <EditModal ref={e => this.modal = e} permission={permission} 
                    create={this.props.createDmChau} update={this.props.updateDmChau} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmChau: state.dmChau });
const mapActionsToProps = { getDmChauAll, createDmChau, updateDmChau, deleteDmChau, getDmChauPage};
export default connect(mapStateToProps, mapActionsToProps)(DmChauPage);