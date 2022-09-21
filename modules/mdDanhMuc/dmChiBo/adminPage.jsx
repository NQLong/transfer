import React from 'react';
import { connect } from 'react-redux';
import { getDmChiBoPage, createDmChiBo, updateDmChiBo, deleteDmChiBo } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }
    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };

        this.setState({ ma, ten, item });
        this.ten.value(ten);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = (e) => {
        e.preventDefault();

        const changes = {
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.ten == '') {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        }
        else this.state.ten ? this.props.update(this.state.ma, changes, this.hide) :
            this.props.create(changes, this.hide);

    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ten ? 'Cập nhật chi bộ' : 'Tạo mới chi bộ',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên chi bộ' placeholder='Tên chi bộ' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class dmChiBoPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmChiBoPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmChiBoPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa chi bộ', `Bạn có chắc bạn muốn xóa chi bộ ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmChiBo(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá chi bộ ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá chi bộ ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmChiBo', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmChiBo && this.props.dmChiBo.page ?
            this.props.dmChiBo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };
        let table = 'Danh mục chi bộ trống!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} style={{ textAlign: 'right' }} />
                        <TableCell type='number' content={item.ma ? item.ma : ''} style={{ textAlign: 'center' }} />
                        <TableCell type='link' content={item.ten ? item.ten : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission} onChanged={value => this.props.updateDmChiBo(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                )
            });
        }
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Chi bộ',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Chi bộ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmChiBoPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmChiBo} update={this.props.updateDmChiBo} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmChiBo: state.danhMuc.dmChiBo });
const mapActionsToProps = { getDmChiBoPage, createDmChiBo, updateDmChiBo, deleteDmChiBo };
export default connect(mapStateToProps, mapActionsToProps)(dmChiBoPage);
