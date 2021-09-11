import React from 'react';
import { connect } from 'react-redux';
import { getDmHocSdhPage, createDmHocSdh, updateDmHocSdh, deleteDmHocSdh } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import AdminSearchBox from 'view/component/AdminSearchBox';

class EditModal extends AdminModal {
    modal = React.createRef();
    state = { kichHoat: true }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: true };

        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
        this.setState({ kichHoat });

        $(this.modal).attr('data-ma', ma).modal('show');
    };

    onSubmit = () => {
        const maHocSDH = $(this.modal).attr('data-ma'),
            changes = {
                ma: this.ma.value().trim(),
                ten: this.ten.value().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên bị trống!', 'danger');
            this.ten.focus()
            } else if (changes.ma.length != 2) {
                T.notify('Mã sai!', 'danger');
                this.ma.focus();
            } else {
            if (maHocSDH) {
                this.props.update(maHocSDH, changes);
            } else {
                this.props.create(changes);
            }
            $(this.modal).modal('hide');
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma == '' ? 'Cập nhật thông tin' : 'Tạo mới thông tin',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã' readOnly={readOnly} placeholder='Mã' required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        });
    }
}

class dmHocSdhPage extends AdminPage {
    modal = React.createRef();
    state = { searching: false };
    searchBox = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmHocSdhPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục đơn vị tính', 'Bạn có chắc bạn muốn xóa đơn vị tính này?', true, (isConfirm) =>
            isConfirm && this.props.deleteDmHocSdh(item.ma));
    };

    changeActive = item => this.props.updateDmHocSdh(item.ma, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmHocSdh:write'),
            permission = this.getUserPermission('dmHocSdh', ['write', 'delete']);

        const { pageNumber, pageSize, pageTotal, totalItem, list } =
            this.props.dmHocSdh && this.props.dmHocSdh.page ?
                this.props.dmHocSdh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
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
                    <TableCell type='link' content={item.ma} style={{ textAlign: 'center' }} onClick={(e) => this.edit(e, item)} />
                    <TableCell type='text' content={item.ten} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục học Sau Đại học</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmHocSdhPage} setSearching={(value) => this.setState({ searching: value })} />
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name={dmHocSdhPage} style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.props.getDmHocSdhPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDmHocSdh} update={this.props.updateDmHocSdh} />
                    {permissionWrite &&
                        <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
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

const mapStateToProps = state => ({ system: state.system, dmHocSdh: state.dmHocSdh });
const mapActionsToProps = { getDmHocSdhPage, createDmHocSdh, updateDmHocSdh, deleteDmHocSdh };
export default connect(mapStateToProps, mapActionsToProps)(dmHocSdhPage);