import React from 'react';
import { connect } from 'react-redux';
import { createDmDonVi, getDmDonViPage, updateDmDonVi, deleteDmDonVi, PageName } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import ImageBox from 'view/component/ImageBox';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { active: true };
    modal = React.createRef();
    imageBox = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmDonViMa').focus());
        }, 250));
    }

    show = (item) => {
        const { ma, ten, tenTiengAnh, tenVietTat, qdThanhLap, qdXoaTen, maPl, ghiChu, kichHoat, duongDan, image } = item ? item : { ma: null, ten: '', tenTiengAnh: '', tenVietTat: '', qdThanhLap: '', qdXoaTen: '', maPl: '', ghiChu: '', kichHoat: true, duongDan: '', image: null };
        $('#dmDonViMa').val(ma);
        $('#dmDonViTen').val(ten);
        $('#dmDonViTenTiengAnh').val(tenTiengAnh);
        $('#dmDonViTenVietTat').val(tenVietTat);
        $('#dmDonViQdThanhLap').val(qdThanhLap);
        $('#dmDonViQdXoaTen').val(qdXoaTen);
        $('#dmDonViMaPL').val(maPl);
        $('#dmDonViGhiChu').val(ghiChu);
        $('#dmDonViDuongDan').val(duongDan);
        this.imageBox.current.setData('dmDonVi:' + (ma ? ma : 'new'), image ? image : '/img/avatar.png');

        this.setState({ active: kichHoat == '1' });

        $(this.modal.current).attr('data-id', ma).modal('show');
    }

    hide = () => $(this.modal.current).modal('hide')

    save = (e) => {
        e.preventDefault();
        const _id = $(this.modal.current).attr('data-id'),
            changes = {
                ten: $('#dmDonViTen').val().trim(),
                tenTiengAnh: $('#dmDonViTenTiengAnh').val().trim(),
                ma: $('#dmDonViMa').val().trim(),
                tenVietTat: $('#dmDonViTenVietTat').val().trim(),
                qdThanhLap: $('#dmDonViQdThanhLap').val().trim(),
                qdXoaTen: $('#dmDonViQdXoaTen').val().trim(),
                maPl: $('#dmDonViMaPL').val().trim(),
                ghiChu: $('#dmDonViGhiChu').val(),
                kichHoat: this.state.active ? '1' : '0',
                duongDan: $('#dmDonViDuongDan').val().trim()
            }

        if (changes.ma == '') {
            T.notify('Mã đơn vị bị trống!', 'danger');
            $('#dmDonViMa').focus();
        } else
            if (changes.ten == '') {
                T.notify('Tên đơn vị bị trống!', 'danger');
                $('#dmDonViTen').focus();
            } else {
                if (_id) {
                    this.props.updateDmDonVi(_id, changes);
                } else {
                    this.props.createDmDonVi(changes);
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
                            <h5 className='modal-title'>Đơn vị</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='row'>
                                <div className='form-group col-md-6'>
                                    <label htmlFor='dmDonViMa'>Mã Đơn vị</label>
                                    <input className='form-control' id='dmDonViMa' type='number' placeholder='Mã Đơn vị' readOnly={readOnly} />
                                </div>
                                <div className='form-group col-md-6'>
                                    <label htmlFor='dmDonViKichHoat'>Kích hoạt: <br /></label>&nbsp;&nbsp;
                                    <div className='toggle'>
                                        <label>
                                            <input type='checkbox' id='dmDonViKichHoat' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
                                            <span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>

                                <div className='form-group col-md-6'>
                                    <label htmlFor='dmDonViTen'>Tên Đơn vị</label>
                                    <input className='form-control' id='dmDonViTen' type='text' placeholder='Tên Đơn vị' readOnly={readOnly} />
                                </div>
                                <div className='form-group col-md-6'>
                                    <label htmlFor='dmDonViTenTiengAnh'>Tên tiếng Anh</label>
                                    <input className='form-control' id='dmDonViTenTiengAnh' type='text' placeholder='Tên tiếng Anh' readOnly={readOnly} />
                                </div>

                                <div className='form-group col-md-6'>
                                    <label htmlFor='dmDonViTenVietTat'>Tên viết tắt</label>
                                    <input className='form-control' id='dmDonViTenVietTat' type='text' placeholder='Tên viết tắt' readOnly={readOnly} />
                                </div>
                                <div className='form-group col-md-6'>
                                    <label htmlFor='dmDonViQdThanhLap'>Quyết định thành lập</label>
                                    <input className='form-control' id='dmDonViQdThanhLap' type='text' placeholder='Quyết định thành lập' readOnly={readOnly} />
                                </div>

                                <div className='form-group col-md-6'>
                                    <label htmlFor='dmDonViMaPL'>Mã PL</label>
                                    <input className='form-control' id='dmDonViMaPL' type='text' placeholder='Mã PL' readOnly={readOnly} />
                                </div>
                                <div className='form-group col-md-6'>
                                    <label htmlFor='dmDonViQdXoaTen'>Quyết định xóa tên</label>
                                    <input className='form-control' id='dmDonViQdXoaTen' type='text' placeholder='Quyết định xóa tên' readOnly={readOnly} />
                                </div>
                                <div className='form-group col-md-12'>
                                    <label htmlFor='dmDonViDuongDan'>Đường dẫn</label>
                                    <input className='form-control' id='dmDonViDuongDan' type='text' placeholder='Đường dẫn' readOnly={readOnly} />
                                </div>
                                <div className='form-group col-12'>
                                    <label htmlFor='dmDonViImage'>Hình ảnh</label>
                                    <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='DmDonViImage' />
                                </div>
                                <div className='form-group col-12'>
                                    <label>Ghi chú</label>
                                    <textarea className='form-control' id='dmDonViGhiChu' placeholder='Ghi chú' readOnly={readOnly} rows={3} />
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly && <button type='submit' className='btn btn-success'>Lưu</button>}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DmDonViPage extends React.Component {
    state = { searching: false };
    searchBox = React.createRef();
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/danh-muc/don-vi', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmDonVi(item.ma, { ma: item.ma, kichHoat: item.kichHoat ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục đơn vị', 'Bạn có chắc bạn muốn xóa đơn vị này?', true, isConfirm =>
            isConfirm && this.props.deleteDmDonVi(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmDonVi:write'),
            permissionUpload = currentPermissions.includes('dmDonVi:upload'),
            permissionDelete = currentPermissions.includes('dmDonVi:delete');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.dmDonVi && this.props.dmDonVi.page ?
            this.props.dmDonVi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = 'Không có danh sách đơn vị!';
        if (this.props.dmDonVi && this.props.dmDonVi.page && this.props.dmDonVi.page.list && this.props.dmDonVi.page.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            {/* <th style={{ width: 'auto', textAlign: 'center' }}>#</th> */}
                            <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                            <th style={{ width: '50%' }}>Tên đơn vị</th>
                            <th style={{ width: '50%' }}>Tên tiếng Anh</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã PL</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.dmDonVi.page.list.map((item, index) => (
                            <tr key={index}>
                                {/* <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td> */}
                                <td style={{ textAlign: 'right' }}><a href='#' onClick={e => this.edit(e, item)}>{item.ma}</a></td>
                                <td>{item.ten}</td>
                                <td>{item.tenTiengAnh}</td>
                                <td style={{ textAlign: 'right' }}>{item.maPl}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat == '1' ? true : false} onChange={() => permissionWrite && this.changeActive(item)} />
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
                                                <i className='fa fa-trash-o fa-lg'></i>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Đơn vị</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmDonViPage} setSearching={value => this.setState({ searching: value })} />
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Đơn vị
                    </ul>
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name={PageName} style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite}
                        createDmDonVi={this.props.createDmDonVi} updateDmDonVi={this.props.updateDmDonVi} />
                    <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>
                    {permissionWrite &&
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                            <i className='fa fa-lg fa-plus' />
                        </button>}
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmDonVi: state.dmDonVi });
const mapActionsToProps = { getDmDonViPage, createDmDonVi, updateDmDonVi, deleteDmDonVi };
export default connect(mapStateToProps, mapActionsToProps)(DmDonViPage);