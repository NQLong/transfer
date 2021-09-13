import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createDmBoMon, getDmBoMonPage, updateDmBoMon, deleteDmBoMon } from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true, kichHoat: true };
    // modal = React.createRef();
    //maDonVi = React.createRef();

    componentDidMount() {
        // $(document).ready(() => setTimeout(() => {
        //     $(this.modal.current).on('shown.bs.modal', () => $('#ma').focus());
        // }, 250));
        $(document).ready(() => this.onShow(() => {
            !this.ma.value() ? this.ma.focus() : this.ten().focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, tenTiengAnh, maDv, qdThanhLap, qdXoaTen, kichHoat, ghiChu } = item ? item : { ma: '', ten: '', tenTiengAnh: '', maDv: '', qdThanhLap: '', qdXoaTen: '', kichHoat: false, ghiChu: '' };
        this.setState({ma, item});
        this.ma.value(ma);
        this.ten.value(ten);
        this.tenTiengAnh.value(tenTiengAnh);
        // this.maDv.setVal(maDv);
        this.maDonVi.current.setVal(maDv);
        this.qdThanhLap.val(qdThanhLap);
        this.qdXoaTen.val(qdXoaTen);
        this.ghiChu.val(ghiChu);
        this.kichHoat.value(kichHoat);
        // $('#ma').val(ma);
        // $('#ten').val(ten);
        // $('#tenTiengAnh').val(tenTiengAnh);
        // this.maDonVi.current.setVal(maDv);
        // $('#qdThanhLap').val(qdThanhLap);
        // $('#qdXoaTen').val(qdXoaTen);
        // $('#ghiChu').val(ghiChu);
        // if (ma) {
        //     this.setState({ kichHoat });
        // } else {
        //     this.setState({ kichHoat });
        // }
        // $('#kichHoat').val(kichHoat);

        // $(this.modal.current).attr('data-id', ma).modal('show');
    }

    // hide = () => $(this.modal.current).modal('hide');

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            tenTiengAnh: this.tenTiengAnh.value(), 
            maDv: this.maDonVi.current.getVal(),
            //maDv: this.maDonVi.getFormVal().data,
            qdThanhLap: this.qdThanhLap.value(),
            qdXoaTen: this.qdXoaTen.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
            ghiChu: this.ghiChu.value(),
            // ma: $('#ma').val().trim(),
            // ten: $('#ten').val().trim(),
            // tenTiengAnh: $('#tenTiengAnh').val().trim(),
            // maDv: this.maDonVi.current.getVal(),
            // qdThanhLap: $('#qdThanhLap').val().trim(),
            // qdXoaTen: $('#qdXoaTen').val().trim(),
            // kichHoat: Number(this.state.kichHoat),
            // ghiChu: $('#ghiChu').val().trim(),
        };
        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã bộ môn bị trống!', 'danger');
            this.ma.focus();
            // $('#ma').focus();
        } else if (changes.maDv == '') {
            T.notify('Mã đơn vị bị trống!', 'danger');
            this.maDv.focus();
            // this.maDonVi.current.focus();
        } else {
            this.state.ma ? this.props.updateDmBoMon(this.state.ma, changes, this.hide) : this.props.createDmBoMon(changes, this.hide);
        }
        e.preventDefault();
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật bộ môn' : 'Tạo mới bộ môn',
            body: <div className='row'>
                <FormTextBox className='col-md-6' ref={e => this.ma = e} label='Mã bộ môn' 
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} 
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.ten = e} label='Tên bộ môn (tiếng Việt)' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.tenTiengAnh = e} label='Tên bộ môn (tiếng Anh)' readOnly={readOnly} />
                <FormSelect className='col-12 col-md-6' ref={e => this.maDonVi = e} 
                    adapter={SelectAdapter_DmDonVi} label='Mã Đơn Vị' required />
                <FormTextBox type='text' className='col-md-6' ref={e => this.qdThanhLap = e} label='Quyết định thành lập' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.qdXoaTen = e} label='Quyết định xóa tên' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
            </div>
        }));
    }
}

