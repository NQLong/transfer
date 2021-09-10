import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDmChucVuPage, createDmChucVu, deleteDmChucVu, updateDmChucVu } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class EditModal extends React.Component {
    state = { active: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#chucVuMa').focus());
        }, 250));
    }

    show = (item) => {
        let { ma, ten, kichHoat, phuCap, ghiChu } = item ? item : { ma: null, ten: '', kichHoat: 1, phuCap: null, ghiChu: '' };
        $('#chucVuMa').val(ma);
        $('#chucVuTen').val(ten);
        $('#chucVuPhuCap').val(phuCap);
        $('#chucVuGhiChu').val(ghiChu);
        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật chức vụ' : 'Tạo mới chức vụ');
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-ma', ma).modal('show');
        $(this.modal.current).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const chucVuMa = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#chucVuMa').val().trim(),
                ten: $('#chucVuTen').val().trim(),
                phuCap: $('#chucVuPhuCap').val().trim(),
                ghiChu: $('#chucVuGhiChu').val().trim(),
                kichHoat: this.state.active ? 1 : 0,
            };
        if (changes.ma == '') {
            T.notify('Mã chức vụ bị trống!', 'danger');
            $('#chucVuMa').focus();
        } else if (changes.tenQuocGia == '') {
            T.notify('Tên chức vụ bị trống!', 'danger');
            $('#chucVuTen').focus();
        } else {
            if (chucVuMa) {
                this.props.update(chucVuMa, changes, () => {
                    $(this.modal.current).modal('hide');
                });
            } else {
                this.props.create(changes, () => {
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
                                <label htmlFor='chucVuMa'>Mã chức vụ</label>
                                <input className='form-control' id='chucVuMa' placeholder='Mã chức vụ' type='text' auto-focus='' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='chucVuTen'>Tên chức vụ</label>
                                <input className='form-control' id='chucVuTen' placeholder='Tên chức vụ' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='chucVuPhuCap'>Phụ cấp</label>
                                <input className='form-control' id='chucVuPhuCap' placeholder='Phụ cấp' type='number' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='kichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='kichHoat' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
                                        <span className='button-indecator' />
                                    </label>
                                </div>
                            </div>
                            <div className='form-group'>
                                <label htmlFor='chucVuGhiChu'>Ghi chú</label>
                                <input className='form-control' id='chucVuGhiChu' placeholder='Ghi chú' type='text' readOnly={readOnly} />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly && <button type='submit' className='btn btn-primary' onClick={this.save}>Lưu</button>}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DmChucVuPage extends AdminPage {
    state = { searching: false };
    searchBox = React.createRef();
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmChucVu(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    delete = (e, item) => {
        T.confirm('Xóa chức vụ', `Bạn có chắc bạn muốn xóa Chức vụ ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmChucVu(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Chức vụ ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá chức vụ ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmChucVu:write'),
            permissionDelete = currentPermissions.includes('dmChucVu:delete'),
            permission = this.getUserPermission('dmChucVu', ['write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, list} = this.props.dmChucVu && this.props.dmChucVu.page ?
            this.props.dmChucVu.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 , list : null};
        let table = 'Danh mục chức vụ trống!';
        if (list && list.length > 0) {
            // let list = this.props.dmChucVu.page.list;
            table = renderTable ({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        {/* <th style={{ width: 'auto', textAlign: 'center' }}>#</th> */}
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Phụ cấp</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={item.ma}>
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={e => this.edit(e, item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='number' content={item.phuCap ? item.phuCap : 0} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} 
                            onChange={e => permissionWrite && this.changeActive(item)} />
                        <TableCell type='buttons' content={item} permission={permission} 
                            onEdit={e => this.edit(e, item)} onDelete={e => this.delete(e, item)} />
                    </tr>)
            });
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Chức vụ</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmChucVuPage} setSearching={value => this.setState({ searching: value })} />
                    {/* <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Chức vụ
                    </ul> */}
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <EditModal ref={this.modal} readOnly={!permissionWrite}
                        create={this.props.createDmChucVu} update={this.props.updateDmChucVu} />
                    <Pagination name='pageDmChucVu' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    <Link to='/user/danh-muc/chuc-vu/upload' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
                        <i className='fa fa-lg fa-cloud-upload' />
                    </Link>
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

// class DmChucVu extends React.Component {
//     state = { searching: false };
//     searchBox = React.createRef();
//     modal = React.createRef();

//     componentDidMount() {
//         T.ready('/user/category', () => this.searchBox.current.getPage());
//     }

//     edit = (e, item) => {
//         e.preventDefault();
//         this.modal.current.show(item);
//     }

//     changeActive = item => this.props.updateDmChucVu(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

//     delete = (e, item) => {
//         T.confirm('Xóa chức vụ', `Bạn có chắc bạn muốn xóa Chức vụ ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
//             isConfirm && this.props.deleteDmChucVu(item.ma, error => {
//                 if (error) T.notify(error.message ? error.message : `Xoá Chức vụ ${item.ten} bị lỗi!`, 'danger');
//                 else T.alert(`Xoá chức vụ ${item.ten} thành công!`, 'success', false, 800);
//             });
//         });
//         e.preventDefault();
//     }

//     render() {
//         const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
//             permissionWrite = currentPermissions.includes('dmChucVu:write'),
//             permissionDelete = currentPermissions.includes('dmChucVu:delete');
//         const { pageNumber, pageSize, pageTotal, totalItem } = this.props.dmChucVu && this.props.dmChucVu.page ?
//             this.props.dmChucVu.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
//         let table = 'Danh mục chức vụ trống!';
//         if (this.props.dmChucVu && this.props.dmChucVu.page && this.props.dmChucVu.page.list && this.props.dmChucVu.page.list.length > 0) {
//             table = (
//                 <table className='table table-hover table-bordered'>
//                     <thead>
//                         <tr>
//                             {/* <th style={{ width: 'auto', textAlign: 'center' }}>#</th> */}
//                             <td style={{ width: 'auto' }}>Mã</td>
//                             <td style={{ width: '100%' }}>Tên</td>
//                             <td style={{ width: 'auto' }} nowrap='true'>Phụ cấp</td>
//                             <td style={{ width: 'auto' }} nowrap='true'>Kích hoạt</td>
//                             <td style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</td>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {this.props.dmChucVu.page.list.map((item, index) => (
//                             <tr key={item.ma}>
//                                 {/* <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td> */}
//                                 <td><a href='#' onClick={e => this.edit(e, item)}>{item.ma}</a></td>
//                                 <td>{item.ten}</td>
//                                 <td style={{ textAlign: 'right' }}>{item.phuCap ? item.phuCap : 0}</td>
//                                 <td className='toggle' style={{ textAlign: 'center' }}>
//                                     <label>
//                                         <input type='checkbox' checked={item.kichHoat} onChange={e => permissionWrite && this.changeActive(item)} />
//                                         <span className='button-indecator' />
//                                     </label>
//                                 </td>
//                                 <td style={{ textAlign: 'center' }}>
//                                     <div className='btn-group'>
//                                         <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
//                                             <i className='fa fa-lg fa-edit' />
//                                         </a>
//                                         {permissionDelete &&
//                                             <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
//                                                 <i className='fa fa-trash-o fa-lg' />
//                                             </a>}
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             );
//         }

//         return (
//             <main className='app-content'>
//                 <div className='app-title'>
//                     <h1><i className='fa fa-list-alt' /> Danh mục Chức vụ</h1>
//                     <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmChucVuPage} setSearching={value => this.setState({ searching: value })} />
//                     <ul className='app-breadcrumb breadcrumb'>
//                         <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
//                         &nbsp;/&nbsp;
//                         <Link to='/user/category'>Danh mục</Link>
//                         &nbsp;/&nbsp;Chức vụ
//                     </ul>
//                 </div>
//                 <div className='tile'>
//                     {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
//                     <EditModal ref={this.modal} readOnly={!permissionWrite}
//                         create={this.props.createDmChucVu} update={this.props.updateDmChucVu} />
//                     <Pagination name='pageDmChucVu' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
//                         getPage={this.searchBox.current && this.searchBox.current.getPage} />
//                     <Link to='/user/danh-muc/chuc-vu/upload' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
//                         <i className='fa fa-lg fa-cloud-upload' />
//                     </Link>
//                     {permissionWrite &&
//                         <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
//                             <i className='fa fa-lg fa-plus' />
//                         </button>}
//                     <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
//                         <i className='fa fa-lg fa-reply' />
//                     </Link>
//                 </div>
//             </main>
//         );
//     }
// }

const mapStateToProps = state => ({ system: state.system, dmChucVu: state.dmChucVu });
const mapActionsToProps = { getDmChucVuPage, createDmChucVu, deleteDmChucVu, updateDmChucVu };
export default connect(mapStateToProps, mapActionsToProps)(DmChucVuPage);