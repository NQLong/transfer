import React from 'react';
import { connect } from 'react-redux';
import { getDmNguonKinhPhiTrongNuocPage, deleteDmNguonKinhPhiTrongNuoc, createDmNguonKinhPhiTrongNuoc, updateDmNguonKinhPhiTrongNuoc } from './redux';
import AdminSearchBox from 'view/component/AdminSearchBox';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class EditModal extends React.Component {
    state = { kichHoat: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmNguonKinhPhiTrongNuocMa').focus());
        }, 250));
    }

    show = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: '', moTa: '', kichHoat: true };
        $('#dmNguonKinhPhiTrongNuocMa').val(ma);
        $('#dmNguonKinhPhiTrongNuocMoTa').val(moTa);
        this.setState({ kichHoat });
        $(this.modal.current).attr('data-id', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ma: $('#dmNguonKinhPhiTrongNuocMa').val().trim(),
                moTa: $('#dmNguonKinhPhiTrongNuocMoTa').val().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống!');
            $('#dmNguonKinhPhiTrongNuocMa').focus();
        } else if (changes.moTa == '') {
            T.notify('Mô tả danh mục bị trống!');
            $('#dmNguonKinhPhiTrongNuocMoTa').focus();
        } else if (!ma && this.props.dmNguonKinhPhiTrongNuoc.page.list.find(item => item.ma == changes.ma)) {
            T.notify('Mã danh mục đã tồn tại!');
            $('#dmNguonKinhPhiTrongNuocMa').focus();
        } else {
            if (ma) {
                this.props.updateDmNguonKinhPhiTrongNuoc(ma, changes);
            } else {
                this.props.createDmNguonKinhPhiTrongNuoc(changes);
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
                            <h5 className='modal-title'>Thông tin Nguồn kinh phí trong nước</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmNguonKinhPhiTrongNuocMa'>Mã</label>
                                <input className='form-control' id='dmNguonKinhPhiTrongNuocMa' type='text' placeholder='Mã danh mục' maxLength={2} readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmNguonKinhPhiTrongNuocMoTa'>Mô tả</label>
                                <input className='form-control' id='dmNguonKinhPhiTrongNuocMoTa' type='text' placeholder='Mô tả' readOnly={readOnly} />
                            </div>
                            <div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
                                <label htmlFor='dmNguonKinhPhiTrongNuocActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmNguonKinhPhiTrongNuocActive' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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

class DmNguonKinhPhiTrongNuocPage extends AdminPage {
    state = { searching: false };
    searchBox = React.createRef();
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => {
        this.props.updateDmNguonKinhPhiTrongNuoc(item.ma, { kichHoat: Number(!item.kichHoat) });
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa nguồn kinh phí trong nước!', 'Bạn có chắc bạn muốn xóa Nguồn kinh phí trong nước này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNguonKinhPhiTrongNuoc(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmNguonKinhPhiTrongNuoc:write'),
            permissionDelete = currentPermissions.includes('dmNguonKinhPhiTrongNuoc:delete'),
            permission = this.getUserPermission('dmNguonKinhPhiTrongNuoc', ['write', 'delete']);
        let table = 'Không có danh sách!',
            { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNguonKinhPhiTrongNuoc && this.props.dmNguonKinhPhiTrongNuoc.page ?
                this.props.dmNguonKinhPhiTrongNuoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        if (!this.state.searching && list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Mô tả</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} style={{ textAlign: 'right' }} />
                        <TableCell type='link' content={item.ma} onClick={(e) => this.edit(e, item)} />
                        <TableCell type='text' content={item.moTa} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                    </tr>
                ),
            });
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Kinh phí trong nước</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmNguonKinhPhiTrongNuocPage} setSearching={value => this.setState({ searching: value })} />
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp; Kinh phí trong nước
                    </ul>
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='pageDmNguonKinhPhiTrongNuoc' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                </div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} dmNguonKinhPhiTrongNuoc={this.props.dmNguonKinhPhiTrongNuoc}
                    createDmNguonKinhPhiTrongNuoc={this.props.createDmNguonKinhPhiTrongNuoc} updateDmNguonKinhPhiTrongNuoc={this.props.updateDmNguonKinhPhiTrongNuoc} />
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

const mapStateToProps = state => ({ system: state.system, dmNguonKinhPhiTrongNuoc: state.dmNguonKinhPhiTrongNuoc });
const mapActionsToProps = { getDmNguonKinhPhiTrongNuocPage, deleteDmNguonKinhPhiTrongNuoc, createDmNguonKinhPhiTrongNuoc, updateDmNguonKinhPhiTrongNuoc };
export default connect(mapStateToProps, mapActionsToProps)(DmNguonKinhPhiTrongNuocPage);