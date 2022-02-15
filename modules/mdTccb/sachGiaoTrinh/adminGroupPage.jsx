import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { updateSachGiaoTrinhGroupPageMa, deleteSachGiaoTrinhGroupPageMa,
    getSachGiaoTrinhPage, createSachGiaoTrinhGroupPageMa,
} from './redux';

import { DateInput } from 'view/component/Input';
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
                <FormRichTextBox className='col-12' ref={e => this.ten = e} label={'Tên sách, giáo trình'} type='text' required/>
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
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/sach-giao-trinh/group/:shcc'),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.setState({ filter: { list_shcc: params.shcc, list_dv: '' } });
            T.onSearch = (searchText) => {
                this.searchText = searchText;
                this.getPage();
            };
            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.sachGiaoTrinh && this.props.sachGiaoTrinh.page ? this.props.sachGiaoTrinh.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : Number(this.fromYear?.value());
        const toYear = this.toYear?.value() == '' ? null : Number(this.toYear?.value());
        const list_dv = this.state.filter.list_dv;
        const list_shcc = this.state.filter.list_shcc;
        const pageFilter = isInitial ? null : { list_dv, fromYear, toYear, list_shcc };
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

    getPage = (pageN, pageS, done) => {
        this.props.getSachGiaoTrinhPage(pageN, pageS, this.searchText, this.state.filter, done);
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
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sachGiaoTrinh && this.props.sachGiaoTrinh.page ? this.props.sachGiaoTrinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thông tin sách</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thông tin xuất bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thông tin sản phẩm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nơi xuất bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>Tên: <i>{item.ten}</i></span><br /> <br/>
                                <span>Thể loại: <span style={{ color: 'blue' }}>{item.theLoai}</span></span>
                            </>
                        )} 
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>Nhà xuất bản: <i>{item.nhaSanXuat}</i></span><br />
                                <span>Năm xuất bản: <span style={{ color: 'blue' }}>{item.namSanXuat}</span></span> <br /> <br/>
                                <span>Chủ biên: <span style={{ color: 'blue' }}>{item.chuBien}</span></span>
                            </>
                        )} 
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>Tên: {item.sanPham}</span><br />
                                <span>Bút danh: <span style={{ color: 'blue' }}>{item.butDanh}</span></span>
                            </>
                        )} 
                        />
                        <TableCell type='text' content={(
                            item.quocTe == '0' ? <span> Xuất bản trong nước</span>
                            : item.quocTe == '1' ? <span> Xuất bản quốc tế</span>
                                : item.quocTe == '2' ? <span> Xuất bản trong và ngoài nước </span>
                                    : ''
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
            icon: 'fa fa-book',
            title: 'Sách giáo trình - Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={0} to='/user/tccb/sach-giao-trinh'>Sách giáo trình</Link>,
                'Sách giáo trình - Cán bộ',
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormTextBox className='col-md-3' ref={e => this.fromYear = e} label='Từ năm sản suất (yyyy)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormTextBox className='col-md-3' ref={e => this.toYear = e} label='Đến năm sản xuất (yyyy)' type='year' onChange={() => this.changeAdvancedSearch()} /> 
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
            backRoute: '/user/tccb/sach-giao-trinh',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sachGiaoTrinh: state.tccb.sachGiaoTrinh });
const mapActionsToProps = {
    updateSachGiaoTrinhGroupPageMa, deleteSachGiaoTrinhGroupPageMa, 
    getSachGiaoTrinhPage, createSachGiaoTrinhGroupPageMa,
};
export default connect(mapStateToProps, mapActionsToProps)(SachGiaoTrinhGroupPage);