import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtHuongDanLuanVanGroupPageMa, deleteQtHuongDanLuanVanGroupPageMa, createQtHuongDanLuanVanGroupPageMa, getQtHuongDanLuanVanGroupPageMa,
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class EditModal extends AdminModal {
    state = {
        id: null,
    }

    onShow = (item) => {
        let { shcc, hoTen, tenLuanVan, namTotNghiep, sanPham, bacDaoTao, id } = item ? item : {
            shcc: '', hoTen: '', tenLuanVan: '', namTotNghiep: null, sanPham: '', bacDaoTao: '', id: ''
        };
        this.setState({ id, item });
        setTimeout(() => {
            this.shcc.value(shcc ? shcc : this.props.shcc);
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
            shcc: this.shcc.value(),
            hoTen: this.hoTen.value(),
            tenLuanVan: this.tenLuanVan.value(),
            namTotNghiep: this.namTotNghiep.value(),
            sanPham: this.sanPham.value(),
            bacDaoTao: this.bacDaoTao.value(),
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
            this.maCanBo.focus();
        } else if (!this.tenLuanVan.value()) {
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
                <FormSelect type='text' className='col-md-12' multiple={this.multiple} ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly={true} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.hoTen = e} label='Danh sách họ tên sinh viên, học viên' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenLuanVan = e} label='Tên luận văn' readOnly={readOnly} required />
                <FormTextBox className='col-md-4' ref={e => this.namTotNghiep = e} label='Năm tốt nghiệp (yyyy)' type='year' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-4' ref={e => this.sanPham = e} label='Sản phẩm' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.bacDaoTao = e} label='Bậc hướng dẫn luận văn' readOnly={readOnly} />
            </div>
        });
    }
}

class QtHuongDanLuanVanGroupPage extends AdminPage {
    state = { filter: {} };
    searchText = '';
    menu = '';
    componentDidMount() {
        this.menu = T.routeMatcher('/user/:khcn/qua-trinh/hdlv/group/:shcc').parse(window.location.pathname).khcn;
        T.ready('/user/' + this.menu, () => {
            T.clearSearchBox();
            const route = T.routeMatcher(`/user/${this.menu}/qua-trinh/hdlv/group/:shcc`),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.setState({ filter: { listShcc: params.shcc, listDv: '' } });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');

            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtHuongDanLuanVan && this.props.qtHuongDanLuanVan.pageMa ? this.props.qtHuongDanLuanVan.pageMa : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : Number(this.fromYear?.value());
        const toYear = this.toYear?.value() == '' ? null : Number(this.toYear?.value());
        const listDv = this.state.filter.listDv;
        const listShcc = this.state.filter.listShcc;
        const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtHuongDanLuanVanGroupPageMa(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin hướng dẫn luận văn', 'Bạn có chắc bạn muốn xóa thông tin hướng dẫn luận văn này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHuongDanLuanVanGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin hướng dẫn luận văn bị lỗi!', 'danger');
                else T.alert('Xoá thông tin hướng dẫn luận văn thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('qtHuongDanLuanVan', ['read', 'write', 'delete', 'readOnly']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtHuongDanLuanVan && this.props.qtHuongDanLuanVan.pageMa ? this.props.qtHuongDanLuanVan.pageMa : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
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
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br/>Đơn vị công tác</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.hoTen} />
                        <TableCell type='text' style={{}} content={<>
                            <span><i>{item.tenLuanVan}</i></span><br />
                            {item.sanPham ? <span>Sản phẩm: {item.sanPham || ''}</span> : null}
                        </>} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namTotNghiep} />
                        <TableCell type='text' content={item.bacDaoTao} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHocVi || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span> {item.tenChucVu || ''}<br /> </span>
                                {(item.tenDonVi || '')}
                            </>
                        )} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                        </TableCell>

                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Quá trình hướng dẫn luận văn - Cán bộ',
            breadcrumb: [
                <Link key={0} to={'/user/' + this.menu}>{this.menu == 'tccb' ? 'Tổ chức cán bộ' : 'Khoa học công nghệ'}</Link>,
                <Link key={0} to={`/user/${this.menu}/qua-trinh/hdlv`}>Quá trình hướng dẫn luận văn</Link>,
                'Quá trình hướng dẫn luận văn - Cán bộ',
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormTextBox className='col-md-3' ref={e => this.fromYear = e} label='Từ năm (năm tốt nghiệp)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormTextBox className='col-md-3' ref={e => this.toYear = e} label='Đến năm (năm tốt nghiệp)' type='year' onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    shcc={this.shcc}
                    create={this.props.createQtHuongDanLuanVanGroupPageMa} update={this.props.updateQtHuongDanLuanVanGroupPageMa}
                />
            </>,
            backRoute: `/user/${this.menu}/qua-trinh/hdlv`,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHuongDanLuanVan: state.khcn.qtHuongDanLuanVan });
const mapActionsToProps = {
    updateQtHuongDanLuanVanGroupPageMa, deleteQtHuongDanLuanVanGroupPageMa,
    createQtHuongDanLuanVanGroupPageMa, getQtHuongDanLuanVanGroupPageMa,
};
export default connect(mapStateToProps, mapActionsToProps)(QtHuongDanLuanVanGroupPage);