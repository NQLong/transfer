import React from 'react';
import { connect } from 'react-redux';
import { getDmHoatDongKhcnPage, deleteDmHoatDongKhcn, createDmHoatDongKhcn, updateDmHoatDongKhcn } from './redux';
import AdminSearchBox from 'view/component/AdminSearchBox';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import TextInput, { TextareaInput } from 'view/component/Input';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class EditModal extends React.Component {
    modalID = 'DmHoatDongKhcnModal_' + T.randomPassword();
    state = { ma: null };
    modal = React.createRef();
    ten = React.createRef();
    ghiChu = React.createRef();

    show = (item = {}) => {
        let isUpdate = !$.isEmptyObject(item);
        this.setState({ isUpdate, ma: item.ma });

        $(this.modal.current).modal('show');
        $(this.modal.current).find('.modal-title').html(isUpdate ? 'Cập nhật danh mục danh mục hoạt động KH&CN ' + item.ma : 'Tạo mới danh mục danh mục hoạt động KH&CN');
        this.ten.current.setVal(item.ten);
        this.ghiChu.current.setVal(item.ghiChu);
    };

    focusInput = element => element.focus ? element.focus() : $(element).data('select2-hidden-accessible') ? $(element).select2('open') : $(element).focus();

    getValue = (selector, required = true, dataGetter = i => i.val ? i.val() : $(i).val() ? $(i).val().trim() : '') => {
        const data = dataGetter(selector);
        if (data) return data;
        if (required) throw selector;
        return '';
    }

    save = (e) => {
        e.preventDefault();
        try {
            const changes = {
                ten: this.getValue(this.ten.current),
                ghiChu: this.getValue(this.ghiChu.current, false)
            };
            const done = item => {
                if (item) $(this.modal.current).modal('hide');
            };
            this.state.isUpdate ? this.props.update(this.state.ma, changes, done) : this.props.create(changes, done);
        }
        catch (e) {
            this.focusInput(e);
            const fieldName = e.label || $('label[for=' + $(e).attr('id') + ']').text();
            T.notify('<b>' + fieldName + '</b> bị trống!!', 'danger');
        }
    };

    render() {
        const readOnly = !!this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save} style={{ width: '40%' }}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'></h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='row modal-body' id={this.modalID}>
                            <div className='form-group col-12 col-md-12'>
                                <TextInput ref={this.ten} label='Tên danh mục hoạt động KH&CN' length={100} disabled={readOnly} />
                            </div>
                            <div className='form-group col-12 col-md-12'>
                                <TextareaInput ref={this.ghiChu} label='Ghi chú' length={2000} disabled={readOnly} />
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

class DmHoatDongKhcnPage extends AdminPage {
    modal = React.createRef();
    state = {}
    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmHoatDongKhcnPage();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa thông tin', 'Bạn có chắc bạn muốn xóa thông tin này?', true, isConfirm =>
            isConfirm && this.props.deleteDmHoatDongKhcn(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmHoatDongKhcn:write'),
            permission = this.getUserPermission('dmHoatDongKhcn', ['write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmHoatDongKhcn && this.props.dmHoatDongKhcn.page ?
            this.props.dmHoatDongKhcn.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Tên danh mục hoạt động KH&CN</th>
                        <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} >
                        <TableCell type='number' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.ma ? item.ma : ''} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='text' content={item.ghiChu ? item.ghiChu : ''} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={e => this.edit(e, item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Hoạt động KH&CN</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmHoatDongKhcnPage} setSearching={value => this.setState({ searching: value })} />
                    {/* <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp; Hoạt động KH&CN
                    </ul> */}
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='DmHoatDongKhcnPage' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.props.getDmHoatDongKhcnPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDmHoatDongKhcn} update={this.props.updateDmHoatDongKhcn} />
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

// class DmHoatDongKhcnPage extends React.Component {
//     modal = React.createRef();
//     state = {}
//     componentDidMount() {
//         T.ready('/user/category');
//         this.props.getDmHoatDongKhcnPage();
//     }

//     edit = (e, item) => {
//         e.preventDefault();
//         this.modal.current.show(item);
//     }

//     delete = (e, item) => {
//         e.preventDefault();
//         T.confirm('Xóa thông tin', 'Bạn có chắc bạn muốn xóa thông tin này?', true, isConfirm =>
//             isConfirm && this.props.deleteDmHoatDongKhcn(item.ma));
//     }

//     render() {
//         const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
//             permissionWrite = currentPermissions.includes('dmHoatDongKhcn:write'),
//             permissionDelete = currentPermissions.includes('dmHoatDongKhcn:delete');
//         let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmHoatDongKhcn && this.props.dmHoatDongKhcn.page ?
//             this.props.dmHoatDongKhcn.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
//         let table = 'Không có dữ liệu!';
//         if (list && list.length > 0) {
//             table = (
//                 <table className='table table-hover table-bordered table-responsive'>
//                     <thead>
//                         <tr>
//                             <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
//                             <th style={{ width: 'auto' }}>Mã</th>
//                             <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Tên danh mục hoạt động KH&CN</th>
//                             <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Ghi chú</th>
//                             <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {list.map((item, index) => (
//                             <tr key={index}>
//                                 <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
//                                 <td>{item.ma}</td>
//                                 <td>{item.ten}</td>
//                                 <td>{item.ghiChu}</td>
//                                 <td style={{ textAlign: 'center' }}>
//                                     <div className='btn-group' style={{ display: 'flex' }}>
//                                         <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
//                                             <i className='fa fa-lg fa-edit' />
//                                         </a>
//                                         {permissionDelete &&
//                                             <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
//                                                 <i className='fa fa-lg fa-trash' />
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
//                     <h1><i className='fa fa-list-alt' /> Hoạt động KH&CN</h1>
//                     <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmHoatDongKhcnPage} setSearching={value => this.setState({ searching: value })} />
//                     <ul className='app-breadcrumb breadcrumb'>
//                         <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
//                         &nbsp;/&nbsp;
//                         <Link to='/user/category'>Danh mục</Link>
//                         &nbsp;/&nbsp; Hoạt động KH&CN
//                     </ul>
//                 </div>
//                 <div className='tile'>
//                     {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
//                     <Pagination name='DmHoatDongKhcnPage' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
//                         getPage={this.props.getDmHoatDongKhcnPage} />
//                     <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDmHoatDongKhcn} update={this.props.updateDmHoatDongKhcn} />
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

const mapStateToProps = state => ({ system: state.system, dmHoatDongKhcn: state.danhMuc.dmHoatDongKhcn });
const mapActionsToProps = { getDmHoatDongKhcnPage, deleteDmHoatDongKhcn, createDmHoatDongKhcn, updateDmHoatDongKhcn };
export default connect(mapStateToProps, mapActionsToProps)(DmHoatDongKhcnPage);