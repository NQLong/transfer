import React from 'react';
import { connect } from 'react-redux';
import { getDmQuocGiaPage, deleteDmQuocGia, createDmQuocGia, updateDmQuocGia, createDmQuocGiaByUpload } from './redux';
import FileBox from 'view/component/FileBox';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class EditModal extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmqgMaQuocGia').focus());
        }, 250));
    }

    show = (item) => {
        let { maCode, tenQuocGia, country, shortenName, codeAlpha, maKhuVuc, tenKhac, } = item ? item : { maCode: '', tenQuocGia: '', country: '', shortenName: '', codeAlpha: '', maKhuVuc: '', tenKhac: '', maCu: '' };
        $('#dmqgMaQuocGia').val(maCode);
        $('#dmqgTenQuocGia').val(tenQuocGia);
        $('#dmqgQuocGia').val(country);
        $('#dmqgTenVietTat').val(shortenName);
        $('#dmqgCodeAlpha').val(codeAlpha);
        $('#dmqgMaKhuVuc').val(maKhuVuc);
        $('#dmqgTenKhac').val(tenKhac);

        $(this.modal.current).attr('data-id', maCode).modal('show');
    }

    hide = () => $(this.modal.current).modal('hide')

    save = e => {
        e.preventDefault();
        const maCode = $(this.modal.current).attr('data-id'),
            changes = {
                maCode: $('#dmqgMaQuocGia').val().trim().toUpperCase(),
                tenQuocGia: $('#dmqgTenQuocGia').val().trim().toUpperCase(),
                country: $('#dmqgQuocGia').val().trim().toUpperCase(),
                shortenName: $('#dmqgTenVietTat').val().trim().toUpperCase(),
                codeAlpha: $('#dmqgCodeAlpha').val().trim().toUpperCase(),
                maKhuVuc: $('#dmqgMaKhuVuc').val().trim().toUpperCase(),
                tenKhac: $('#dmqgTenKhac').val().trim().toUpperCase(),
                maCu: '',
            };

        if (changes.maCode == '') {
            T.notify('Mã quốc gia bị trống!', 'danger');
            $('#dmqgMaQuocGia').focus();
        } else if (changes.tenQuocGia == '') {
            T.notify('Tên quốc gia bị trống!', 'danger');
            $('#dmqgTenQuocGia').focus();
        } else if (changes.country == '') {
            T.notify('Quốc gia bị trống!', 'danger');
            $('#dmqgQuocGia').focus();
        } else if (changes.shortenName == '') {
            T.notify('Tên viết tắt bị trống!', 'danger');
            $('#dmqgTenVietTat').focus();
        } else if (changes.codeAlpha == '') {
            T.notify('Code Alpha bị trống!', 'danger');
            $('#dmqgCodeAlpha').focus();
        } else if (changes.maKhuVuc == '') {
            T.notify('Mã khu vực bị trống!', 'danger');
            $('#dmqgMaKhuVuc').focus();
        } else {
            let dataChanges = {
                changes: changes,
                maCode: maCode
            };
            this.props.dataChanges(dataChanges);
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Quốc gia</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group row'>
                                <div className='col-12 col-sm-4'>
                                    <label htmlFor='dmqgMaQuocGia'>Mã quốc gia</label>
                                    <input className='form-control' id='dmqgMaQuocGia' type='text' placeholder='Mã quốc gia' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className='col-12 col-sm-4'>
                                    <label htmlFor='dmqgTenQuocGia'>Tên quốc gia</label>
                                    <input className='form-control' id='dmqgTenQuocGia' type='text' placeholder='Tên quốc gia' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className='col-12 col-sm-4'>
                                    <label htmlFor='dmqgQuocGia'>Quốc gia</label>
                                    <input className='form-control' id='dmqgQuocGia' type='text' placeholder='Quốc gia' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <div className='col-12 col-sm-4'>
                                    <label htmlFor='dmqgTenVietTat'>Tên viết tắt</label>
                                    <input className='form-control' id='dmqgTenVietTat' type='text' placeholder='Tên viết tắt' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className='col-12 col-sm-4'>
                                    <label htmlFor='dmqgCodeAlpha'>Code Alpha</label>
                                    <input className='form-control' id='dmqgCodeAlpha' type='text' placeholder='Code Alpha' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className='col-12 col-sm-4'>
                                    <label htmlFor='dmqgMaKhuVuc'>Mã khu vực</label>
                                    <input className='form-control' id='dmqgMaKhuVuc' type='text' placeholder='Mã khu vực' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                                </div>
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmqgTenKhac'>Tên khác</label>
                                <input className='form-control' id='dmqgTenKhac' type='text' placeholder='Tên Khác' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                                <small className='form-text text-muted'>Có thể có nhiều tên. Mỗi tên cách nhau bằng dấu phẩy (,).</small>
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

class adminUploadPage extends AdminPage {
    modal = React.createRef();
    state = { dmQuocGia: [] };

    componentDidMount() {
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        let indexDelete;
        T.confirm('Xóa danh mục quốc gia', 'Bạn có chắc bạn muốn xóa quốc gia này?', true, isConfirm =>
            isConfirm && this.setState(state => {
                state.dmQuocGia.forEach((data, index) => {
                    if (data.maCode == item.maCode) {
                        indexDelete = index;
                    }
                });
                state.dmQuocGia.splice(indexDelete, 1);
                return state;
            }));
    }

    updateTableData = (dataEditModal) => {
        this.setState((state,) => {
            state.dmQuocGia.forEach(data => {
                if (data.maCode == dataEditModal.changes.maCode) {
                    data.tenQuocGia = dataEditModal.changes.tenQuocGia;
                    data.country = dataEditModal.changes.country;
                    data.shortenName = dataEditModal.changes.shortenName;
                    data.codeAlpha = dataEditModal.changes.codeAlpha;
                    data.maKhuVuc = dataEditModal.changes.maKhuVuc;
                    data.tenKhac = dataEditModal.changes.tenKhac;
                }
            });
            return state;
        });
    }

    onSuccess = (data) => {
        this.setState({ dmQuocGia: data.dmQuocGia });
    }

    save = () => {
        let dataImport = this.state.dmQuocGia;
        if (dataImport && dataImport.length > 0) {
            this.props.createDmQuocGiaByUpload(dataImport, () => {
                T.notify('Cập nhật thành công!', 'success');
                this.props.history.push('/user/danh-muc/quoc-gia');
            });
        }
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmQuocGia:write'), 
            permission = this.getUserPermission('dmQuocGia', ['write', 'delete']);
        let table = null;
        if (this.state.dmQuocGia && this.state.dmQuocGia.length > 0) {
            table = renderTable({
                getDataSource: () => this.state.dmQuocGia, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '50%' }} nowrap='true'>Tên quốc gia</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Code alpha</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Tên viết tắt</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã khu vực</th>
                        <th style={{ width: '50%' }}>Tên khác</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right'}} content={index + 1} />
                        <TableCell type='text' content={item.maCode ? item.maCode : ''} />
                        <TableCell type='link' content={<b>{item.tenQuocGia} {item.country ? `(${item.country})` : ''}</b>}
                            onClick = {e => this.edit(e, item)} />
                        <TableCell type='number' content={item.codeAlpha ? item.codeAlpha : ''} />
                        <TableCell type='text' content={item.shortenName ? item.shortenName : ''} />
                        <TableCell type='text' content={item.maKhuVuc ? item.maKhuVuc : ''} />
                        <TableCell type='text' content={item.tenKhac && item.tenKhac.length > 0 ? item.tenKhac.toString().replaceAll(',', ', ') : ''} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} 
                            onEdit={e => this.edit(e, item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Quốc gia: Upload</h1>
                </div>
                <div style={{ marginTop: '2%' }} className='row tile'>
                    <FileBox ref={this.fileBox} postUrl='/api/danh-muc/quoc-gia/upload' uploadType='DmQuocGiaFile' userData='dmQuocGiaImportData' style={{ width: '100%', backgroundColor: '#fdfdfd' }}
                        success={this.onSuccess} ajax={true} />
                </div>

                {table ? <div style={{ marginTop: '2%' }} className='row tile'>{table}</div> : null}
                <EditModal dataChanges={this.updateTableData} ref={this.modal} readOnly={!permissionWrite} />
                <Link to='/user/danh-muc/quoc-gia/' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {permissionWrite && (
                    <React.Fragment>
                        <a href='/download/template/QuocGia.xlsx' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
                            <i className='fa fa-download' />
                        </a>
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                            <i className='fa fa-lg fa-save' />
                        </button>
                    </React.Fragment>)}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, categoryRoom: state.categoryRoom, categoryBuilding: state.categoryBuilding });
const mapActionsToProps = { getDmQuocGiaPage, deleteDmQuocGia, createDmQuocGia, updateDmQuocGia, createDmQuocGiaByUpload };
export default connect(mapStateToProps, mapActionsToProps)(adminUploadPage);

// class adminUploadPage extends React.Component {
//     modal = React.createRef();
//     state = { dmQuocGia: [] };

//     componentDidMount() {
//         T.ready('/user/category');
//     }

//     edit = (e, item) => {
//         e.preventDefault();
//         this.modal.current.show(item);
//     };

//     delete = (e, item) => {
//         e.preventDefault();
//         let indexDelete;
//         T.confirm('Xóa danh mục quốc gia', 'Bạn có chắc bạn muốn xóa quốc gia này?', true, isConfirm =>
//             isConfirm && this.setState(state => {
//                 state.dmQuocGia.forEach((data, index) => {
//                     if (data.maCode == item.maCode) {
//                         indexDelete = index;
//                     }
//                 });
//                 state.dmQuocGia.splice(indexDelete, 1);
//                 return state;
//             }));
//     }

//     updateTableData = (dataEditModal) => {
//         this.setState((state,) => {
//             state.dmQuocGia.forEach(data => {
//                 if (data.maCode == dataEditModal.changes.maCode) {
//                     data.tenQuocGia = dataEditModal.changes.tenQuocGia;
//                     data.country = dataEditModal.changes.country;
//                     data.shortenName = dataEditModal.changes.shortenName;
//                     data.codeAlpha = dataEditModal.changes.codeAlpha;
//                     data.maKhuVuc = dataEditModal.changes.maKhuVuc;
//                     data.tenKhac = dataEditModal.changes.tenKhac;
//                 }
//             });
//             return state;
//         });
//     }

//     onSuccess = (data) => {
//         this.setState({ dmQuocGia: data.dmQuocGia });
//     }

//     save = () => {
//         let dataImport = this.state.dmQuocGia;
//         if (dataImport && dataImport.length > 0) {
//             this.props.createDmQuocGiaByUpload(dataImport, () => {
//                 T.notify('Cập nhật thành công!', 'success');
//                 this.props.history.push('/user/danh-muc/quoc-gia');
//             });
//         }
//     }

//     render() {
//         const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
//             permissionWrite = currentPermissions.includes('dmQuocGia:write');
//         let table = null;
//         if (this.state.dmQuocGia && this.state.dmQuocGia.length > 0) {
//             table = (
//                 <table className='table table-hover table-bordered'>
//                     <thead>
//                         <tr>
//                             <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
//                             <th style={{ width: 'auto' }}>Mã</th>
//                             <th style={{ width: '50%' }} nowrap='true'>Tên quốc gia</th>
//                             <th style={{ width: 'auto' }} nowrap='true'>Code alpha</th>
//                             <th style={{ width: 'auto' }} nowrap='true'>Tên viết tắt</th>
//                             <th style={{ width: 'auto' }} nowrap='true'>Mã khu vực</th>
//                             <th style={{ width: '50%' }}>Tên khác</th>
//                             <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {this.state.dmQuocGia.map((item, index) => (
//                             <tr key={index}>
//                                 <td style={{ textAlign: 'right' }}>{index + 1}</td>
//                                 <td>{item.maCode}</td>
//                                 <td>
//                                     <a href='#' onClick={e => this.edit(e, item)}>{item.tenQuocGia}{item.country ? ` (${item.country})` : ''}</a>
//                                 </td>
//                                 <td>{item.codeAlpha}</td>
//                                 <td>{item.shortenName}</td>
//                                 <td>{item.maKhuVuc}</td>
//                                 <td>{item.tenKhac && item.tenKhac.length > 0 ? item.tenKhac.toString().replaceAll(',', ', ') : ''}</td>
//                                 <td style={{ textAlign: 'center' }}>
//                                     <div className='btn-group'>
//                                         <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
//                                             <i className='fa fa-lg fa-edit' />
//                                         </a>
//                                         {permissionWrite &&
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
//                     <h1><i className='fa fa-list-alt' /> Danh mục Quốc gia: Upload</h1>
//                 </div>
//                 <div style={{ marginTop: '2%' }} className='row tile'>
//                     <FileBox ref={this.fileBox} postUrl='/api/danh-muc/quoc-gia/upload' uploadType='DmQuocGiaFile' userData='dmQuocGiaImportData' style={{ width: '100%', backgroundColor: '#fdfdfd' }}
//                         success={this.onSuccess} ajax={true} />
//                 </div>

//                 {table ? <div style={{ marginTop: '2%' }} className='row tile'>{table}</div> : null}
//                 <EditModal dataChanges={this.updateTableData} ref={this.modal} readOnly={!permissionWrite} />
//                 <Link to='/user/danh-muc/quoc-gia/' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
//                     <i className='fa fa-lg fa-reply' />
//                 </Link>
//                 {permissionWrite && (
//                     <React.Fragment>
//                         <a href='/download/template/QuocGia.xlsx' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
//                             <i className='fa fa-download' />
//                         </a>
//                         <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
//                             <i className='fa fa-lg fa-save' />
//                         </button>
//                     </React.Fragment>)}
//             </main>
//         );
//     }
// }

// const mapStateToProps = state => ({ system: state.system, categoryRoom: state.categoryRoom, categoryBuilding: state.categoryBuilding });
// const mapActionsToProps = { getDmQuocGiaPage, deleteDmQuocGia, createDmQuocGia, updateDmQuocGia, createDmQuocGiaByUpload };
// export default connect(mapStateToProps, mapActionsToProps)(adminUploadPage);