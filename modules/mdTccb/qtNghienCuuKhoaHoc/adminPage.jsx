import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { createQtNckhStaff, 
    updateQtNckhStaff, deleteQtNckhStaff, 
    getQtNghienCuuKhoaHocGroupPage, getQtNghienCuuKhoaHocPage } 
from './redux';

import { DateInput } from 'view/component/Input';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import Dropdown from 'view/component/Dropdown';

const EnumDateType = Object.freeze({
    0: { text: '' },
    1: { text: 'dd/mm/yyyy' },
    2: { text: 'mm/yyyy' },
    3: { text: 'yyyy' },
}), typeMapper = {
    'yyyy': 'year',
    'mm/yyyy': 'month',
    'dd/mm/yyyy': 'date'
};
class EditModal extends AdminModal {
    state = {
        id: null,
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        ngayNghiemThuType: 'dd/mm/yyyy',
    }

    multiple = false;

    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { id, shcc, batDauType, ketThucType, batDau, ketThuc, tenDeTai, maSoCapQuanLy, kinhPhi, vaiTro, ngayNghiemThu, ketQua, ngayNghiemThuType, thoiGian }
            = item ? item : 
            {
                id: null, shcc: '', batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, tenDeTai: '',
                maSoCapQuanLy: '', kinhPhi: '', vaiTro: '', ngayNghiemThu: null, ketQua: '', ngayNghiemThuType: 'dd/mm/yyyy', thoiGian: null
            };
        this.setState({
            batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThuc ? ketThucType : 'dd/mm/yyyy',
            ngayNghiemThuType: ngayNghiemThuType ? ngayNghiemThuType : 'dd/mm/yyyy',
            id, batDau, ketThuc, ngayNghiemThu
        });
        setTimeout(() => {
            this.maCanBo.value(shcc);
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.ngayNghiemThuType.setText({ text: ngayNghiemThuType ? ngayNghiemThuType : 'dd/mm/yyyy' });
            this.batDau.setVal(batDau ? batDau : '');
            this.ketThuc.setVal(ketThuc ? ketThuc : '');
            this.tenDeTai.value(tenDeTai);
            this.maSoCapQuanLy.value(maSoCapQuanLy ? maSoCapQuanLy : '');
            this.kinhPhi.value(kinhPhi ? kinhPhi : '');
            this.thoiGian.value(thoiGian);
            this.vaiTro.value(vaiTro ? vaiTro : '');
            this.ngayNghiemThu.setVal(ngayNghiemThu ? ngayNghiemThu : '');
            this.ketQua.value(ketQua ? ketQua : '');
        }, 500);
    }

    onSubmit = () => {
        const changes = {
            shcc: this.maCanBo.value(),
            batDau: this.batDau.getVal(),
            ketThuc: this.ketThuc.getVal(),
            batDauType: this.state.batDauType,
            ketThucType: this.state.ketThucType,
            tenDeTai: this.tenDeTai.value(),
            maSoCapQuanLy: this.maSoCapQuanLy.value(),
            kinhPhi: this.kinhPhi.value(),
            thoiGian: this.thoiGian.value(),
            vaiTro: this.vaiTro.value(),
            ketQua: this.ketQua.value(),
            ngayNghiemThu: this.ngayNghiemThu.getVal(),
            ngayNghiemThuType: this.state.ngayNghiemThuType,
        };
        if (!changes.tenDeTai) {
            T.notify('Tên đề tài bị trống!', 'danger');
            this.tenDeTai.focus();
        } else if (!changes.maSoCapQuanLy) {
            T.notify('Mã số và cấp quản lý bị trống!', 'danger');
            this.maSoCapQuanLy.focus();
        }
        else if (!changes.batDau) {
            T.notify('Thời gian bắt đầu bị trống!', 'danger');
            this.batDau.focus();
        }
        else if (!changes.vaiTro) {
            T.notify('Vai trò bị trống!', 'danger');
            this.vaiTro.focus();
        }
        else if (this.state.id) {
            this.props.update(this.state.id, changes, this.hide);
        } else {
            this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.state.id ? true : this.props.readOnly;
        return this.renderModal({
            title: 'Thông tin nghiên cứu khoa học',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} />
                <FormTextBox className='col-12' ref={e => this.tenDeTai = e} label={'Tên đề tài'} type='text' required />
                <FormTextBox className='col-md-4' ref={e => this.maSoCapQuanLy = e} label={'Mã số và cấp quản lý'} type='text' required />
                <FormTextBox className='col-md-4' ref={e => this.thoiGian = e} label={'Thời gian thực hiện (tháng)'} type='number' />
                <FormTextBox className='col-md-4' ref={e => this.kinhPhi = e} label={'Kinh phí'} type='text' />
                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
                <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} />)</div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
                <FormTextBox className='col-md-6' ref={e => this.vaiTro = e} label={'Vai trò'} type='text' required />
                <div className='form-group col-md-6'><DateInput ref={e => this.ngayNghiemThu = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian nghiệm thu (định dạng:&nbsp; <Dropdown ref={e => this.ngayNghiemThuType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayNghiemThuType: item })} />)</div>
                    }
                    type={this.state.ngayNghiemThuType ? typeMapper[this.state.ngayNghiemThuType] : null} /></div>
                <FormTextBox className='col-md-12' ref={e => this.ketQua = e} label={'Kết quả'} type='text' />

            </div>,
        });
    }
}

