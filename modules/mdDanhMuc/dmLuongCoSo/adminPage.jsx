import React from 'react';
import { connect } from 'react-redux';
import { getDmLuongCoSoPage, createDmLuongCoSo, updateDmLuongCoSo, deleteDmLuongCoSo } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmLuongCoSoMucLuong').focus());
        });
    }

    show = (item) => {
        let { ma, mucLuong, hieuLucTu, hieuLucDen, nghiDinhChinhPhu } = item ? item : { ma: null, mucLuong: '', hieuLucTu: '', hieuLucDen: '', nghiDinhChinhPhu: '' };
        let hieuLucTuDate = hieuLucTu ? new Date(hieuLucTu) : null,
            hieuLucDenDate = hieuLucDen ? new Date(hieuLucDen) : null;
        $('#dmLuongCoSoMucLuong').val(mucLuong);
        $('#dmLuongCoSoHieuLucTu').val(hieuLucTuDate ? T.dateToText(hieuLucTuDate, 'dd/mm/yyyy') : '');
        $('#dmLuongCoSoHieuLucDen').val(hieuLucDenDate ? T.dateToText(hieuLucDenDate, 'dd/mm/yyyy') : '');
        $('#dmLuongCoSoNghiDinhChinhPhu').val(nghiDinhChinhPhu);
        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật lương cơ sở' : 'Tạo mới lương cơ sở');
        $(this.modal.current).attr('data-ma', ma).modal('show');
        $('#dmLuongCoSoHieuLucTu').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
        $('#dmLuongCoSoHieuLucTu').datepicker('update', T.dateToText(hieuLucTuDate, 'dd/mm/yyyy'));
        $('#dmLuongCoSoHieuLucDen').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
        if (hieuLucDen) $('#dmLuongCoSoHieuLucDen').datepicker('update', T.dateToText(hieuLucDenDate, 'dd/mm/yyyy'));
    };

    save = (e) => {
        e.preventDefault();
        let hieuLucTuDate = $('#dmLuongCoSoHieuLucTu').val() ? T.formatDate($('#dmLuongCoSoHieuLucTu').val()) : null,
            hieuLucDenDate = $('#dmLuongCoSoHieuLucDen').val() ? T.formatDate($('#dmLuongCoSoHieuLucDen').val()) : null;
        const maLuongCoSo = $(this.modal.current).attr('data-ma'),
            changes = {
                mucLuong: $('#dmLuongCoSoMucLuong').val().trim(),
                hieuLucTu: hieuLucTuDate ? Number(hieuLucTuDate) : '',
                hieuLucDen: hieuLucDenDate ? Number(hieuLucDenDate) : '',
                nghiDinhChinhPhu: $('#dmLuongCoSoNghiDinhChinhPhu').val().trim(),
            };
        if (changes.mucLuong == '') {
            T.notify('Mức lương cơ sở bị trống!', 'danger');
            $('#dmLuongCoSoMucLuong').focus();
        } else if (changes.hieuLucTu == '') {
            T.notify('Hiệu lực từ bị trống!', 'danger');
            $('#dmLuongCoSoHieuLucTu').focus();
        } else {
            if (maLuongCoSo) {
                this.props.update(maLuongCoSo, changes, () => {
                    T.notify('Cập nhật lương cơ sở thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            } else {
                this.props.create(changes, () => {
                    T.notify('Tạo mới lương cơ sở thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            }
        }
    };

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' autoComplete='off' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'></h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmLuongCoSoMucLuong'>Mức lương cơ sở</label>
                                <input className='form-control' id='dmLuongCoSoMucLuong' placeholder='Mức lương cơ sở' type='number' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label className='control-label' htmlFor='dmLuongCoSoHieuLucTu'>Hiệu lực từ</label>
                                <input className='form-control' type='text' placeholder='Hiệu lực từ' id='dmLuongCoSoHieuLucTu' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmLuongCoSoHieuLucDen'>Hiệu lực đến</label>
                                <input className='form-control' id='dmLuongCoSoHieuLucDen' placeholder='Hiệu lực đến' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmLuongCoSoNghiDinhChinhPhu'>Nghị định chính phủ</label>
                                <input className='form-control' id='dmLuongCoSoNghiDinhChinhPhu' placeholder='Nghị định chính phủ' type='text' readOnly={readOnly} />
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

class dmLuongCoSoPage extends React.Component {
    state = {};
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.getPage());
    }

    getPage = (pageNumber, pageSize, pageCondition) => {
        this.setState({ searching: true });
        this.props.getDmLuongCoSoPage(pageNumber, pageSize, pageCondition, page => {
            this.setState({ searching: false });
        });
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Lương cơ sở', 'Bạn có chắc bạn muốn xóa lương cơ sở này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmLuongCoSo(item.ma));
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmLuongCoSo:write'),
            permissionDelete = currentPermissions.includes('dmLuongCoSo:delete');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmLuongCoSo && this.props.dmLuongCoSo.page ?
            this.props.dmLuongCoSo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có dữ liệu!';
        list.sort((a, b) => b.hieuLucTu - a.hieuLucTu);
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mức lương</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Hiệu lực từ</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Hiệu lực đến</th>
                            <th style={{ width: '100%' }} nowrap='true'>Nghị định chính phủ</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <a href='#' onClick={e => this.edit(e, item)}>
                                        {item.mucLuong.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    </a>
                                </td>
                                <td>{T.dateToText(item.hieuLucTu, 'dd/mm/yyyy')}</td>
                                <td>{item.hieuLucDen ? T.dateToText(item.hieuLucDen, 'dd/mm/yyyy') : ''}</td>
                                <td>{item.nghiDinhChinhPhu}</td>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Lương cơ sở</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Lương cơ sở
                    </ul>
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='dmLuongCoSoPage' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.getPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite}
                        create={this.props.createDmLuongCoSo} update={this.props.updateDmLuongCoSo} />
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

const mapStateToProps = state => ({ system: state.system, dmLuongCoSo: state.dmLuongCoSo });
const mapActionsToProps = { getDmLuongCoSoPage, createDmLuongCoSo, updateDmLuongCoSo, deleteDmLuongCoSo };
export default connect(mapStateToProps, mapActionsToProps)(dmLuongCoSoPage);
