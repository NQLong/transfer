import React from 'react';
import { connect } from 'react-redux';
import { getDmHocPhanAll, createDmHocPhan, updateDmHocPhan, deleteDmHocPhan } from './redux';
import { Link } from 'react-router-dom';
import { getDmDonViAll} from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmMonHocAll } from 'modules/mdDanhMuc/dmMonHoc/redux';
import { getDmPhongAll } from 'modules/mdDanhMuc/dmPhong/redux';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true, ma: '' };
    DonViTable = [];
    MonHocTable = [];
    PhongTable = []

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
        this.props.getDonViSelect(items => {
            if (items) {
                this.DonViTable = [];
                items.forEach(item => this.DonViTable.push({ 'id': item.ma, 'text': item.ten }));
            }
        });

        this.props.getMonHocSelect(items => {
            if (items) {
                this.MonHocTable = [];
                items.forEach(item => this.MonHocTable.push({ 'id': item.ma, 'text': item.ten }));
            }
        });


        this.props.getPhongSelect(items => {
            if (items) {
                this.PhongTable = [];
                items.forEach(item => this.PhongTable.push({ 'id': item.ma, 'text': item.ten }));
            }
        });
    }

    onShow = (item) => {
        let { ma, ten, nhom, maLop, loaiHp, soTinChi, tongSoMh, thu, tietBd, soTiet, tietBd2, soTiet2, phong, ngayBd, cbgd, siSoTt, siSoTd, hocKy, khoaLop, kichHoat } = item ? item : {
           ma: '', ten: '', nhom: '', maLop: '', loaiHp: 'LT' , soTinChi: 0, tongSoMh:0, thu: 2, tietBd: 1, soTiet: 1, tietBd2:0, soTiet2:0,phong:'', ngayBd: '', cbgd: '', siSoTt:0, siSoTd: 0, hocKy: '', khoaLop: '', kichHoat: 1 };

        this.ma.value(ma);
        this.ten.value(ten);
        this.nhom.value(nhom);
        this.maLop.value(maLop);
        this.loaiHp.value(loaiHp);
        this.soTinChi.value(soTinChi);
        this.tongSoMh.value(tongSoMh);
        this.thu.value(thu);
        this.tietBd.value(tietBd);
        this.soTiet.value(soTiet);
        this.tietBd2.value(tietBd2);
        this.soTiet2.value(soTiet2);
        this.phong.value(phong);
        this.ngayBd.value(ngayBd);
        this.cbgd.value(cbgd);
        this.siSoTt.value(siSoTt);
        this.siSoTd.value(siSoTd);
        this.hocKy.value(hocKy);
        this.khoaLop.value(khoaLop);
        this.kichHoat.value(kichHoat);
        this.setState({ active: kichHoat == 1, ma: ma });

    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ma:this.ma.value(),
                ten: this.ten.value(),
                nhom:this.nhom.value(),
                maLop:this.maLop.value(),
                loaiHp:this.loaiHp.value(),
                soTinChi:this.soTinChi.value(),
                tongSoMh:this.tongSoMh.value(),
                thu:this.thu.value(),
                tietBd:this.tietBd.value(),
                soTiet: this.soTiet.value(),
                tietBd2: this.tietBd2.value(),
                soTiet2:this.soTiet2.value(),
                phong:this.phong.value(),
                ngayBd:this.ngayBd.value(),
                cbgd:this.cbgd.value(),
                siSoTt:this.siSoTt.value(),
                siSoTd:this.siSoTd.value(),
                hocKy:this.hocKy.value(),
                khoaLop:this.khoaLop.value(),
                kichHoat: this.state.active ? '1' : '0',
            };
        if (changes.ma == '') {
            T.notify('Mã học phần bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên học phần bị trống!', 'danger');
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
            title: this.state.ma ? 'Cập nhật học phần' : 'Tạo mới học phần',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã học phần' readOnly={this.state.ma ? true : readOnly} placeholder='Mã học phần' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên học phần' readOnly={readOnly} placeholder='Tên học phần' required />
                <FormTextBox type='text' className='col-6' ref={e => this.nhom = e} label='Nhóm' readOnly={readOnly} placeholder='Nhóm' required />
                <FormTextBox type='text' className='col-6' ref={e => this.maLop = e} label='Mã Lớp' readOnly={readOnly} placeholder='Mã Lớp' required />
                <FormSelect className='col-12' ref={e => this.loaiHp = e} data={[{'id': 'LT', 'text': 'LT'}, {'id': 'TH', 'text': 'TH'}]} label='Loại HP' required />
                <FormTextBox type='number' className='col-6' ref={e => this.soTinChi = e} label='Số tín chỉ' readOnly={readOnly} placeholder='Số tín chỉ' required />
                <FormTextBox type='number' className='col-6' ref={e => this.tongSoMh = e} label='Tổng số MH' readOnly={readOnly} placeholder='Tổng số MH' required />
                <FormTextBox type='number' className='col-4' ref={e => this.thu = e} label='Thứ' readOnly={readOnly} placeholder='Thứ' required />
                <FormTextBox type='number' className='col-4' ref={e => this.tietBd = e} label='Tiết bắt đầu' readOnly={readOnly} placeholder='Tiết bắt đầu' required />
                <FormTextBox type='number' className='col-4' ref={e => this.soTiet = e} label='Số tiết' readOnly={readOnly} placeholder='Số tiết' required />
                <FormTextBox type='number' className='col-4' ref={e => this.tietBd2 = e} label='Tiết bắt đầu 2' readOnly={readOnly} placeholder='Tiết bắt đầu 2' />
                <FormTextBox type='number' className='col-4' ref={e => this.soTiet2 = e} label='Số tiết 2' readOnly={readOnly} placeholder='Số tiết 2' required />
                <FormSelect className='col-12' ref={e => this.phong = e} data={this.PhongTable}  label='Phòng'  />
                <FormTextBox type='text' className='col-12' ref={e => this.ngayBd = e} label='Ngày bắt đâu' readOnly={readOnly} placeholder='Ngày bắt đầu' />
                <FormSelect className='col-12' ref={e => this.cbgd = e} data={this.DonViTable} label='Cán bộ giảng dạy' />
                <FormTextBox type='number' className='col-6' ref={e => this.siSoTt = e} label='Sỉ sô tối thiểu' readOnly={readOnly} placeholder='Sỉ sô tối thiểu' />
                <FormTextBox type='number' className='col-6' ref={e => this.siSoTd = e} label='Sỉ sô tối đa' readOnly={readOnly} placeholder='Sỉ sô tối đa' />
                <FormTextBox type='text' className='col-12' ref={e => this.hocKy = e} label='Học Kỳ' readOnly={readOnly} placeholder='Học Kỳ' />
                <FormSelect className='col-12' ref={e => this.khoaLop = e} data={this.DonViTable} label='Khoa/Lớp' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmHocPhanPage extends AdminPage {
    donViMapper = {};
    monHocMapper = {};

    componentDidMount() {
        this.props.getDmDonViAll(items => {
            if (items) {
                this.donViMapper = {};
                items.forEach(item => this.donViMapper[item.ma] = item.ten);
            }
        });

        this.props.getDmMonHocAll(items => {
            if (items) {
                this.monHocMapper = {};
                items.forEach(item => this.monHocMapper[item.ma] = item.ten);
            }
        });

        T.ready('/user/category', () => {
            this.props.getDmHocPhanAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmHocPhan(item.ma, { kichHoat: item.kichHoat == '1' ? '0' : '1' });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa học phần', 'Bạn có chắc bạn muốn xóa học phần này?', true, isConfirm =>
            isConfirm && this.props.deleteDmHocPhan(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmHocPhan', ['read', 'write', 'delete']);
        let table = 'Không có học phần!';

        if (this.props.dmHocPhan && this.props.dmHocPhan.items && this.props.dmHocPhan.items.length > 0) {
            table = renderTable({
                getDataSource: () => this.props.dmHocPhan.items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                        <th style={{ width: '10%' }}>Nhóm</th>
                        <th style={{ width: '40%' }}>Môn học</th>
                        <th style={{ width: '10%' }}>Mã lớp</th>
                        <th style={{ width: '40%' }}>Khoa/Lớp</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma} style={{ textAlign: 'right' }} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.nhom} />
                        <TableCell type='text' content={this.monHocMapper && this.monHocMapper[item.monHoc] ? this.monHocMapper[item.monHoc] : ''} />
                        <TableCell type='number' content={item.maLop} />
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
            title: 'Danh mục Học Phần',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Học Phần'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission} getDonViSelect = {this.props.getDmDonViAll} getMonHocSelect = {this.props.getDmMonHocAll} getPhongSelect = {this.props.getDmPhongAll}
                    create={this.props.createDmHocPhan} update={this.props.updateDmHocPhan} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmHocPhan: state.danhMuc.dmHocPhan, dmDonVi: state.danhMuc.dmDonVi  });
const mapActionsToProps = { getDmPhongAll, getDmMonHocAll, getDmDonViAll, getDmHocPhanAll, createDmHocPhan, updateDmHocPhan, deleteDmHocPhan };
export default connect(mapStateToProps, mapActionsToProps)(DmHocPhanPage);