import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormCheckbox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    createQtLuongStaff, updateQtLuongStaff, deleteQtLuongStaff,
    getQtLuongGroupPage, getQtLuongPage,
} from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class EditModal extends AdminModal {
    state = {
        ma: null,
    }

    onShow = (item) => {
        let { id, batDau, batDauType, ketThuc, ketThucType, chucDanhNgheNghiep, bac, heSoLuong, 
            phuCapThamNienVuotKhung, ngayHuong, mocNangBacLuong, soHieuVanBan, shcc } = item ? item : {
                id: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', chucDanhNgheNghiep: '', bac: '', heSoLuong: '', 
                phuCapThamNienVuotKhung: '', ngayHuong: '', mocNangBacLuong: '', soHieuVanBan: '', shcc: ''
        };
        this.setState({ id });
        setTimeout(() => {
            this.shcc.value(shcc);
            this.batDau.value(batDau);
            this.batDauType.value(batDauType);
            this.ketThuc.value(ketThuc);
            this.ketThucType.value(ketThucType);
            this.chucDanhNgheNghiep.value(chucDanhNgheNghiep);
            this.bac.value(bac);
            this.heSoLuong.value(heSoLuong);
            this.phuCapThamNienVuotKhung.value(phuCapThamNienVuotKhung);
            this.ngayHuong.value(ngayHuong);
            this.mocNangBacLuong.value(mocNangBacLuong);
            this.soHieuVanBan.value(soHieuVanBan);
        }, 500);
    }

    onSubmit = () => {
        const changes = {
            shcc: this.shcc.value(),
            batDau: this.batDau.value(),
            batDauType: this.batDauType.value(),
            ketThuc: this.ketThuc.value(),
            ketThucType: this.ketThucType.value(),
            chucDanhNgheNghiep: this.chucDanhNgheNghiep.value(),
            bac: this.bac.value(),
            heSoLuong: this.heSoLuong.value(),
            phuCapThamNienVuotKhung: this.phuCapThamNienVuotKhung.value(),
            ngayHuong: this.ngayHuong.value(),
            mocNangBacLuong: this.mocNangBacLuong.value(),
            soHieuVanBan: this.soHieuVanBan.value(),
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
            this.maCanBo.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide, false) : this.props.create(changes, this.hide, false);
        }
    }

    render = () => {
        const readOnly = this.state.ma ? true : this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật thông tin lương' : 'Tạo mới thông tin lương',
            size: 'large',
            body: <div className='row'>
                <FormSelect type='text' className='col-md-12' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly={this.state.id ? true : false} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.chucDanhNgheNghiep = e} label='Chức danh nghề nghiệp' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.bac = e} label='Bậc' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.heSoLuong = e} label='Hệ số lương' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.phuCapThamNienVuotKhung = e} label='Phụ cấp thâm niên vượt khung' readOnly={readOnly} />
                <FormDatePicker className='col-md-6' ref={e => this.ngayHuong = e} label="Ngày hưởng" readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.mocNangBacLuong = e} label='Mốc nâng bậc lương' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.soHieuVanBan = e} label='Số hiệu văn bản' readOnly={readOnly} />
            </div>,
        });
    }
}

class QtLuong extends AdminPage {
    checked = false;
    curState = [];
    searchText = '';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => {
                this.searchText = searchText;
                if (this.checked) this.props.getQtLuongGroupPage(undefined, undefined, this.curState, this.searchText || '');
                else this.props.getQtLuongPage(undefined, undefined, this.curState, this.searchText || '');
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
        let { pageNumber, pageSize } = this.props && this.props.qtLuong && this.props.qtLuong.page ? this.props.qtLuong.page : { pageNumber: 1, pageSize: 50 };
        const loaiDoiTuong = this.loaiDoiTuong?.value() || [];
        this.curState = loaiDoiTuong;
        if (this.checked) this.props.getQtLuongGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtLuongPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    groupPage = () => {
        let { pageNumber, pageSize } = this.props && this.props.qtLuong && this.props.qtLuong.page ? this.props.qtLuong.page : { pageNumber: 1, pageSize: 50 };
        this.checked = !this.checked;
        if (this.checked) this.props.getQtLuongGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtLuongPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin lương', 'Bạn có chắc bạn muốn xóa thông tin lương này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtLuongStaff(item.ma, false, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin lương bị lỗi!', 'danger');
                else T.alert('Xoá thông tin lương thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtLuong', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtLuong && this.props.qtLuong.page_gr ?
                this.props.qtLuong.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtLuong && this.props.qtLuong.page ? this.props.qtLuong.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Quyết định nghỉ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày nghỉ</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            item.shcc ?
                                <>
                                    <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                    {item.shcc}
                                </> :
                                <span>{item.hoTen ? item.hoTen : ''}</span>
                        )}
                        />
                        <TableCell type='text' style={{  whiteSpace: 'nowrap' }} content={(
                            <>
                                <span><i>{item.soQuyetDinh}</i></span><br />
                                <span>Diện nghỉ: <span style={{ color: 'blue' }}>{item.dienNghi == 1 ? 'Biên chế' : 'Hợp đồng'}</span></span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.ngayNghi ? T.dateToText(item.ngayNghi, 'dd/mm/yyyy') : ''}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span><i>{item.noiDung}</i></span><br/>
                                {item.ghiChu ? '(' + item.ghiChu + ')' : null}
                            </>
                        )}
                        />
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/nghi-viec/group/-1/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Quá trình lương',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình lương'
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
                    getPage={this.checked ? this.props.getQtLuongGroupPage : this.props.getQtLuongPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                    create={this.props.createQtLuongStaff} update={this.props.updateQtLuongStaff}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtLuong: state.qtLuong });
const mapActionsToProps = {
    createQtLuongStaff, updateQtLuongStaff, deleteQtLuongStaff,
    getQtLuongGroupPage, getQtLuongPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtLuong);