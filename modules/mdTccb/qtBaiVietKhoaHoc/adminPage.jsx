import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormCheckbox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtBaiVietKhoaHocPage, updateQtBaiVietKhoaHocStaff,
    deleteQtBaiVietKhoaHocStaff, createQtBaiVietKhoaHocStaff, getQtBaiVietKhoaHocGroupPage,
} from './redux';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo, getStaffAll } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

const quocTeList = [
    { id: 0, text: 'Trong nước' },
    { id: 1, text: 'Quốc tế' },
    { id: 2, text: 'Trong và ngoài nước' }
];

class EditModal extends AdminModal {
    state = {
        id: '',
    };
    multiple = false;

    onShow = (item, multiple = true) => {
        this.multiple = multiple;

        let { id, shcc, tenTacGia, namXuatBan, tenBaiViet, tenTapChi, soHieuIssn, sanPham, diemIf, quocTe } = item ? item : {
            id: null, shcc: '', tenTacGia: '', namXuatBan: null, tenBaiViet: '', tenTapChi: '', soHieuIssn: '', sanPham: '', diemIf: '',
            quocTe: 0
        };

        this.setState({ id: id });

        setTimeout(() => {
            this.maCanBo.value(shcc);
            this.tenTacGia.value(tenTacGia ? tenTacGia : '');
            if (namXuatBan) this.namXuatBan.setVal(new Date(namXuatBan.toString()));
            this.tenBaiViet.value(tenBaiViet ? tenBaiViet : '');
            this.tenTapChi.value(tenTapChi ? tenTapChi : '');
            this.soHieuIssn.value(soHieuIssn ? soHieuIssn : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.diemIf.value(diemIf ? diemIf : '');
            this.quocTe.value(quocTe ? quocTe : '');
        }, 500);
    };

    onSubmit = (e) => {
        e.preventDefault();
        let list_ma = this.maCanBo.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.maCanBo.focus();
        } else if (!this.tenTacGia.value()) {
            T.notify('Tên tác giả trống', 'danger');
            this.tenTacGia.focus();
        } else if (!this.tenTapChi.value()) {
            T.notify('Tên tạp chí trống', 'danger');
            this.tenTapChi.focus();
        } else if (!this.soHieuIssn.value()) {
            T.notify('Số hiệu ISSN trống', 'danger');
            this.soHieuIssn.focus();
        } else if (!this.namXuatBan.getVal()) {
            T.notify('Năm xuất bản trống', 'danger');
            this.namXuatBan.focus();
        } else {
            list_ma.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    tenTacGia: this.tenTacGia.value(),
                    namXuatBan: this.namXuatBan.getVal() ? new Date(this.namXuatBan.getVal()).getFullYear() : null,
                    tenBaiViet: this.tenBaiViet.value(),
                    tenTapChi: this.tenTapChi.value(),
                    soHieuIssn: this.soHieuIssn.value(),
                    sanPham: this.sanPham.value(),
                    diemIf: this.diemIf.value(),
                    quocTe: this.quocTe.value(),
                };
                if (index == list_ma.length - 1) {
                    this.state.id ? this.props.update(this.state.id, changes, this.hide, false) : this.props.create(changes, this.hide, false);
                    this.setState({
                        id: ''
                    });
                    this.maCanBo.reset();
                }
                else {
                    this.state.id ? this.props.update(this.state.id, changes, null, false) : this.props.create(changes, null, false);
                }
            });
        }
    }

    handleTacGia = () => {
        // if (!this.state.id) {
        //     if (this.tenTacGia.value() == '') this.tenTacGia.value(this.staffMapper[data.id]);
        //     else this.tenTacGia.value(', ' + this.staffMapper[data.id]);
        // }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật bài viết khoa học' : 'Tạo mới bài viết khoa học',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={this.handleTacGia} readOnly={this.state.id ? true : false} required />
                <FormTextBox className='col-12' ref={e => this.tenTacGia = e} label={'Tác giả'} type='text' required readOnly={readOnly} />
                <FormRichTextBox className='col-12' ref={e => this.tenBaiViet = e} label={'Tên bài viết'} type='text' readOnly={readOnly} />
                <FormTextBox className='col-9' ref={e => this.tenTapChi = e} label={'Tên tạp chí'} type='text' required readOnly={readOnly} />
                <FormTextBox className='col-3' ref={e => this.soHieuIssn = e} label={'Số hiệu ISSN'} type='text' required readOnly={readOnly} />
                <FormRichTextBox className='col-12' ref={e => this.sanPham = e} label={'Sản phẩm'} type='text' readOnly={readOnly} />
                <div className='form-group col-md-4'><DateInput ref={e => this.namXuatBan = e} label='Năm xuất bản' type='year' required readOnly={readOnly} /></div>
                <FormSelect className='col-md-4' ref={e => this.quocTe = e} label='Phạm vi xuất bản' data={quocTeList} readOnly={readOnly} />
                <FormTextBox className='col-4' ref={e => this.diemIf = e} label={'Điểm If'} type='text' readOnly={readOnly} />
            </div>
        });
    }
}

