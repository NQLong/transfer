import React from 'react';
import { connect } from 'react-redux';
import { getDmGioiTinhAll, createDmGioiTinh, updateDmGioiTinh, deleteDmGioiTinh } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    modal = React.createRef();
    state = { kichHoat: true, visible: false }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmGioiTinhMa').focus());
        })
    }

    show = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: true };
        ten = T.language.parse(ten, true);
        $('#dmGioiTinhMa').val(ma);
        $('#dmGioiTinhTen').val(ten.vi);
        $('#dmGioiTinhTenTiengAnh').val(ten.en);
        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật giới tính' : 'Tạo mới giới tính');
        this.setState({ kichHoat, visible: false });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const maGioiTinh = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#dmGioiTinhMa').val().trim(),
                ten: JSON.stringify({ vi: $('#dmGioiTinhTen').val().trim(), en: $('#dmGioiTinhTenTiengAnh').val().trim() }),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã giới tính bị trống!', 'danger');
            $('#dmGioiTinhMa').focus();
        } else if ($('#dmGioiTinhTen').val() == '') {
            T.notify('Tên giới tính bị trống!', 'danger');
            $('#dmGioiTinhTen').focus();
        } else if ($('#dmGioiTinhTenTiengAnh').val() == '') {
            T.notify('Tên giới tính tiếng Anh bị trống!', 'danger');
            $('#dmGioiTinhTenTiengAnh').focus();
        } else if (changes.ma.length != 2) {
            this.setState({ visible: true })
        } else {
            if (maGioiTinh) {
                this.props.update(maGioiTinh, changes);
            } else {
                this.props.create(changes);
            }
            $(this.modal.current).modal('hide');
        }
    };

    render() {
        const readOnly = this.props.readOnly;
        let help = this.state.visible ? <small id='maHelp' class='form-text text-muted'>Mã giới tính chỉ gồm 2 kí tự</small> : null;
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
                                <label htmlFor='dmGioiTinhMa'>Mã giới tính</label>
                                <input className='form-control' id='dmGioiTinhMa' placeholder='Mã giới tính' type='text' auto-focus='' readOnly={readOnly} />
                                {help}
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmGioiTinhTen'>Tên giới tính</label>
                                <input className='form-control' id='dmGioiTinhTen' placeholder='Tên giới tính' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmGioiTinhTenTiengAnh'>Tên giới tính tiếng Anh</label>
                                <input className='form-control' id='dmGioiTinhTenTiengAnh' placeholder='Tên giới tính tiếng Anh' type='text' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmGioiTinhKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmGioiTinhKichHoat' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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
        )
    }
}

class dmGioiTinhPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmGioiTinhAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Giới tính', 'Bạn có chắc bạn muốn xóa giới tính này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmGioiTinh(item.ma));
    };

    changeActive = item => this.props.updateDmGioiTinh(item.ma, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmGioiTinh:write'),
            permissionDelete = currentPermissions.includes('dmGioiTinh:delete');
        let table = 'Không có dữ liệu!',
            items = this.props.dmGioiTinh && this.props.dmGioiTinh.items;
        if (items && items.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>Mã</th>
                            <th style={{ width: '50%' }}>Tên</th>
                            <th style={{ width: '50%' }} nowrap='true'>Tên tiếng Anh</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'center' }}><a href='#' onClick={e => this.edit(e, item)}>{item.ma}</a></td>
                                <td>{T.language.parse(item.ten, true).vi}</td>
                                <td>{T.language.parse(item.ten, true).en}</td>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Giới tính</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Giới tính
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDmGioiTinh} update={this.props.updateDmGioiTinh} />
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmGioiTinh: state.dmGioiTinh });
const mapActionsToProps = { getDmGioiTinhAll, createDmGioiTinh, updateDmGioiTinh, deleteDmGioiTinh };
export default connect(mapStateToProps, mapActionsToProps)(dmGioiTinhPage);