import React from 'react';
import { connect } from 'react-redux';
import { getDmLinhVucKinhDoanhAll, deleteDmLinhVucKinhDoanh, createDmLinhVucKinhDoanh, updateDmLinhVucKinhDoanh, getDmLinhVucKinhDoanhPage } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { kichHoat: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmLinhVucKinhDoanhTen').focus());
        }, 250));
    }

    show = (item) => {
        let { ma, ten, moTa, kichHoat } = item ? item : { ma: '', ten: '', moTa: '', kichHoat: true };
        $('#dmLinhVucKinhDoanhTen').val(ten);
        $('#dmLinhVucKinhDoanhMoTa').val(moTa);
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-id', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ten: $('#dmLinhVucKinhDoanhTen').val().trim(),
                moTa: $('#dmLinhVucKinhDoanhMoTa').val().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ten == '') {
            T.notify('Tên danh mục bị trống');
            $('#dmLinhVucKinhDoanhTen').focus();
        } else {
            if (ma) {
                this.props.updateDmLinhVucKinhDoanh(ma, changes);
            } else {
                this.props.createDmLinhVucKinhDoanh(changes);
            }
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin danh mục Lĩnh vực kinh doanh</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>

                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmLinhVucKinhDoanhTen'>Tên</label>
                                <input className='form-control' id='dmLinhVucKinhDoanhTen' type='text' placeholder='Tên' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmLinhVucKinhDoanhMoTa'>Mô tả</label>
                                <textarea className='form-control' style={{ minHeight: 80 }} id='dmLinhVucKinhDoanhMoTa' placeholder='Mô tả' />
                            </div>
                            <div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
                                <label htmlFor='dmMucDichNuocNgoaiActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmMucDichNuocNgoaiActive' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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

class DmLinhVucKinhDoanhPage extends React.Component {
    state = { searching: false };
    modal = React.createRef();
    searchBox = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => {
            this.searchBox.current.getPage();
        });
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmLinhVucKinhDoanh(item.ma, { kichHoat: Number(!item.kichHoat) });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa lĩnh vực kinh doanh', 'Bạn có chắc bạn muốn xóa lĩnh vực kinh doanh này?', true, isConfirm =>
            isConfirm && this.props.deleteDmLinhVucKinhDoanh(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmLinhVucKinhDoanh:write'),
            permissionDelete = currentPermissions.includes('dmLinhVucKinhDoanh:delete');
        let table = 'Không có danh sách!',
            { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmLinhVucKinhDoanh && this.props.dmLinhVucKinhDoanh.page ?
                this.props.dmLinhVucKinhDoanh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '40%', textAlign: 'center' }}>Tên</th>
                            <th style={{ width: '60%', textAlign: 'center' }}>Mô tả</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ten}</a></td>
                                <td>{item.moTa}</td>
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
                    <h1><i className='fa fa-list-alt' /> Lĩnh vực kinh doanh</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmLinhVucKinhDoanhPage} setSearching={value => this.setState({ searching: value })} />
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Lĩnh vực kinh doanh
                    </ul>
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='pageDmLinhVucKinhDoanh' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.props.getDmLinhVucKinhDoanhPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite} dmLinhVucKinhDoanh={this.props.dmLinhVucKinhDoanh}
                        createDmLinhVucKinhDoanh={this.props.createDmLinhVucKinhDoanh} updateDmLinhVucKinhDoanh={this.props.updateDmLinhVucKinhDoanh} />
                    {permissionWrite &&
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                            <i className='fa fa-lg fa-plus' />
                        </button>}
                    <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '30px', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmLinhVucKinhDoanh: state.dmLinhVucKinhDoanh });
const mapActionsToProps = { getDmLinhVucKinhDoanhAll, deleteDmLinhVucKinhDoanh, createDmLinhVucKinhDoanh, updateDmLinhVucKinhDoanh, getDmLinhVucKinhDoanhPage };
export default connect(mapStateToProps, mapActionsToProps)(DmLinhVucKinhDoanhPage);