import React from 'react';
import { connect } from 'react-redux';
import { createDmNgoaiNgu, getDmNgoaiNguAll, updateDmNgoaiNgu, deleteDmNgoaiNgu } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { active: true, kichHoat: true };
    modal = React.createRef();

    show = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: false };
        $('#ma').val(ma);
        $('#ten').val(ten);
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-id', ma).modal('show');
    }

    hide = () => $(this.modal.current).modal('hide');

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ma: $('#ma').val(),
                ten: $('#ten').val(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã ngoại ngữ bị trống!', 'danger');
            $('#ma').focus();
        } else {
            if (ma) {
                this.props.updateDmNgoaiNgu(ma, changes);
            } else {
                this.props.createDmNgoaiNgu(changes);
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
                            <h5 className='modal-title'>Danh mục Ngoại ngữ</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label className='control-label'>Mã ngoại ngữ</label>
                                <input className='form-control' type='text' placeholder='Mã ngoại ngữ' id='ma' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label className='control-label'>Tên ngoại ngữ</label>
                                <input className='form-control' type='text' placeholder='Tên ngoại ngữ' id='ten' readOnly={readOnly} />
                            </div>
                            <div className='form-group' style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmNgoaiNguKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmNgoaiNguKichHoat' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
                                        <span className='button-indecator' readOnly={readOnly} />
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
        this.props.getDmNgoaiNguAll();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeRead = (item) => this.props.updateDmNgoaiNgu(item.ma, { read: !item.read });

    delete = (e, item) => {
        T.confirm('Xóa thông tin', 'Bạn có chắc bạn muốn xóa ngoại ngữ này?', true, isConfirm => isConfirm && this.props.deleteDmNgoaiNgu(item.ma));
        e.preventDefault();
    }

    changeKichHoat = item => this.props.updateDmNgoaiNgu(item.ma, { kichHoat: Number(!item.kichHoat) })

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmNgoaiNgu:write'),
            notDelete = !currentPermissions.includes('dmNgoaiNgu:delete');
        let table = 'Không có ngoại ngữ!',
            items = this.props.dmNgoaiNgu && this.props.dmNgoaiNgu.items;
        if (items && items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                            <th style={{ width: '100%' }}>Tên ngoại ngữ</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ma}</td>
                                <td nowrap='true'><a href='#' onClick={e => this.edit(e, item)}>{item.ten ? item.ten : ''}</a></td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={e => permissionWrite && this.changeKichHoat(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {notDelete ? null :
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Ngoại ngữ</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Ngoại ngữ
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                {permissionWrite &&
                    (<button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>)}
                <EditModal ref={this.modal} readOnly={!permissionWrite} createDmNgoaiNgu={this.props.createDmNgoaiNgu} updateDmNgoaiNgu={this.props.updateDmNgoaiNgu} />
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmNgoaiNgu: state.dmNgoaiNgu });
const mapActionsToProps = { createDmNgoaiNgu, getDmNgoaiNguAll, updateDmNgoaiNgu, deleteDmNgoaiNgu };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);