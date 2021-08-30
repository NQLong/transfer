import React from 'react';
import { connect } from 'react-redux';
import { getDmNghiCongTacAll, createDmNghiCongTac, updateDmNghiCongTac, deleteDmNghiCongTac } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    modal = React.createRef();
    state = { active: false }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmNghiCongTacMa').focus());
        })
    }

    show = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: null, moTa: '', kichHoat: 1 };
        $('#dmNghiCongTacMa').val(ma);
        $('#dmNghiCongTacMoTa').val(moTa);
        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật nghỉ công tác' : 'Tạo mới nghỉ công tác');
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const maNghiCongTac = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#dmNghiCongTacMa').val().trim(),
                moTa: $('#dmNghiCongTacMoTa').val().trim(),
                kichHoat: this.state.active ? 1 : 0,
            };
        if (changes.ma == '') {
            T.notify('Mã nghỉ công tác bị trống!', 'danger');
            $('#dmNghiCongTacMa').focus();
        } else if (changes.tenQuocGia == '') {
            T.notify('Mô tả nghỉ công tác bị trống!', 'danger');
            $('#dmNghiCongTacMoTa').focus();
        } else {
            if (maNghiCongTac) {
                if (typeof this.state.ImportIndex == 'number') changes.ImportIndex = this.state.ImportIndex;
                this.props.update(maNghiCongTac, changes, () => {
                    T.notify('Cập nhật nghỉ công tác thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            } else {
                this.props.create(changes, () => {
                    T.notify('Tạo mới nghỉ công tác thành công!', 'success');
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
                                <label htmlFor='dmNghiCongTacMa'>Mã nghỉ công tác</label>
                                <input className='form-control' id='dmNghiCongTacMa' placeholder='Mã nghỉ công tác' type='text' auto-focus='' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmNghiCongTacMoTa'>Mô tả</label>
                                <input className='form-control' id='dmNghiCongTacMoTa' placeholder='Mô tả' type='text' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
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
        )
    }
}

class AdminPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmNghiCongTacAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Nghỉ công tác', 'Bạn có chắc bạn muốn xóa nghỉ công tác này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmNghiCongTac(item.ma));
    };

    changeActive = item => this.props.updateDmNghiCongTac(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmNghiCongTac:write'),
            permissionDelete = currentPermissions.includes('dmNghiCongTac:delete');
        let table = 'Không có dữ liệu!',
            items = this.props.dmNghiCongTac && this.props.dmNghiCongTac.items;
        if (items && items.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                            <th style={{ width: '100%' }} nowrap='true'>Mô tả</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'center' }}><a href='#' onClick={e => this.edit(e, item)}>{item.ma}</a></td>
                                <td>{item.moTa}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat == '1' ? true : false} onChange={e => permissionWrite && this.changeActive(item)} />
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Nghỉ công tác</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Nghỉ công tác
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    create={this.props.createDmNghiCongTac} update={this.props.updateDmNghiCongTac} />
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmNghiCongTac: state.dmNghiCongTac });
const mapActionsToProps = { getDmNghiCongTacAll, createDmNghiCongTac, updateDmNghiCongTac, deleteDmNghiCongTac };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);
