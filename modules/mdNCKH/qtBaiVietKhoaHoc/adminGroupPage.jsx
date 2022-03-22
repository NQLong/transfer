import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtBaiVietKhoaHocGroupPageMa, createQtBaiVietKhoaHocGroupPageMa,
    deleteQtBaiVietKhoaHocGroupPageMa, getQtBaiVietKhoaHocGroupPageMa,
} from './redux';
import { getStaffEdit } from 'modules/mdTccb/tccbCanBo/redux';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

const quocTeList = [
    { id: 0, text: 'Trong nước' },
    { id: 1, text: 'Quốc tế' },
    { id: 2, text: 'Trong và ngoài nước' }
];


class EditModal extends AdminModal {
    state = {
        id: '',
    };

    onShow = (item) => {
        let { id, shcc, tenTacGia, namXuatBan, tenBaiViet, tenTapChi, soHieuIssn, sanPham, diemIf, quocTe } = item ? item : {
            id: null, shcc: '', tenTacGia: '', namXuatBan: null, tenBaiViet: '', tenTapChi: '', soHieuIssn: '', sanPham: '', diemIf: '',
            quocTe: 0
        };

        this.setState({ id: id });

        setTimeout(() => {
            this.maCanBo.value(shcc ? shcc : this.props.shcc);
            this.tenTacGia.value(tenTacGia ? tenTacGia : this.props.hoten);
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
        const changes = {
            shcc: this.maCanBo.value(),
            tenTacGia: this.tenTacGia.value(),
            namXuatBan: this.namXuatBan.getVal() ? new Date(this.namXuatBan.getVal()).getFullYear() : null,
            tenBaiViet: this.tenBaiViet.value(),
            tenTapChi: this.tenTapChi.value(),
            soHieuIssn: this.soHieuIssn.value(),
            sanPham: this.sanPham.value(),
            diemIf: this.diemIf.value(),
            quocTe: this.quocTe.value(),
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
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
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật bài viết khoa học' : 'Tạo mới bài viết khoa học',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} required />
                <FormTextBox className='col-12' ref={e => this.tenTacGia = e} label={'Tác giả'} type='text' required readOnly={readOnly} />
                <FormRichTextBox className='col-12' ref={e => this.tenBaiViet = e} label={'Tên bài viết'} type='text' readOnly={readOnly} />
                <FormTextBox className='col-9' ref={e => this.tenTapChi = e} label={'Tên tạp chí'} type='text' required readOnly={readOnly} />
                <FormTextBox className='col-3' ref={e => this.soHieuIssn = e} label={'Số hiệu ISSN'} type='text' required readOnly={readOnly} />
                <FormRichTextBox className='col-12' ref={e => this.sanPham = e} label={'Sản phẩm'} type='text' readOnly={readOnly} />
                <div className='form-group col-md-4'><DateInput ref={e => this.namXuatBan = e} label='Năm xuất bản' type='year' required readOnly={readOnly} /></div>
                <FormSelect className='col-md-4' ref={e => this.quocTe = e} label='Phạm vi xuất bản' data={quocTeList} readOnly={readOnly} />
                <FormTextBox className='col-4' ref={e => this.diemIf = e} label={'Điểm IF'} type='text' readOnly={readOnly} />
            </div>
        });
    }
}

class QtBaiVietKhoaHocGroupPage extends AdminPage {
    state = { filter: {}, name: '' };
    menu = '';

