import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateSachGiaoTrinhGroupPageMa, deleteSachGiaoTrinhGroupPageMa,
    getSachGiaoTrinhGroupPageMa, createSachGiaoTrinhGroupPageMa,
} from './redux';

import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { getStaffEdit } from 'modules/mdTccb/tccbCanBo/redux';

const quocTeList = [
    { id: 0, text: 'Xuât bản trong nước' },
    { id: 1, text: 'Xuất bản quốc tế' },
    { id: 2, text: 'Xuất bản trong và ngoài nước' }
];
class EditModal extends AdminModal {
    state = {
        id: null,
    }

    onShow = (item) => {
        let { id, shcc, ten, theLoai, nhaSanXuat, namSanXuat, chuBien, sanPham, butDanh, quocTe } = item ? item : {
            id: null, shcc: '', ten: '', theLoai: '', nhaSanXuat: '', namSanXuat: null, chuBien: '', sanPham: '', butDanh: '', quocTe: 0
        };
        this.setState({ id });
        setTimeout(() => {
            this.maCanBo.value(shcc ? shcc : this.props.shcc);
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

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.maCanBo.value(),
            ten: this.ten.value(),
            theLoai: this.theLoai.value(),
            namSanXuat: this.namSanXuat.getVal() ? new Date(this.namSanXuat.getVal()).getFullYear() : null,
            nhaSanXuat: this.nhaSanXuat.value(),
            chuBien: this.chuBien.value(),
            sanPham: this.sanPham.value(),
            butDanh: this.butDanh.value(),
            quocTe: this.quocTe.value()
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
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
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật sách giáo trình' : 'Tạo mới sách giáo trình',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} required />
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

class SachGiaoTrinhGroupPage extends AdminPage {
    state = { filter: {}, name: '' };

    componentDidMount() {
        T.ready('/user/library', () => {
            const route = T.routeMatcher('/user/library/sach-giao-trinh/group/:shcc'),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.setState({ filter: { listShcc: params.shcc, listDv: '' } });
            this.props.getStaffEdit(this.shcc, (data) => {
                if (data.error) T.alert('Cán bộ không tồn tại!');
                else {
                    this.setState({ name: 'Cán bộ ' + data.item.ho + ' ' + data.item.ten + ' (' + this.shcc + ')' });
                }
            });
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
        let { pageNumber, pageSize } = this.props && this.props.sachGiaoTrinh && this.props.sachGiaoTrinh.pageMa ? this.props.sachGiaoTrinh.pageMa : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : Number(this.fromYear?.value());
        const toYear = this.toYear?.value() == '' ? null : Number(this.toYear?.value());
        const listDv = this.state.filter.listDv;
        const listShcc = this.state.filter.listShcc;
        const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc };
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
        this.props.getSachGiaoTrinhGroupPageMa(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa sách giáo trình', 'Bạn có chắc bạn muốn xóa sách giáo trình này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSachGiaoTrinhGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá sách giáo trình bị lỗi!', 'danger');
                else T.alert('Xoá sách giáo trình thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('sachGiaoTrinh', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sachGiaoTrinh && this.props.sachGiaoTrinh.pageMa ? this.props.sachGiaoTrinh.pageMa : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thông tin sách</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thông tin xuất bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thông tin sản phẩm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={(
                            <>
                                <span><a style={{ color: 'blue' }} href='#' onClick={e => { e.preventDefault(); this.modal.show(item); }}>{item.ten}</a><br /><br /></span>
                                {item.theLoai ? <span><b>Thể loại: </b><span style={{ whiteSpace: 'nowrap' }}>{item.theLoai}<br /></span></span> : null}
                                {item.butDanh ? <span><b>Bút danh: </b><i>{item.butDanh}</i></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
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
                        />
                        <TableCell type='text' content={(<span>{item.sanPham}</span>)} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                        </TableCell>

                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Sách, Giáo trình theo cán bộ',
            subTitle: <div style={{ color: 'blue' }} >{this.state.name}</div>,
            breadcrumb: [
                <Link key={0} to='/user/library'>Thư viện</Link>,
                <Link key={0} to='/user/library/sach-giao-trinh'>Sách, giáo trình cán bộ</Link>,
                'Sách, Giáo trình theo cán bộ',
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormTextBox className='col-md-3' ref={e => this.fromYear = e} label='Từ năm xuất bản (yyyy)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormTextBox className='col-md-3' ref={e => this.toYear = e} label='Đến năm xuất bản (yyyy)' type='year' onChange={() => this.changeAdvancedSearch()} />
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
                    update={this.props.updateSachGiaoTrinhGroupPageMa} create={this.props.createSachGiaoTrinhGroupPageMa}
                />
            </>,
            backRoute: '/user/library/sach-giao-trinh',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sachGiaoTrinh: state.library.sachGiaoTrinh });
const mapActionsToProps = {
    updateSachGiaoTrinhGroupPageMa, deleteSachGiaoTrinhGroupPageMa,
    getSachGiaoTrinhGroupPageMa, createSachGiaoTrinhGroupPageMa, getStaffEdit
};
export default connect(mapStateToProps, mapActionsToProps)(SachGiaoTrinhGroupPage);