class DmBoMonPage extends AdminPage {
    state = { searching: false };
    donVi = {};

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmBoMonPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmBoMonPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin', 'Bạn có chắc bạn muốn xóa bộ môn này?', true, isConfirm => isConfirm && this.props.deleteDmBoMon(item.ma));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmBoMon', ['read', 'write', 'delete']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmBoMon && this.props.dmBoMon.page ?
        this.props.dmBoMon.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có dữ liệu bộ môn';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                        <th style={{ width: '60%' }}>Bộ môn</th>
                        <th style={{ width: '40%' }}>Đơn vị</th>
                        <th style={{ width: 'auto'}} nowrap='true'>QĐ thành lập</th>
                        <th style={{ width: 'auto'}} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center'}} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='link' content={<b> {item.ten ? item.ten : ''} <br /> {item.tenTiengAnh ? item.tenTiengAnh : ''} </b>} 
                            className={item.qdXoaTen ? 'text-danger' : 'text-primary'} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.maDv ? item.maDv : ''} />
                        <TableCell type='text' content={item.qdThanhLap ? item.qdThanhLap : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission} 
                            onChanged={() => this.props.updateDmBoMon(item.ma, { kichHoat: Number(!item.kichHoat) })} />
                        <TableCell type='buttons' content={item} permission={permission} 
                            onEdit={this.modal.show(item)} onDelete={this.delete}></TableCell>
                    </tr>)
            });
        }
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục bộ môn',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục bộ môn'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} 
                    getPage={this.props.getDmBoMonPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmBoMon} update={this.props.updateDmBoMon} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/dm-bo-mon/upload') : null
        });
    }
        // return (
        //     <main className='app-content'>
        //         <div className='app-title'>
        //             <h1><i className='fa fa-list-all' /> Danh mục Bộ môn</h1>
        //             <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmBoMonPage} setSearching={value => this.setState({ searching: value })} />
        //             {/* <ul className='app-breadcrumb breadcrumb'>
        //                 <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
        //                 &nbsp;/&nbsp;
        //                 <Link to='/user/category'>Danh mục</Link>
        //                 &nbsp;/&nbsp;Bộ môn
        //             </ul> */}
        //         </div>
        //         <div className='tile'>
        //             {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
        //             <EditModal ref={this.modal} readOnly={!permissionWrite}
        //                 createDmBoMon={this.props.createDmBoMon} updateDmBoMon={this.props.updateDmBoMon} />
                    
        //             <Pagination name={PageName} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ marginLeft: '70px' }}
        //             getPage={this.searchBox.current && this.searchBox.current.getPage} />

        //             <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
        //                 <i className='fa fa-lg fa-reply' />
        //             </Link>
        //             {permissionUpload && (
        //                 <Link to='/user/dm-bo-mon/upload' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
        //                     <i className='fa fa-lg fa-cloud-upload' />
        //                 </Link>)}
        //             {permissionWrite && (
        //                 <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
        //                     <i className='fa fa-lg fa-plus' />
        //                 </button>)}
        //         </div>
        //     </main>
        // );
}

// class AdminPage extends React.Component {
//     state = { searching: false };
//     donVi = {};
//     modal = React.createRef();
//     searchBox = React.createRef();

//     componentDidMount() {
//         T.ready('/user/category', () => this.searchBox.current.getPage());
//     }

//     edit = (e, item) => {
//         e.preventDefault();
//         this.modal.current.show(item);
//     }

//     delete = (e, item) => {
//         T.confirm('Xóa thông tin', 'Bạn có chắc bạn muốn xóa bộ môn này?', true, isConfirm => isConfirm && this.props.deleteDmBoMon(item.ma));
//         e.preventDefault();
//     }

//     changeKichHoat = item => this.props.updateDmBoMon(item.ma, { kichHoat: Number(!item.kichHoat) })

