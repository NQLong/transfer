import React from 'react';
import { connect } from 'react-redux';
import { getSdhLoaiQdPage, updateSdhLoaiQd, deleteSdhLoaiQd, createSdhLoaiQd } from './redux';
import { AdminModal, AdminPage, FormCheckbox, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import T from 'view/js/common';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
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

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);


    render = () => {
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật loại quyết định' : 'Tạo mới loại quyết định',
            body: <div className='row'>
                <FormTextBox type='text' className='col-sm-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : false} placeholder='Mã' required />
                <FormTextBox type='text' className='col-sm-12' ref={e => this.ten = e} label='Tên' placeholder='Tên' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}
class sdhLoaiQuyetDinhPage extends AdminPage {
    state = { list: [] }
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhLoaiQdPage();
        });
    }

    delete = (e, item) => {
        T.confirm('Xóa loại quyết định', `Bạn có chắc muốn xóa loại quyết định ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSdhLoaiQd(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá loại quyết định ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá loại quyết định ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }
    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('sdhLoaiQuyetDinh', ['write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sdhLoaiQuyetDinh ? this.props.sdhLoaiQuyetDinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };
        let table = 'Chưa có dữ liệu';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list,
                stickyHead: false,
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
                        <TableCell type='text' content={item.ma} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateSdhLoaiQd(item.ma, { kichHoat: value ? 1 : 0, })} />

                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                )
            });
        }



        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Loại quyết định',
            breadcrumb: [
                <Link key={0} to={'/user/sau-dai-hoc'}>{'Sau đại học'}</Link>,
                'Loại quyết định'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} />
                <EditModal ref={e => this.modal = e} update={this.props.updateSdhLoaiQd} create={this.props.createSdhLoaiQd} permissions={currentPermissions} />
            </>,
            backRoute: '/user/sau-dai-hoc',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }

}
const mapStateToProps = state => ({ system: state.system, sdhLoaiQuyetDinh: state.sdh.sdhLoaiQuyetDinh });
const mapActionsToProps = { getSdhLoaiQdPage, updateSdhLoaiQd, deleteSdhLoaiQd, createSdhLoaiQd };
export default connect(mapStateToProps, mapActionsToProps)(sdhLoaiQuyetDinhPage);