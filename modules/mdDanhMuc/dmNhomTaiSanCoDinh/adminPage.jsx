import React from 'react';
import { connect } from 'react-redux';
import { createDmNhomTaiSanCoDinh, getDmNhomTaiSanCoDinhPage, getdmNhomTaiSanCoDinhAll, updateDmNhomTaiSanCoDinh, deleteDmNhomTaiSanCoDinh } from './redux';
import { Link } from 'react-router-dom';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

let dateFormat = require('dateformat');

class EditModal extends React.Component {
    state = { active: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmNhomTaiSanCoDinhMa').focus());
        }, 250));
    }

    show = (item) => {
        let { ma, ten, ngayBienBan, daIn } = item ? item : { ma: null, ten: '', ngayBienBan: null, daIn: 0 };
        let ngayBienBanDate = ngayBienBan ? new Date(ngayBienBan) : null;
        $('#dmNhomTaiSanCoDinhMa').val(ma);
        $('#dmNhomTaiSanCoDinhTen').val(ten);
        $('#dmNhomTaiSanCoDinhNgayBienBan').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
        $('#dmNhomTaiSanCoDinhNgayBienBan').datepicker('update', T.dateToText(ngayBienBanDate, 'dd/mm/yyyy'));
        $('#dmNhomTaiSanCoDinhNgayBienBan').val(ngayBienBanDate ? T.dateToText(ngayBienBanDate, 'dd/mm/yyyy') : '');
        $('#dmNhomTaiSanCoDinhDaIn').val(daIn);
        $(this.modal.current).attr('data-id', ma).modal('show');
    }

    hide = () => {
        $(this.modal.current).modal('hide');
    }

    save = (e) => {
        e.preventDefault();
        let ngayBienBanDate = $('#dmNhomTaiSanCoDinhNgayBienBan').val() ? T.formatDate($('#dmNhomTaiSanCoDinhNgayBienBan').val()) : null;
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ten: $('#dmNhomTaiSanCoDinhTen').val().trim(),
                ma: $('#dmNhomTaiSanCoDinhMa').val().trim(),
                ngayBienBan: ngayBienBanDate.getTime(),
                daIn: $('#dmNhomTaiSanCoDinhDaIn').val().trim(),
            };

        if (changes.ma == '') {
            T.notify('Mã nhóm tài sản cố định bị trống!', 'danger');
            $('#dmNhomTaiSanCoDinhMa').focus();
        }
        else if (changes.ten == '') {
            T.notify('Tên nhóm tài sản cố định bị trống!', 'danger');
            $('#dmNhomTaiSanCoDinhTen').focus();
        }
        else {
            if (ma) {
                this.props.update(ma, changes, () => {
                    T.notify('Cập nhật nhóm tài sản cố định thành công!', 'success');
                });
            } else {
                this.props.create(changes, () => {
                    T.notify('Tạo mới nhóm tài sản cố định!', 'success');
                });
            }
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' autoComplete='off' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'></h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmNhomTaiSanCoDinhMa'>Mã</label>
                                <input className='form-control' id='dmNhomTaiSanCoDinhMa' placeholder='Mã' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label className='control-label' htmlFor='dmNhomTaiSanCoDinhTen'>Tên</label>
                                <input className='form-control' type='text' placeholder='Tên' id='dmNhomTaiSanCoDinhTen' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmNhomTaiSanCoDinhNgayBienBan'>Ngày biên bản</label>
                                <input className='form-control' id='dmNhomTaiSanCoDinhNgayBienBan' placeholder='Ngày biên bản' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmNhomTaiSanCoDinhDaIn'>Đã in</label>
                                <input className='form-control' id='dmNhomTaiSanCoDinhDaIn' placeholder='Đã in' type='text' readOnly={readOnly} />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='reset' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly && <button type='submit' className='btn btn-primary'>Lưu</button>}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DmNhomTaiSanCoDinhPage extends AdminPage {
    state = {};
    modal = React.createRef();

    componentDidMount() {
        this.props.getdmNhomTaiSanCoDinhAll();
        T.ready('/user/category', () => this.getPage());
    }

    getPage = (pageNumber, pageSize, pageCondition) => {
        this.setState({ searching: true });
        this.props.getDmNhomTaiSanCoDinhPage(pageNumber, pageSize, pageCondition, () => {
            this.setState({ searching: false });
        });
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục nhóm tài sản cố định', 'Bạn có chắc bạn muốn xóa nhóm tài sản cố định này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNhomTaiSanCoDinh(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmNhomTaiSanCoDinh:write'),
            // permissionDelete = currentPermissions.includes('dmNhomTaiSanCoDinh:delete'),
            permission = this.getUserPermission('dmNhomTaiSanCoDinh', ['write', 'delete']);

        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNhomTaiSanCoDinh && this.props.dmNhomTaiSanCoDinh.page ?
            this.props.dmNhomTaiSanCoDinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách nhóm tài sản cố định!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '40%' }}>Tên nhóm tài sản</th>
                        <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Ngày lập biên bản</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>In</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} >
                        <TableCell type='text' style={{ textAlign: 'right' }} content={item.ma ? item.ma : ''} />
                        <TableCell type='link' style={{ textAlign: 'left' }} content={item.ten ? item.ten : ''} />
                        <TableCell type='date' style={{ textAlign: 'center' }}
                            content={item.ngayBienBan != null ? dateFormat(item.ngayBienBan, 'dd/mm/yyyy') : null} />
                        <TableCell type='text' style={{ textAlign: 'center' }}
                            content={item.daIn == 1 ? '*' : null} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={e => this.edit(e, item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Nhóm tài sản cố định</h1>
                    {/* <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>&nbsp;/&nbsp;Nhóm tài sản cố định
                    </ul> */}
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='dmNhomTaiSanCoDinhPage' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.getPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite}
                        create={this.props.createDmNhomTaiSanCoDinh} update={this.props.updateDmNhomTaiSanCoDinh} />
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

const mapStateToProps = state => ({ system: state.system, dmNhomTaiSanCoDinh: state.danhMuc.dmNhomTaiSanCoDinh });
const mapActionsToProps = { getdmNhomTaiSanCoDinhAll, getDmNhomTaiSanCoDinhPage, createDmNhomTaiSanCoDinh, updateDmNhomTaiSanCoDinh, deleteDmNhomTaiSanCoDinh };
export default connect(mapStateToProps, mapActionsToProps)(DmNhomTaiSanCoDinhPage);

// class DmNhomTaiSanCoDinhPage extends React.Component {
//     state = {};
//     modal = React.createRef();

//     componentDidMount() {
//         this.props.getdmNhomTaiSanCoDinhAll();
//         T.ready('/user/category', () => this.getPage());
//     }

//     getPage = (pageNumber, pageSize, pageCondition) => {
//         this.setState({ searching: true });
//         this.props.getDmNhomTaiSanCoDinhPage(pageNumber, pageSize, pageCondition, (page) => {
//             this.setState({ searching: false });
//         });
//     }

//     edit = (e, item) => {
//         e.preventDefault();
//         this.modal.current.show(item);
//     }

//     delete = (e, item) => {
//         e.preventDefault();
//         T.confirm('Xóa danh mục nhóm tài sản cố định', 'Bạn có chắc bạn muốn xóa nhóm tài sản cố định này?', true, isConfirm =>
//             isConfirm && this.props.deleteDmNhomTaiSanCoDinh(item.ma));
//     }

//     render() {
//         const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
//             permissionWrite = currentPermissions.includes('dmNhomTaiSanCoDinh:write'),
//             permissionDelete = currentPermissions.includes('dmNhomTaiSanCoDinh:delete');

//         let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNhomTaiSanCoDinh && this.props.dmNhomTaiSanCoDinh.page ?
//             this.props.dmNhomTaiSanCoDinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
//         let table = 'Không có danh sách nhóm tài sản cố định!';
//         if (list && list.length > 0) {
//             table = (
//                 <table className='table table-hover table-bordered'>
//                     <thead>
//                         <tr>
//                             <th style={{ width: 'auto' }}>Mã</th>
//                             <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Tên nhóm tài sản</th>
//                             <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Ngày lập biên bản</th>
//                             <th style={{ width: '20%' }}>In</th>
//                             <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {list.map((item, index) => (
//                             <tr key={index}>
//                                 <td style={{ textAlign: 'right' }}>{item.ma}</td>
//                                 <td style={{ textAlign: 'left' }}>{item.ten}</td>
//                                 <td style={{ textAlign: 'center' }}>{item.ngayBienBan != null ? dateFormat(item.ngayBienBan, 'dd/mm/yyyy') : null}</td>
//                                 <td style={{ textAlign: 'center' }}>{item.daIn == 1 ? '*' : null}</td>
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
//                     <h1><i className='fa fa-list-alt' /> Danh mục Nhóm tài sản cố định</h1>
//                     <ul className='app-breadcrumb breadcrumb'>
//                         <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
//                         <Link to='/user/category'>Danh mục</Link>&nbsp;/&nbsp;Nhóm tài sản cố định
//                     </ul>
//                 </div>
//                 <div className='tile'>
//                     {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
//                     <Pagination name='dmNhomTaiSanCoDinhPage' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
//                         getPage={this.getPage} />
//                     <EditModal ref={this.modal} readOnly={!permissionWrite}
//                         create={this.props.createDmNhomTaiSanCoDinh} update={this.props.updateDmNhomTaiSanCoDinh} />
//                     {permissionWrite &&
//                         <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
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

// const mapStateToProps = state => ({ system: state.system, dmNhomTaiSanCoDinh: state.dmNhomTaiSanCoDinh });
// const mapActionsToProps = { getdmNhomTaiSanCoDinhAll, getDmNhomTaiSanCoDinhPage, createDmNhomTaiSanCoDinh, updateDmNhomTaiSanCoDinh, deleteDmNhomTaiSanCoDinh };
// export default connect(mapStateToProps, mapActionsToProps)(DmNhomTaiSanCoDinhPage);