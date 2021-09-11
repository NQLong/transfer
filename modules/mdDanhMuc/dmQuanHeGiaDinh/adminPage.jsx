import React from 'react';
import { connect } from 'react-redux';
import { getDmQuanHeGiaDinhPage, createDmQuanHeGiaDinh, updateDmQuanHeGiaDinh, deleteDmQuanHeGiaDinh } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    modal = React.createRef();
    state = { kichHoat: true, visible: false };

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmQuanHeGiaDinhMa').focus());
        });
    }

    show = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: 1 };
        $('#dmQuanHeGiaDinhMa').val(ma);
        $('#dmQuanHeGiaDinhTen').val(ten);
        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật quan hệ gia đình' : 'Tạo mới quan hệ gia đình');
        this.setState({ kichHoat, visible: false });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const maDmQuanHeGiaDinh = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#dmQuanHeGiaDinhMa').val().trim(),
                ten: $('#dmQuanHeGiaDinhTen').val().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã quan hệ gia đình sách bị trống!', 'danger');
            $('#dmQuanHeGiaDinhMa').focus();
        } else if (changes.ten == '') {
            T.notify('Tên quan hệ gia đình bị trống!', 'danger');
            $('#dmQuanHeGiaDinhTen').focus();
        } else if (changes.ma.length != 2) {
            this.setState({ visible: true });
        } else {
            if (maDmQuanHeGiaDinh) {
                this.props.update(maDmQuanHeGiaDinh, changes);
            } else {
                this.props.create(changes);
            }
            $(this.modal.current).modal('hide');
        }
    };

    render() {
        const readOnly = this.props.readOnly;
        let help = this.state.visible ? <small id='maHelp' className='form-text text-muted'>Mã quan hệ gia đình chỉ gồm 2 kí tự</small> : null;
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
                                <label htmlFor='dmQuanHeGiaDinhMa'>Mã quan hệ gia đình</label>
                                <input className='form-control' id='dmQuanHeGiaDinhMa' placeholder='Mã quan hệ gia đình' type='text' auto-focus='' readOnly={readOnly} />
                                {help}
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmQuanHeGiaDinhTen'>Tên quan hệ gia đình</label>
                                <input className='form-control' id='dmQuanHeGiaDinhTen' placeholder='Tên quan hệ gia đình' type='text' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmQuanHeGiaDinhKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmQuanHeGiaDinhKichHoat' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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
    state = { searching: false };
    searchBox = React.createRef();
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Quan hệ gia đình', 'Bạn có chắc bạn muốn xóa quan hệ gia đình này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmQuanHeGiaDinh(item.ma));
    };

    changeActive = item => this.props.updateDmQuanHeGiaDinh(item.ma, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmQuanHeGiaDinh:write'),
            permissionDelete = currentPermissions.includes('dmQuanHeGiaDinh:delete');
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dmQuanHeGiaDinh && this.props.dmQuanHeGiaDinh.page ?
            this.props.dmQuanHeGiaDinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
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
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'center' }}><a href='#' onClick={e => this.edit(e, item)}>{item.ma}</a></td>
                                <td>{item.ten}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={() => permissionWrite && this.changeActive(item)} />
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Quan hệ gia đình</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmQuanHeGiaDinhPage} setSearching={value => this.setState({ searching: value })} />
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Quan hệ gia đình
                    </ul>
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='dmQuanHeGiaDinh' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite}
                        create={this.props.createDmQuanHeGiaDinh} update={this.props.updateDmQuanHeGiaDinh} />
                    {permissionWrite &&
                        <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                            <i className='fa fa-lg fa-plus' />
                        </button>}
                    <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmQuanHeGiaDinh: state.dmQuanHeGiaDinh });
const mapActionsToProps = { getDmQuanHeGiaDinhPage, createDmQuanHeGiaDinh, updateDmQuanHeGiaDinh, deleteDmQuanHeGiaDinh };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);