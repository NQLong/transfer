import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtHuongDanLuanVanGroupPageMa, deleteQtHuongDanLuanVanGroupPageMa,
    createQtHuongDanLuanVanGroupPageMa, getQtHuongDanLuanVanPage,
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
                <FormSelect type='text' className='col-md-12' multiple={this.multiple} ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly={true} required/>
                <FormTextBox type='text' className='col-md-12' ref={e => this.hoTen = e} label='Danh sách họ tên sinh viên, học viên' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenLuanVan = e} label='Tên luận văn' readOnly={readOnly} required />
                <FormTextBox className='col-md-4' ref={e => this.namTotNghiep = e} label='Năm tốt nghiệp (yyyy)' type='year' readOnly={false} required />
                <FormTextBox type='text' className='col-md-4' ref={e => this.sanPham = e} label='Sản phẩm' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.bacDaoTao = e} label='Bậc hướng dẫn luận văn' readOnly={readOnly} />
            </div>
        });
    }
}

class QtHuongDanLuanVanGroupPage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/hdlv/group/:shcc'),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.setState({filter: {list_shcc: params.shcc, list_dv: ''}});
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');

            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.props.getQtHuongDanLuanVanPage(undefined, undefined, undefined, this.state.filter, () => {
                T.updatePage('pageQtHuongDanLuanVan', undefined, undefined, undefined, this.state.filter);
            });
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtHuongDanLuanVan && this.props.qtHuongDanLuanVan.page ? this.props.qtHuongDanLuanVan.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : Number(this.fromYear?.value());
        const toYear = this.toYear?.value() == '' ? null : Number(this.toYear?.value());
        const list_dv = this.state.filter.list_dv;
        const list_shcc = this.state.filter.list_shcc;
        const pageFilter = isInitial ? null : { list_dv, fromYear, toYear, list_shcc };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
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
        this.props.getQtHuongDanLuanVanPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin học tập công tác', 'Bạn có chắc bạn muốn xóa thông tin học tập công tác này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHuongDanLuanVanGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin học tập công tác bị lỗi!', 'danger');
                else T.alert('Xoá thông tin học tập công tác thành công!', 'success', false, 800);
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
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ tên sinh viên</th>
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
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                        </TableCell>

                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Quá trình hướng dẫn luận văn - Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={0} to='/user/tccb/qua-trinh/hdlv'>Quá trình hướng dẫn luận văn</Link>,
                'Quá trình hướng dẫn luận văn - Cán bộ',
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormTextBox className='col-md-3' ref={e => this.fromYear = e} label='Từ năm (năm tốt nghiệp)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormTextBox className='col-md-3' ref={e => this.toYear = e} label='Đến năm (năm tốt nghiệp))' type='year' onChange={() => this.changeAdvancedSearch()} /> 
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions} shcc={this.shcc}
                    create={this.props.createQtHuongDanLuanVanGroupPageMa} update={this.props.updateQtHuongDanLuanVanGroupPageMa}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/hdlv',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHuongDanLuanVan: state.qtHuongDanLuanVan });
const mapActionsToProps = {
    updateQtHuongDanLuanVanGroupPageMa, deleteQtHuongDanLuanVanGroupPageMa,
    createQtHuongDanLuanVanGroupPageMa, getQtHuongDanLuanVanPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtHuongDanLuanVanGroupPage);