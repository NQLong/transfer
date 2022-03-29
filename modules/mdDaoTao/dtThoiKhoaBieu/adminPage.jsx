import React from 'react';
import { connect } from 'react-redux';
import { getDtThoiKhoaBieuAll, createDtThoiKhoaBieu, updateDtThoiKhoaBieu, deleteDtThoiKhoaBieu } from './redux';
import { Link } from 'react-router-dom';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmMonHocAll } from 'modules/mdDanhMuc/dmMonHoc/redux';
import { getDmPhongAll } from 'modules/mdDanhMuc/dmPhong/redux';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { ma: '', maHocPhan: '', soTinChi: 0, tongSoTiet: 0, boMon: 0 };
    MonHocTable = [];
    monHocMapper = {};
    donviMapper = {};

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.maHocKy.value() ? this.maHocKy.focus() : null;
        }));

        this.props.getDonViSelect(items => {
            if (items) {
                items.forEach(item => {
                    this.donviMapper[item.ma] = item.ten;
                });
            }
        });

        this.props.getMonHocSelect(items => {
            if (items) {
                this.MonHocTable = [];
                items.forEach(item => {
                    this.MonHocTable.push({ 'id': item.ma, 'text': item.ten });
                    this.monHocMapper[item.ma] = item;
                });
            }
        });
    }

    setMaHocPhan = (id) => {
        this.setState({ maHocPhan: id }, () => {
            this.soTinChi?.value(this.monHocMapper[id].soTinChi);
            this.tongSoTiet?.value(this.monHocMapper[id].tongSoTiet);
            this.boMon?.value(this.donviMapper[this.monHocMapper[id].boMon]);
        });


    }

    onShow = (item) => {
        let { id, maHocKy, soNhom, maHocPhan, thu, phong, ngayBatDau, cbgd } = item ? item : {
            id: '', maHocKy: '', soNhom: 1, maHocPhan: '', thu: 0, phong: '', ngayBatDau: '', cbgd: ''
        };

        this.maHocKy.value(maHocKy);
        this.soNhom?.value(soNhom);
        this.maHocPhan.value(maHocPhan);
        // this.maLop.value(maLop);
        // this.loaiHp.value(loaiHp);
        // this.soTinChi.value(soTinChi);
        // this.tongSoMh.value(tongSoMh);
        // this.thu.value(thu);
        // this.tietBd.value(tietBd);
        // this.soTiet.value(soTiet);
        // this.tietBd2.value(tietBd2);
        // this.soTiet2.value(soTiet2);
        // this.phong.value(phong);
        // this.ngayBd.value(ngayBd);
        // this.cbgd.value(cbgd);
        // this.siSoTt.value(siSoTt);
        // this.siSoTd.value(siSoTd);
        // this.hocKy.value(hocKy);
        // this.khoaLop.value(khoaLop);
        this.setState({ ma: id }, () => {
            if (id !== '') {
                this.thu?.value(thu);
                this.phong?.value(phong);
                this.cbgd?.value(cbgd);
                this.ngayBatDau?.value(ngayBatDau);
            }
        });

        this.setMaHocPhan(maHocPhan);

    };


    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                maHocKy: this.maHocKy.value(),
                soNhom: this.soNhom.value(),
                maHocPhan: this.maHocPhan.value(),
            };
        if (changes.maHocKy == '') {
            T.notify('Mã học kỳ bị trống!', 'danger');
            this.maHocKy.focus();
        } else if (changes.soNhom <= 0) {
            T.notify('Số nhóm phải lớn hơn 0!', 'danger');
            this.soNhom.focus();
        } else if (changes.maHocPhan == '') {
            T.notify('Mã học phần bị trống!', 'danger');
            this.maHocPhan.focus();
        } else {
            if (this.state.ma) {
                const nChanges = {
                    thu: this.thu.value(),
                    phong: this.phong.value(),
                    ngayBatDau: this.ngayBatDau.value(),
                    cbgd: this.cbgd.value(),
                };

                this.props.update(this.state.ma, { ...changes, ...nChanges }, this.hide);
                return;
            }
            for (let i = 0; i < changes.soNhom; i++) {
                const nChanges = {
                    maHocKy: changes.maHocKy,
                    nhom: i + 1,
                    maHocPhan: changes.maHocPhan,
                };
                this.props.create(nChanges, this.hide);
            }
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật học phần' : 'Tạo mới học phần',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.maHocKy = e} label='Mã học kỳ' readOnly={this.state.ma ? true : readOnly} placeholder='Mã học kỳ' required />
                {/* <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên học phần' readOnly={readOnly} placeholder='Tên học phần' required /> */}
                {
                    !this.state.ma && <FormTextBox type='number' className='col-6' ref={e => this.soNhom = e} label='Số Nhóm' readOnly={readOnly} placeholder='Số Nhóm' required />
                }
                {/* <FormTextBox type='text' className='col-6' ref={e => this.maLop = e} label='Mã Lớp' readOnly={readOnly} placeholder='Mã Lớp' required />
                <FormSelect className='col-12' ref={e => this.loaiHp = e} data={[{'id': 'LT', 'text': 'LT'}, {'id': 'TH', 'text': 'TH'}]} label='Loại HP' required />
                <FormTextBox type='number' className='col-6' ref={e => this.soTinChi = e} label='Số tín chỉ' readOnly={readOnly} placeholder='Số tín chỉ' required />
                <FormTextBox type='number' className='col-6' ref={e => this.tongSoMh = e} label='Tổng số MH' readOnly={readOnly} placeholder='Tổng số MH' required />
                <FormTextBox type='text' className='col-12' ref={e => this.hocKy = e} label='Học Kỳ' readOnly={readOnly} placeholder='Học Kỳ' /> */}
                <FormSelect className='col-12' ref={e => this.maHocPhan = e} data={this.MonHocTable} label='Môn học' required
                    onChange={value => this.setMaHocPhan(value.id)} />
                {this.state.maHocPhan && (
                    <React.Fragment>
                        <FormTextBox type='text' className='col-6' ref={e => this.soTinChi = e} label='Số Tín Chỉ' readOnly={true} placeholder='Số Tín Chỉ' />
                        <FormTextBox type='text' className='col-6' ref={e => this.tongSoTiet = e} label='Tổng Số Tiết' readOnly={true} placeholder='Tổng Số Tiết' />
                        <FormTextBox type='text' className='col-12' ref={e => this.boMon = e} label='Khoa/Bộ môn' readOnly={true} />
                    </React.Fragment>
                )}
                {
                    this.state.ma && (
                        <React.Fragment>
                            <FormTextBox type='number' className='col-6' ref={e => this.thu = e} label='Thứ' readOnly={readOnly} placeholder='Thứ' />
                            {/* <FormTextBox type='number' className='col-4' ref={e => this.tietBd = e} label='Tiết bắt đầu' readOnly={readOnly} placeholder='Tiết bắt đầu' required />
                            <FormTextBox type='number' className='col-4' ref={e => this.soTiet = e} label='Số tiết' readOnly={readOnly} placeholder='Số tiết' required />
                            <FormTextBox type='number' className='col-4' ref={e => this.tietBd2 = e} label='Tiết bắt đầu 2' readOnly={readOnly} placeholder='Tiết bắt đầu 2' />
                            <FormTextBox type='number' className='col-4' ref={e => this.soTiet2 = e} label='Số tiết 2' readOnly={readOnly} placeholder='Số tiết 2' required /> */}
                            <FormTextBox type='text' className='col-6' ref={e => this.phong = e} label='Phòng' readOnly={readOnly} placeholder='Phòng' />
                            <FormTextBox type='text' className='col-6' ref={e => this.ngayBatDau = e} label='Ngày bắt đâu' readOnly={readOnly} placeholder='Ngày bắt đầu' />
                            <FormTextBox type='text' className='col-6' ref={e => this.cbgd = e} label='Cán bộ giảng dạy' readOnly={readOnly} placeholder='Cán bộ giảng dạy' />
                            {/* <FormTextBox type='number' className='col-6' ref={e => this.siSoTt = e} label='Sỉ sô tối thiểu' readOnly={readOnly} placeholder='Sỉ sô tối thiểu' />
                            <FormTextBox type='number' className='col-6' ref={e => this.siSoTd = e} label='Sỉ sô tối đa' readOnly={readOnly} placeholder='Sỉ sô tối đa' /> */}
                        </React.Fragment>
                    )
                }
            </div>
        });
    }
}

