import React from 'react';
import { connect } from 'react-redux';
import { getDmLoaiVienChucAll, updateDmLoaiVienChuc, createDmLoaiVienChuc, deleteDmLoaiVienChuc } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { active: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmLoaiVienChucMa').focus());
        }, 250));
    }

    show = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: '', moTa: '', kichHoat: true };
        $('#dmLoaiVienChucMa').val(ma);
        $('#dmLoaiVienChucMota').val(moTa);
        this.setState({ active: kichHoat == 1 });
        $(this.modal.current).attr('data-id', ma).modal('show');
    }

    hide = () => $(this.modal.current).modal('hide');

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ma: $('#dmLoaiVienChucMa').val().trim(),
                moTa: $('#dmLoaiVienChucMota').val().trim(),
                kichHoat: this.state.active ? 1 : 0,
            }
        if (changes.ma == '') {
            T.notify('Mã bị trống!', 'danger');
            $('#dmLoaiVienChucMa').focus();
        } else {
            if (ma) {
                this.props.updateDmLoaiVienChuc(ma, changes);
            } else {
                this.props.createDmLoaiVienChuc(changes);
            }
            $(this.modal.current).modal('hide');
        }
        e.preventDefault();
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin loại viên chức</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmLoaiVienChucMa'>Mã loại viên chức</label>
                                <input className='form-control' id='dmLoaiVienChucMa' type='text' placeholder='Mã loại viên chức' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmLoaiVienChucMota'>Mô tả</label>
                                <input className='form-control' id='dmLoaiVienChucMota' type='text' placeholder='Mô tả' readOnly={readOnly} />
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

class AdminPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmLoaiVienChucAll();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmLoaiVienChuc(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa loại viên chức', 'Bạn có chắc bạn muốn xóa loại viên chức này?', true, isConfirm =>
            isConfirm && this.props.deleteDmLoaiVienChuc(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmLoaiVienChuc:write'),
            permissionDelete = currentPermissions.includes('dmLoaiVienChuc:delete');
        let table = 'Không có loại viên chức!',
            items = this.props.dmLoaiVienChuc && this.props.dmLoaiVienChuc.items ? this.props.dmLoaiVienChuc.items : [];
        if (items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã </th>
                            <th style={{ width: '100%' }}>Mô tả</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <a href='#' onClick={e => this.edit(e, item)}>{item.ma}</a>
                                </td>
                                <td>{item.moTa}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={e => permissionWrite && this.changeActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {!permissionDelete ? null :
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Loại viên chức</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Loại viên chức
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    createDmLoaiVienChuc={this.props.createDmLoaiVienChuc} updateDmLoaiVienChuc={this.props.updateDmLoaiVienChuc} />
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmLoaiVienChuc: state.dmLoaiVienChuc });
const mapActionsToProps = { getDmLoaiVienChucAll, updateDmLoaiVienChuc, createDmLoaiVienChuc, deleteDmLoaiVienChuc };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);