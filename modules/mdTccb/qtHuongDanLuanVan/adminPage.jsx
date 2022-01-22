import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtHuongDanLuanVanPage, deleteQtHuongDanLuanVanStaff, createQtHuongDanLuanVanStaff,
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
        let list_ma = this.shcc.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.shcc.focus();
        } else if (!this.tenLuanVan.value()) {
            T.notify('Tên luận văn trống', 'danger');
            this.tenLuanVan.focus();
        } else if (!this.namTotNghiep.value()) {
            T.notify('Năm tốt nghiệp trống', 'danger');
            this.namTotNghiep.focus();
        } else {
            list_ma.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    hoTen: this.hoTen.value(),
                    tenLuanVan: this.tenLuanVan.value(),
                    namTotNghiep: this.namTotNghiep.value(),
                    sanPham: this.sanPham.value(),
                    bacDaoTao: this.bacDaoTao.value(),
                };
                if (index == list_ma.length - 1) {
                    this.state.id ? this.props.update(this.state.id, changes, this.hide, false) : this.props.create(changes, this.hide, false);
                    this.setState({
                        id: ''
                    });
                    this.shcc.reset();
                }
                else {
                    this.state.id ? this.props.update(this.state.id, changes, null, false) : this.props.create(changes, null, false);
                }
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình hướng dẫn luận văn' : 'Tạo mới quá trình hướng dẫn luận văn',
            size: 'large',
            body: <div className='row'>
                <FormSelect type='text' className='col-md-12' multiple={this.multiple} ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly={this.state.id ? true : false} required/>
                <FormTextBox type='text' className='col-md-12' ref={e => this.hoTen = e} label='Danh sách họ tên sinh viên, học viên' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenLuanVan = e} label='Tên luận văn' readOnly={readOnly} required />
                <FormTextBox className='col-md-4' ref={e => this.namTotNghiep = e} label='Năm tốt nghiệp (yyyy)' type='year' readOnly={false} required />
                <FormTextBox type='text' className='col-md-4' ref={e => this.sanPham = e} label='Sản phẩm' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.bacDaoTao = e} label='Bậc hướng dẫn luận văn' readOnly={readOnly} />
            </div>
        });
    }
}

class QtHuongDanLuanVan extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tccb', () => {
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
                this.props.getQtHuongDanLuanVanGroupPage();
            } else {
                this.props.getQtHuongDanLuanVanPage();
            }
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
        const list_dv = this.maDonVi?.value().toString() || '';
        const list_shcc = this.mulCanBo?.value().toString() || '';
        const pageFilter = isInitial ? null : { list_dv, fromYear, toYear, list_shcc };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi?.value(filter.list_dv);
                    this.mulCanBo?.value(filter.list_shcc);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.list_shcc || filter.list_dv)) this.showAdvanceSearch();
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
        if (!text) return '';
        let deTais = text.split('??').map(str => <p key={i--} style={{ textTransform: 'uppercase' }}>{j - i}. {str}</p>);
        return deTais;
    }


    delete = (e, item) => {
        T.confirm('Xóa hướng dẫn luận văn', 'Bạn có chắc bạn muốn xóa hướng dẫn luận văn này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHuongDanLuanVanStaff(item.id, false, null, error => {
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
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số đề tài hướng dẫn</th> }
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ tên sinh viên</th> }
                        {this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Danh sách sinh viên</th> }
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên luận văn</th> }
                        {this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Danh sách luận văn</th> }
                        {!this.checked && <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm tốt nghiệp</th> }
                        {!this.checked &&  <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Bậc đào tạo</th> } 
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
                        {this.checked && <TableCell type='text' content={item.soDeTai} /> }
                        {!this.checked && <TableCell type='text' content={item.hoTen} /> }
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachHoTen, item.soDeTai, item.soDeTai)} /> }
                        {!this.checked && <TableCell type='text' style={{}} content={<>
                            <span><i>{item.tenLuanVan}</i></span><br />
                            {item.sanPham ? <span>Sản phẩm: {item.sanPham ? item.sanPham : ''}</span> : null}
                        </>} /> }
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachDeTai, item.soDeTai, item.soDeTai)} /> }
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namTotNghiep} /> }
                        {!this.checked && <TableCell type='text' content={item.bacDaoTao} style={{ whiteSpace: 'nowrap' }} /> }
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/hdlv/group/${item.shcc}`} >
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
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình hướng dẫn luận văn'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormTextBox className='col-md-3' ref={e => this.fromYear = e} label='Từ năm (năm tốt nghiệp)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormTextBox className='col-md-3' ref={e => this.toYear = e} label='Đến năm (năm tốt nghiệp))' type='year' onChange={() => this.changeAdvancedSearch()} /> 
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1}/>
                    <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1}/>
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtHuongDanLuanVanStaff} update={this.props.updateQtHuongDanLuanVanStaff}
                    permissions={currentPermissions}

                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHuongDanLuanVan: state.qtHuongDanLuanVan });
const mapActionsToProps = {
    getQtHuongDanLuanVanPage, deleteQtHuongDanLuanVanStaff, createQtHuongDanLuanVanStaff,
    updateQtHuongDanLuanVanStaff, getQtHuongDanLuanVanGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtHuongDanLuanVan);