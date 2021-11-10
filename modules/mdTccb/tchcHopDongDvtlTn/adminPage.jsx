import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getStaffAll } from 'modules/mdTccb/tccbCanBo/redux';
import { getdmLoaiHopDongAll } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import { getTchcCanBoHopDongDvtlTnAll } from 'modules/mdTccb/tchcCanBoHopDongDvtlTn/redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmNgachCdnnAll } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import {
    getTchcHopDongDvtlTnPage, getTchcHopDongDvtlTnAll, updateTchcHopDongDvtlTn,
    deleteTchcHopDongDvtlTn, createTchcHopDongDvtlTn
} from './redux';

class EditModal extends AdminModal {
    loaiHopDong = [];
    kieuHopDong = [];
    staffSign = [];
    staffHired = [];
    donVi = [];

    componentDidMount() {
        this.props.getStaffHired(items => {
            if (items) {
                this.staffHired = [];
                items.forEach(item => this.staffHired.push({ 'id': item.shcc, 'text': item.ho + ' ' + item.ten }));
            }
        });
        this.props.getLoaiHopDong(items => {
            if (items) {
                this.loaiHopDong = [];
                items.forEach(item => this.loaiHopDong.push({ 'id': item.ma, 'text': item.ten }));
            }
        });
        this.props.getStaffSign(items => {
            if (items) {
                this.staffSign = [];
                items.forEach(item => this.staffSign.push({ 'id': item.shcc, 'text': item.ho + ' ' + item.ten }));
            }
        });
        this.props.getDonVi(items => {
            if (items) {
                this.donVi = [];
                items.forEach(item => this.donVi.push({ 'id': item.ma, 'text': item.ten }));
            }
        });
        this.kieuHopDong = [
            {
                'id': 'DVTL',
                'text': 'Đơn vị trả lương'
            },
            {
                'id': 'TN',
                'text': 'Trách nhiệm'
            }
        ];
        $(document).ready(() => this.onShown(() => {
            this.soHopDong.focus();
        }));
    }

    onShow = (item) => {
        let { ma, soHopDong, loaiHopDong, kieuHopDong, nguoiDuocThue, nguoiKy
            , batDauLamViec, ketThucHopDong, ngayKyHopDongTiepTheo, diaDiemLamViec, chucDanhChuyenMon,
            congViecDuocGiao, chiuSuPhanCong, donViChiTra, ngach, bac, heSo, hieuLucHopDong, ngayKyHopDong,
            phanTramHuong, tienLuong } = item ? item : {
                ma: '', soHopDong: '', loaiHopDong: '', kieuHopDong: '', nguoiDuocThue: '', nguoiKy
                    : '', batDauLamViec: '', ketThucHopDong: '', ngayKyHopDongTiepTheo: '', diaDiemLamViec: '', chucDanhChuyenMon: '',
                congViecDuocGiao: '', chiuSuPhanCong: '', donViChiTra: '', ngach: '', bac: '', heSo: '', hieuLucHopDong: '', ngayKyHopDong: '',
                phanTramHuong: '', tienLuong: ''
            };
        this.setState({ ma, item });
        this.soHopDong.value(soHopDong ? soHopDong : '');
        this.loaiHopDong.value(loaiHopDong ? loaiHopDong : '');
        this.kieuHopDong.value(kieuHopDong ? kieuHopDong : '');
        this.nguoiDuocThue.value(nguoiDuocThue ? nguoiDuocThue : '');
        this.nguoiKy.value(nguoiKy ? nguoiKy : '');
        this.batDauLamViec.value(batDauLamViec ? batDauLamViec : '');
        this.ketThucHopDong.value(ketThucHopDong ? ketThucHopDong : '');
        this.ngayKyHopDongTiepTheo.value(ngayKyHopDongTiepTheo ? ngayKyHopDongTiepTheo : '');
        this.diaDiemLamViec.value(diaDiemLamViec ? diaDiemLamViec : '');
        this.chucDanhChuyenMon.value(chucDanhChuyenMon ? chucDanhChuyenMon : '');
        this.congViecDuocGiao.value(congViecDuocGiao ? congViecDuocGiao : '');
        this.chiuSuPhanCong.value(chiuSuPhanCong ? chiuSuPhanCong : '');
        this.donViChiTra.value(donViChiTra ? donViChiTra : '');
        this.ngach.value(ngach ? ngach : '');
        this.bac.value(bac ? bac : '');
        this.heSo.value(heSo ? heSo : '');
        this.hieuLucHopDong.value(hieuLucHopDong ? hieuLucHopDong : '');
        this.ngayKyHopDong.value(ngayKyHopDong ? ngayKyHopDong : '');
        this.phanTramHuong.value(phanTramHuong ? phanTramHuong : '');
        this.tienLuong.value(tienLuong ? tienLuong : '');
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            soHopDong: this.soHopDong.value(),
            loaiHopDong: this.loaiHopDong.value(),
            kieuHopDong: this.kieuHopDong.value(),
            nguoiDuocThue: this.nguoiDuocThue.value(),
            nguoiKy: this.nguoiKy.value(),
            batDauLamViec: Number(this.batDauLamViec.value()),
            ketThucHopDong: Number(this.ketThucHopDong.value()),
            ngayKyHopDongTiepTheo: Number(this.ngayKyHopDongTiepTheo.value()),
            diaDiemLamViec: this.diaDiemLamViec.value(),
            chucDanhChuyenMon: this.chucDanhChuyenMon.value(),
            congViecDuocGiao: this.congViecDuocGiao.value(),
            chiuSuPhanCong: this.chiuSuPhanCong.value(),
            donViChiTra: this.donViChiTra.value(),
            ngach: Number(this.ngach.value()),
            bac: Number(this.bac.value()),
            heSo: Number(this.heSo.value()),
            hieuLucHopDong: Number(this.hieuLucHopDong.value()),
            ngayKyHopDong: Number(this.ngayKyHopDong.value()),
            phanTramHuong: this.phanTramHuong.value(),
            tienLuong: Number(this.tienLuong.value()),
        };
        if (changes.soHopDong == '') {
            T.notify('Số hợp đồng bị trống');
            this.soHopDong.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo mới hợp đồng đơn vị trả lương - trách nhiệm',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-6' ref={e => this.soHopDong = e} label='Số hợp đồng' required />
                <FormSelect type='text' className='col-md-6' data={this.staffHired} ref={e => this.nguoiDuocThue = e} label='Người được thuê' required />
                <FormSelect type='text' className='col-md-6' data={this.loaiHopDong} ref={e => this.loaiHopDong = e} label='Loại hợp đồng' required />
                <FormSelect type='text' className='col-md-6' data={this.kieuHopDong} ref={e => this.kieuHopDong = e} label='Kiểu hợp đồng' required />
                <FormSelect type='text' className='col-md-6' data={this.staffSign} ref={e => this.nguoiKy = e} label='Người ký' required />
                <FormDatePicker type='date' className='col-md-6' ref={e => this.hieuLucHopDong = e} label='Hiệu lực hợp đồng' />
                <FormDatePicker type='date' className='col-md-6' ref={e => this.ngayKyHopDong = e} label='Ngày ký hợp đồng' />
                <FormDatePicker type='date' className='col-md-6' ref={e => this.batDauLamViec = e} label='Ngày bắt đầu làm việc' required />
                <FormDatePicker type='date' className='col-md-6' ref={e => this.ketThucHopDong = e} label='Ngày kết thúc hợp đồng' required />
                <FormDatePicker type='date' className='col-md-6' ref={e => this.ngayKyHopDongTiepTheo = e} label='Ngày ký hợp đồng tiếp theo' />
                <FormSelect type='text' className='col-md-6' data={this.donVi} ref={e => this.diaDiemLamViec = e} label='Địa điểm làm việc' />
                <FormTextBox type='text' className='col-md-6' ref={e => this.chucDanhChuyenMon = e} label='Chức danh chuyên môn' />
                <FormTextBox type='text' className='col-md-6' ref={e => this.congViecDuocGiao = e} label='Công việc được giao' />
                <FormTextBox type='text' className='col-md-6' ref={e => this.chiuSuPhanCong = e} label='Chịu sự phân công' />
                <FormSelect type='text' className='col-md-6' data={this.donVi} ref={e => this.donViChiTra = e} label='Đơn vị chi trả' />
                <FormTextBox type='text' className='col-md-6' ref={e => this.ngach = e} label='Ngạch' />
                <FormTextBox type='text' className='col-md-6' ref={e => this.bac = e} label='Bậc' />
                <FormTextBox type='text' className='col-md-6' ref={e => this.heSo = e} label='Hệ số' />

                <FormTextBox type='text' className='col-md-6' ref={e => this.phanTramHuong = e} label='Phần trăm hưởng' />
                <FormTextBox type='text' className='col-md-6' ref={e => this.tienLuong = e} label='Tiền lương' />

            </div>
        });
    }
}