class QtNghienCuuKhoaHoc extends AdminPage {
    checked = false;
    curState = [];
    searchText = '';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => {
                this.searchText = searchText;
                if (this.checked) this.props.getQtNghienCuuKhoaHocGroupPage(undefined, undefined, this.curState, this.searchText || '');
                else this.props.getQtNghienCuuKhoaHocPage(undefined, undefined, this.curState, this.searchText || '');
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
        let { pageNumber, pageSize } = this.props && this.props.qtNghienCuuKhoaHoc && this.props.qtNghienCuuKhoaHoc.page ? this.props.qtNghienCuuKhoaHoc.page : { pageNumber: 1, pageSize: 50 };
        const loaiDoiTuong = this.loaiDoiTuong?.value() || [];
        this.curState = loaiDoiTuong;
        if (this.checked) this.props.getQtNghienCuuKhoaHocGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtNghienCuuKhoaHocPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    groupPage = () => {
        let { pageNumber, pageSize } = this.props && this.props.qtNghienCuuKhoaHoc && this.props.qtNghienCuuKhoaHoc.page ? this.props.qtNghienCuuKhoaHoc.page : { pageNumber: 1, pageSize: 50 };
        this.checked = !this.checked;
        if (this.checked) this.props.getQtNghienCuuKhoaHocGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtNghienCuuKhoaHocPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    delete = (e, item) => {
        T.confirm('Xóa nghiên cứu khoa học', 'Bạn có chắc bạn muốn xóa nghiên cứu khoa học này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNckhStaff(false, item.id, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá nghiên cứu khoa học bị lỗi!', 'danger');
                else T.alert('Xoá nghiên cứu khoa học thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtNghienCuuKhoaHoc', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtNghienCuuKhoaHoc && this.props.qtNghienCuuKhoaHoc.page_gr ?
                this.props.qtNghienCuuKhoaHoc.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtNghienCuuKhoaHoc && this.props.qtNghienCuuKhoaHoc.page ? this.props.qtNghienCuuKhoaHoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên đề tài, dự án</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Mã số và cấp quản lý</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian thực hiện</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Vai trò</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày nghiệm thu</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết quả</th>
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
                        <TableCell type='text' content={item.tenDeTai} />
                        <TableCell type='text' content={item.maSoCapQuanLy} />
                        <TableCell type='text' content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType) : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType) : ''}</span></span> <br />
                                <span style={{ whiteSpace: 'nowrap' }}>Tổng thời gian: <span style={{ color: 'blue' }}>{item.thoiGian ? item.thoiGian : ''}</span></span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={item.kinhPhi} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.vaiTro} />
                        <TableCell type='text' content={item.ngayNghiemThu} />
                        <TableCell type='text' content={item.ketQua} />
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/nghien-cuu-khoa-hoc/group_nckh/-1/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-wpexplorer',
            title: 'Quá trình nghiên cứu khoa học',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình nghiên cứu khoa học'
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
                    getPage={this.checked ? this.props.getQtNghienCuuKhoaHocGroupPage : this.props.getQtNghienCuuKhoaHocPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                    create={this.props.createQtNckhStaff} update={this.props.updateQtNckhStaff}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghienCuuKhoaHoc: state.qtNghienCuuKhoaHoc });
const mapActionsToProps = {
    createQtNckhStaff, updateQtNckhStaff, deleteQtNckhStaff, 
    getQtNghienCuuKhoaHocGroupPage, getQtNghienCuuKhoaHocPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghienCuuKhoaHoc);