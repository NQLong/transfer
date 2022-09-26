import React from 'react';
import { connect } from 'react-redux';
import { getDmCoSoKcbPage, createDmCoSoKcb, getDmCoSoKcbAll, updateDmCoSoKcb, deleteDmCoSoKcb } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, getValue } from 'view/component/AdminPage';
import T from 'view/js/common';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() =>
            this.onShown(() => {
                this.ten.focus();
            })
        );
    }

    onShow = (item) => {
        const { ma, ten, diaChi, ghiChu, loaiDangKy, loaiCoSo } = item ? item : { ma: '', ten: '', diaChi: '', ghiChu: '', loaiDangKy: 0, loaiCoSo: 0 };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.diachi.value(diaChi);
        this.loaiDangKy.value(loaiDangKy);
        this.loaiCoSo.value(loaiCoSo);
        this.ghiChu.value(ghiChu ? ghiChu : '');
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            ten: getValue(this.ten),
            diaChi: getValue(this.diachi),
            loaiDangKy: getValue(this.loaiDangKy),
            loaiCoSo: getValue(this.loaiCoSo),
            ghiChu: getValue(this.ghiChu),
        };
        this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật cơ sở khám chữa bệnh' : 'Tạo mới cơ sở khám chữa bệnh',
            body: (
                <div className='row'>
                    <FormTextBox className='col-md-12' ref={(e) => (this.ma = e)} label='Mã' readOnly={this.state.ma ? true : readOnly} required />
                    <FormTextBox type='text' className='col-md-12' ref={(e) => (this.ten = e)} label='Tên' readOnly={readOnly} required />
                    <FormTextBox type='text' className='col-md-12' ref={(e) => (this.diachi = e)} label='Địa chỉ' readOnly={readOnly} required />
                    <FormTextBox type='number' className='col-md-6' ref={(e) => (this.loaiDangKy = e)} label='Loại đăng ký' readOnly={readOnly} step={1} />
                    <FormTextBox type='number' className='col-md-6' ref={(e) => (this.loaiCoSo = e)} label='Loại cơ sở' readOnly={readOnly} step={1} />
                    <FormTextBox type='text' className='col-md-12' ref={(e) => (this.ghiChu = e)} label='Ghi chú' readOnly={readOnly} />
                </div>
            ),
        });
    };
}

class DmCoSoKcbPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmCoSoKcbPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmCoSoKcbPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục cơ sở', 'Bạn có chắc bạn muốn xóa cơ sở này?', true, (isConfirm) => isConfirm && this.props.deleteDmCoSoKcb(item.ma));
    };

    render() {
        const permission = this.getUserPermission('dmCoSoKcb', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmCoSoKcb && this.props.dmCoSoKcb.page ? this.props.dmCoSoKcb.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        const table = renderTable({
            getDataSource: () => {
                return list;
            },
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '50%' }}>Tên cơ sở</th>
                    <th style={{ width: '50%' }}>Địa chỉ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={pageSize * pageNumber + index + 1 - pageSize} />
                    <TableCell type='text' content={item.ma.toString()} />
                    <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                    <TableCell type='text' content={item.diaChi} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={(e) => this.delete(e, item)}></TableCell>
                </tr>
            ),
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục cơ sở khám chữa bệnh BHYT',
            breadcrumb: [
                <Link key={0} to={'/user/category'}>
                    Danh mục
                </Link>,
                'Danh mục cơ sở khám chữa bệnh',
            ],
            content: (
                <>
                    <div className='tile'>{table}</div>
                    <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmCoSoKcbPage} />
                    <EditModal ref={(e) => (this.modal = e)} readOnly={!permission.write} create={this.props.createDmCoSoKcb} update={this.props.updateDmCoSoKcb} />
                </>
            ),
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = (state) => ({
    system: state.system,
    dmCoSoKcb: state.danhMuc.dmCoSoKcb,
});
const mapActionsToProps = { getDmCoSoKcbPage, getDmCoSoKcbAll, createDmCoSoKcb, updateDmCoSoKcb, deleteDmCoSoKcb };
export default connect(mapStateToProps, mapActionsToProps)(DmCoSoKcbPage);
