import React from 'react';
import { connect } from 'react-redux';
import { PageName, createDmQuocGia, getDmQuocGiaPage, updateDmQuocGia, deleteDmQuocGia } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmqgMaQuocGia').focus());
        }, 250));
    }

    show = (item) => {
        let { maCode, tenQuocGia, country, shortenName, codeAlpha, maKhuVuc, tenKhac, maCu } = item ? item : { maCode: '', tenQuocGia: '', country: '', shortenName: '', codeAlpha: '', maKhuVuc: '', tenKhac: '', maCu: '' };
        $('#dmqgMaQuocGia').val(maCode);
        $('#dmqgTenQuocGia').val(tenQuocGia);
        $('#dmqgQuocGia').val(country);
        $('#dmqgTenVietTat').val(shortenName);
        $('#dmqgCodeAlpha').val(codeAlpha);
        $('#dmqgMaKhuVuc').val(maKhuVuc);
        $('#dmqgTenKhac').val(tenKhac);

        $(this.modal.current).attr('data-id', maCode).modal('show');
    }

    hide = () => $(this.modal.current).modal('hide');

    save = e => {
        e.preventDefault();
        const maCode = $(this.modal.current).attr('data-id'),
            changes = {
                maCode: $('#dmqgMaQuocGia').val().trim().toUpperCase(),
                tenQuocGia: $('#dmqgTenQuocGia').val().trim(),
                country: $('#dmqgQuocGia').val().trim(),
                shortenName: $('#dmqgTenVietTat').val().trim().toUpperCase(),
                codeAlpha: $('#dmqgCodeAlpha').val().trim().toUpperCase(),
                maKhuVuc: $('#dmqgMaKhuVuc').val().trim().toUpperCase(),
                tenKhac: $('#dmqgTenKhac').val().trim().toUpperCase(),
                maCu: '',
            };

        if (changes.maCode == '') {
            T.notify('Mã quốc gia bị trống!', 'danger');
            $('#dmqgMaQuocGia').focus();
        } else if (changes.tenQuocGia == '') {
            T.notify('Tên quốc gia bị trống!', 'danger');
            $('#dmqgTenQuocGia').focus();
        } else if (changes.country == '') {
            T.notify('Quốc gia bị trống!', 'danger');
            $('#dmqgQuocGia').focus();
            // } else if (changes.shortenName == '') {
            //     T.notify('Tên viết tắt bị trống!', 'danger');
            //     $('#dmqgTenVietTat').focus();
            // } else if (changes.codeAlpha == '') {
            //     T.notify('Code Alpha bị trống!', 'danger');
            //     $('#dmqgCodeAlpha').focus();
            // } else if (changes.maKhuVuc == '') {
            //     T.notify('Mã khu vực bị trống!', 'danger');
            //     $('#dmqgMaKhuVuc').focus();
        } else {
            if (maCode) {
                this.props.updateDmQuocGia(maCode, changes);
            } else {
                this.props.createDmQuocGia(changes);
            }
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Quốc gia</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group row'>
                                <div className='col-12 col-sm-4'>
                                    <label htmlFor='dmqgMaQuocGia'>Mã quốc gia</label>
                                    <input className='form-control' id='dmqgMaQuocGia' type='text' placeholder='Mã quốc gia' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className='col-12 col-sm-4'>
                                    <label htmlFor='dmqgTenQuocGia'>Tên quốc gia</label>
                                    <input className='form-control' id='dmqgTenQuocGia' type='text' placeholder='Tên quốc gia' readOnly={readOnly} />
                                </div>
                                <div className='col-12 col-sm-4'>
                                    <label htmlFor='dmqgQuocGia'>Quốc gia</label>
                                    <input className='form-control' id='dmqgQuocGia' type='text' placeholder='Quốc gia' readOnly={readOnly} />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <div className='col-12 col-sm-4'>
                                    <label htmlFor='dmqgTenVietTat'>Tên viết tắt</label>
                                    <input className='form-control' id='dmqgTenVietTat' type='text' placeholder='Tên viết tắt' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className='col-12 col-sm-4'>
                                    <label htmlFor='dmqgCodeAlpha'>Code Alpha</label>
                                    <input className='form-control' id='dmqgCodeAlpha' type='text' placeholder='Code Alpha' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className='col-12 col-sm-4'>
                                    <label htmlFor='dmqgMaKhuVuc'>Mã khu vực</label>
                                    <input className='form-control' id='dmqgMaKhuVuc' type='text' placeholder='Mã khu vực' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                                </div>
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmqgTenKhac'>Tên khác</label>
                                <input className='form-control' id='dmqgTenKhac' type='text' placeholder='Tên Khác' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                                <small className='form-text text-muted'>Có thể có nhiều tên. Mỗi tên cách nhau bằng dấu phẩy (,).</small>
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
        T.confirm('Xóa danh mục quốc gia', 'Bạn có chắc bạn muốn xóa quốc gia này?', true, isConfirm =>
            isConfirm && this.props.deleteDmQuocGia(item.maCode));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmQuocGia:write'),
            permissionDelete = currentPermissions.includes('dmQuocGia:delete');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.dmQuocGia && this.props.dmQuocGia.page ?
            this.props.dmQuocGia.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = 'Không có dữ liệu quốc gia!';
        if (this.props.dmQuocGia && this.props.dmQuocGia.page && this.props.dmQuocGia.page.list && this.props.dmQuocGia.page.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>Mã</th>
                            <th style={{ width: '40%' }} nowrap='true'>Tên quốc gia</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Code alpha</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Tên viết tắt</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã khu vực</th>
                            <th style={{ width: '60%' }}>Tên khác</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.dmQuocGia.page.list.map((item, index) => (
                            <tr key={index}>
                                <td>{item.maCode}</td>
                                <td>
                                    <a href='#' onClick={e => this.edit(e, item)}>
                                        {item.tenQuocGia}{item.country ? ` (${item.country})` : ''}
                                    </a>
                                </td>
                                <td>{item.codeAlpha}</td>
                                <td>{item.shortenName}</td>
                                <td>{item.maKhuVuc}</td>
                                <td>{item.tenKhac && item.tenKhac.length > 0 ? item.tenKhac.toString().replaceAll(',', ', ') : ''}</td>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Quốc gia</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmQuocGiaPage} setSearching={value => this.setState({ searching: value })} />
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Quốc gia
                    </ul>
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <EditModal ref={this.modal} readOnly={!permissionWrite}
                        createDmQuocGia={this.props.createDmQuocGia} updateDmQuocGia={this.props.updateDmQuocGia} />
                    <Pagination name={PageName} style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>
                    {permissionWrite && <Link to='/user/danh-muc/quoc-gia/upload' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
                        <i className='fa fa-lg fa-cloud-upload' />
                    </Link>}
                    {permissionWrite &&
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                            <i className='fa fa-lg fa-plus' />
                        </button>}
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmQuocGia: state.dmQuocGia });
const mapActionsToProps = { getDmQuocGiaPage, createDmQuocGia, updateDmQuocGia, deleteDmQuocGia };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);