    componentDidMount() {
        this.menu = T.routeMatcher('/user/:khcn/qua-trinh/bai-viet-khoa-hoc/group/:shcc').parse(window.location.pathname).khcn;
        T.ready('/user/' + this.menu, () => {
            T.clearSearchBox();
            const route = T.routeMatcher(`/user/${this.menu}/qua-trinh/bai-viet-khoa-hoc/group/:shcc`),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.setState({ filter: { listShcc: params.shcc, listDv: '' } });
            this.props.getStaffEdit(this.shcc, (data) => {
                if (data.error) T.alert('Cán bộ không tồn tại!');
                else {
                    this.hoten = data.item.ho + ' ' + data.item.ten;
                    this.hoten = this.hoten.trim();
                    this.hoten = this.hoten.normalizedName();
                    this.setState({ name: 'Cán bộ ' + data.item.ho + ' ' + data.item.ten + ' (' + this.shcc + ')' });
                }
            });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');

            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                this.xuatBanRange.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtBaiVietKhoaHoc && this.props.qtBaiVietKhoaHoc.pageMa ? this.props.qtBaiVietKhoaHoc.pageMa : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : Number(this.fromYear?.value());
        const toYear = this.toYear?.value() == '' ? null : Number(this.toYear?.value());
        const listDv = this.state.filter.listDv;
        const listShcc = this.state.filter.listShcc;
        const xuatBanRange = this.xuatBanRange?.value() == '' ? null : this.xuatBanRange?.value();
        const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc, xuatBanRange };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.xuatBanRange?.value(filter.xuatBanRange);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.xuatBanRange)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtBaiVietKhoaHocGroupPageMa(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin bài viết khoa học', 'Bạn có chắc bạn muốn xóa thông tin bài viết khoa học này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtBaiVietKhoaHocGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin bài viết khoa học bị lỗi!', 'danger');
                else T.alert('Xoá thông tin bài viết khoa học thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtBaiVietKhoaHoc', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtBaiVietKhoaHoc && this.props.qtBaiVietKhoaHoc.pageMa ? this.props.qtBaiVietKhoaHoc.pageMa : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Bài viết</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tạp chí xuất bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm IF</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thông tin xuất bản</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        {/* <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )}
                        /> */}
                        <TableCell type='text' content={(
                            <>
                                <a href='#' onClick={() => this.modal.show(item, false)}>
                                    <span style={{ color: 'blue' }}>{item.tenBaiViet ? item.tenBaiViet : ''}</span> <br />
                                </a>
                                <span>Tác giả:
                                    <span style={{ color: 'black' }}>{' ' + item.tenTacGia} </span>
                                </span>
                            </>

                        )} />
                        <TableCell type='text' content={(
                            <>
                                <span><span><i>{item.tenTapChi ? item.tenTapChi : ''}</i></span> </span> <br />
                                {item.soHieuIssn ? <span style={{ whiteSpace: 'nowrap' }}>ISSN: <span style={{ color: 'blue' }}>{item.soHieuIssn}</span> </span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ textAlign: 'right' }} content={item.diemIf} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                {item.quocTe != null && <span>{item.quocTe == '0' ? <span style={{ color: 'red' }}>Trong nước</span>
                                    : item.quocTe == '1' ? <span style={{ color: 'orange' }}>Quốc tế</span>
                                        : item.quocTe == '2' ? <span style={{ color: 'green' }}>Trong và ngoài nước</span> :
                                            ''}<br /></span>}
                                <span style={{ whiteSpace: 'nowrap' }}>Năm: <b>{item.namXuatBan}</b> </span>

                            </>
                        )}
                        />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                        </TableCell>

                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-quote-right',
            title: 'Bài viết Khoa học - Cán bộ',
            subTitle: <div style={{ color: 'blue' }} >{this.state.name}</div>,
            breadcrumb: [
                <Link key={0} to={'/user/' + this.menu}>{this.menu == 'tccb' ? 'Tổ chức cán bộ' : 'Khoa học công nghệ'}</Link>,
                <Link key={0} to={`/user/${this.menu}/qua-trinh/bai-viet-khoa-hoc`}>Quá trình bài viết khoa học</Link>,
                'Quá trình bài viết khoa học - Cán bộ',
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormTextBox className='col-md-4' ref={e => this.fromYear = e} label='Từ năm (năm xuất bản)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormTextBox className='col-md-4' ref={e => this.toYear = e} label='Đến năm (năm xuất bản)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect className='col-md-4' ref={e => this.xuatBanRange = e} label='Phạm vi xuất bản' data={quocTeList} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions} shcc={this.shcc} hoten={this.hoten}
                    update={this.props.updateQtBaiVietKhoaHocGroupPageMa} create={this.props.createQtBaiVietKhoaHocGroupPageMa}
                />
            </>,
            backRoute: '/user/' + this.menu + '/qua-trinh/bai-viet-khoa-hoc',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onExport: (e) => {
                e.preventDefault();
                const { fromYear, toYear, listShcc, listDv, xuatBanRange } = (this.state.filter && this.state.filter != '%%%%%%%%') ? this.state.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, xuatBanRange: null };
                T.download(T.url(`/api/qua-trinh/bai-viet-khoa-hoc/download-excel/${listShcc ? listShcc : null}/${listDv ? listDv : null}/${fromYear ? fromYear : null}/${toYear ? toYear : null}/${xuatBanRange ? xuatBanRange : null}`), 'baivietkhoahoc.xlsx');
            }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtBaiVietKhoaHoc: state.khcn.qtBaiVietKhoaHoc });
const mapActionsToProps = {
    deleteQtBaiVietKhoaHocGroupPageMa, createQtBaiVietKhoaHocGroupPageMa,
    updateQtBaiVietKhoaHocGroupPageMa, getQtBaiVietKhoaHocGroupPageMa, getStaffEdit
};
export default connect(mapStateToProps, mapActionsToProps)(QtBaiVietKhoaHocGroupPage);