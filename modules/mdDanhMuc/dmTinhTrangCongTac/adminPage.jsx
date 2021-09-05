import React from 'react';
import { connect } from 'react-redux';
import { getDmTinhTrangCongTacAll, createDmTinhTrangCongTac, updateDmTinhTrangCongTac, deleteDmTinhTrangCongTac } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    modal = React.createRef();
    state = { kichHoat: true }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmTinhTrangCongTacTen').focus());
        });
    }

    show = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: true };
        $('#dmTinhTrangCongTacTen').val(ten);

        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật tình trạng công tác' : 'Tạo mới tình trạng công tác');
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-ma'),
            changes = {
                ten: $('#dmTinhTrangCongTacTen').val().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if ($('#dmTinhTrangCongTacTen').val() == '') {
            T.notify('Tên tình trạng công tác bị trống!', 'danger');
            $('#dmTinhTrangCongTacTen').focus();
        } else {
            if (ma) {
                this.props.update(ma, changes);
            } else {
                this.props.create(changes);
            }
            $(this.modal.current).modal('hide');
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
                                <label htmlFor='dmTinhTrangCongTacTen'>Tên tình trạng công tác</label>
                                <input className='form-control' id='dmTinhTrangCongTacTen' placeholder='Tên tình trạng công tác' type='text' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmTinhTrangCongTacKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmTinhTrangCongTacKichHoat' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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

class dmTinhTrangCongTacPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmTinhTrangCongTacAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Tình trạng công tác', 'Bạn có chắc bạn muốn xóa tình trạng công tác này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmTinhTrangCongTac(item.ma));
    };

    changeActive = item => this.props.updateDmTinhTrangCongTac(item.ma, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmTinhTrangCongTac:write'),
            permissionDelete = currentPermissions.includes('dmTinhTrangCongTac:delete');
        let table = 'Không có dữ liệu!',
            items = this.props.dmTinhTrangCongTac && this.props.dmTinhTrangCongTac.items;
        if (items && items.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }} nowrap='true'>Tên tình trạng công tác</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ten}</a></td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={() => permissionWrite && this.changeActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group' style={{ display: 'flex', justifyContent: 'center' }}>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Tình trạng công tác</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Tình trạng công tác
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDmTinhTrangCongTac} update={this.props.updateDmTinhTrangCongTac} />
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

const mapStateToProps = state => ({ system: state.system, dmTinhTrangCongTac: state.dmTinhTrangCongTac });
const mapActionsToProps = { getDmTinhTrangCongTacAll, createDmTinhTrangCongTac, updateDmTinhTrangCongTac, deleteDmTinhTrangCongTac };
export default connect(mapStateToProps, mapActionsToProps)(dmTinhTrangCongTacPage);