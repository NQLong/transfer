import React from 'react';
import { connect } from 'react-redux';
import { getDmHocSdhPage, createDmHocSdh, updateDmHocSdh, deleteDmHocSdh } from './redux';
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
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: false };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten ? ten : '');
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0
        };

        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        } else if (!changes.ten) {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật Bậc sau đại học' : 'Tạo mới Bậc sau đại học',
            body: <div className='row'>
                <FormTextBox type='text' className='col-sm-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
                <FormTextBox type='text' className='col-sm-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class dmHocSdhPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        let route = T.routeMatcher('/user/:menu/bac-sdh').parse(window.location.pathname);
        this.menu = route.menu == 'sau-dai-hoc' ? 'sau-dai-hoc' : 'category';
        T.ready(`/user/${this.menu}`, () => {
            T.onSearch = (searchText) => this.props.getDmHocSdhPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmHocSdhPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Bậc sau đại học', `Bạn có chắc bạn muốn xóa Bậc sau đại học ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmHocSdh(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Bậc sau đại học ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá Bậc sau đại học ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmHocSdh', ['read', 'write', 'delete']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } =
            this.props.dmHocSdh && this.props.dmHocSdh.page ?
                this.props.dmHocSdh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };
        let table = 'Không có dữ liệu Bậc sau đại học!';
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
                        <TableCell type='link' content={item.ma} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmHocSdh(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Bậc sau đại học',
            breadcrumb: [
                <Link key={0} to={this.menu == 'category' ? '/user/category' : '/user/sau-dai-hoc'}>{this.menu == 'category' ? 'Danh mục' : 'Sau đại học'}</Link>,
                'Bậc sau đại học'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmHocSdhPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmHocSdh} update={this.props.updateDmHocSdh} permissions={currentPermissions} />
            </>,
            backRoute: `/user/${this.menu}`,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmHocSdh: state.danhMuc.dmHocSdh });
const mapActionsToProps = { getDmHocSdhPage, createDmHocSdh, updateDmHocSdh, deleteDmHocSdh };
export default connect(mapStateToProps, mapActionsToProps)(dmHocSdhPage);