import React from 'react';
import { connect } from 'react-redux';
import { getDmLuongDiNuocNgoaiPage, createDmLuongDiNuocNgoai, deleteDmLuongDiNuocNgoai, updateDmLuongDiNuocNgoai } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { kichHoat: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmLuongDiNuocNgoaiMa').focus());
        }, 250));
    }

    show = (item) => {
        let { ma, moTa, ghiChu, kichHoat } = item ? item : { ma: '', moTa: '', ghiChu: '', kichHoat: true };
        $('#dmLuongDiNuocNgoaiMa').val(ma);
        $('#dmLuongDiNuocNgoaiMoTa').val(moTa);
        $('#dmLuongDiNuocNgoaiGhiChu').val(ghiChu);
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-id', ma).modal('show');
    };

    save = e => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                moTa: $('#dmLuongDiNuocNgoaiMoTa').val(),
                ghiChu: $('#dmLuongDiNuocNgoaiGhiChu').val(),
                kichHoat: this.state.kichHoat ? '1' : '0'
            };
        if (changes.moTa == '') {
            T.notify('Mô tả Lương đi nước ngoài bị trống!', 'danger');
            $('#dmLuongDiNuocNgoaiMoTa').focus();
        } else if (changes.ghiChu == '') {
            T.notify('Ghi chú Lương đi nước ngoài bị trống!', 'danger');
            $('#dmLuongDiNuocNgoaiGhiChu').focus();
        } else if (changes.ma == '') {
            T.notify('Mã Lương đi nước ngoài bị trống!', 'danger');
            $('dmLuongDiNuocNgoaiMa').focus();
        } else {
            if (ma) {
                this.props.updateDmLuongDiNuocNgoai(ma, changes);
            } else {
                changes.ma = $('#dmLuongDiNuocNgoaiMa').val();
                this.props.createDmLuongDiNuocNgoai(changes);
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
                            <h5 className='modal-title'>Lương đi nước ngoài</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmLuongDiNuocNgoaiMa'>Mã</label>
                                <input className='form-control' id='dmLuongDiNuocNgoaiMa' type='string' placeholder='Mã Lương đi nước ngoài' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmLuongDiNuocNgoaiMoTa'>Mô tả</label>
                                <textarea className='form-control' id='dmLuongDiNuocNgoaiMoTa' type='text' placeholder='Mô tả Lương đi nước ngoài' readOnly={readOnly} style={{ minHeight: '40px' }} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmLuongDiNuocNgoaiGhiChu'>Ghi chú</label>
                                <textarea className='form-control' id='dmLuongDiNuocNgoaiGhiChu' type='text' placeholder='Ghi chú Lương đi nước ngoài' readOnly={readOnly} style={{ minHeight: '40px' }} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmLuongDiNuocNgoaiActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmLuongDiNuocNgoaiActive' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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

class DmLuongDiNuocNgoaiPage extends React.Component {
    state = { searching: false };
    searchBox = React.createRef();
    modal = React.createRef();
    optionsDonVi = [];

    componentDidMount() {
        T.ready('/user/category', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmLuongDiNuocNgoai(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa Lương đi nước ngoài', 'Bạn có chắc bạn muốn xóa Lương đi nước ngoài này?', true, isConfirm =>
            isConfirm && this.props.deleteDmLuongDiNuocNgoai(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmLuongDiNuocNgoai:write'),
            permissionDelete = currentPermissions.includes('dmLuongDiNuocNgoai:delete');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dmLuongDiNuocNgoai && this.props.dmLuongDiNuocNgoai.page ?
            this.props.dmLuongDiNuocNgoai.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let table = 'Không có Lương đi nước ngoài!';
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <td style={{ width: 'auto' }}>Mã</td>
                            <td style={{ width: '50%' }}>Mô tả</td>
                            <td style={{ width: '50%' }}>Ghi chú</td>
                            <td style={{ width: 'auto' }} nowrap='true'>Kích hoạt</td>
                            <td style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</td>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={item.ma}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ma}</a></td>
                                <td>{item.moTa}</td>
                                <td>{item.ghiChu}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={e => permissionWrite && this.changeActive(item)} />
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
                    <h1><i className='fa fa-list-alt' /> Lương đi nước ngoài</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmLuongDiNuocNgoaiPage} setSearching={value => this.setState({ searching: value })} />
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Lương đi nước ngoài
                    </ul>
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <EditModal ref={this.modal} readOnly={!permissionWrite} optionsDonVi={this.optionsDonVi} createDmLuongDiNuocNgoai={this.props.createDmLuongDiNuocNgoai} updateDmLuongDiNuocNgoai={this.props.updateDmLuongDiNuocNgoai} />
                    <Pagination name='pageDmLuongDiNuocNgoai' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    {permissionWrite &&
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
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

const mapStateToProps = state => ({ system: state.system, dmLuongDiNuocNgoai: state.dmLuongDiNuocNgoai });
const mapActionsToProps = { getDmLuongDiNuocNgoaiPage, createDmLuongDiNuocNgoai, deleteDmLuongDiNuocNgoai, updateDmLuongDiNuocNgoai };
export default connect(mapStateToProps, mapActionsToProps)(DmLuongDiNuocNgoaiPage);