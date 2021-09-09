import React from 'react';
import { connect } from 'react-redux';
import { getDmPhanLoaiVienChucPage, createDmPhanLoaiVienChuc, updateDmPhanLoaiVienChuc, deleteDmPhanLoaiVienChuc } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class EditModal extends React.Component {
    modal = React.createRef();
    state = { active: false }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmPhanLoaiVienChucMa').focus());
        });
    }

    show = (item) => {
        let { ma, ten, ghiChu, kichHoat } = item ? item : { ma: null, ten: '', ghiChu: '', kichHoat: 1 };
        $('#dmPhanLoaiVienChucMa').val(ma);
        $('#dmPhanLoaiVienChucTen').val(ten);
        $('#dmPhanLoaiVienChucGhiChu').val(ghiChu);
        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật phân loại viên chức' : 'Tạo mới phân loại viên chức');
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    };

    save = e => {
        e.preventDefault();
        const maPhanLoaiVienChuc = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#dmPhanLoaiVienChucMa').val().trim(),
                ten: $('#dmPhanLoaiVienChucTen').val().trim(),
                ghiChu: $('#dmPhanLoaiVienChucGhiChu').val().trim(),
                kichHoat: this.state.active ? 1 : 0,
            };
        if (changes.ma == '') {
            T.notify('Mã phân loại viên chức bị trống!', 'danger');
            $('#dmPhanLoaiVienChucMa').focus();
        } else if (changes.ten == '') {
            T.notify('Tên phân loại viên chức bị trống!', 'danger');
            $('#dmPhanLoaiVienChucTen').focus();
        } else {
            if (maPhanLoaiVienChuc) {
                this.props.update(maPhanLoaiVienChuc, changes, () => {
                    T.notify('Cập nhật phân loại viên chức thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            } else {
                this.props.create(changes, () => {
                    T.notify('Tạo mới phân loại viên chức thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            }
        }
    };

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'></h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmPhanLoaiVienChucMa'>Mã phân loại viên chức</label>
                                <input className='form-control' id='dmPhanLoaiVienChucMa' placeholder='Mã phân loại viên chức' type='text' auto-focus='' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmPhanLoaiVienChucTen'>Tên Phân loại viên chức</label>
                                <input className='form-control' id='dmPhanLoaiVienChucTen' placeholder='Tên Phân loại viên chức' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmPhanLoaiVienChucghiChu'>Ghi chú</label>
                                <input className='form-control' id='dmPhanLoaiVienChucGhiChu' placeholder='Ghi chú' type='text' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmPhanLoaiVienChucKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmPhanLoaiVienChucKichHoat' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
                                        <span className='button-indecator' />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly && <button type='submit' className='btn btn-primary'>Lưu</button>}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class dmPhanLoaiVienChucPage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmPhanLoaiVienChucPage();
        T.ready('/user/category');
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
            permissionDelete = currentPermissions.includes('dmPhanLoaiVienChuc:delete'),
            permission = this.getUserPermission('dmPhanLoaiVienChuc', ['write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmPhanLoaiVienChuc && this.props.dmPhanLoaiVienChuc.page ?
            this.props.dmPhanLoaiVienChuc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list };
        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
            table = renderTable({
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
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Phân loại viên chức</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Phân loại viên chức
                    </ul>
                </div>
                <div className='tile'>{table}</div>
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
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmPhanLoaiVienChuc: state.dmPhanLoaiVienChuc });
const mapActionsToProps = { getDmPhanLoaiVienChucPage, createDmPhanLoaiVienChuc, updateDmPhanLoaiVienChuc, deleteDmPhanLoaiVienChuc };
export default connect(mapStateToProps, mapActionsToProps)(dmPhanLoaiVienChucPage);
