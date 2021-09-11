import React from 'react';
import { connect } from 'react-redux';
import { getDmTonGiaoPage, createDmTonGiao, updateDmTonGiao, deleteDmTonGiao } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class EditModal extends React.Component {
    modal = React.createRef();
    state = { kichHoat: true, visible: false };

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmTonGiaoMa').focus());
        });
    }

    show = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: 1 };
        $('#dmTonGiaoMa').val(ma);
        $('#dmTonGiaoTen').val(ten);
        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật tôn giáo' : 'Tạo mới tôn giáo');
        this.setState({ kichHoat, visible: false });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const maDmTonGiao = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#dmTonGiaoMa').val().trim(),
                ten: $('#dmTonGiaoTen').val().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã tôn giáo sách bị trống!', 'danger');
            $('#dmTonGiaoMa').focus();
        } else if (changes.ten == '') {
            T.notify('Tên tôn giáo bị trống!', 'danger');
            $('#dmTonGiaoTen').focus();
        } else if (changes.ma.length != 2) {
            this.setState({ visible: true });
        } else {
            if (maDmTonGiao) {
                this.props.update(maDmTonGiao, changes);
            } else {
                this.props.create(changes);
            }
            $(this.modal.current).modal('hide');
        }
    };

    render() {
        const readOnly = this.props.readOnly;
        let help = this.state.visible ? <small id='maHelp' className='form-text text-muted'>Mã tôn giáo chỉ gồm 2 kí tự</small> : null;
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
                                <label htmlFor='dmTonGiaoMa'>Mã tôn giáo</label>
                                <input className='form-control' id='dmTonGiaoMa' placeholder='Mã tốn giáo' type='text' auto-focus='' readOnly={readOnly} />
                                {help}
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmTonGiaoTen'>Tên tôn giáo</label>
                                <input className='form-control' id='dmTonGiaoTen' placeholder='Tên tôn giáo' type='text' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmTonGiaoKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmTonGiaoKichHoat' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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

class DmTonGiaoPage extends AdminPage {
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
        T.confirm('Tôn giáo', 'Bạn có chắc bạn muốn xóa tôn giáo này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmTonGiao(item.ma));
    };

    changeActive = item => this.props.updateDmTonGiao(item.ma, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmTonGiao:write'),
            permissionDelete = currentPermissions.includes('dmTonGiao:delete'),
            permission = this.getUserPermission('dmTonGiao', ['write', 'delete']);

        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dmTonGiao && this.props.dmTonGiao.page ?
            this.props.dmTonGiao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right'}} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' style={{ textAlign: 'center'}} content={item.ma ? item.ma : ''} 
                            onClick = {e => this.edit(e, item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Tôn giáo</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmTonGiaoPage} setSearching={value => this.setState({ searching: value })} />
                    {/* <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Tôn giáo
                    </ul> */}
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='pageDmTonGiao' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite}
                        create={this.props.createDmTonGiao} update={this.props.updateDmTonGiao} />
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

const mapStateToProps = state => ({ system: state.system, dmTonGiao: state.dmTonGiao });
const mapActionsToProps = { getDmTonGiaoPage, createDmTonGiao, updateDmTonGiao, deleteDmTonGiao };
export default connect(mapStateToProps, mapActionsToProps)(DmTonGiaoPage);

// class DmTonGiaoPage extends React.Component {
//     state = { searching: false };
//     searchBox = React.createRef();
//     modal = React.createRef();

//     componentDidMount() {
//         T.ready('/user/category', () => this.searchBox.current.getPage());
//     }

//     edit = (e, item) => {
//         e.preventDefault();
//         this.modal.current.show(item);
//     };

//     delete = (e, item) => {
//         e.preventDefault();
//         T.confirm('Tôn giáo', 'Bạn có chắc bạn muốn xóa tôn giáo này?', 'warning', true, isConfirm =>
//             isConfirm && this.props.deleteDmTonGiao(item.ma));
//     };

//     changeActive = item => this.props.updateDmTonGiao(item.ma, { kichHoat: Number(!item.kichHoat) });

//     render() {
//         const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
//             permissionWrite = currentPermissions.includes('dmTonGiao:write'),
//             permissionDelete = currentPermissions.includes('dmTonGiao:delete');
//         let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dmTonGiao && this.props.dmTonGiao.page ?
//             this.props.dmTonGiao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
//         let table = 'Không có dữ liệu!';
//         if (list && list.length > 0) {
//             table = (
//                 <table className='table table-hover table-bordered table-responsive'>
//                     <thead>
//                         <tr>
//                             <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
//                             <th style={{ width: 'auto' }}>Mã</th>
//                             <th style={{ width: '100%' }}>Tên</th>
//                             <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
//                             <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {list.map((item, index) => (
//                             <tr key={index}>
//                                 <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
//                                 <td style={{ textAlign: 'center' }}><a href='#' onClick={e => this.edit(e, item)}>{item.ma}</a></td>
//                                 <td>{item.ten}</td>
//                                 <td className='toggle' style={{ textAlign: 'center' }}>
//                                     <label>
//                                         <input type='checkbox' checked={item.kichHoat} onChange={() => permissionWrite && this.changeActive(item)} />
//                                         <span className='button-indecator' />
//                                     </label>
//                                 </td>
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
//                     <h1><i className='fa fa-list-alt' /> Danh mục Tôn giáo</h1>
//                     <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmTonGiaoPage} setSearching={value => this.setState({ searching: value })} />
//                     <ul className='app-breadcrumb breadcrumb'>
//                         <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
//                         &nbsp;/&nbsp;
//                         <Link to='/user/category'>Danh mục</Link>
//                         &nbsp;/&nbsp;Tôn giáo
//                     </ul>
//                 </div>
//                 <div className='tile'>
//                     {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
//                     <Pagination name='pageDmTonGiao' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
//                         getPage={this.searchBox.current && this.searchBox.current.getPage} />
//                     <EditModal ref={this.modal} readOnly={!permissionWrite}
//                         create={this.props.createDmTonGiao} update={this.props.updateDmTonGiao} />
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

// const mapStateToProps = state => ({ system: state.system, dmTonGiao: state.dmTonGiao });
// const mapActionsToProps = { getDmTonGiaoPage, createDmTonGiao, updateDmTonGiao, deleteDmTonGiao };
// export default connect(mapStateToProps, mapActionsToProps)(DmTonGiaoPage);