import React from 'react';
import { connect } from 'react-redux';
import { getDmMucDichTrongNuocAll, deleteDmMucDichTrongNuoc, createDmMucDichTrongNuoc, updateDmMucDichTrongNuoc } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class EditModal extends React.Component {
    state = { kichHoat: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmMucDichTrongNuocMa').focus());
        }, 250));
    }

    show = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: '', moTa: '', kichHoat: true };
        $('#dmMucDichTrongNuocMa').val(ma);
        $('#dmMucDichTrongNuocMoTa').val(moTa);
        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật ' : 'Tạo mới ');
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-id', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ma: $('#dmMucDichTrongNuocMa').val().trim(),
                moTa: $('#dmMucDichTrongNuocMoTa').val().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống');
            $('#dmMucDichTrongNuocMa').focus();
        } else if (changes.moTa == '') {
            T.notify('Mô tả danh mục bị trống');
            $('#dmMucDichTrongNuocMoTa').focus();
        } else {
            if (ma) {
                this.props.update(ma, changes);
            } else {
                this.props.create(changes);
            }
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin Danh mục mục đích đi công tác trong nước</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmMucDichTrongNuocMa'>Mã</label>
                                <input className='form-control' id='dmMucDichTrongNuocMa' type='text' placeholder='Mã danh mục' maxLength={2} readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmMucDichTrongNuocMoTa'>Mô tả</label>
                                <input className='form-control' id='dmMucDichTrongNuocMoTa' type='text' placeholder='Mô tả' readOnly={readOnly} />
                            </div>
                            <div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
                                <label htmlFor='dmMucDichTrongNuocActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmMucDichTrongNuocActive' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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

class DmMucDichTrongNuocPage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmMucDichTrongNuocAll();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmMucDichTrongNuoc(item.ma, { kichHoat: Number(!item.kichHoat) });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa mục đích đi công tác trong nước', 'Bạn có chắc bạn muốn xóa Mục đích đi công tác trong nước này?', true, isConfirm =>
            isConfirm && this.props.deleteDmMucDichTrongNuoc(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmMucDichTrongNuoc:write'),
            permission = this.getUserPermission('dmMucDichTrongNuoc', ['write', 'delete']);
        let table = 'Không có danh sách!',
            items = this.props.dmMucDichTrongNuoc && this.props.dmMucDichTrongNuoc.items ? this.props.dmMucDichTrongNuoc.items : [];
        if (items && items.length > 0) {
            items.sort((a, b) => (a.ma < b.ma) ? -1 : 1);
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Mô tả</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} >
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.ma ? item.ma : ''} />
                        <TableCell type='link' content={item.moTa ? item.moTa : ''}
                            onClick={e => this.edit(e, item)} />
                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permissionWrite}
                            onChange={() => permissionWrite && this.changeActive(item)} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={e => this.edit(e, item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Mục đích đi công tác trong nước</h1>
                    {/* <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Mục đích đi công tác trong nước
                    </ul> */}
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} dmMucDichTrongNuoc={this.props.dmMucDichTrongNuoc}
                    create={this.props.createDmMucDichTrongNuoc} update={this.props.updateDmMucDichTrongNuoc} />
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmMucDichTrongNuoc: state.dmMucDichTrongNuoc });
const mapActionsToProps = { getDmMucDichTrongNuocAll, deleteDmMucDichTrongNuoc, createDmMucDichTrongNuoc, updateDmMucDichTrongNuoc };
export default connect(mapStateToProps, mapActionsToProps)(DmMucDichTrongNuocPage);

// class AdminPage extends React.Component {
//     modal = React.createRef();

//     componentDidMount() {
//         T.ready('/user/category');
//         this.props.getDmMucDichTrongNuocAll();
//     }

//     edit = (e, item) => {
//         e.preventDefault();
//         this.modal.current.show(item);
//     }

//     changeActive = item => this.props.updateDmMucDichTrongNuoc(item.ma, { kichHoat: Number(!item.kichHoat) });

//     delete = (e, item) => {
//         e.preventDefault();
//         T.confirm('Xóa mục đích đi công tác trong nước', 'Bạn có chắc bạn muốn xóa Mục đích đi công tác trong nước này?', true, isConfirm =>
//             isConfirm && this.props.deleteDmMucDichTrongNuoc(item.ma));
//     }

//     render() {
//         const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
//             permissionWrite = currentPermissions.includes('dmMucDichTrongNuoc:write'),
//             permissionDelete = currentPermissions.includes('dmMucDichTrongNuoc:delete');
//         let table = 'Không có danh sách!',
//             items = this.props.dmMucDichTrongNuoc && this.props.dmMucDichTrongNuoc.items ? this.props.dmMucDichTrongNuoc.items : [];
//         if (items && items.length > 0) {
//             items.sort((a, b) => (a.ma < b.ma) ? -1 : 1);
//             table = (
//                 <table className='table table-hover table-bordered'>
//                     <thead>
//                         <tr>
//                             <th style={{ width: 'auto' }}>Mã</th>
//                             <th style={{ width: '100%' }}>Mô tả</th>
//                             <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
//                             <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {items.map((item, index) => (
//                             <tr key={index}>
//                                 <td style={{ textAlign: 'center' }}>{item.ma}</td>
//                                 <td><a href='#' onClick={e => this.edit(e, item)}>{item.moTa}</a></td>
//                                 <td className='toggle' style={{ textAlign: 'center' }}>
//                                     <label>
//                                         <input type='checkbox' checked={item.kichHoat} onChange={() => permissionWrite && this.changeActive(item)} />
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
//                     <h1><i className='fa fa-list-alt' /> Danh mục Mục đích đi công tác trong nước</h1>
//                     <ul className='app-breadcrumb breadcrumb'>
//                         <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
//                         &nbsp;/&nbsp;
//                         <Link to='/user/category'>Danh mục</Link>
//                         &nbsp;/&nbsp;Mục đích đi công tác trong nước
//                     </ul>
//                 </div>
//                 <div className='tile'>{table}</div>
//                 <EditModal ref={this.modal} readOnly={!permissionWrite} dmMucDichTrongNuoc={this.props.dmMucDichTrongNuoc}
//                     create={this.props.createDmMucDichTrongNuoc} update={this.props.updateDmMucDichTrongNuoc} />
//                 {permissionWrite &&
//                     <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
//                         <i className='fa fa-lg fa-plus' />
//                     </button>}
//                 <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
//                     <i className='fa fa-lg fa-reply' />
//                 </Link>
//             </main>
//         );
//     }
// }

// const mapStateToProps = state => ({ system: state.system, dmMucDichTrongNuoc: state.dmMucDichTrongNuoc });
// const mapActionsToProps = { getDmMucDichTrongNuocAll, deleteDmMucDichTrongNuoc, createDmMucDichTrongNuoc, updateDmMucDichTrongNuoc };
// export default connect(mapStateToProps, mapActionsToProps)(AdminPage);
