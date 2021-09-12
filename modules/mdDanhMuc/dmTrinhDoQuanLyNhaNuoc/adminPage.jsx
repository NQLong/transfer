import React from 'react';
import { connect } from 'react-redux';
import { createDmTrinhDoQuanLyNhaNuoc, deleteDmTrinhDoQuanLyNhaNuoc, updateDmTrinhDoQuanLyNhaNuoc, getDmTrinhDoQuanLyNhaNuocPage } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import AdminSearchBox from 'view/component/AdminSearchBox';

class EditModal extends AdminModal {
    state = { kichHoat: true };
    modal = React.createRef();

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };

        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
        this.setState({ kichHoat });

        $(this.modal).attr('data-id', ma).modal('show');
    };

    onSubmit = () => {
        const ma = $(this.modal).attr('data-id'),
            changes = {
                ma: this.ma.value(),
                ten: this.ten.value(),
                kichHoat: Number(this.kichHoat.value())
            };
        if (changes.ten == '') {
            T.notify('Tên trình độ bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.ma == '') {
            T.notify('Mã trình độ bị trống!', 'danger');
            this.ma.focus();
        } else {
            if (ma) {
                this.props.update(ma, changes);
            } else this.props.create(changes);
            $(this.modal).modal('hide');
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Tạo mới trình độ' : 'Cập nhật trình độ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã trình độ' readOnly={readOnly} placeholder='Mã trình độ đơn vị' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên trình độ' readOnly={readOnly} placeholder='Tên trình độ' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} placeholder='Ghi chú' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        }
        );
    }
}

class dmTrinhDoQLNNAdminPage extends AdminPage {
    modal = React.createRef();
    state = { searching: false };
    searchBox = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmTrinhDoQuanLyNhaNuocPage());

    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmTrinhDoQuanLyNhaNuoc(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    delete = (e, item) => {
        T.confirm('Xóa trình độ quản lý nhà nước', `Bạn có chắc bạn muốn xóa trình độ ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmTrinhDoQuanLyNhaNuoc(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá trình độ ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá trình độ ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmTrinhDoQuanLyNhaNuoc:write'),
            permission = this.getUserPermission('dmTrinhDoQuanLyNhaNuoc', ['write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dmTrinhDoQuanLyNhaNuoc && this.props.dmTrinhDoQuanLyNhaNuoc.page ?
            this.props.dmTrinhDoQuanLyNhaNuoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>Mã</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.ma} />
                    <TableCell type='link' content={item.ten} onClick={e => this.edit(e, item)} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Trình độ Quản lý nhà nước</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmTrinhDoQuanLyNhaNuocPage} setSearching={value => this.setState({ searching: value })} />
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <EditModal ref={this.modal} readOnly={!permissionWrite}
                        create={this.props.createDmTrinhDoQuanLyNhaNuoc} update={this.props.updateDmTrinhDoQuanLyNhaNuoc} />
                    <Pagination name='pageDmTrinhDoQuanLyNhaNuoc' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.props.getDmTrinhDoQuanLyNhaNuocPage} />
                    {permissionWrite &&
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                            <i className='fa fa-lg fa-plus' />
                        </button>}
                    <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmTrinhDoQuanLyNhaNuoc: state.dmTrinhDoQuanLyNhaNuoc });
const mapActionsToProps = { createDmTrinhDoQuanLyNhaNuoc, deleteDmTrinhDoQuanLyNhaNuoc, updateDmTrinhDoQuanLyNhaNuoc, getDmTrinhDoQuanLyNhaNuocPage };
export default connect(mapStateToProps, mapActionsToProps)(dmTrinhDoQLNNAdminPage);