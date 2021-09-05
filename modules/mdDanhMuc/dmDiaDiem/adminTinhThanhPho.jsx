import React from 'react';
import { connect } from 'react-redux';
import { getDMTinhThanhPhoPage, createDMTinhThanhPho, updateDMTinhThanhPho, deleteDMTinhThanhPho } from './reduxTinhThanhPho';
import { Link } from 'react-router-dom';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';

export class EditModal extends React.Component {
    state = { active: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmTinhThanhPhoMa').focus());
        });
    }

    show = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: null, kichHoat: 1 };
        $('#dmTinhThanhPhoMa').val(ma);
        $('#dmTinhThanhPhoTen').val(ten);
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-id', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ma: $('#dmTinhThanhPhoMa').val().trim(),
                ten: $('#dmTinhThanhPhoTen').val().trim(),
                kichHoat: this.state.active ? 1 : 0
            };

        if (changes.ma.length != 2) {
            T.notify('Mã tỉnh không hợp lệ!', 'danger');
            $('dmTinhThanhPhoMa').focus();
        }
        if (ma) {
            this.props.update({ ma }, changes, (error, item) => {
                if (error) {
                    T.notify(error.message ? error.message : `Cập nhật tỉnh/thành phố ${changes.ten} bị lỗi!`, 'danger');
                } else {
                    T.notify(`Cập nhật tỉnh/thành phố ${changes.ten} thành công!`, 'success');
                    $(this.modal.current).modal('hide');
                }
            });
        } else {
            this.props.create(changes, (error, item) => {
                if (error) {
                    T.notify(error.message ? error.message : `Tạo mới tỉnh/thành phố ${changes.ten} bị lỗi!`, 'danger');
                } else {
                    T.notify(`Tạo mới tỉnh/thành phố ${changes.ten} thành công!`, 'success');
                    $(this.modal.current).modal('hide');
                }
            });
        }
    };

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>{this.state.isUpdate ? 'Cập nhật' : 'Tạo mới'} tỉnh/thành phố</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmTinhThanhPhoMa'>Mã</label>
                                <input className='form-control' id='dmTinhThanhPhoMa' placeholder='Mã tỉnh/thành phố' type='text' auto-focus='' maxLength={3} readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmTinhThanhPhoTen'>Tên tỉnh/thành phố</label>
                                <input className='form-control' id='dmTinhThanhPhoTen' placeholder='Tên tỉnh/thành phố' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
                                <label htmlFor='dmTinhThanhPhoKichHoat'>Kích hoạt</label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmTinhThanhPhoKichHoat' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
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

class DMTinhThanhPhoPage extends React.Component {
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
        T.confirm('Tỉnh/thành phố', `Bạn có chắc bạn muốn xóa tỉnh/thành phố ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDMTinhThanhPho(item.ma));
    };

    changeActive = item => this.props.updateDMTinhThanhPho(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmDienChinhSach:write'),
            permissionUpload = currentPermissions.includes('dmDienChinhSach:upload'),
            permissionDelete = currentPermissions.includes('dmDienChinhSach:delete');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmTinhThanhPho && this.props.dmTinhThanhPho.page ?
            this.props.dmTinhThanhPho.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>Mã</th>
                            <th style={{ width: '100%' }}>Tên tỉnh/thành phố</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ma}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ten}</a></td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat ? true : false} onChange={() => permissionWrite && this.changeActive(item, 'kichHoat')} />
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
                    <div>
                        <h1><i className='fa fa-list-alt' /> Danh mục Tỉnh - Thành phố</h1>
                    </div>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDMTinhThanhPhoPage} setSearching={value => this.setState({ searching: value })} />
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Tỉnh - Thành phố
                    </ul>
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='dmTinhThanhPho' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDMTinhThanhPho} update={this.props.updateDMTinhThanhPho} />
                    {permissionUpload &&
                        <Link key={0} to='/user/danh-muc/tinh-thanh-pho/upload' className='btn btn-success btn-circle' style={{ zIndex: 100, position: 'fixed', right: '70px', bottom: '10px' }}>
                            <i className='fa fa-lg fa-cloud-upload' />
                        </Link>}
                    {permissionWrite &&
                        <button key={1} type='button' className='btn btn-primary btn-circle' onClick={this.edit} style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }}>
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

const mapStateToProps = state => ({ system: state.system, dmTinhThanhPho: state.dmTinhThanhPho });
const mapActionsToProps = { getDMTinhThanhPhoPage, createDMTinhThanhPho, updateDMTinhThanhPho, deleteDMTinhThanhPho };
export default connect(mapStateToProps, mapActionsToProps)(DMTinhThanhPhoPage);