class QtBaiVietKhoaHoc extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {} };
    staffMapper = {};

    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getStaffAll(items => {
                items && items.forEach(canBo => {
                    this.staffMapper[canBo.shcc] = (canBo.ho + ' ' + canBo.ten).normalizedName();
                });
            });
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                this.maDonVi?.value('');
                this.mulCanBo?.value('');
                this.xuatBanRange.value('');
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
        let { pageNumber, pageSize } = this.props && this.props.qtBaiVietKhoaHoc && this.props.qtBaiVietKhoaHoc.page ? this.props.qtBaiVietKhoaHoc.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : Number(this.fromYear?.value());
        const toYear = this.toYear?.value() == '' ? null : Number(this.toYear?.value());
        const list_dv = this.maDonVi?.value().toString() || '';
        const list_shcc = this.mulCanBo?.value().toString() || '';
        const xuatBanRange = this.xuatBanRange?.value() == '' ? null : this.xuatBanRange?.value();
        const pageFilter = isInitial ? null : { list_dv, fromYear, toYear, list_shcc, xuatBanRange };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi?.value(filter.list_dv);
                    this.mulCanBo?.value(filter.list_shcc);
                    this.xuatBanRange?.value(filter.xuatBanRange);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.list_shcc || filter.list_dv || filter.xuatBanRange)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        if (this.checked) this.props.getQtBaiVietKhoaHocGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtBaiVietKhoaHocPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (text, i, j) => {
        if (i == 0) return [];
        let deTais = text.split('??').map(str => <p key={i--} style={{ textTransform: 'uppercase' }}>{j - i}. {str}</p>);
        return deTais;
    }


    delete = (e, item) => {
        T.confirm('Xóa bài viết khoa học', 'Bạn có chắc bạn muốn xóa bài viết khoa học này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtBaiVietKhoaHocStaff(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá bài viết khoa học bị lỗi!', 'danger');
                else T.alert('Xoá bài viết khoa học thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtBaiVietKhoaHoc', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtBaiVietKhoaHoc && this.props.qtBaiVietKhoaHoc.page_gr ?
                this.props.qtBaiVietKhoaHoc.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtBaiVietKhoaHoc && this.props.qtBaiVietKhoaHoc.page ? this.props.qtBaiVietKhoaHoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Bài viết</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tạp chí</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm IF</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Xuất bản</th>}
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số bài viết</th>}
                        {this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Danh sách bài viết</th>}
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={((pageNumber - 1) * pageSize + index + 1)} />
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : '') + ' ' + (item.tenCanBo ? item.tenCanBo : '')}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span><b>{item.tenBaiViet}</b></span> <br />
                                <span>Tác giả:
                                    <a href='#' onClick={() => this.modal.show(item, false)}>
                                        <span style={{ color: 'blue' }}>{' ' + item.tenTacGia} </span>
                                    </a>
                                </span>

                            </>
                        )} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span>Tên: <span><i>{item.tenTapChi}</i></span> </span> <br />
                                <span style={{ whiteSpace: 'nowrap' }}>Số hiệu ISSN: <span style={{ color: 'blue' }}>{item.soHieuIssn}</span> </span> <br /> <br />
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' style={{ textAlign: 'right' }} content={item.diemIf} />}
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                {item.quocTe != null && <span>{item.quocTe == '0' ? <span style={{ color: 'red' }}>Trong nước</span>
                                    : item.quocTe == '1' ? <span style={{ color: 'orange' }}>Quốc tế</span>
                                        : item.quocTe == '2' ? <span style={{ color: 'green' }}>Trong và ngoài nước</span> :
                                            ''}<br /></span>}
                                <span style={{ whiteSpace: 'nowrap' }}>Năm: <b>{item.namXuatBan}</b> </span>

                            </>
                        )}
                        />}
                        {this.checked && <TableCell type='text' content={item.soBaiViet} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachBaiViet, item.soBaiViet, item.soBaiViet)} />}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/bai-viet-khoa-hoc/group/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-quote-right',
            title: 'Bài viết khoa học',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Bài viết khoa học'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormTextBox className='col-md-4' ref={e => this.fromYear = e} label='Từ năm (năm xuất bản)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormTextBox className='col-md-4' ref={e => this.toYear = e} label='Đến năm (năm xuất bản)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect className='col-md-4' ref={e => this.xuatBanRange = e} label='Phạm vi xuất bản' data={quocTeList} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
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
                    permissions={currentPermissions} getStaffAll={this.props.getStaffAll}
                    create={this.props.createQtBaiVietKhoaHocStaff} update={this.props.updateQtBaiVietKhoaHocStaff}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtBaiVietKhoaHoc: state.tccb.qtBaiVietKhoaHoc });
const mapActionsToProps = {
    getQtBaiVietKhoaHocPage, deleteQtBaiVietKhoaHocStaff, createQtBaiVietKhoaHocStaff,
    updateQtBaiVietKhoaHocStaff, getQtBaiVietKhoaHocGroupPage, getStaffAll
};
export default connect(mapStateToProps, mapActionsToProps)(QtBaiVietKhoaHoc);