import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDmBenhVienPage, createDmBenhVien, updateDmBenhVien, deleteDmBenhVien } from './reduxBenhVien';
import { getDmTuyenBenhVienAll } from './reduxTuyenBenhVien';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';

class EditModal extends React.Component {
    modal = React.createRef();
    state = { kichHoat: true }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmBenhVienMa').focus());
            $('#dmBenhVienMaTuyen').select2({ minimumResultsForSearch: -1 })
        }, 250));
    }

    show = (item) => {
        let { ma, ten, diaChi, maTuyen, kichHoat } = item ? item : { ma: null, ten: '', diaChi: '', maTuyen: null, kichHoat: true };
        $('#dmBenhVienMa').val(ma);
        $('#dmBenhVienTen').val(ten);
        $('#dmBenhVienDiaChi').val(diaChi);
        $('#dmBenhVienMaTuyen').val(maTuyen ? maTuyen : '');
        $('#dmBenhVienMaTuyen').select2({ minimumResultsForSearch: -1 }).trigger('change');

        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật bệnh viện' : 'Tạo mới bệnh viện');
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const maBenhVien = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#dmBenhVienMa').val().trim(),
                ten: $('#dmBenhVienTen').val().trim(),
                diaChi: $('#dmBenhVienDiaChi').val().trim(),
                maTuyen: $('#dmBenhVienMaTuyen').val().trim(),
                kichHoat: Number(this.state.kichHoat),

            };
        if (changes.ma == '') {
            T.notify('Mã bệnh viện bị trống!', 'danger');
            $('#dmBenhVienMa').focus();
        } else if ($('#dmBenhVienTen').val() == '') {
            T.notify('Tên bệnh viện bị trống!', 'danger');
            $('#dmBenhVienTen').focus();
        } else if ($('#dmBenhVienDiaChi').val() == '') {
            T.notify('Địa chỉ bệnh viện bị trống!', 'danger');
            $('#dmBenhVienDiaChi').focus();
        } else if ($('#dmBenhVienMaTuyen').val() == '') {
            T.notify('Mã tuyến bệnh viện bị trống!', 'danger');
            $('#dmBenhVienMaTuyen').focus();
        } else {
            if (maBenhVien) {
                this.props.update(maBenhVien, changes);
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
                                <label htmlFor='dmBenhVienMa'>Mã bệnh viện</label>
                                <input className='form-control' id='dmBenhVienMa' placeholder='Mã bệnh viện' type='text' auto-focus='' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmBenhVienTen'>Tên bệnh viện</label>
                                <input className='form-control' id='dmBenhVienTen' placeholder='Tên bệnh viện' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmBenhVienDiaChi'>Địa chỉ bệnh viện</label>
                                <input className='form-control' id='dmBenhVienDiaChi' placeholder='Địa chỉ bệnh viện' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label className='control-label' htmlFor='dmBenhVienMaTuyen'>Mã tuyến</label>
                                <select className='form-control' id='dmBenhVienMaTuyen'>{this.props.tuyenOptions}</select>
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmBenhVienKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmBenhVienKichHoat' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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

class dmBenhVienPage extends React.Component {
    state = { searching: false };
    searchBox = React.createRef();
    modal = React.createRef();
    tuyenMapper = null;
    tuyenOptions = [];

    componentDidMount() {
        this.props.getDmTuyenBenhVienAll(items => {
            if (items) {
                const mapper = {};
                items.forEach(item => {
                    mapper[item.ma] = item.ten;
                    if (item.kichHoat == 1) this.tuyenOptions.push(<option key={item.ma} value={item.ma}>{item.ten}</option>);
                });
                this.tuyenMapper = mapper;
            }
        });
        T.ready('/user/category', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Bệnh viện', 'Bạn có chắc bạn muốn xóa bệnh viện này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmBenhVien(item.ma));
    };

    changeActive = item => this.props.updateDmBenhVien(item.ma, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmBenhVien:write'),
            permissionDelete = currentPermissions.includes('dmBenhVien:delete');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmBenhVien && this.props.dmBenhVien.page ?
            this.props.dmBenhVien.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có dữ liệu!';
        if (list && list.length > 0 && this.tuyenMapper) {
            table = (
                <table className='table table-hover table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                            <th style={{ width: '40%' }} nowrap='true'>Tên</th>
                            <th style={{ width: '30%' }} nowrap='true'>Địa chỉ</th>
                            <th style={{ width: '30%' }} nowrap='true'>Tên tuyến</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td style={{ textAlign: 'center' }}>{item.ma}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ten}</a></td>
                                <td>{item.diaChi}</td>
                                <td>{this.tuyenMapper[item.maTuyen] ? this.tuyenMapper[item.maTuyen] : ''}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={e => permissionWrite && this.changeActive(item)} />
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
            )
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Bệnh viện</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmBenhVienPage} setSearching={value => this.setState({ searching: value })} />
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Bệnh viện
                    </ul>
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='dmBenhVienPage' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        style={{ paddingLeft: '70px' }}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite} tuyenOptions={this.tuyenOptions}
                        create={this.props.createDmBenhVien} update={this.props.updateDmBenhVien} />
                    <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>
                    <Link to='/user/danh-muc/benh-vien/upload' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
                        <i className='fa fa-lg fa-cloud-upload' />
                    </Link>
                    {permissionWrite &&
                        <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                            <i className='fa fa-lg fa-plus' />
                        </button>}
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmBenhVien: state.dmBenhVien, dmBenhVienMaTuyen: state.dmTuyenBenhVien });
const mapActionsToProps = { getDmBenhVienPage, createDmBenhVien, updateDmBenhVien, deleteDmBenhVien, getDmTuyenBenhVienAll };
export default connect(mapStateToProps, mapActionsToProps)(dmBenhVienPage);