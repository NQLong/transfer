import React from 'react';
import { connect } from 'react-redux';
import { createDmLoaiDonVi, getDmLoaiDonViAll, updateDmLoaiDonVi, deleteDmLoaiDonVi } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { active: true };
    modal = React.createRef();
    editor = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmLoaiDonViMa').focus());
        }, 250));
    }

    show = (item) => {
        const { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: 0 };
        $('#dmLoaiDonViMa').val(ma);
        $('#dmLoaiDonViTen').val(ten);
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-id', ma).modal('show');
    }

    hide = () => $(this.modal.current).modal('hide');

    save = e => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ma: $('#dmLoaiDonViMa').val().trim(),
                ten: $('#dmLoaiDonViTen').val().trim(),
                kichHoat: this.state.active ? '1' : '0',
            };

        if (changes.ma == '') {
            T.notify('Mã loại đơn vị bị trống!', 'danger');
            $('#dmLoaiDonViMa').focus();
        } else if (changes.ten == '') {
            T.notify('Tên loại đơn vị bị trống!', 'danger');
            $('#dmLoaiDonViTen').focus();
        } else {
            if (ma) {
                this.props.updateDmLoaiDonVi(ma, changes);
            } else {
                this.props.createDmLoaiDonVi(changes);
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
                            <h5 className='modal-title'>Loại Đơn vị</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmLoaiDonViMa'>Mã Đơn vị</label>
                                <input className='form-control' id='dmLoaiDonViMa' type='number' placeholder='Mã Đơn vị' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmLoaiDonViTen'>Tên Loại Đơn vị</label>
                                <input className='form-control' id='dmLoaiDonViTen' type='text' placeholder='Tên Đơn vị' readOnly={readOnly} />
                            </div>
                            <div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
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
                            {!readOnly && <button type='submit' className='btn btn-success'>Lưu</button>}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DmLoaiDonViPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmLoaiDonViAll();
        T.ready('/user/dm-loai-don-vi');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmLoaiDonVi(item.ma, { ma: item.ma, kichHoat: item.kichHoat == 1 ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục loại đơn vị', 'Bạn có chắc bạn muốn xóa loại đơn vị này?', true, isConfirm =>
            isConfirm && this.props.deleteDmLoaiDonVi(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmLoaiDonVi:write'),
            permissionDelete = currentPermissions.includes('dmLoaiDonVi:delete');
        let table = 'Không có danh sách Loại đơn vị!',
            items = this.props.dmLoaiDonVi && this.props.dmLoaiDonVi.items ? this.props.dmLoaiDonVi.items : [];
        if (items && items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                            <th style={{ width: '100%' }}>Tên đơn vị</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}><a href='#' onClick={e => this.edit(e, item)}>{item.ma}</a></td>
                                <td>{item.ten}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat == '1' ? true : false} onChange={() => permissionWrite && this.changeActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permissionDelete &&
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-trash-o fa-lg'></i>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Loại đơn vị</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Loại đơn vị
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    createDmLoaiDonVi={this.props.createDmLoaiDonVi} updateDmLoaiDonVi={this.props.updateDmLoaiDonVi} />
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

const mapStateToProps = state => ({ system: state.system, dmLoaiDonVi: state.dmLoaiDonVi });
const mapActionsToProps = { getDmLoaiDonViAll, createDmLoaiDonVi, updateDmLoaiDonVi, deleteDmLoaiDonVi };
export default connect(mapStateToProps, mapActionsToProps)(DmLoaiDonViPage);