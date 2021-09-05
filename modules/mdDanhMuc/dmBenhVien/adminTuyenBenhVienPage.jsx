import React from 'react';
import { connect } from 'react-redux';
import { getDmTuyenBenhVienAll, createDmTuyenBenhVien, updateDmTuyenBenhVien, deleteDmTuyenBenhVien } from './reduxTuyenBenhVien';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    modal = React.createRef();
    state = { kichHoat: true, visible: true }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmTuyenBenhVienMa').focus());
        });
    }

    show = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: true };
        $('#dmTuyenBenhVienMa').val(ma);
        $('#dmTuyenBenhVienTen').val(ten);

        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật tuyến bệnh viện' : 'Tạo mới tuyến bệnh viện');
        this.setState({ kichHoat, visible: false });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const maTuyenBenhVien = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#dmTuyenBenhVienMa').val().trim(),
                ten: $('#dmTuyenBenhVienTen').val().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã tuyến bệnh viện bị trống!', 'danger');
            $('#dmTuyenBenhVienMa').focus();
        } else if ($('#dmTuyenBenhVienTen').val() == '') {
            T.notify('Tên tuyến bệnh viện bị trống!', 'danger');
            $('#dmTuyenBenhVienTen').focus();
        } else if (changes.ma.length != 2) {
            this.setState({ visible: true });
        } else {
            if (maTuyenBenhVien) {
                this.props.update(maTuyenBenhVien, changes);
            } else {
                this.props.create(changes);
            }
            $(this.modal.current).modal('hide');
        }
    };

    render() {
        const readOnly = this.props.readOnly;
        let help = this.state.visible ? <small id='maHelp' className='form-text text-muted'>Mã tuyến bệnh viện chỉ gồm 2 kí tự</small> : null;
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
                                <label htmlFor='dmTuyenBenhVienMa'>Mã tuyến bệnh viện</label>
                                <input className='form-control' id='dmTuyenBenhVienMa' placeholder='Mã tuyến bệnh viện' type='text' auto-focus='' readOnly={readOnly} />
                                {help}
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmTuyenBenhVienTen'>Tên tuyến bệnh viện</label>
                                <input className='form-control' id='dmTuyenBenhVienTen' placeholder='Tên tuyến bệnh viện' type='text' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmTuyenBenhVienKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmTuyenBenhVienKichHoat' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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

class dmTuyenBenhVienPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmTuyenBenhVienAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Tuyến bệnh viện', 'Bạn có chắc bạn muốn xóa tuyến bệnh viện này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmTuyenBenhVien(item.ma));
    };

    changeActive = item => this.props.updateDmTuyenBenhVien(item.ma, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmTuyenBenhVien:write'),
            permissionDelete = currentPermissions.includes('dmTuyenBenhVien:delete');
        let table = 'Không có dữ liệu!',
            items = this.props.dmTuyenBenhVien && this.props.dmTuyenBenhVien.items;
        if (items && items.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>Mã</th>
                            <th style={{ width: '100%' }}>Tên</th>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Tuyến bệnh viện</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Tuyến bệnh viện
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    create={this.props.createDmTuyenBenhVien} update={this.props.updateDmTuyenBenhVien} />
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

const mapStateToProps = state => ({ system: state.system, dmTuyenBenhVien: state.dmTuyenBenhVien });
const mapActionsToProps = { getDmTuyenBenhVienAll, createDmTuyenBenhVien, updateDmTuyenBenhVien, deleteDmTuyenBenhVien };
export default connect(mapStateToProps, mapActionsToProps)(dmTuyenBenhVienPage);