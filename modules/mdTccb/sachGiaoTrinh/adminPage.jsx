import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormCheckbox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { createSachGTStaff, updateSachGTStaff, deleteSachGTStaff,
    getSachGiaoTrinhGroupPage, getSachGiaoTrinhPage,
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
        let list_ma = this.maCanBo.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
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
            list_ma.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    ten: this.ten.value(),
                    theLoai: this.theLoai.value(),
                    namSanXuat: this.namSanXuat.getVal() ? new Date(this.namSanXuat.getVal()).getFullYear() : null,
                    nhaSanXuat: this.nhaSanXuat.value(),
                    chuBien: this.chuBien.value(),
                    sanPham: this.sanPham.value(),
                    butDanh: this.butDanh.value(),
                    quocTe: this.quocTe.value()
                };
                if (index == list_ma.length - 1) {
                    this.state.id ? this.props.update(this.state.id, changes, this.hide, false) : this.props.create(changes, this.hide, false);
                    this.setState({
                        id: ''
                    });
                    this.maCanBo.reset();
                }
                else {
                    this.state.id ? this.props.update(this.state.id, changes, false) : this.props.create(changes, false);
                }
            });
        }
    }

    render = () => {
        const readOnly = this.state.id ? true : this.props.readOnly;
        return this.renderModal({
            title: 'Thông tin sách, giáo trình',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} required />
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

class SachGiaoTrinh extends AdminPage {
    checked = false;
    curState = [];
    searchText = '';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => {
                this.searchText = searchText;
                if (this.checked) this.props.getSachGiaoTrinhGroupPage(undefined, undefined, this.curState, this.searchText || '');
                else this.props.getSachGiaoTrinhPage(undefined, undefined, this.curState, this.searchText || '');
            };
            T.showSearchBox(() => {
                this.loaiDoiTuong?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
                setTimeout(() => this.showAdvanceSearch(), 1000);
            });
            this.changeAdvancedSearch();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = () => {
        let { pageNumber, pageSize } = this.props && this.props.sachGiaoTrinh && this.props.sachGiaoTrinh.page ? this.props.sachGiaoTrinh.page : { pageNumber: 1, pageSize: 50 };
        const loaiDoiTuong = this.loaiDoiTuong?.value() || [];
        this.curState = loaiDoiTuong;
        if (this.checked) this.props.getSachGiaoTrinhGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getSachGiaoTrinhPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    groupPage = () => {
        let { pageNumber, pageSize } = this.props && this.props.sachGiaoTrinh && this.props.sachGiaoTrinh.page ? this.props.sachGiaoTrinh.page : { pageNumber: 1, pageSize: 50 };
        this.checked = !this.checked;
        if (this.checked) this.props.getSachGiaoTrinhGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getSachGiaoTrinhPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    delete = (e, item) => {
        T.confirm('Xóa sách giáo trình', 'Bạn có chắc bạn muốn xóa sách giáo trình này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSachGTStaff(item.id, false, null, error => {
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
            this.props.sachGiaoTrinh && this.props.sachGiaoTrinh.page_gr ?
                this.props.sachGiaoTrinh.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.sachGiaoTrinh && this.props.sachGiaoTrinh.page ? this.props.sachGiaoTrinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Thông tin sách</th>
                        <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Thông tin xuất bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thông tin sản phẩm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phạm vi xuất bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{item.hoCanBo + ' ' + item.tenCanBo}</span><br />
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
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/sach-giao-trinh/group_sgt/-1/${item.shcc}`} >
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
            title: 'Sách, giáo trình',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Sách giáo trình'
            ],
            advanceSearch: <>
                <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.loaiDoiTuong = e} label='Chọn loại đơn vị (có thể chọn nhiều loại)' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} />
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.checked ? this.props.getSachGiaoTrinhGroupPage : this.props.getSachGiaoTrinhPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                    create={this.props.createSachGTStaff} update={this.props.updateSachGTStaff}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sachGiaoTrinh: state.sachGiaoTrinh });
const mapActionsToProps = {
    createSachGTStaff, updateSachGTStaff, deleteSachGTStaff, 
    getSachGiaoTrinhGroupPage, getSachGiaoTrinhPage,
};
export default connect(mapStateToProps, mapActionsToProps)(SachGiaoTrinh);