class TchcHopDongDvtlTn extends AdminPage {
    typeContract = {};
    hiredStaff = {};

    componentDidMount() {
        this.props.getTchcCanBoHopDongDvtlTnAll(items => {
            if (items) {
                this.hiredStaff = {};
                items.forEach(item => {
                    this.hiredStaff[item.shcc] = item.ho + ' ' + item.ten;
                });
            }
        });
        this.props.getdmLoaiHopDongAll(items => {
            if (items) {
                this.typeContract = {};
                items.forEach(item => {
                    if (item.kichHoat) {
                        this.typeContract[item.ma] = item.ten;
                    }
                });
            }
        });

        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.props.getTchcHopDongDvtlTnPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getTchcHopDongDvtlTnPage();
        });
    }

    getStaffSign = data => {
        this.signedStaff[data.item.shcc] = data.item.ho + ' ' + data.item.ten;
    }

    showModal = (e) => {
        e.preventDefault();
        T.push('/user/tccb/new');
    }

    delete = (e, item) => {
        T.confirm('Xóa hợp đồng', `Bạn có chắc bạn muốn xóa hợp đồng ${item.soHopDong ? `<b>${item.soHopDong}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteTchcHopDongDvtlTn(item.ID, error => {
                if (error) T.notify(error.message ? error.message : `Xoá hợp đồng ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá hợp đồng ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('tchcHopDongDvtlTn', ['read', 'write', 'delete']),
            permissionWrite = currentPermissions.includes('tchcHopDongDvtlTn:write');

        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tchcHopDongDvtlTn && this.props.tchcHopDongDvtlTn.page ?
            this.props.tchcHopDongDvtlTn.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                        <th style={{ width: '10%' }}>Số hợp đồng</th>
                        <th style={{ width: '20%' }}>Tên người được thuê</th>
                        <th style={{ width: 'auto' }}>Kiểu hợp đồng</th>
                        <th style={{ width: 'auto' }}>Loại hợp đồng</th>
                        <th style={{ width: 'auto' }} >Ngày ký</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>

                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.ma ? item.ma : ''} />
                        <TableCell type='link' content={item.soHopDong} url={`/user/hopDongDvtlTn/${item.ma}`} />
                        <TableCell type='text' content={this.hiredStaff && this.hiredStaff[item.nguoiDuocThue] ? this.hiredStaff[item.nguoiDuocThue] : ''} />
                        <TableCell type='text' content={item.kieuHopDong == 'DVTL' ? 'Đơn vị trả lương' : 'Trách nhiệm'} />
                        <TableCell type='text' content={this.typeContract && this.typeContract[item.loaiHopDong] ? this.typeContract[item.loaiHopDong] : ''} />
                        <TableCell type='date' content={item.ngayKyHopDong} dateFormat='dd/mm/yyyy' />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Hợp đồng Đơn vị trả lương - Trách nhiệm',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Danh mục</Link>,
                'Hợp đồng Đơn vị trả lương - Trách nhiệm'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getTchcHopDongDvtlTnPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    getLoaiHopDong={this.props.getdmLoaiHopDongAll}
                    getStaffSign={this.props.getStaffAll}
                    getStaffHired={this.props.getTchcCanBoHopDongDvtlTnAll}
                    getDonVi={this.props.getDmDonViAll}
                    getNgachNgheNghiep={this.props.getDmNgachCdnnAll}
                    create={this.props.createTchcHopDongDvtlTn} update={this.props.updateTchcHopDongDvtlTn}
                    permissions={currentPermissions} />
                {permissionWrite && (
                    <Link to='/user/hopDongDvtlTn/new' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}>
                        <i className='fa fa-lg fa-plus' />
                    </Link>)}
            </>,
            backRoute: '/user/tccb',
            // onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tchcHopDongDvtlTn: state.tchcHopDongDvtlTn });
const mapActionsToProps = {
    getTchcHopDongDvtlTnPage, getTchcHopDongDvtlTnAll, updateTchcHopDongDvtlTn, getdmLoaiHopDongAll,
    deleteTchcHopDongDvtlTn, createTchcHopDongDvtlTn, getStaffAll, getTchcCanBoHopDongDvtlTnAll,
    getDmDonViAll, getDmNgachCdnnAll
};
export default connect(mapStateToProps, mapActionsToProps)(TchcHopDongDvtlTn);