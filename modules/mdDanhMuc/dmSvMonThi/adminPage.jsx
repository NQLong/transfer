import React from 'react';
import { connect } from 'react-redux';
import { getDmSvMonThiPage, deleteDmSvMonThi, createDmSvMonThi, updateDmSvMonThi } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { id, ten, kichHoat } = item ? item : { id: '', ten: '', kichHoat: true };

        this.setState({ id, item });
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            kichHoat: Number(this.kichHoat.value())
        };
        if (changes.ten == '') {
            T.notify('Tên không được bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Tạo mới môn thi' : 'Cập nhật môn thi',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class DmSvMonThiPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.props.getDmSvMonThiPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmSvMonThiPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa môn thi', `Bạn có chắc bạn muốn xóa môn thi ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmSvMonThi(item.id, error => {
                if (error) T.notify(error.message ? error.message : `Xoá môn thi ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá môn thi ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmSvMonThi', ['read', 'write', 'delete']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmSvMonThi && this.props.dmSvMonThi.page ?
            this.props.dmSvMonThi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const table = !(list && list.length > 0) ? 'Không có dữ liệu môn thi' :
            renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }} nowrap='true'>#</th>
                        <th style={{ width: '100%' }} nowrap='true'>Tên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmSvMonThi(item.id, { kichHoat: Number(value) })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Môn thi',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Môn thi'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmSvMonThiPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmSvMonThi} update={this.props.updateDmSvMonThi} permissions={currentPermissions} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmSvMonThi: state.danhMuc.dmSvMonThi });
const mapActionsToProps = { getDmSvMonThiPage, deleteDmSvMonThi, createDmSvMonThi, updateDmSvMonThi };
export default connect(mapStateToProps, mapActionsToProps)(DmSvMonThiPage);