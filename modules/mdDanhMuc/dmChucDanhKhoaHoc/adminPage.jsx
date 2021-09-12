import React from 'react';
import { connect } from 'react-redux';
import { getDmChucDanhKhoaHocAll, deleteDmChucDanhKhoaHoc, createDmChucDanhKhoaHoc, updateDmChucDanhKhoaHoc } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { kichHoat: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmChucDanhKhoaHocMa').focus());
        }, 250));
    }

    show = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };
        $('#dmChucDanhKhoaHocMa').val(ma);
        $('#dmChucDanhKhoaHocTen').val(ten);
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-id', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ma: $('#dmChucDanhKhoaHocMa').val().trim(),
                ten: $('#dmChucDanhKhoaHocTen').val().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống');
            $('#dmChucDanhKhoaHocMa').focus();
        } else if (changes.ten == '') {
            T.notify('Tên danh mục bị trống');
            $('#dmChucDanhKhoaHocTen').focus();
        } else {
            if (ma) {
                this.props.updateDmChucDanhKhoaHoc(ma, changes);
            } else {
                this.props.createDmChucDanhKhoaHoc(changes);
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
                            <h5 className='modal-title'>Thông tin Danh mục chức danh khoa học</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmChucDanhKhoaHocMa'>Mã</label>
                                <input className='form-control' id='dmChucDanhKhoaHocMa' type='text' placeholder='Mã danh mục' maxLength={2} readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmChucDanhKhoaHocTen'>Tên</label>
                                <input className='form-control' id='dmChucDanhKhoaHocTen' type='text' placeholder='Tên' readOnly={readOnly} />
                            </div>
                            <div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
                                <label htmlFor='dmChucDanhKhoaHocActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmChucDanhKhoaHocActive' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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

class AdminPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmChucDanhKhoaHocAll();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmChucDanhKhoaHoc(item.ma, { kichHoat: Number(!item.kichHoat) });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa chức danh', 'Bạn có chắc bạn muốn xóa chức danh này?', true, isConfirm =>
            isConfirm && this.props.deleteDmChucDanhKhoaHoc(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmChucDanhKhoaHoc:write'),
            permissionDelete = currentPermissions.includes('dmChucDanhKhoaHoc:delete');
        let table = 'Không có danh sách!',
            items = this.props.dmChucDanhKhoaHoc && this.props.dmChucDanhKhoaHoc.items ? this.props.dmChucDanhKhoaHoc.items : [];
        if (items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
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
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ma}</a></td>
                                <td>{T.language.parse(item.ten, true).vi}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={() => permissionWrite && this.changeActive(item)} />
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Chức danh khoa học</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Chức danh khoa học
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    createDmChucDanhKhoaHoc={this.props.createDmChucDanhKhoaHoc} updateDmChucDanhKhoaHoc={this.props.updateDmChucDanhKhoaHoc} />
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

const mapStateToProps = state => ({ system: state.system, dmChucDanhKhoaHoc: state.dmChucDanhKhoaHoc });
const mapActionsToProps = { getDmChucDanhKhoaHocAll, deleteDmChucDanhKhoaHoc, createDmChucDanhKhoaHoc, updateDmChucDanhKhoaHoc };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);