class DtThoiKhoaBieuPage extends AdminPage {
    donViMapper = {};
    monHocMapper = {};

    componentDidMount() {


        this.props.getDmMonHocAll(items => {
            if (items) {
                this.monHocMapper = {};
                items.forEach(item => this.monHocMapper[item.ma] = item);
            }
        });

        T.ready('/user/pdt', () => {
            this.props.getDtThoiKhoaBieuAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDtThoiKhoaBieu(item.id, { kichHoat: item.kichHoat == '1' ? '0' : '1' });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa học phần', 'Bạn có chắc bạn muốn xóa học phần này?', true, isConfirm =>
            isConfirm && this.props.deleteDtThoiKhoaBieu(item.id));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dtThoiKhoaBieu', ['read', 'write', 'delete']);
        let table = 'Không có học phần!';

        if (this.props.dtThoiKhoaBieu && this.props.dtThoiKhoaBieu.items && this.props.dtThoiKhoaBieu.items.length > 0) {
            table = renderTable({
                getDataSource: () => this.props.dtThoiKhoaBieu.items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '10%' }}>Mã học kỳ</th>
                        <th style={{ width: '10%' }}>Nhóm</th>
                        <th style={{ width: '50%' }}>Môn học</th>
                        <th style={{ width: '10%' }}>Số tín chỉ</th>
                        <th style={{ width: '20%' }}>Tổng số tiết</th>

                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.id} style={{ textAlign: 'right' }} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.maHocKy} />
                        <TableCell type='text' content={item.nhom} />
                        <TableCell type='text' content={this.monHocMapper && this.monHocMapper[item.maHocPhan]?.ten ? this.monHocMapper[item.maHocPhan]?.ten : ''} />
                        <TableCell type='text' content={this.monHocMapper && this.monHocMapper[item.maHocPhan]?.soTinChi ? this.monHocMapper[item.maHocPhan]?.soTinChi : ''} />
                        <TableCell type='text' content={this.monHocMapper && this.monHocMapper[item.maHocPhan]?.tongSoTiet ? this.monHocMapper[item.maHocPhan]?.tongSoTiet : ''} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Thời Khoá Biểu',
            breadcrumb: [
                <Link key={0} to='/user/pdt'>Đào tạo</Link>,
                'Thời Khoá Biểu'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission} getDonViSelect={this.props.getDmDonViAll} getMonHocSelect={this.props.getDmMonHocAll} getPhongSelect={this.props.getDmPhongAll}
                    create={this.props.createDtThoiKhoaBieu} update={this.props.updateDtThoiKhoaBieu} permissions={currentPermissions} />
            </>,
            backRoute: '/user/pdt',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu, dmDonVi: state.danhMuc.dmDonVi });
const mapActionsToProps = { getDmPhongAll, getDmMonHocAll, getDmDonViAll, getDtThoiKhoaBieuAll, createDtThoiKhoaBieu, updateDtThoiKhoaBieu, deleteDtThoiKhoaBieu };
export default connect(mapStateToProps, mapActionsToProps)(DtThoiKhoaBieuPage);