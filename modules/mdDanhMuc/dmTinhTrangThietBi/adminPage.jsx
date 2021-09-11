import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import AdminSearchBox from 'view/component/AdminSearchBox';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { getDanhSachTinhTrangThietBi, createTinhTrangThietBi, deleteTinhTrangThietBi, updateTinhTrangThietBi } from './redux';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox  } from 'view/component/AdminPage';


class EditModal extends AdminModal {
    modal = React.createRef();
    state = { kichHoat: true }

    onShow = (item) => {
        let { ma, tinhTrangThietBi, kichHoat } = item ? item : { ma: null, tinhTrangThietBi: '', kichHoat: 1 };

        this.tinhTrangThietBi.value(tinhTrangThietBi);
        this.kichHoat.value(kichHoat);
        this.setState({ kichHoat });

        $(this.modal).attr('data-ma', ma).modal('show');
    };

    onSubmit = () => {
        const ma = $(this.modal).attr('data-ma'),
            changes = {
                tinhTrangThietBi: this.tinhTrangThietBi.value().trim(),
                kichHoat: Number(this.kichHoat.value()),
            };
        if (changes.tinhTrangThietBi == '') {
            T.notify('Tên tình trạng thiết bị bị trống!', 'danger');
            this.tinhTrangThietBi.focus();
        } else {
            if (ma) {
                this.props.update(ma, changes);
            } else {
                this.props.create(changes);
            }
            $(this.modal).modal('hide');

        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.tinhTrangThietBi ? 'Tạo mới tình trạng thiết bị' : 'Cập nhật tình trạng thiết bị',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.tinhTrangThietBi = e} label='Tên tình trạng thiết bị' readOnly={readOnly} placeholder='Tên tình trạng thiết bị' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        }
        );
    }
}

class DanhMucTinhTrangThietBi extends AdminPage {
    modal = React.createRef();
    searchBox = React.createRef();

    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };


    changeActive = item => this.props.updateTinhTrangThietBi(item.ma, { tinhTrangThietBi: item.tinhTrangThietBi, kichHoat: item.kichHoat == '1' ? '0' : '1' });

    delete = (e, ma) => {
        e.preventDefault();
        T.confirm('Tình trạng thiết bị', 'Bạn có chắc bạn muốn xóa tình trạng thiết bị này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteTinhTrangThietBi(ma));
    }

    render() {
        const currentPermissions = this.props?.system?.user?.permissions || [];
        const permissionWrite = currentPermissions.includes('dmTinhTrangThietBi:write');
        const permission = this.getUserPermission('dmTinhTrangThietBi', ['write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmTinhTrangThietBi && this.props.dmTinhTrangThietBi.page ?
            this.props.dmTinhTrangThietBi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>#</th>
                    <th style={{ width: '100%', textAlign: 'center' }} nowrap='true'>Tình trạng thiết bị</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.tinhTrangThietBi} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });


        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-lg fa-flask fa-fw' />Tình trạng thiết bị</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDanhSachTinhTrangThietBi} setSearching={value => this.setState({ searching: value })} />
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='dmTinhTrangThietBiPagination' style={{ marginLeft: '70px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} getPage={this.props.getDanhSachTinhTrangThietBi} />
                    <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>
                    {permissionWrite && (
                        <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                            <i className='fa fa-lg fa-plus' />
                        </button>)}
                    <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createTinhTrangThietBi} update={this.props.updateTinhTrangThietBi} />
                </div>
            </main>
        );
    }
}


const mapStateToProps = (state) => ({ system: state.system, dmTinhTrangThietBi: state.dmTinhTrangThietBi });
const mapActionsToProps = { getDanhSachTinhTrangThietBi, createTinhTrangThietBi, deleteTinhTrangThietBi, updateTinhTrangThietBi };
export default connect(mapStateToProps, mapActionsToProps)(DanhMucTinhTrangThietBi);
