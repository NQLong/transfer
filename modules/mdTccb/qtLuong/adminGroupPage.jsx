import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtLuongGroupPageMa, deleteQtLuongGroupPageMa,
    getQtLuongGroupPageMa, getQtLuongPage,
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class EditModal extends AdminModal {
    state = {
        id: null,
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
            batDau: Number(this.batDau.value()),
            batDauType: this.batDauType.value(),
            ketThuc: Number(this.ketThuc.value()),
            ketThucType: this.ketThucType.value(),
            chucDanhNgheNghiep: this.chucDanhNgheNghiep.value(),
            bac: this.bac.value(),
            heSoLuong: this.heSoLuong.value(),
            phuCapThamNienVuotKhung: this.phuCapThamNienVuotKhung.value(),
            ngayHuong: Number(this.ngayHuong.value()),
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
                <FormDatePicker className='col-md-6' ref={e => this.batDau = e} label="Bắt đầu" readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.batDauType = e} label='Kiêủ bắt đầu' readOnly={readOnly} />
                <FormDatePicker className='col-md-6' ref={e => this.ketThuc = e} label="Kết thúc" readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.ketThucType = e} label='Kiêủ kết thúc' readOnly={readOnly} />
            </div>,
        });
    }
}

class QtLuongGroupPage extends AdminPage {
    ma = ''; loaiDoiTuong = '-1';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/luong/group/:loaiDoiTuong/:ma'),
                params = route.parse(window.location.pathname);
            this.loaiDoiTuong = params.loaiDoiTuong;
            this.ma = params.ma;
            T.onSearch = (searchText) => this.props.getQtLuongPage(undefined, undefined, this.loaiDoiTuong, searchText || '');
            T.showSearchBox();
            this.props.getQtLuongGroupPageMa(undefined, undefined, this.loaiDoiTuong, this.ma);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin lương', 'Bạn có chắc bạn muốn xóa thông tin lương này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtLuongGroupPageMa(item.ma, item.shcc, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin lương bị lỗi!', 'danger');
                else T.alert('Xoá thông tin lương thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtLuong', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtLuong && this.props.qtLuong.page ? this.props.qtLuong.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thông tin</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số hiệu văn bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.ho ? item.ho : ' ') + ' ' + (item.ten ? item.ten : ' ')}</span><br />
                                {item.shcc}
                            </> 
                        )}
                        />
                        <TableCell type='text' style={{  whiteSpace: 'nowrap' }} content={item.chucDanhNgheNghiep}/>
                        <TableCell type='text' content={(
                            <>
                                <span>{item.ngayNghi ? T.dateToText(item.ngayNghi, 'dd/mm/yyyy') : ''}</span> <br/>
                                <span>{('Bậc: ' + item.bac)}</span> <br/>
                            </>
                        )}
                        />
                        <TableCell type='text' content={item.soHieuVanBan}/>
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/luong/group/-1/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-sign-out',
            title: 'Quá trình lương',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình lương'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtLuongPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                    update={this.props.updateQtLuongGroupPageMa}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/luong',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtLuong: state.qtLuong });
const mapActionsToProps = {
    updateQtLuongGroupPageMa, deleteQtLuongGroupPageMa,
    getQtLuongGroupPageMa, getQtLuongPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtLuongGroupPage);