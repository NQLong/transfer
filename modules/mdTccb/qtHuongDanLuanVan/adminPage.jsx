import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtHuongDanLuanVanPage, getQtHuongDanLuanVanAll, updateQtHuongDanLuanVan,
    deleteQtHuongDanLuanVan, createQtHuongDanLuanVan, getQtHuongDanLuanVanGroupPage
} from './redux';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

class EditModal extends AdminModal {
    state = { id: null };
    componentDidMount() {
    }

    onShow = (item) => {
        let { shcc, hoTen, tenLuanVan, namTotNghiep, sanPham, bacDaoTao, id } = item ? item : {
            shcc: '', hoTen: '', tenLuanVan: '', namTotNghiep: null, sanPham: '', bacDaoTao: '', id: ''
        };
        this.setState({ id, item });
        this.shcc.value(shcc ? shcc : '');
        this.hoTen.value(hoTen ? hoTen : '');
        this.tenLuanVan.value(tenLuanVan ? tenLuanVan : '');
        if (namTotNghiep) this.namTotNghiep.setVal(new Date(namTotNghiep.toString()));
        this.sanPham.value(sanPham ? sanPham : '');
        this.bacDaoTao.value(bacDaoTao ? bacDaoTao : '');
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            hoTen: this.hoTen.value(),
            tenLuanVan: this.tenLuanVan.value(),
            namTotNghiep: this.namTotNghiep.getVal() ? new Date(this.namTotNghiep.getVal()).getFullYear() : null,
            sanPham: this.sanPham.value(),
            bacDaoTao: this.bacDaoTao.value(),
        };
        if (changes.shcc == '') {
            T.notify('Mã số cán bộ bị trống');
            this.shcc.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình hướng dẫn luận văn' : 'Tạo mới quá trình hướng dẫn luận văn',
            size: 'large',
            body: <div className='row'>
                <FormSelect type='text' className='col-md-12' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly={this.state.id ? true : false} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.hoTen = e} label='Danh sách họ tên sinh viên, học viên' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenLuanVan = e} label='Tên luận văn' readOnly={readOnly} />
                <div className='form-group col-md-4'><DateInput ref={e => this.namTotNghiep = e} label='Năm tốt nghiệp' type='year' readOnly={readOnly} /></div>
                <FormTextBox type='text' className='col-md-4' ref={e => this.sanPham = e} label='Sản phẩm' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.bacDaoTao = e} label='Bậc hướng dẫn luận văn' readOnly={readOnly} />
            </div>
        });
    }
}

class QtHuongDanLuanVan extends AdminPage {
    checked = false;
    curState = [];
    searchText = '';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => {
                this.searchText = searchText;
                if (this.checked) this.props.getQtHuongDanLuanVanGroupPage(undefined, undefined, this.curState, this.searchText || '');
                else this.props.getQtHuongDanLuanVanPage(undefined, undefined, this.curState, this.searchText || '');
            };
            T.showSearchBox(() => {
                this.loaiDoiTuong?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
                setTimeout(() => this.showAdvanceSearch(), 1000);
            });
            this.changeAdvancedSearch();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = () => {
        let { pageNumber, pageSize } = this.props && this.props.qtHuongDanLuanVan && this.props.qtHuongDanLuanVan.page ? this.props.qtHuongDanLuanVan.page : { pageNumber: 1, pageSize: 50 };
        const loaiDoiTuong = this.loaiDoiTuong?.value() || [];
        this.curState = loaiDoiTuong;
        if (this.checked) this.props.getQtHuongDanLuanVanGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtHuongDanLuanVanPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    groupPage = () => {
        let { pageNumber, pageSize } = this.props && this.props.qtHuongDanLuanVan && this.props.qtHuongDanLuanVan.page ? this.props.qtHuongDanLuanVan.page : { pageNumber: 1, pageSize: 50 };
        this.checked = !this.checked;
        if (this.checked) this.props.getQtHuongDanLuanVanGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtHuongDanLuanVanPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    delete = (e, item) => {
        T.confirm('Xóa hướng dẫn luận văn', 'Bạn có chắc bạn muốn xóa hướng dẫn luận văn này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHuongDanLuanVan(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá hướng dẫn luận văn bị lỗi!', 'danger');
                else T.alert('Xoá hướng dẫn luận văn thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtHuongDanLuanVan', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtHuongDanLuanVan && this.props.qtHuongDanLuanVan.page_gr ?
                this.props.qtHuongDanLuanVan.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtHuongDanLuanVan && this.props.qtHuongDanLuanVan.page ? this.props.qtHuongDanLuanVan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ tên sinh viên</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên luận văn</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm tốt nghiệp</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Bậc đào tạo</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : '') + ' ' + (item.tenCanBo ? item.tenCanBo : '')}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />
                        <TableCell type='text' content={item.hoTen} />
                        <TableCell type='text' style={{}} content={<>
                            <span><i>{item.tenLuanVan}</i></span><br />
                            {item.sanPham ? <span>Sản phẩm: {item.sanPham ? item.sanPham : ''}</span> : null}
                        </>} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namTotNghiep} />
                        <TableCell type='text' content={item.bacDaoTao} style={{ whiteSpace: 'nowrap' }} />
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/hdlv/group/-1/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Hướng dẫn luận văn',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình hướng dẫn luận văn'
            ],
            advanceSearch: <>
                <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.loaiDoiTuong = e} label='Chọn loại đơn vị (có thể chọn nhiều loại)' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} />
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.checked ? this.props.getQtHuongDanLuanVanGroupPage : this.props.getQtHuongDanLuanVanPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtHuongDanLuanVan} update={this.props.updateQtHuongDanLuanVan}
                    permissions={currentPermissions}

                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHuongDanLuanVan: state.tccb.qtHuongDanLuanVan });
const mapActionsToProps = {
    getQtHuongDanLuanVanAll, getQtHuongDanLuanVanPage, deleteQtHuongDanLuanVan, createQtHuongDanLuanVan,
    updateQtHuongDanLuanVan, getQtHuongDanLuanVanGroupPage
};
export default connect(mapStateToProps, mapActionsToProps)(QtHuongDanLuanVan);