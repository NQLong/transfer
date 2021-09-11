import React from 'react';
import { connect } from 'react-redux';
import { getDmPhanLoaiVienChucPage, createDmPhanLoaiVienChuc, updateDmPhanLoaiVienChuc, deleteDmPhanLoaiVienChuc } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import AdminSearchBox from 'view/component/AdminSearchBox';

class EditModal extends AdminModal {
    modal = React.createRef();
    state = { kichHoat: true }

    onShow = (item) => {
        let { ma, ten, ghiChu, kichHoat } = item ? item : { ma: null, ten: '', ghiChu: '', kichHoat: 1 };

        this.ma.value(ma);
        this.ten.value(ten);
        this.ghiChu.value(ghiChu);
        this.kichHoat.value(kichHoat);

        this.setState({ kichHoat });

        $(this.modal).attr('data-ma', ma).modal('show');
    };

    onSubmit = () => {
        const maPhanLoaiVienChuc = $(this.modal).attr('data-ma'),
            changes = {
                ma: this.ma.value(),
                ten: this.ten.value(),
                ghiChu: this.ghiChu.value(),
                kichHoat: Number(this.kichHoat.value())
            };
        if (changes.ma == '') {
            T.notify('Mã phân loại viên chức bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên phân loại viên chức bị trống!', 'danger');
            this.ten.focus();
        } else {
            if (maPhanLoaiVienChuc) {
                this.props.update(maPhanLoaiVienChuc, changes, () => {
                    T.notify('Cập nhật phân loại viên chức thành công!', 'success');
                    $(this.modal).modal('hide');
                });
            } else {
                this.props.create(changes, () => {
                    T.notify('Tạo mới phân loại viên chức thành công!', 'success');
                    $(this.modal).modal('hide');
                });
            }
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Tạo mới phân loại viên chức' : 'Cập nhật phân loại viên chức',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã phân loại viên chức' readOnly={readOnly} placeholder='Mã phân loại viên chức' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên phân loại viên chức' readOnly={readOnly} placeholder='Tên phân loại viên chức' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} placeholder='Ghi chú' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        }
        );
    }
}

class dmPhanLoaiVienChucPage extends AdminPage {
    modal = React.createRef();
    state = { searching: false };
    searchBox = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Phân loại viên chức', 'Bạn có chắc bạn muốn xóa phân loại viên chức này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmPhanLoaiVienChuc(item.ma));
    };

    changeActive = item => this.props.updateDmPhanLoaiVienChuc(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmPhanLoaiVienChuc:write'),
            permission = this.getUserPermission('dmPhanLoaiVienChuc', ['write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmPhanLoaiVienChuc && this.props.dmPhanLoaiVienChuc.page ?
            this.props.dmPhanLoaiVienChuc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list };

        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                    <th style={{ width: '50%' }} nowrap='true'>Tên</th>
                    <th style={{ width: '50%' }} nowrap='true'>Ghi chú</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} style={{ textAlign: 'right' }} />
                    <TableCell type='link' content={item.ma} onClick={(e) => this.edit(e, item)} />
                    <TableCell type='text' content={item.ten} />
                    <TableCell type='text' content={item.ghiChu} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });


        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Phân loại viên chức</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmPhanLoaiVienChucPage} setSearching={value => this.setState({ searching: value })} />
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='dmPhanLoaiVienChucPage' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.props.getDmPhanLoaiVienChucPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite}
                        create={this.props.createDmPhanLoaiVienChuc} update={this.props.updateDmPhanLoaiVienChuc} />
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

const mapStateToProps = state => ({ system: state.system, dmPhanLoaiVienChuc: state.dmPhanLoaiVienChuc });
const mapActionsToProps = { getDmPhanLoaiVienChucPage, createDmPhanLoaiVienChuc, updateDmPhanLoaiVienChuc, deleteDmPhanLoaiVienChuc };
export default connect(mapStateToProps, mapActionsToProps)(dmPhanLoaiVienChucPage);
