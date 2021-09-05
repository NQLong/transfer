import React from 'react';
import { connect } from 'react-redux';
import { createDmDoiTuongCanBo, getDmDoiTuongCanBoAll, updateDmDoiTuongCanBo, deleteDmDoiTuongCanBo } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { active: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmDoiTuongCanBoMa').focus());
        }, 250));
    }

    show = (item) => {
        const { ma, ten, kichHoat, ghiChu } = item ? item : { ma: null, ten: '', kichHoat: 1, ghiChu: '' };
        $('#dmDoiTuongCanBoMa').val(ma);
        $('#dmDoiTuongCanBoTen').val(ten);
        $('#dmDoiTuongCanBoGhiChu').val(ghiChu);
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-id', ma).modal('show');
    }

    hide = () => $(this.modal.current).modal('hide')

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ten: $('#dmDoiTuongCanBoTen').val().trim(),
                ma: $('#dmDoiTuongCanBoMa').val().trim(),
                ghiChu: $('#dmDoiTuongCanBoGhiChu').val(),
                kichHoat: this.state.active ? 1 : 0,
            };

        if (changes.ten == '') {
            T.notify('Tên đối tượng cán bộ bị trống!', 'danger');
            $('#dmDoiTuongCanBoTen').focus();
        } else {
            if (ma) {
                this.props.updateDmDoiTuongCanBo(ma, changes);
            } else {
                this.props.createDmDoiTuongCanBo(changes);
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
                            <h5 className='modal-title'>Đối tượng cán bộ</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmDoiTuongCanBoMa'>Mã Đối tượng cán bộ</label>
                                <input className='form-control' id='dmDoiTuongCanBoMa' type='text' placeholder='Mã Đối tượng cán bộ' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmDoiTuongCanBoTen'>Tên đối tượng cán bộ</label>
                                <input className='form-control' id='dmDoiTuongCanBoTen' type='text' placeholder='Tên Đối tượng cán bộ' readOnly={readOnly} />
                            </div>
                            <div className='form-group' style={{ margin: 0 }}>
                                <label>Ghi chú</label>
                                <textarea className='form-control' id='dmDoiTuongCanBoGhiChu' style={{ minHeight: 40 }} placeholder='Ghi chú' readOnly={readOnly} />
                            </div>
                            <div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
                                <label htmlFor='dmDoiTuongCanBoKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmDoiTuongCanBoKichHoat' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
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
        this.props.getDmDoiTuongCanBoAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmDoiTuongCanBo(item.ma, { ma: item.ma, kichHoat: item.kichHoat == '1' ? '0' : '1' });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục đối tượng cán bộ', 'Bạn có chắc bạn muốn xóa đối tượng cán bộ này?', true, isConfirm =>
            isConfirm && this.props.deleteDmDoiTuongCanBo(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmDoiTuongCanBo:write'),
            permissionDelete = currentPermissions.includes('dmDoiTuongCanBo:delete');
        let table = 'Không có danh sách đối tượng cán bộ!',
            items = this.props.dmDoiTuongCanBo && this.props.dmDoiTuongCanBo.items ? this.props.dmDoiTuongCanBo.items : [];
        if (items && items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                            <th style={{ width: 'auto' }}>Tên</th>
                            <th style={{ width: '100%' }}>Ghi chú</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{item.ma}</td>
                                <td nowrap='true'><a href='#' onClick={e => this.edit(e, item)}>{item.ten}</a></td>
                                <td>{item.ghiChu}</td>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Đối tượng cán bộ</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Đối tượng cán bộ
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    createDmDoiTuongCanBo={this.props.createDmDoiTuongCanBo} updateDmDoiTuongCanBo={this.props.updateDmDoiTuongCanBo} />
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmDoiTuongCanBo: state.dmDoiTuongCanBo });
const mapActionsToProps = { getDmDoiTuongCanBoAll, createDmDoiTuongCanBo, updateDmDoiTuongCanBo, deleteDmDoiTuongCanBo };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);