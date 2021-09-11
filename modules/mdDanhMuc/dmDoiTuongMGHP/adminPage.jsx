import React from 'react';
import { connect } from 'react-redux';
import { getDmDoiTuongMghpAll, createDmDoiTuongMghp, updateDmDoiTuongMghp, deleteDmDoiTuongMghp } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    modal = React.createRef();
    state = { active: false }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmDoiTuongMghpMa').focus());
        });
    }

    show = (item) => {
        let { ma, ten, tiLe, kichHoat, moTa } = item ? item : { ma: null, ten: '', tiLe: '', kichHoat: 1, moTa: '' };
        $('#dmDoiTuongMghpMa').val(ma);
        $('#dmDoiTuongMghpTen').val(ten);
        $('#dmDoiTuongMghpMota').val(moTa);
        $('#dmDoiTuongMghpTile').val(tiLe);
        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật đối tượng miễn giảm học phí' : 'Tạo mới đối tượng miễn giảm học phí');
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const maDoiTuongMghp = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#dmDoiTuongMghpMa').val().trim(),
                ten: $('#dmDoiTuongMghpTen').val().trim(),
                moTa: $('#dmDoiTuongMghpMota').val().trim(),
                tiLe: $('#dmDoiTuongMghpTile').val().trim(),
                kichHoat: this.state.active ? 1 : 0,
            };
        if (changes.ma == '') {
            T.notify('Mã đối tượng bị trống!', 'danger');
            $('#dmDoiTuongMghpMa').focus();
        } else if (changes.ten == '') {
            T.notify('Tên đối tượng bị trống!', 'danger');
            $('#dmDoiTuongMghpTen').focus();
        } else if (changes.moTa == '') {
            T.notify('Tên đối tượng bị trống!', 'danger');
            $('#dmDoiTuongMghpMota').focus();
        } else if (changes.tiLe == '') {
            T.notify('Tỉ lệ bị trống!', 'danger');
            $('#dmDoiTuongMghpTile').focus();
        } else {
            if (maDoiTuongMghp) {
                this.props.update(maDoiTuongMghp, changes, () => {
                    T.notify('Cập nhật đối tượng thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            } else {
                this.props.create(changes, () => {
                    T.notify('Tạo mới đối tượng thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            }
        }
    };

    render() {
        const readOnly = this.props.readOnly;
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
                                <label htmlFor='dmDoiTuongMghpMa'>Mã</label>
                                <input className='form-control' id='dmDoiTuongMghpMa' placeholder='Mã' type='text' auto-focus='' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmDoiTuongMghpTen'>Tên</label>
                                <input className='form-control' id='dmDoiTuongMghpTen' placeholder='Tên' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmDoiTuongMghpMota'>Mô tả</label>
                                <input className='form-control' id='dmDoiTuongMghpMota' placeholder='Mô tả' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmDoiTuongMghpTile'>Tỉ lệ miễn giảm (%)</label>
                                <input className='form-control' id='dmDoiTuongMghpTile' placeholder='Tỉ lệ' type='number' min='0' step='1' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmDoiTuongMghpKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmChauKichHoat' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
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
        this.props.getDmDoiTuongMghpAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Đối tượng', 'Bạn có chắc bạn muốn xóa đối tượng này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmDoiTuongMghp(item.ma));
    };

    changeActive = item => this.props.updateDmDoiTuongMghp(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmDoiTuongMGHP:write'),
            permissionDelete = currentPermissions.includes('dmDoiTuongMGHP:delete');
        let table = 'Không có dữ liệu!',
            items = this.props.dmDoiTuongMghp && this.props.dmDoiTuongMghp.items;
        if (items && items.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                            <th style={{ width: '40%' }} nowrap='true'>Tên</th>
                            <th style={{ width: '60%' }} nowrap='true'>Mô tả</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Tỉ lệ miễn giảm (%)</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ma}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ten}</a></td>
                                <td>{item.moTa}</td>
                                <td style={{ textAlign: 'center' }}>{item.tiLe}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat == '1' ? true : false} onChange={() => permissionWrite && this.changeActive(item)} />
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Đối tượng miễn giảm học phí</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Đối tượng miễn giảm học phí
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDmDoiTuongMghp} update={this.props.updateDmDoiTuongMghp} />
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

const mapStateToProps = state => ({ system: state.system, dmDoiTuongMghp: state.dmDoiTuongMghp });
const mapActionsToProps = { getDmDoiTuongMghpAll, createDmDoiTuongMghp, updateDmDoiTuongMghp, deleteDmDoiTuongMghp };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);
