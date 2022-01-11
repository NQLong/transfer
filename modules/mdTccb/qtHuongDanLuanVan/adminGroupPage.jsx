import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtHuongDanLuanVanPage, getQtHuongDanLuanVanAll, updateQtHuongDanLuanVan,
    deleteQtHuongDanLuanVan, createQtHuongDanLuanVan, getQtHuongDanLuanVanGroupPageMa
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

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
                <FormSelect type='text' className='col-md-12' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.hoTen = e} label='Danh sách họ tên sinh viên, học viên' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenLuanVan = e} label='Tên luận văn' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.namTotNghiep = e} label='Năm tốt nghiệp' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.sanPham = e} label='Sản phẩm' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.bacDaoTao = e} label='Bậc hướng dẫn luận văn' readOnly={readOnly} />
            </div>
        });
    }
}

class QtHuongDanLuanVanGroup extends AdminPage {
    ma = ''; loaiDoiTuong = '-1';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/hdlv/group/:loaiDoiTuong/:ma'),
                params = route.parse(window.location.pathname);
            this.loaiDoiTuong = params.loaiDoiTuong;
            this.ma = params.ma;
            T.onSearch = (searchText) => this.props.getQtHuongDanLuanVanPage(undefined, undefined, this.loaiDoiTuong, searchText || '');
            T.showSearchBox();
            this.props.getQtHuongDanLuanVanGroupPageMa(undefined, undefined, this.loaiDoiTuong, this.ma);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa hướng dẫn luận văn', 'Bạn có chắc bạn muốn xóa hướng dẫn luận văn này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHuongDanLuanVan(item.id, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá hướng dẫn luận văn bị lỗi!', 'danger');
                else T.alert('Xoá hướng dẫn luận văn thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtHuongDanLuanVan', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtHuongDanLuanVan && this.props.qtHuongDanLuanVan.page ? this.props.qtHuongDanLuanVan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
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
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
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
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
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
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtNghienCuuKhoaHocPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtHuongDanLuanVan} update={this.props.updateQtHuongDanLuanVan}
                    permissions={currentPermissions}

                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHuongDanLuanVan: state.qtHuongDanLuanVan });
const mapActionsToProps = {
    getQtHuongDanLuanVanAll, getQtHuongDanLuanVanPage, deleteQtHuongDanLuanVan, createQtHuongDanLuanVan,
    updateQtHuongDanLuanVan, getQtHuongDanLuanVanGroupPageMa
};
export default connect(mapStateToProps, mapActionsToProps)(QtHuongDanLuanVanGroup);