//     render() {
//         const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
//             permissionWrite = currentPermissions.includes('dmBoMon:write'),
//             permissionDelete = currentPermissions.includes('dmBoMon:delete'),
//             permissionUpload = currentPermissions.includes('dmBoMon:upload');
//         const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dmBoMon && this.props.dmBoMon.page ?
//             this.props.dmBoMon.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
//         let table = 'Không có bộ môn!';
//         if (list && list.length > 0) {
//             table = (
//                 <table className='table table-hover table-bordered table-responsive'>
//                     <thead>
//                         <tr>
//                             <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
//                             <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
//                             <th style={{ width: '60%' }}>Bộ môn</th>
//                             <th style={{ width: '40%' }}>Đơn vị</th>
//                             <th style={{ width: 'auto' }} nowrap='true'>QĐ thành lập</th>
//                             <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
//                             <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {list.map((item, index) => (
//                             <tr key={index}>
//                                 <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
//                                 <td style={{ textAlign: 'right' }}>
//                                     <a href='#' onClick={e => this.edit(e, item)} style={{ color: 'black' }}>{item.ma}</a>
//                                 </td>
//                                 <td>
//                                     <a href='#' onClick={e => this.edit(e, item)} className={item.qdXoaTen ? 'text-danger' : 'text-primary'}>
//                                         {item.ten ? item.ten : ''}<br />
//                                         {item.tenTiengAnh ? item.tenTiengAnh : ''}
//                                     </a>
//                                 </td>
//                                 <td>{item.maDv ? this.donVi[item.maDv] : ''}</td>
//                                 <td nowrap='true'>{item.qdThanhLap ? item.qdThanhLap : ''}</td>
//                                 <td className='toggle' style={{ textAlign: 'center' }}>
//                                     <label>
//                                         <input type='checkbox' checked={item.kichHoat} onChange={e => permissionWrite && this.changeKichHoat(item)} />
//                                         <span className='button-indecator' />
//                                     </label>
//                                 </td>
//                                 <td style={{ textAlign: 'center' }}>
//                                     <div className='btn-group'>
//                                         <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
//                                             <i className='fa fa-lg fa-edit' />
//                                         </a>
//                                         {permissionDelete && (
//                                             <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
//                                                 <i className='fa fa-trash-o fa-lg' />
//                                             </a>)}
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
//                     <h1><i className='fa fa-list-alt' /> Danh mục Bộ môn</h1>
//                     <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmBoMonPage} setSearching={value => this.setState({ searching: value })} />
//                     <ul className='app-breadcrumb breadcrumb'>
//                         <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
//                         &nbsp;/&nbsp;
//                         <Link to='/user/category'>Danh mục</Link>
//                         &nbsp;/&nbsp;Bộ môn
//                     </ul>
//                 </div>
//                 <div className='tile'>
//                     {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
//                     <EditModal ref={this.modal} readOnly={!permissionWrite}
//                         createDmBoMon={this.props.createDmBoMon} updateDmBoMon={this.props.updateDmBoMon} />
//                     <Pagination name={PageName} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ marginLeft: '70px' }}
//                         getPage={this.searchBox.current && this.searchBox.current.getPage} />
//                     <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
//                         <i className='fa fa-lg fa-reply' />
//                     </Link>
//                     {permissionUpload && (
//                         <Link to='/user/dm-bo-mon/upload' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
//                             <i className='fa fa-lg fa-cloud-upload' />
//                         </Link>)}
//                     {permissionWrite && (
//                         <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
//                             <i className='fa fa-lg fa-plus' />
//                         </button>)}
//                 </div>
//             </main>
//         );
//     }
// }

const mapStateToProps = state => ({ system: state.system, dmBoMon: state.dmBoMon, dmDonVi: state.dmDonVi });
const mapActionsToProps = { createDmBoMon, getDmBoMonPage, SelectAdapter_DmDonVi, updateDmBoMon, deleteDmBoMon };
export default connect(mapStateToProps, mapActionsToProps)(DmBoMonPage);