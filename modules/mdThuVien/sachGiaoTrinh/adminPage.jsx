import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormCheckbox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateSachGTStaff, deleteSachGTStaff,
    getSachGiaoTrinhGroupPage, getSachGiaoTrinhPage, createSachGiaoTrinhMultiple
} from './redux';

import { DateInput } from 'view/component/Input';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

const quocTeList = [
    { id: 0, text: 'Xuât bản trong nước' },
    { id: 1, text: 'Xuất bản quốc tế' },
    { id: 2, text: 'Xuất bản trong và ngoài nước' }
];
class EditModal extends AdminModal {
    state = {
        id: null,
    }
    multiple = false;

    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { id, shcc, ten, theLoai, nhaSanXuat, namSanXuat, chuBien, sanPham, butDanh, quocTe } = item ? item : {
            id: null, shcc: '', ten: '', theLoai: '', nhaSanXuat: '', namSanXuat: null, chuBien: '', sanPham: '', butDanh: '', quocTe: 0
        };
        this.setState({ id });
        setTimeout(() => {
            this.maCanBo.value(shcc);
            this.ten.value(ten);
            this.theLoai.value(theLoai ? theLoai : '');
            if (namSanXuat) this.namSanXuat.setVal(new Date(namSanXuat.toString()));
            this.nhaSanXuat.value(nhaSanXuat ? nhaSanXuat : '');
            this.chuBien.value(chuBien ? chuBien : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.butDanh.value(butDanh ? butDanh : '');
            this.quocTe.value(quocTe);
        }, 500);
    }

    onSubmit = () => {
        let listMa = this.maCanBo.value();
        if (!Array.isArray(listMa)) {
            listMa = [listMa];
        }
        let changes = {
            ten: this.ten.value(),
            theLoai: this.theLoai.value(),
            namSanXuat: this.namSanXuat.getVal() ? new Date(this.namSanXuat.getVal()).getFullYear() : null,
            nhaSanXuat: this.nhaSanXuat.value(),
            chuBien: this.chuBien.value(),
            sanPham: this.sanPham.value(),
            butDanh: this.butDanh.value(),
            quocTe: this.quocTe.value()
        };
        if (listMa.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.maCanBo.focus();
        } else if (!this.ten.value()) {
            T.notify('Tên sách, giáo trình trống', 'danger');
            this.ten.focus();
        } else if (!this.namSanXuat.getVal()) {
            T.notify('Năm xuất bản trống', 'danger');
            this.namSanXuat.focus();
        } else if (!this.nhaSanXuat.value()) {
            T.notify('Nhà xuất bản trống', 'danger');
            this.nhaSanXuat.focus();
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
        const readOnly = this.state.id ? true : this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật sách giáo trình' : 'Tạo mới sách giáo trình',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} required />
                <FormRichTextBox className='col-12' ref={e => this.ten = e} label={'Tên sách, giáo trình'} type='text' required />
                <div className='form-group col-md-4'><DateInput ref={e => this.namSanXuat = e} label='Năm xuất bản' type='year' required /></div>
                <FormTextBox className='col-8' ref={e => this.nhaSanXuat = e} label={'Nhà xuất bản, số hiệu ISBN'} type='text' required />
                <FormTextBox className='col-4' ref={e => this.theLoai = e} label={'Thể loại'} type='text' />
                <FormTextBox className='col-md-8' ref={e => this.chuBien = e} label={'Chủ biên, đồng chủ biên'} type='text' />
                <FormRichTextBox className='col-md-12' ref={e => this.sanPham = e} label={'Sản phẩm'} type='text' />
                <FormTextBox className='col-md-6' ref={e => this.butDanh = e} label={'Bút danh'} type='text' />
                <FormSelect className='col-md-6' ref={e => this.quocTe = e} label='Phạm vi xuất bản' data={quocTeList} />
            </div>,
        });
    }
}

class SachGiaoTrinh extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tccb', () => {
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
        let { pageNumber, pageSize } = this.props && this.props.sachGiaoTrinh && this.props.sachGiaoTrinh.page ? this.props.sachGiaoTrinh.page : { pageNumber: 1, pageSize: 50 };
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
        if (this.checked) this.props.getSachGiaoTrinhGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getSachGiaoTrinhPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (text, i, j) => {
        if (i == 0) return [];
        let deTais = text.split('??').map(str => <div key={i--} style={{}}>{j - i}. {str}</div>);
        return deTais;
    }

    delete = (e, item) => {
        T.confirm('Xóa sách giáo trình', 'Bạn có chắc bạn muốn xóa sách giáo trình này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSachGTStaff(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá sách giáo trình bị lỗi!', 'danger');
                else T.alert('Xoá sách giáo trình thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('sachGiaoTrinh', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.sachGiaoTrinh && this.props.sachGiaoTrinh.pageGr ?
                this.props.sachGiaoTrinh.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.sachGiaoTrinh && this.props.sachGiaoTrinh.page ? this.props.sachGiaoTrinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br />Đơn vị công tác</th>
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thông tin sách</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thông tin xuất bản</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thông tin sản phẩm</th>}
                        {/* {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số lượng sách giáo trình</th>} */}
                        {this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Danh sách sách, giáo trình của cán bộ</th>}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
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
                                {item.tenChucVu && <span> {item.tenChucVu || ''}<br /> </span>}
                                {(item.tenDonVi || '')}
                            </>
                        )} />
                        {!this.checked && <TableCell type='text' contentClassName='multiple-lines-5' content={(
                            <>
                                <span><i style={{ color: 'blue' }}>{item.ten}</i><br /></span>
                                {item.theLoai ? <span><b>Thể loại: </b><span style={{ whiteSpace: 'nowrap' }}>{item.theLoai}<br /></span></span> : null}
                                {item.butDanh ? <span><b>Bút danh: </b><i>{item.butDanh}</i></span> : null}
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' contentClassName='multiple-lines-5' content={(
                            <>
                                <span><b>Nhà XB: </b><span style={{ color: 'blue' }}>{item.nhaSanXuat}</span></span><br />
                                <span><b>Năm XB:</b> <span >{item.namSanXuat}</span></span> <br />
                                <span><b>Vai trò:</b> <span>{item.chuBien}<br /></span></span>
                                {item.quocTe ?
                                    <span><b>Phạm vi:</b> {item.quocTe == '0' ? <span>Trong nước</span>
                                        : item.quocTe == '1' ? <span>Quốc tế</span>
                                            : item.quocTe == '2' ? <span>Trong và ngoài nước </span>
                                                : ''}
                                    </span> : null}

                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={(<span>{item.sanPham}</span>)} />}
                        {/* {this.checked && <TableCell type='text' style={{ textAlign: 'center' }} content={item.soLuong} />} */}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSach, item.soLuong, item.soLuong)} />}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/sach-giao-trinh/group/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Sách, giáo trình cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Sách, giáo trình cán bộ'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormTextBox className='col-md-3' ref={e => this.fromYear = e} label='Từ năm xuất bản (yyyy)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormTextBox className='col-md-3' ref={e => this.toYear = e} label='Đến năm xuất bản (yyyy)' type='year' onChange={() => this.changeAdvancedSearch()} />
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
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                    create={this.props.createSachGiaoTrinhMultiple} update={this.props.updateSachGTStaff}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sachGiaoTrinh: state.tccb.sachGiaoTrinh });
const mapActionsToProps = {
    updateSachGTStaff, deleteSachGTStaff,
    getSachGiaoTrinhGroupPage, getSachGiaoTrinhPage, createSachGiaoTrinhMultiple
};
export default connect(mapStateToProps, mapActionsToProps)(SachGiaoTrinh);