import React from 'react';
import { connect } from 'react-redux';
import { getDmDanTocPage, createDmDanToc, updateDmDanToc, deleteDmDanToc } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {

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
        this.kichHoat.value(kichHoat ? 1 : 0);


    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) :
                this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật dân tộc' : 'Tạo mới dân tộc',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã dân tộc' readOnly={this.state.ma ? 'true' : readOnly} placeholder='Mã dân tộc' required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên dân tộc' placeholder='Tên dân tộc' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class dmDanTocAdminPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmDanTocPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmDanTocPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa dân tộc', `Bạn có chắc bạn muốn xóa dân tộc ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmDanToc(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá dân tộc ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá dân tộc ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }


    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmDanToc', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmDanToc && this.props.dmDanToc.page ?
            this.props.dmDanToc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có dữ liệu dân tộc';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={() => this.modal.show(item)} style={{ textAlign: 'center' }} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmDanToc(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete}></TableCell>
                    </tr>
                )

            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Dân tộc',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Dân tộc'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmDanTocPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmDanToc} update={this.props.updateDmDanToc} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmDanToc: state.danhMuc.dmDanToc });
const mapActionsToProps = { getDmDanTocPage, createDmDanToc, updateDmDanToc, deleteDmDanToc };
export default connect(mapStateToProps, mapActionsToProps)(dmDanTocAdminPage);