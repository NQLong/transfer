import React from 'react';
import { connect } from 'react-redux';
import { getDmLoaiBangCapAll, createDmLoaiBangCap, updateDmLoaiBangCap, deleteDmLoaiBangCap, getDmLoaiBangCapPage } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: false }

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: 1 };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.ma == '') {
            T.notify('Mã loại bằng cấp bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên loại bằng cấp bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
        e.preventDefault();
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật loại bằng cấp' : 'Tạo mới loại bằng cấp',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã loại bằng cấp'
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên loại bằng cấp'
                    readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmLoaiBangCapPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmLoaiBangCapPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmLoaiBangCapPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('loại bằng cấp', 'Bạn có chắc bạn muốn xóa loại bằng cấp này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmLoaiBangCap(item.ma));
    };

    changeActive = item => this.props.updateDmLoaiBangCap(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmLoaiBangCap', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmLoaiBangCap && this.props.dmLoaiBangCap.page ?
            this.props.dmLoaiBangCap.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma ? item.ma : ''} />
                        <TableCell type="link" content={item.ten ? item.ten : ''}
                            onClick={() => this.modal.show(item)} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={() => this.props.updateDmLoaiBangCap(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục loại bằng cấp',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục loại bằng cấp'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmLoaiBangCapPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmLoaiBangCap} update={this.props.updateDmLoaiBangCap} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmLoaiBangCap: state.danhMuc.dmLoaiBangCap });
const mapActionsToProps = { getDmLoaiBangCapAll, createDmLoaiBangCap, updateDmLoaiBangCap, deleteDmLoaiBangCap, getDmLoaiBangCapPage };
export default connect(mapStateToProps, mapActionsToProps)(DmLoaiBangCapPage);