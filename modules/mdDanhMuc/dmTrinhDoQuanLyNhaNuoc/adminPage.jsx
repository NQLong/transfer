import React from 'react';
import { connect } from 'react-redux';
import { createDmTrinhDoQuanLyNhaNuoc, deleteDmTrinhDoQuanLyNhaNuoc, updateDmTrinhDoQuanLyNhaNuoc, getDmTrinhDoQuanLyNhaNuocPage } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { active: 0 };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#trinhDoMa').focus());
        }, 250));
    }

    show = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: 1 };
        $('#trinhDoMa').val(ma);
        $('#trinhDoTen').val(ten);
        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật trình độ quản lý nhà nước' : 'Tạo mới trình độ quản lý nhà nước');
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-ma', ma).modal('show');
        $(this.modal.current).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const trinhDoMa = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#trinhDoMa').val().trim(),
                ten: $('#trinhDoTen').val().trim(),
                kichHoat: this.state.active ? 1 : 0,
            };
        if (changes.ma == '') {
            T.notify('Mã trình độ bị trống!', 'danger');
            $('#trinhDoMa').focus();
        } else if (changes.ten == '') {
            T.notify('Tên trình độ bị trống!', 'danger');
            $('#trinhDoTen').focus();
        } else {
            if (trinhDoMa) {
                this.props.update(trinhDoMa, changes, () => {
                    $(this.modal.current).modal('hide');
                });
            } else {
                this.props.create(changes, () => {
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
                                <label htmlFor='trinhDoMa'>Mã trình độ</label>
                                <input className='form-control' id='trinhDoMa' placeholder='Mã trình độ' type='text' auto-focus='' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='trinhDoTen'>Tên trình độ</label>
                                <input className='form-control' id='trinhDoTen' placeholder='Tên trình độ' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group' style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmQuanLyNhaNuocKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmQuanLyNhaNuocKichHoat' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
                                        <span className='button-indecator' />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly && <button type='submit' className='btn btn-primary' onClick={this.save}>Lưu</button>}
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
        this.props.getDmTrinhDoQuanLyNhaNuocPage();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmTrinhDoQuanLyNhaNuoc(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    delete = (e, item) => {
        T.confirm('Xóa trình độ quản lý nhà nước', `Bạn có chắc bạn muốn xóa trình độ ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmTrinhDoQuanLyNhaNuoc(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá trình độ ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá trình độ ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmTrinhDoQuanLyNhaNuoc:write'),
            permissionDelete = currentPermissions.includes('dmTrinhDoQuanLyNhaNuoc:delete');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.dmTrinhDoQuanLyNhaNuoc && this.props.dmTrinhDoQuanLyNhaNuoc.page ?
            this.props.dmTrinhDoQuanLyNhaNuoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = 'Danh mục trình độ quản lý nhà nước trống!';
        if (this.props.dmTrinhDoQuanLyNhaNuoc && this.props.dmTrinhDoQuanLyNhaNuoc.page && this.props.dmTrinhDoQuanLyNhaNuoc.page.list && this.props.dmTrinhDoQuanLyNhaNuoc.page.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <td style={{ width: 'auto' }}>Mã</td>
                            <td style={{ width: '100%' }}>Tên</td>
                            <td style={{ width: 'auto' }} nowrap='true'>Kích hoạt</td>
                            <td style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.dmTrinhDoQuanLyNhaNuoc.page.list.map((item) => (
                            <tr key={item.ma}>
                                <td>{item.ma}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ten}</a></td>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Trình độ Quản lý nhà nước</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Trình độ quản lý nhà nước
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    create={this.props.createDmTrinhDoQuanLyNhaNuoc} update={this.props.updateDmTrinhDoQuanLyNhaNuoc} />
                <Pagination name='pageDmTrinhDoQuanLyNhaNuoc' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getDmTrinhDoQuanLyNhaNuocPage} />
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

const mapStateToProps = state => ({ system: state.system, dmTrinhDoQuanLyNhaNuoc: state.dmTrinhDoQuanLyNhaNuoc });
const mapActionsToProps = { createDmTrinhDoQuanLyNhaNuoc, deleteDmTrinhDoQuanLyNhaNuoc, updateDmTrinhDoQuanLyNhaNuoc, getDmTrinhDoQuanLyNhaNuocPage };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);