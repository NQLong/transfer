import React from 'react';
import { connect } from 'react-redux';
import { getDmMonHocAll, createDmMonHoc, updateDmMonHoc, deleteDmMonHoc } from './redux';
import { Link } from 'react-router-dom';
import { getDmDonViAll} from 'modules/mdDanhMuc/dmDonVi/redux';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true, ma: '' };
    DonViTable = [];

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
        this.props.getDataSelect(items => {
            if (items) {
                this.DonViTable = [];
                items.forEach(item => this.DonViTable.push({ 'id': item.ma, 'text': item.ten }));
            }
        });
    }

    onShow = (item) => {
        let { ma, ten, soTinChi, tongSoTiet, soTietLt, soTietTh, soTietTt, soTietTl, soTietDa, soTietLa, tinhChatPhong, tenTiengAnh,
            boMon, loaiHinh, chuyenNganh, ghiChu, maCtdt, tenCtdt, kichHoat } = item ? item : { ma: '', ten: '', soTinChi: 0, tongSoTiet: 0, soTietLt: 0, soTietTh: 0, soTietTt: 0, soTietTl: 0, soTietDa: 0, soTietLa: 0, tinhChatPhong: '', tenTiengAnh: '', boMon: 0, loaiHinh: '', chuyenNganh: '', ghiChu: '', maCtdt: '', tenCtdt: '', kichHoat: 1 };

        this.ma.value(ma);
        this.ten.value(ten);
        this.soTinChi.value(soTinChi);
        this.tongSoTiet.value(tongSoTiet);
        this.soTietLt.value(soTietLt);
        this.soTietTh.value(soTietTh);
        this.soTietTt.value(soTietTt);
        this.soTietTl.value(soTietTl);
        this.soTietDa.value(soTietDa);
        this.soTietLa.value(soTietLa);
        this.tinhChatPhong.value(tinhChatPhong || '');
        this.tenTiengAnh.value(tenTiengAnh || '');
        this.boMon.value(boMon);
        this.loaiHinh.value(loaiHinh || '');
        this.chuyenNganh.value(chuyenNganh || '');
        this.ghiChu.value(ghiChu || '');
        this.maCtdt.value(maCtdt || '');
        this.tenCtdt.value(tenCtdt || '');
        this.kichHoat.value(kichHoat);
        this.setState({ active: kichHoat == 1, ma: ma });

    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ma: this.ma.value(),
                ten: this.ten.value(),
                soTinChi: this.soTinChi.value(),
                tongSoTiet: this.tongSoTiet.value(),
                soTietLt: this.soTietLt.value(),
                soTietTh: this.soTietTh.value(),
                soTietTt: this.soTietTt.value(),
                soTietTl: this.soTietTl.value(),
                soTietDa: this.soTietDa.value(),
                soTietLa: this.soTietLa.value(),
                tinhChatPhong: this.tinhChatPhong.value(),
                tenTiengAnh: this.tenTiengAnh.value(),
                boMon: this.boMon.value(),
                loaiHinh: this.loaiHinh.value(),
                chuyenNganh: this.chuyenNganh.value(),
                ghiChu: this.ghiChu.value(),
                maCtdt: this.maCtdt.value(),
                tenCtdt: this.tenCtdt.value(),
                kichHoat: this.state.active ? '1' : '0',
            };
        if (changes.ma == '') {
            T.notify('Mã môn học bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên môn học bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.soTinChi <= 0) {
            T.notify('Số tín chỉ phải lớn hơn 0!', 'danger');
            this.tongSoTiet.focus();
        } else if (changes.tongSoTiet <= 0) {
            T.notify('Tổng số tiết phải lớn hơn 0!', 'danger');
            this.tongSoTiet.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật môn học' : 'Tạo mới môn học',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã môn học' readOnly={this.state.ma ? true : readOnly} placeholder='Mã môn học' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên môn học' readOnly={readOnly} placeholder='Tên môn học' required />
                <FormTextBox type='number' className='col-6' ref={e => this.soTinChi = e} label='Số tín chỉ' readOnly={readOnly} placeholder='Số tín chỉ' required />
                <FormTextBox type='number' className='col-6' ref={e => this.tongSoTiet = e} label='Tổng số tiết' readOnly={readOnly} placeholder='Tổng số tiết' required />
                <FormTextBox type='number' className='col-4' ref={e => this.soTietLt = e} label='Số tiết LT' readOnly={readOnly} placeholder='Số tiết LT' required />
                <FormTextBox type='number' className='col-4' ref={e => this.soTietTh = e} label='Số tiết TH' readOnly={readOnly} placeholder='Số tiết TH' required />
                <FormTextBox type='number' className='col-4' ref={e => this.soTietTt = e} label='Số tiết TT' readOnly={readOnly} placeholder='Số tiết TT' required />
                <FormTextBox type='number' className='col-4' ref={e => this.soTietTl = e} label='Số tiết TL' readOnly={readOnly} placeholder='Số tiết TL' required />
                <FormTextBox type='number' className='col-4' ref={e => this.soTietDa = e} label='Số tiết DA' readOnly={readOnly} placeholder='Số tiết DA' required />
                <FormTextBox type='number' className='col-4' ref={e => this.soTietLa = e} label='Số tiết LA' readOnly={readOnly} placeholder='Số tiết LA' required />
                <FormTextBox type='text' className='col-12' ref={e => this.tinhChatPhong = e} label='Tính chất phòng' readOnly={readOnly} placeholder='Tính chất phòng' />
                <FormTextBox type='text' className='col-12' ref={e => this.tenTiengAnh = e} label='Tên tiếng Anh' readOnly={readOnly} placeholder='Tên tiếng Anh' />
                <FormSelect className='col-12' ref={e => this.boMon = e} data={this.DonViTable} label='Khoa/Bộ Môn' required />
                <FormTextBox type='text' className='col-6' ref={e => this.loaiHinh = e} label='Loại hình' readOnly={readOnly} placeholder='Loại hình' />
                <FormTextBox type='text' className='col-6' ref={e => this.chuyenNganh = e} label='Chuyên ngành' readOnly={readOnly} placeholder='Chuyên ngành' />
                <FormTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} placeholder='Ghi chú' />
                <FormTextBox type='text' className='col-6' ref={e => this.maCtdt = e} label='Mã CTĐT' readOnly={readOnly} placeholder='Mã CTĐT' />
                <FormTextBox type='text' className='col-6' ref={e => this.tenCtdt = e} label='Tên CTĐT' readOnly={readOnly} placeholder='Tên CTĐT' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmMonHocPage extends AdminPage {
    donViMapper = {};

    componentDidMount() {
        this.props.getDmDonViAll(items => {
            if (items) {
                this.donViMapper = {};
                items.forEach(item => this.donViMapper[item.ma] = item.ten);
            }
        });
        T.ready('/user/category', () => {
            this.props.getDmMonHocAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmMonHoc(item.ma, { kichHoat: item.kichHoat == '1' ? '0' : '1' });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa môn học', 'Bạn có chắc bạn muốn xóa môn học này?', true, isConfirm =>
            isConfirm && this.props.deleteDmMonHoc(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmMonHoc', ['read', 'write', 'delete']);
        let table = 'Không có môn học!';

        if (this.props.dmMonHoc && this.props.dmMonHoc.items && this.props.dmMonHoc.items.length > 0) {
            table = renderTable({
                getDataSource: () => this.props.dmMonHoc.items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                        <th style={{ width: '50%' }}>Môn học</th>
                        <th style={{ width: '10%' }}>Số tín chỉ</th>
                        <th style={{ width: '40%' }}>Khoa/Bộ môn</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma} style={{ textAlign: 'right' }} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='number' content={item.soTinChi} />
                        <TableCell type='text' content={this.donViMapper && this.donViMapper[item.boMon] ? this.donViMapper[item.boMon] : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmLoaiDonVi(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Môn Học',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Môn Học'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission} getDataSelect = {this.props.getDmDonViAll}
                    create={this.props.createDmMonHoc} update={this.props.updateDmMonHoc} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmMonHoc: state.danhMuc.dmMonHoc, dmDonVi: state.danhMuc.dmDonVi  });
const mapActionsToProps = { getDmDonViAll, getDmMonHocAll, createDmMonHoc, updateDmMonHoc, deleteDmMonHoc };
export default connect(mapStateToProps, mapActionsToProps)(DmMonHocPage);