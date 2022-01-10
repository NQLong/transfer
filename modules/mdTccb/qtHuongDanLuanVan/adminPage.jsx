import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtHuongDanLuanVanPage, getQtHuongDanLuanVanAll, updateQtHuongDanLuanVan,
    deleteQtHuongDanLuanVan, createQtHuongDanLuanVan
} from './redux';
import { getStaffAll, SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class EditModal extends AdminModal {
    state = { id: null };
    componentDidMount() {
    }

    onShow = (item) => {
        let { shcc, hoTen, tenLuanVan, namTotNghiep, sanPham, bacDaoTao, id } = item ? item : {
            shcc: '', hoTen: '', tenLuanVan: '', namTotNghiep: '', sanPham: '', bacDaoTao: '', id: ''
            };
        this.setState({ id, item });
        this.shcc.value(shcc ? shcc : '');
        this.hoTen.value(hoTen ? hoTen : '');
        this.tenLuanVan.value(tenLuanVan ? tenLuanVan : '');
        this.namTotNghiep.value(namTotNghiep ? namTotNghiep : '');
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
            namTotNghiep: Number(this.tenLuanVan.value()),
            sanPham: this.sanPham.value(),
            bacDaoTao: this.bacDaoTao.value(),
        };
        if (changes.shcc == '') {
            T.notify('Mã số cán bộ bị trống');
            this.shcc.focus();
        } else {
            this.state.id ? this.props.update(this.state.stt, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.stt ? 'Cập nhật quá trình hướng dẫn luận văn' : 'Tạo mới quá trình hướng dẫn luận văn',
            size: 'large',
            body: <div className='row'>
                <FormSelect type='text' className='col-md-12' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Mã thẻ cán bộ' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.hoTen = e} label='Họ Tên' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenLuanVan = e} label='Tên Luận Văn' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.namTotNghiep = e} label='Năm tốt nghiệp' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.sanPham = e} label='Sản phẩm' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.bacDaoTao = e} label='Bậc hướng dẫn luận văn' readOnly={readOnly} />
            </div>
        });
    }
}

class QtHuongDanLuanVan extends AdminPage {
    checked = true;

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => {
                // if (this.checked) this.props.getQtHuongDanLuanVanGroupPage(undefined, undefined, searchText || ''); 
                this.props.getQtHuongDanLuanVanPage(undefined, undefined, searchText || '');
            };
            T.showSearchBox();
            this.props.getQtHuongDanLuanVanPage(undefined, undefined, '');
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    // groupPage = () => {
    //     this.checked = !this.checked;
    //     this.props.getQtHuongDanLuanVanGroupPage(undefined, undefined, '');
    // }

    delete = (e, item) => {
        T.confirm('Xóa quá trình hướng dẫn luận văn', 'Bạn có chắc bạn muốn xóa quá trình hướng dẫn luận văn này', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHuongDanLuanVan(item.stt, error => {
                if (error) T.notify(error.message ? error.message : `Xoá quá trình hướng dẫn luận văn ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá quá trình hướng dẫn luận văn ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtHuongDanLuanVan', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = (this.props.qtHuongDanLuanVan && this.props.qtHuongDanLuanVan.page ? this.props.qtHuongDanLuanVan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });

        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '25%', textAlign: 'center' }}>Cán bộ</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Họ tên</th>
                        <th style={{ width: '35%', textAlign: 'center' }}>Tên luận văn</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Năm tốt nghiệp</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Sản phẩm</th>
                        <th style={{ width: '25%', textAlign: 'center' }}>Bậc đào tạo</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                {/* <span>{item.ho + ' ' + item.ten}</span><br /> */}
                                <a href='#' onClick={() => this.modal.show(item)}>{item.shcc}</a>
                            </>
                        )}
                        />
                        <TableCell type='text' style={{}} content={item.hoTen} />
                        <TableCell type='text' style={{}} content={item.tenLuanVan} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.namTotNghiep} />
                        <TableCell type='text' content={item.sanPham} />
                        <TableCell type='text' content={item.bacDaoTao} />
                        {
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} > </TableCell>
                        }
                        {/* {
                            // this.checked &&
                            <TableCell type='buttons' style={{ textAlign: 'center', width: '45px' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/nghi-thai-san/group/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        } */}
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa-book-open',
            title: 'Hướng dẫn luận văn',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình hướng dẫn luận văn'
            ],
            content: <>
                <div className='tile'>
                    {/* <FormCheckbox label='Hiển thị theo cán bộ' onChange={this.groupPage} /> */}
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtHuongDanLuanVanPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtHuongDanLuanVan} update={this.props.updateQtHuongDanLuanVan}
                    getDonVi={this.props.getDmDonViAll} permissions={currentPermissions}
                    getChucVu={this.props.getDmChucVuAll}
                    getStaff={this.props.getStaffAll} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHuongDanLuanVan: state.qtHuongDanLuanVan });
const mapActionsToProps = {
    getQtHuongDanLuanVanAll, getQtHuongDanLuanVanPage, deleteQtHuongDanLuanVan, createQtHuongDanLuanVan,
    updateQtHuongDanLuanVan, getStaffAll
};
export default connect(mapStateToProps, mapActionsToProps)(QtHuongDanLuanVan);