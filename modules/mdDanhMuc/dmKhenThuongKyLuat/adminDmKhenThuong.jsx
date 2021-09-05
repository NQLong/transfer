import React from 'react';
import { connect } from 'react-redux';
import { createDmKhenThuong, getDmKhenThuongAll, updateDmKhenThuong, deleteDmKhenThuong } from './reduxKhenThuong';
import { Link } from 'react-router-dom';
class EditModal extends React.Component {
    state = { active: true };
    modal = React.createRef();
    editor = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmKhenThuongMa').focus());
        }, 250));
    }

    show = (item) => {
        const { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: 0 };
        $('#dmKhenThuongMa').val(ma);
        $('#dmKhenThuongTen').val(ten);
        this.setState({ active: kichHoat == '1' });

        $(this.modal.current).attr('data-id', ma).modal('show');
    }

    hide = () => $(this.modal.current).modal('hide')

    save = (e) => {
        e.preventDefault();
        const _id = $(this.modal.current).attr('data-id'),
            changes = {
                ten: $('#dmKhenThuongTen').val().trim(),
                ma: $('#dmKhenThuongMa').val().trim(),
                kichHoat: this.state.active ? '1' : '0',
            };

        if (changes.ten == '') {
            T.notify('Tên khen thưởng bị trống!', 'danger');
            $('#dmKhenThuongTen').focus();
        } else {
            if (_id) {
                this.props.updateDmKhenThuong(_id, changes);
            } else {
                this.props.createDmKhenThuong(changes);
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
                            <h5 className='modal-title'>Khen thưởng</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmKhenThuongMa'>Mã Khen Thưởng</label>
                                <input className='form-control' id='dmKhenThuongMa' type='number' placeholder='Mã Khen Thưởng' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmKhenThuongTen'>Tên khen thưởng</label>
                                <input className='form-control' id='dmKhenThuongTen' type='text' placeholder='Tên Khen Thưởng' readOnly={readOnly} />
                            </div>
                            <div className='form-group' style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
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
                            {!readOnly && <button type='submit' className='btn btn-primary'>Lưu</button>}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DmKhenThuongPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmKhenThuongAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmKhenThuong(item.ma, { ma: item.ma, kichHoat: item.kichHoat == '1' ? '0' : '1' });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục khen thưởng', 'Bạn có chắc bạn muốn xóa khen thưởng này?', true, isConfirm =>
            isConfirm && this.props.deleteDmKhenThuong(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmKhenThuong:write'),
            permissionDelete = currentPermissions.includes('dmKhenThuong:delete');
        let table = 'Không có danh sách khen thưởng!',
            items = this.props.dmKhenThuong && this.props.dmKhenThuong.items ? this.props.dmKhenThuong.items : [];
        if (items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                            <th style={{ width: '100%' }}>Tên Khen Thưởng</th>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Khen thưởng</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Khen thưởng
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    createDmKhenThuong={this.props.createDmKhenThuong} updateDmKhenThuong={this.props.updateDmKhenThuong} />
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

const mapStateToProps = state => ({ system: state.system, dmKhenThuong: state.dmKhenThuong });
const mapActionsToProps = { getDmKhenThuongAll, createDmKhenThuong, updateDmKhenThuong, deleteDmKhenThuong };
export default connect(mapStateToProps, mapActionsToProps)(DmKhenThuongPage);