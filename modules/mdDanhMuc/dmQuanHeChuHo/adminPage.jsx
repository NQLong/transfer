import React from 'react';
import { connect } from 'react-redux';
import { getDmQuanHeChuHoPage, createDmQuanHeChuHo, updateDmQuanHeChuHo, deleteDmQuanHeChuHo } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class EditModal extends React.Component {
    modal = React.createRef();
    state = { active: false }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmQuanHeChuHoMa').focus());
        });
    }

    show = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: 1 };
        $('#dmQuanHeChuHoMa').val(ma);
        $('#dmQuanHeChuHoTen').val(ten);
        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật quan hệ chủ hộ' : 'Tạo mới quan hệ chủ hộ');
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const maQuanHeChuHo = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#dmQuanHeChuHoMa').val().trim(),
                ten: $('#dmQuanHeChuHoTen').val().trim(),
                kichHoat: this.state.active ? 1 : 0,
            };
        if (changes.ma == '') {
            T.notify('Mã quan hệ chủ hộ bị trống!', 'danger');
            $('#dmQuanHeChuHoMa').focus();
        } else if (changes.tenQuocGia == '') {
            T.notify('Tên quan hệ chủ hộ bị trống!', 'danger');
            $('#dmQuanHeChuHoTen').focus();
        } else {
            if (maQuanHeChuHo) {
                if (typeof this.state.ImportIndex == 'number') changes.ImportIndex = this.state.ImportIndex;
                this.props.update(maQuanHeChuHo, changes, () => {
                    T.notify('Cập nhật quan hệ chủ hộ thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            } else {
                this.props.create(changes, () => {
                    T.notify('Tạo mới quan hệ chủ hộ thành công!', 'success');
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
                                <label htmlFor='dmQuanHeChuHoMa'>Mã quan hệ chủ hộ</label>
                                <input className='form-control' id='dmQuanHeChuHoMa' placeholder='Mã quan hệ chủ hộ' type='text' auto-focus='' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmQuanHeChuHoTen'>Tên quan hệ</label>
                                <input className='form-control' id='dmQuanHeChuHoTen' placeholder='Tên' type='text' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmDonViKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmDonViKichHoat' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
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

class dmQuanHeChuHoPage extends AdminPage {
    state = { searching: false };
    searchBox = React.createRef();
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Quan hệ chủ hộ', 'Bạn có chắc bạn muốn xóa quan hệ chủ hộ này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmQuanHeChuHo(item.ma));
    };

    changeActive = item => this.props.updateDmQuanHeChuHo(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmQuanHeChuHo:write'),
            permissionDelete = currentPermissions.includes('dmQuanHeChuHo:delete'),
            permission = this.getUserPermission('dmQuanHeChuHo', ['write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmQuanHeChuHo && this.props.dmQuanHeChuHo.page ?
            this.props.dmQuanHeChuHo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list };
        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
            table = renderTable({
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
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} style={{ textAlign: 'right' }} />
                        <TableCell type='link' content={item.ma} onClick={(e) => this.edit(e, item)} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                    </tr>
                ),
            });
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Quan hệ chủ hộ</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmQuanHeChuHoPage} setSearching={value => this.setState({ searching: value })} />
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Quan hệ chủ hộ
                    </ul>
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='dmQuanHeChuHoPage' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDmQuanHeChuHo} update={this.props.updateDmQuanHeChuHo} />
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

const mapStateToProps = state => ({ system: state.system, dmQuanHeChuHo: state.dmQuanHeChuHo });
const mapActionsToProps = { getDmQuanHeChuHoPage, createDmQuanHeChuHo, updateDmQuanHeChuHo, deleteDmQuanHeChuHo };
export default connect(mapStateToProps, mapActionsToProps)(dmQuanHeChuHoPage);
