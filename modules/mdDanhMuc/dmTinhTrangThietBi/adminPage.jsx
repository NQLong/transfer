import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { getDanhSachTinhTrangThietBi, createTinhTrangThietBi, deleteTinhTrangThietBi, updateTinhTrangThietBi } from './redux';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';


class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.tinhTrangThietBi.focus();
        }));
    }

    onShow = (item) => {
        let { ma, tinhTrangThietBi, kichHoat } = item ? item : { ma: '', tinhTrangThietBi: '', kichHoat: 1 };
        this.setState({ ma, item });
        this.tinhTrangThietBi.value(tinhTrangThietBi);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            tinhTrangThietBi: this.tinhTrangThietBi.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.tinhTrangThietBi == '') {
            T.notify('Tên tình trạng thiết bị bị trống!', 'danger');
            this.tinhTrangThietBi.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);


    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Tạo mới tình trạng thiết bị' : 'Cập nhật tình trạng thiết bị',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.tinhTrangThietBi = e} label='Tên tình trạng thiết bị' readOnly={readOnly} placeholder='Tên tình trạng thiết bị' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class DanhMucTinhTrangThietBi extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDanhSachTinhTrangThietBi(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDanhSachTinhTrangThietBi();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Tình trạng thiết bị', `Bạn có chắc bạn muốn xóa Tình trạng thiết bị ${item.tinhTrangThietBi ? `<b>${item.tinhTrangThietBi}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteTinhTrangThietBi(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Tình trạng thiết bị ${item.tinhTrangThietBi} bị lỗi!`, 'danger');
                else T.alert(`Xoá Tình trạng thiết bị ${item.tinhTrangThietBi} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props?.system?.user?.permissions || [];
        const permission = this.getUserPermission('dmTinhTrangThietBi', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmTinhTrangThietBi && this.props.dmTinhTrangThietBi.page ?
            this.props.dmTinhTrangThietBi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };

        const table = !(list && list.length > 0) ? 'Không có dữ liệu Tình trạng thiết bị' :
            renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tình trạng thiết bị</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='text' content={item.tinhTrangThietBi} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateTinhTrangThietBi(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Tình trạng thiết bị',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Tình trạng thiết bị'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDanhSachTinhTrangThietBi} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createTinhTrangThietBi} update={this.props.updateTinhTrangThietBi} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}


const mapStateToProps = (state) => ({ system: state.system, dmTinhTrangThietBi: state.danhMuc.dmTinhTrangThietBi });
const mapActionsToProps = { getDanhSachTinhTrangThietBi, createTinhTrangThietBi, deleteTinhTrangThietBi, updateTinhTrangThietBi };
export default connect(mapStateToProps, mapActionsToProps)(DanhMucTinhTrangThietBi);
