import React from 'react';
import { connect } from 'react-redux';
import { getDmTaiKhoanKeToanPage, deleteDmTaiKhoanKeToan, createDmTaiKhoanKeToan, updateDmTaiKhoanKeToan, createDmTaiKhoanKeToanByUpload } from './redux';
import FileBox from 'view/component/FileBox';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        $(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmtkktMaTaiKhoanKeToan').trigger('focus'));
        }, 250));
    }

    show = (item) => {
        let { ma, tenTaiKhoan } = item ? item : { ma: '', tenTaiKhoan: '' };
        $('#dmtkktMaTaiKhoanKeToan').val(ma);
        $('#dmtkktTenTaiKhoanKeToan').val(tenTaiKhoan);

        $(this.modal.current).attr('data-id', ma).modal('show');
    }

    hide = () => $(this.modal.current).modal('hide')

    save = e => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ma: $('#dmtkktMaTaiKhoanKeToan').val().trim().toUpperCase(),
                tenTaiKhoan: $('#dmtkktTenTaiKhoanKeToan').val().trim(),
            }

        if (changes.ma == '') {
            T.notify('Mã Tài Khoản bị trống!', 'danger');
            $('#dmtkktMaTaiKhoanKeToan').trigger('focus');
        } else if (changes.tenTaiKhoan == '') {
            T.notify('Tên Tài Khoản bị trống!', 'danger');
            $('#dmtkktTenTaiKhoanKeToan').trigger('focus');
        } else {
            let dataChanges = {
                changes, ma
            }
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
                            <h5 className='modal-title'>Tài Khoản Kế Toán</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group row'>
                                <div className='col-12 col-sm-4'>
                                    <label htmlFor='dmtkktMaTaiKhoanKeToan'>Mã Tài Khoản</label>
                                    <input className='form-control' id='dmtkktMaTaiKhoanKeToan' type='text' placeholder='Mã Tài Khoản Kế Toán' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className='col-12 col-sm-4'>
                                    <label htmlFor='dmtkktTenTaiKhoanKeToan'>Tên Tài Khoản</label>
                                    <input className='form-control' id='dmtkktTenTaiKhoanKeToan' type='text' placeholder='Tên Tài Khoản Kế Toán' readOnly={readOnly} />
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

class adminUploadPage extends React.Component {
    modal = React.createRef();
    state = { dmTaiKhoanKeToan: [] };

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
        T.confirm('Xóa danh mục Tài Khoản Kế Toán', 'Bạn có chắc bạn muốn xóa Tài Khoản Kế Toán này?', true, isConfirm =>
            isConfirm && this.setState(state => {
                state.dmTaiKhoanKeToan.forEach((data, index) => {
                    if (data.ma == item.ma) {
                        indexDelete = index;
                    }
                })
                state.dmTaiKhoanKeToan.splice(indexDelete, 1);
                return state;
            }));
    }

    updateTableData = (dataEditModal) => {
        this.setState((state, props) => {
            state.dmTaiKhoanKeToan.forEach(data => {
                if (data.ma == dataEditModal.changes.ma) {
                    data.tenTaiKhoan = dataEditModal.changes.tenTaiKhoan;
                }
            })
            return state;
        });
    }

    onSuccess = (data) => {
        this.setState({ dmTaiKhoanKeToan: data.dmTaiKhoanKeToan });
    }

    save = () => {
        let dataImport = this.state.dmTaiKhoanKeToan;
        if (dataImport && dataImport.length > 0) {
            this.props.createDmTaiKhoanKeToanByUpload(dataImport, () => {
                T.notify('Cập nhật thành công!', 'success');
                this.props.history.push('/user/danh-muc/tai-khoan-ke-toan');
            });
        }
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmTaiKhoanKeToan:write');
        let table = null;
        if (this.state.dmTaiKhoanKeToan && this.state.dmTaiKhoanKeToan.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: 'auto' }}>Mã</th>
                            <th style={{ width: '50%' }} nowrap='true'>Tên Tài Khoản</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.dmTaiKhoanKeToan.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>{item.ma}</td>
                                <td>
                                    <a href='#' onClick={e => this.edit(e, item)}>{item.tenTaiKhoan}</a>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permissionWrite &&
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-trash-o fa-lg' />
                                            </a>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Tài Khoản Kế Toán: Upload</h1>
                </div>
                <div style={{ marginTop: '2%' }} className='row tile'>
                    <FileBox ref={this.fileBox} postUrl='/api/danh-muc/tai-khoan-ke-toan/upload' uploadType='DmTaiKhoanKeToanFile' userData='dmTaiKhoanKeToanImportData' style={{ width: '100%', backgroundColor: '#fdfdfd' }}
                        success={this.onSuccess} ajax={true} />
                </div>

                {table ? <div style={{ marginTop: '2%' }} className='row tile'>{table}</div> : null}
                <EditModal dataChanges={this.updateTableData} ref={this.modal} readOnly={!permissionWrite} />
                <Link to='/user/danh-muc/tai-khoan-ke-toan/' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {permissionWrite && (
                    <React.Fragment>
                        <a href='/download/template/TaiKhoanKeToan.xlsx' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
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
const mapActionsToProps = { getDmTaiKhoanKeToanPage, deleteDmTaiKhoanKeToan, createDmTaiKhoanKeToan, updateDmTaiKhoanKeToan, createDmTaiKhoanKeToanByUpload };
export default connect(mapStateToProps, mapActionsToProps)(adminUploadPage);