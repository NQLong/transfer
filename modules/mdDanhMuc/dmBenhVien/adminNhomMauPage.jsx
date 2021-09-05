import React from 'react';
import { connect } from 'react-redux';
import { getDmNhomMauAll, createDmNhomMau, updateDmNhomMau, deleteDmNhomMau } from './reduxNhomMau';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    modal = React.createRef();
    state = { kichHoat: true, visible: true }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmNhomMauMa').focus());
        });
    }

    show = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: true };
        $('#dmNhomMauMa').val(ma);
        $('#dmNhomMauTen').val(ten);

        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật nhóm máu' : 'Tạo mới nhóm máu');
        this.setState({ kichHoat, visible: false });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const maNhomMau = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#dmNhomMauMa').val().trim(),
                ten: $('#dmNhomMauTen').val().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã nhóm máu bị trống!', 'danger');
            $('#dmNhomMauMa').focus();
        } else if ($('#dmNhomMauTen').val() == '') {
            T.notify('Tên nhóm máu bị trống!', 'danger');
            $('#dmNhomMauTen').focus();
        } else if (changes.ma.length != 2) {
            this.setState({ visible: true });
        } else {
            if (maNhomMau) {
                this.props.update(maNhomMau, changes);
            } else {
                this.props.create(changes);
            }
            $(this.modal.current).modal('hide');
        }
    };

    render() {
        const readOnly = this.props.readOnly;
        let help = this.state.visible ? <small id='maHelp' className='form-text text-muted'>Mã nhóm máu chỉ gồm 2 kí tự</small> : null;
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
                                <label htmlFor='dmNhomMauMa'>Mã nhóm máu</label>
                                <input className='form-control' id='dmNhomMauMa' placeholder='Mã nhóm máu' type='text' auto-focus='' readOnly={readOnly} />
                                {help}
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmNhomMauTen'>Tên nhóm máu</label>
                                <input className='form-control' id='dmNhomMauTen' placeholder='Tên nhóm máu' type='text' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmNhomMauKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmNhomMauKichHoat' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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

class dmNhomMauPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmNhomMauAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Nhóm máu', 'Bạn có chắc bạn muốn xóa nhóm máu này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmNhomMau(item.ma));
    };

    changeActive = item => this.props.updateDmNhomMau(item.ma, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmNhomMau:write'),
            permissionDelete = currentPermissions.includes('dmNhomMau:delete');
        let table = 'Không có dữ liệu!',
            items = this.props.dmNhomMau && this.props.dmNhomMau.items;
        if (items && items.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                            <th style={{ width: '100%' }} nowrap='true'>Tên</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ma}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ten}</a></td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={e => permissionWrite && this.changeActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group' style={{ display: 'flex' }}>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permissionDelete &&
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Nhóm máu</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Nhóm máu
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDmNhomMau} update={this.props.updateDmNhomMau} />
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmNhomMau: state.dmNhomMau });
const mapActionsToProps = { getDmNhomMauAll, createDmNhomMau, updateDmNhomMau, deleteDmNhomMau };
export default connect(mapStateToProps, mapActionsToProps)(dmNhomMauPage);