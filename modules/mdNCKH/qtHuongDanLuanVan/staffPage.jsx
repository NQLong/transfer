import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtHuongDanLuanVanUserPage, deleteQtHuongDanLuanVanUserPage,
    createQtHuongDanLuanVanUserPage, getQtHuongDanLuanVanUserPage,
} from './redux';

class EditModal extends AdminModal {
    state = {
        id: null,
        shcc: '',
    }

    onShow = (item) => {
        let { hoTen, tenLuanVan, namTotNghiep, sanPham, bacDaoTao, id } = item && item.item ? item.item : {
            hoTen: '', tenLuanVan: '', namTotNghiep: null, sanPham: '', bacDaoTao: '', id: ''
        };
        this.setState({
            id, item,
            shcc: item.shcc
        });
        setTimeout(() => {
            this.hoTen.value(hoTen ? hoTen : '');
            this.tenLuanVan.value(tenLuanVan ? tenLuanVan : '');
            this.namTotNghiep.value(namTotNghiep ? namTotNghiep : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.bacDaoTao.value(bacDaoTao ? bacDaoTao : '');
        }, 100);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
            hoTen: this.hoTen.value(),
            tenLuanVan: this.tenLuanVan.value(),
            namTotNghiep: this.namTotNghiep.value(),
            sanPham: this.sanPham.value(),
            bacDaoTao: this.bacDaoTao.value(),
        };

        if (!this.tenLuanVan.value()) {
            T.notify('Tên luận văn trống', 'danger');
            this.tenLuanVan.focus();
        } else if (!this.namTotNghiep.value()) {
            T.notify('Năm tốt nghiệp trống', 'danger');
            this.namTotNghiep.focus();
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
                <FormTextBox type='text' className='col-md-12' ref={e => this.hoTen = e} label='Danh sách họ tên sinh viên, học viên' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenLuanVan = e} label='Tên luận văn' readOnly={readOnly} required />
                <FormTextBox className='col-md-4' ref={e => this.namTotNghiep = e} label='Năm tốt nghiệp (yyyy)' type='year' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-4' ref={e => this.sanPham = e} label='Sản phẩm' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.bacDaoTao = e} label='Bậc hướng dẫn luận văn' readOnly={readOnly} />
            </div>
        });
    }
}

class QtHuongDanLuanVanStaffUserPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { listShcc: shcc, listDv: '', fromYear: null, toYear: null } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtHuongDanLuanVanUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.listShcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin hướng dẫn luận văn', 'Bạn có chắc bạn muốn xóa thông tin hướng dẫn luận văn này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHuongDanLuanVanUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin hướng dẫn luận văn bị lỗi!', 'danger');
                else T.alert('Xoá thông tin hướng dẫn luận văn thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        let permission = this.getUserPermission('staff', ['login']);
        if (permission.login == true) {
            permission = {
                write: true,
                delete: true
            };
        }
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtHuongDanLuanVan && this.props.qtHuongDanLuanVan.userPage ? this.props.qtHuongDanLuanVan.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ tên sinh viên</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên luận văn</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm tốt nghiệp</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Bậc đào tạo</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.hoTen} />
                        <TableCell type='text' style={{}} content={<>
                            <span><i>{item.tenLuanVan}</i></span><br />
                            {item.sanPham ? <span>Sản phẩm: {item.sanPham ? item.sanPham : ''}</span> : null}
                        </>} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namTotNghiep} />
                        <TableCell type='text' content={item.bacDaoTao} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ item, shcc })} onDelete={this.delete} >
                        </TableCell>

                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Quá trình hướng dẫn luận văn',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Hướng dẫn luận văn'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} shcc={shcc} readOnly={!permission.write}
                    create={this.props.createQtHuongDanLuanVanUserPage} update={this.props.updateQtHuongDanLuanVanUserPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            // onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/huong-dan-luan-van/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHuongDanLuanVan: state.khcn.qtHuongDanLuanVan });
const mapActionsToProps = {
    updateQtHuongDanLuanVanUserPage, deleteQtHuongDanLuanVanUserPage,
    createQtHuongDanLuanVanUserPage, getQtHuongDanLuanVanUserPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtHuongDanLuanVanStaffUserPage);