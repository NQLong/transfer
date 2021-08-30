import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createDmBoMon, getDmBoMonPage, updateDmBoMon, deleteDmBoMon, PageName } from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { Select } from 'view/component/Input';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';

class EditModal extends React.Component {
    state = { active: true, kichHoat: true };
    modal = React.createRef();
    maDonVi = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#ma').focus());
        }, 250));
    }

    show = (item) => {
        let { ma, ten, tenTiengAnh, maDv, qdThanhLap, qdXoaTen, kichHoat, ghiChu } = item ? item : { ma: '', ten: '', tenTiengAnh: '', maDv: '', qdThanhLap: '', qdXoaTen: '', kichHoat: false, ghiChu: '' };
        $('#ma').val(ma);
        $('#ten').val(ten);
        $('#tenTiengAnh').val(tenTiengAnh);
        this.maDonVi.current.setVal(maDv);
        $('#qdThanhLap').val(qdThanhLap);
        $('#qdXoaTen').val(qdXoaTen);
        $('#ghiChu').val(ghiChu);
        if (ma) {
            this.setState({ kichHoat });
        } else {
            this.setState({ kichHoat });
        }
        $('#kichHoat').val(kichHoat);

        $(this.modal.current).attr('data-id', ma).modal('show');
    }

    hide = () => $(this.modal.current).modal('hide');


    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ma: $('#ma').val().trim(),
                ten: $('#ten').val().trim(),
                tenTiengAnh: $('#tenTiengAnh').val().trim(),
                maDv: this.maDonVi.current.getVal(),
                qdThanhLap: $('#qdThanhLap').val().trim(),
                qdXoaTen: $('#qdXoaTen').val().trim(),
                kichHoat: Number(this.state.kichHoat),
                ghiChu: $('#ghiChu').val().trim(),
            };
        if (changes.ma == '') {
            T.notify('Mã bộ môn bị trống!', 'danger');
            $('#ma').focus();
        } else if (changes.maDv == '') {
            T.notify('Mã đơn vị bị trống!', 'danger');
            this.maDonVi.current.focus();
        } else {
            if (ma) {
                this.props.updateDmBoMon(ma, changes);
            } else {
                this.props.createDmBoMon(changes);
            }
            $(this.modal.current).modal('hide');
        };
        e.preventDefault();
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h3><i className='fa fa-list-alt' /> Danh mục bộ môn</h3>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body row'>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Mã bộ môn</label>
                                <input className='form-control' type='text' placeholder='Mã bộ môn' id='ma' readOnly={readOnly} />
                            </div>
                            <div className='col-md-6'>
                                <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                    <label htmlFor='dmBoMonKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                        <label>
                                            <input type='checkbox' id='dmBoMonKichHoat' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
                                            <span className='button-indecator' readOnly={readOnly} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Tên bộ môn (tiếng Việt)</label>
                                <input className='form-control' type='text' placeholder='Tên bộ môn (tiếng Việt)' id='ten' readOnly={readOnly} />
                            </div>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Tên bộ môn (tiếng Anh)</label>
                                <input className='form-control' type='text' placeholder='Tên bộ môn (tiếng Anh)' id='tenTiengAnh' readOnly={readOnly} />
                            </div>
                            <div className='form-group col-12'>
                                <Select ref={this.maDonVi} adapter={SelectAdapter_DmDonVi} label='Mã đơn vị' readOnly={readOnly} />
                            </div>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Quyết định thành lập</label>
                                <input className='form-control' type='text' placeholder='QĐ thành lập' id='qdThanhLap' readOnly={readOnly} />
                            </div>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Quyết định xóa tên</label>
                                <input className='form-control' type='text' placeholder='QĐ xóa tên' id='qdXoaTen' readOnly={readOnly} />
                            </div>
                            <div className='form-group col-12'>
                                <label className='control-label'>Ghi chú</label>
                                <input className='form-control' type='text' placeholder='Ghi chú' id='ghiChu' readOnly={readOnly} />
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
    donVi = {};
    modal = React.createRef();
    searchBox = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin', 'Bạn có chắc bạn muốn xóa bộ môn này?', true, isConfirm => isConfirm && this.props.deleteDmBoMon(item.ma));
        e.preventDefault();
    }

    changeKichHoat = item => this.props.updateDmBoMon(item.ma, { kichHoat: Number(!item.kichHoat) })

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmBoMon:write'),
            permissionDelete = currentPermissions.includes('dmBoMon:delete'),
            permissionUpload = currentPermissions.includes('dmBoMon:upload');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dmBoMon && this.props.dmBoMon.page ?
            this.props.dmBoMon.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có bộ môn!';
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                            <th style={{ width: '60%' }}>Bộ môn</th>
                            <th style={{ width: '40%' }}>Đơn vị</th>
                            <th style={{ width: 'auto' }} nowrap='true'>QĐ thành lập</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <a href='#' onClick={e => this.edit(e, item)} style={{ color: 'black' }}>{item.ma}</a>
                                </td>
                                <td>
                                    <a href='#' onClick={e => this.edit(e, item)} className={item.qdXoaTen ? 'text-danger' : 'text-primary'}>
                                        {item.ten ? item.ten : ''}<br />
                                        {item.tenTiengAnh ? item.tenTiengAnh : ''}
                                    </a>
                                </td>
                                <td>{item.maDv ? this.donVi[item.maDv] : ''}</td>
                                <td nowrap='true'>{item.qdThanhLap ? item.qdThanhLap : ''}</td>
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
                                        {permissionDelete && (
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-trash-o fa-lg' />
                                            </a>)}
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Bộ môn</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmBoMonPage} setSearching={value => this.setState({ searching: value })} />
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Bộ môn
                    </ul>
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <EditModal ref={this.modal} readOnly={!permissionWrite}
                        createDmBoMon={this.props.createDmBoMon} updateDmBoMon={this.props.updateDmBoMon} />
                    <Pagination name={PageName} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ marginLeft: '70px' }}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>
                    {permissionUpload && (
                        <Link to='/user/dm-bo-mon/upload' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
                            <i className='fa fa-lg fa-cloud-upload' />
                        </Link>)}
                    {permissionWrite && (
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                            <i className='fa fa-lg fa-plus' />
                        </button>)}
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmBoMon: state.dmBoMon, dmDonVi: state.dmDonVi });
const mapActionsToProps = { createDmBoMon, getDmBoMonPage, SelectAdapter_DmDonVi, updateDmBoMon, deleteDmBoMon };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);