import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtHuongDanLuanVanPage, deleteQtHuongDanLuanVanStaff, createQtHuongDanLuanVanMultiple,
    updateQtHuongDanLuanVanStaff, getQtHuongDanLuanVanGroupPage,
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

class EditModal extends AdminModal {
    state = { id: null };
    componentDidMount() {
    }
    multiple = false;
    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { shcc, hoTen, tenLuanVan, namTotNghiep, sanPham, bacDaoTao, id } = item ? item : {
            shcc: '', hoTen: '', tenLuanVan: '', namTotNghiep: null, sanPham: '', bacDaoTao: '', id: ''
        };
        this.setState({ id, item });
        setTimeout(() => {
            this.shcc.value(shcc ? shcc : '');
            this.hoTen.value(hoTen ? hoTen : '');
            this.tenLuanVan.value(tenLuanVan ? tenLuanVan : '');
            this.namTotNghiep.value(namTotNghiep ? namTotNghiep : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.bacDaoTao.value(bacDaoTao ? bacDaoTao : '');
        }, 100);
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        let listMa = this.shcc.value();
        if (!Array.isArray(listMa)) {
            listMa = [listMa];
        }
        let changes = {
            hoTen: this.hoTen.value(),
            tenLuanVan: this.tenLuanVan.value(),
            namTotNghiep: this.namTotNghiep.value(),
            sanPham: this.sanPham.value(),
            bacDaoTao: this.bacDaoTao.value(),
        };
        if (listMa.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.shcc.focus();
        } else if (!this.tenLuanVan.value()) {
            T.notify('Tên luận văn trống', 'danger');
            this.tenLuanVan.focus();
        } else if (!this.namTotNghiep.value()) {
            T.notify('Năm tốt nghiệp trống', 'danger');
            this.namTotNghiep.focus();
        } else {
            if (this.state.id) {
                changes.shcc = listMa[0];
                this.props.update(this.state.id, changes, this.hide);
            } else {
                changes.listShcc = listMa;
                this.props.create(changes, this.hide);
            }
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình hướng dẫn luận văn' : 'Tạo mới quá trình hướng dẫn luận văn',
            size: 'large',
            body: <div className='row'>
                <FormSelect type='text' className='col-md-12' multiple={this.multiple} ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.hoTen = e} label='Danh sách họ tên sinh viên, học viên' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenLuanVan = e} label='Tên luận văn' readOnly={readOnly} required />
                <FormTextBox className='col-md-4' ref={e => this.namTotNghiep = e} label='Năm tốt nghiệp (yyyy)' type='year' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-4' ref={e => this.sanPham = e} label='Sản phẩm' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.bacDaoTao = e} label='Bậc hướng dẫn luận văn' readOnly={readOnly} />
            </div>
        });
    }
}

class QtHuongDanLuanVan extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {} };
    menu = '';
    componentDidMount() {
        this.menu = T.routeMatcher('/user/:khcn/qua-trinh/hdlv').parse(window.location.pathname).khcn;
        T.ready('/user/' + this.menu, () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                this.maDonVi?.value('');
                this.mulCanBo?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            if (this.checked) {
                this.hienThiTheoCanBo.value(true);
            }
            this.getPage();
            this.changeAdvancedSearch(true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }


    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtHuongDanLuanVan && this.props.qtHuongDanLuanVan.page ? this.props.qtHuongDanLuanVan.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : Number(this.fromYear?.value());
        const toYear = this.toYear?.value() == '' ? null : Number(this.toYear?.value());
        const listDv = this.maDonVi?.value().toString() || '';
        const listShcc = this.mulCanBo?.value().toString() || '';
        const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi?.value(filter.listDv);
                    this.mulCanBo?.value(filter.listShcc);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.listShcc || filter.listDv)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        if (this.checked) this.props.getQtHuongDanLuanVanGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtHuongDanLuanVanPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (text, i, j) => {
        if (!text) return [];
        let deTais = text.split('??').map(str => <div key={i--} style={{ }}>{j - i}. {str}</div>);
        return deTais;
    }

    list2 = (text, n, listYear) => {
        if (!text) return [];
        let deTais = text.split('??');
        let years = listYear.split('??');
        let results = [];
        let choose = n > 5 ? 5 : n;
        for (let k = 0; k < choose; k++) {
            results.push(<div key={results.length}> <span>
                {k + 1}. {deTais[k]} ({years[k].trim()})
            </span></div>);
        }
        if (n > 5) {
            results.push(<div key={results.length}> <span>
                .........................................
            </span></div>);
            let k = n - 1;
            results.push(<div key={results.length}> <span>
                {k + 1}. {deTais[k]} ({years[k].trim()})
            </span></div>);
        }
        return results;
    }

    delete = (e, item) => {
        T.confirm('Xóa hướng dẫn luận văn', 'Bạn có chắc bạn muốn xóa hướng dẫn luận văn này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHuongDanLuanVanStaff(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá hướng dẫn luận văn bị lỗi!', 'danger');
                else T.alert('Xoá hướng dẫn luận văn thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }
    render() {
        const permission = this.getUserPermission('qtHuongDanLuanVan', ['read', 'write', 'delete', 'readOnly']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtHuongDanLuanVan && this.props.qtHuongDanLuanVan.pageGr ?
                this.props.qtHuongDanLuanVan.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtHuongDanLuanVan && this.props.qtHuongDanLuanVan.page ? this.props.qtHuongDanLuanVan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số đề tài hướng dẫn</th>}
                        {this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Danh sách luận văn</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ tên sinh viên</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên luận văn</th>}
                        {!this.checked && <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm tốt nghiệp</th>}
                        {!this.checked && <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Bậc đào tạo</th>}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br/>Đơn vị công tác</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        {this.checked && <TableCell type='text' style={{ textAlign: 'center'}} content={item.soDeTai} />}
                        {!this.checked && <TableCell type='text' content={item.hoTen} />}
                        {!this.checked && <TableCell type='text' style={{}} content={<>
                            <span><i>{item.tenLuanVan}</i></span><br />
                            {item.sanPham ? <span>Sản phẩm: {item.sanPham || ''}</span> : null}
                        </>} />}
                        {this.checked && <TableCell type='text' content={this.list2(item.danhSachDeTai, item.soDeTai, item.danhSachNamTotNghiep)} />}
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namTotNghiep} />}
                        {!this.checked && <TableCell type='text' content={item.bacDaoTao} style={{ whiteSpace: 'nowrap' }} />}
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
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
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/${this.menu}/qua-trinh/hdlv/group/${item.shcc}`} >
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
            title: 'Quá trình hướng dẫn luận văn',
            breadcrumb: [
                <Link key={0} to={`/user/${this.menu}`}>{this.menu == 'tccb' ? 'Tổ chức cán bộ' : 'Khoa học công nghệ'}</Link>,
                'Quá trình hướng dẫn luận văn'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormTextBox className='col-md-3' ref={e => this.fromYear = e} label='Từ năm (năm tốt nghiệp)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormTextBox className='col-md-3' ref={e => this.toYear = e} label='Đến năm (năm tốt nghiệp))' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createQtHuongDanLuanVanMultiple} update={this.props.updateQtHuongDanLuanVanStaff}
                />
            </>,
            backRoute: '/user/' + this.menu,
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHuongDanLuanVan: state.khcn.qtHuongDanLuanVan });
const mapActionsToProps = {
    getQtHuongDanLuanVanPage, deleteQtHuongDanLuanVanStaff, createQtHuongDanLuanVanMultiple,
    updateQtHuongDanLuanVanStaff, getQtHuongDanLuanVanGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtHuongDanLuanVan);