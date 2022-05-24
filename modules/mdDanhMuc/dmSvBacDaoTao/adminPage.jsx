import React from 'react';
import { connect } from 'react-redux';
import { getDmSvBacDaoTaoPage, deleteDmSvBacDaoTao, createDmSvBacDaoTao, updateDmSvBacDaoTao } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.maBac.value() ? this.maBac.focus() : this.tenBac.focus();
        }));
    }

    onShow = (item) => {
        let { maBac, tenBac, kichHoat } = item ? item : { maBac: '', tenBac: '', kichHoat: true };

        this.setState({ maBac, item });
        this.maBac.value(maBac);
        this.tenBac.value(tenBac);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            maBac: this.maBac.value(),
            tenBac: this.tenBac.value(),
            kichHoat: Number(this.kichHoat.value())
        };
        if (!this.state.maBac && !this.maBac.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.maBac.focus();
        } else if (changes.tenBac == '') {
            T.notify('Tên không được bị trống!', 'danger');
            this.tenBac.focus();
        } else {
            this.state.maBac ? this.props.update(this.state.maBac, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.maBac ? 'Tạo mới bậc đào tạo sinh viên' : 'Cập nhật bậc đào tạo sinh viên',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.maBac = e} label='Mã' readOnly={this.state.maBac ? true : readOnly} placeholder='Mã' required />
                <FormTextBox className='col-12' ref={e => this.tenBac = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class DmSvBacDaoTaoPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.props.getDmSvBacDaoTaoPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmSvBacDaoTaoPage();
        });

    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa bậc đào tạo sinh viên', `Bạn có chắc bạn muốn xóa bậc đào tạo sinh viên ${item.tenBac ? `<b>${item.tenBac}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmSvBacDaoTao(item.maBac, error => {
                if (error) T.notify(error.message ? error.message : `Xoá bậc đào tạo sinh viên ${item.tenBac} bị lỗi!`, 'danger');
                else T.alert(`Xoá bậc đào tạo sinh viên ${item.tenBac} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmSvBacDaoTao', ['read', 'write', 'delete']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmSvBacDaoTao && this.props.dmSvBacDaoTao.page ?
            this.props.dmSvBacDaoTao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const table = !(list && list.length > 0) ? 'Không có dữ liệu bậc đào tạo sinh viên' :
            renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                        <th style={{ width: '100%' }} nowrap='true'>Tên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.maBac} onClick={() => this.modal.show(item)} />
                        <TableCell content={item.tenBac} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmSvBacDaoTao(item.maBac, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Bậc Đào tạo sinh viên',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Bậc Đào tạo sinh viên'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmSvBacDaoTaoPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmSvBacDaoTao} update={this.props.updateDmSvBacDaoTao} permissions={currentPermissions} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const maBacpStateToProps = state => ({ system: state.system, dmSvBacDaoTao: state.danhMuc.dmSvBacDaoTao });
const maBacpActionsToProps = { getDmSvBacDaoTaoPage, deleteDmSvBacDaoTao, createDmSvBacDaoTao, updateDmSvBacDaoTao };
export default connect(maBacpStateToProps, maBacpActionsToProps)(DmSvBacDaoTaoPage);