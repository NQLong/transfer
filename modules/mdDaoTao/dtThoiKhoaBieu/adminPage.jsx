import React from 'react';
import { connect } from 'react-redux';
import { getDtThoiKhoaBieuPage, createDtThoiKhoaBieu, updateDtThoiKhoaBieu, deleteDtThoiKhoaBieu } from './redux';
import { Link } from 'react-router-dom';
import { getDmDonViAll, SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmMonHocAll, SelectAdapter_DmMonHoc } from '../dmMonHoc/redux';
import { getDmPhongAll, SelectAdapter_DmPhong } from 'modules/mdDanhMuc/dmPhong/redux';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, FormSelect, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    state = { ma: null, maHocPhan: '', soTinChi: 0, tongSoTiet: 0, boMon: 0 };
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
            this.boMon?.value(this.monHocMapper[id].boMon);
        });
    }

    onShow = (item) => {
        let { id, maHocKy, soNhom, maHocPhan, thu, phong, ngayBatDau, cbgd } = item ? item : {
            id: '', maHocKy: 'HK0', soNhom: 1, maHocPhan: '', thu: 0, phong: '', ngayBatDau: '', cbgd: ''
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
            if (!this.state.ma) this.setMaHocPhan(maHocPhan);
            else {
                this.soTinChi?.value(item.soTinChi);
                this.tongSoTiet?.value(item.tongSoTiet);
                this.boMon?.value(item.maKhoaBoMon);
                this.nhom.value('0' + item.nhom);
            }
        });


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
            const nChanges = {
                maHocKy: changes.maHocKy,
                nhom: changes.soNhom,
                maHocPhan: changes.maHocPhan,
            };
            this.props.create(nChanges, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật học phần' : 'Tạo mới học phần',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-6' ref={e => this.maHocKy = e} label='Mã học kỳ' readOnly={this.state.ma ? true : readOnly} placeholder='Mã học kỳ' required />
                {/* <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên học phần' readOnly={readOnly} placeholder='Tên học phần' required /> */}
                {
                    !this.state.ma ? <FormTextBox type='number' className='col-6' ref={e => this.soNhom = e} label='Số lượng nhóm' readOnly={readOnly} placeholder='Nhập số lượng nhóm của môn học' required /> :
                        <FormTextBox className='col-6' ref={e => this.nhom = e} label='Nhóm' readOnly={true} required />
                }
                {/* <FormTextBox type='text' className='col-6' ref={e => this.maLop = e} label='Mã Lớp' readOnly={readOnly} placeholder='Mã Lớp' required />
                <FormSelect className='col-12' ref={e => this.loaiHp = e} data={[{'id': 'LT', 'text': 'LT'}, {'id': 'TH', 'text': 'TH'}]} label='Loại HP' required />
                <FormTextBox type='number' className='col-6' ref={e => this.soTinChi = e} label='Số tín chỉ' readOnly={readOnly} placeholder='Số tín chỉ' required />
                <FormTextBox type='number' className='col-6' ref={e => this.tongSoMh = e} label='Tổng số MH' readOnly={readOnly} placeholder='Tổng số MH' required />
                <FormTextBox type='text' className='col-12' ref={e => this.hocKy = e} label='Học Kỳ' readOnly={readOnly} placeholder='Học Kỳ' /> */}
                <FormSelect className='col-12' ref={e => this.maHocPhan = e} data={SelectAdapter_DmMonHoc} label='Môn học' required
                    onChange={value => this.setMaHocPhan(value.id)} />
                {(this.state.ma || this.state.maHocPhan) && (
                    <React.Fragment>
                        <FormTextBox type='text' className='col-12' ref={e => this.soTinChi = e} label='Số tín Chỉ' readOnly={true} />
                        <FormTextBox type='text' className='col-12' ref={e => this.tongSoTiet = e} label='Tổng số tiết' readOnly={true} />
                        <FormSelect type='text' className='col-12' ref={e => this.boMon = e} label='Khoa/Bộ môn' readOnly={true} data={SelectAdapter_DmDonVi} />
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
                            <FormSelect type='text' className='col-6' ref={e => this.phong = e} label='Phòng' readOnly={readOnly} data={SelectAdapter_DmPhong} />
                            <FormDatePicker type='date-mask' className='col-6' ref={e => this.ngayBatDau = e} label='Ngày bắt đầu' readOnly={readOnly} placeholder='Ngày bắt đầu' />
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
            T.onSearch = (searchText) => this.props.getDtThoiKhoaBieuPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDtThoiKhoaBieuPage();
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
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtThoiKhoaBieu && this.props.dtThoiKhoaBieu.page ?
            this.props.dtThoiKhoaBieu.page : { pageNumber: 1, pageSize: 200, pageTotal: 1, totalItem: 0, list: [] };

        let table = renderTable({
            emptyTable: 'Không có dữ liệu thời khóa biểu',
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Mã học kỳ</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>Nhóm</th>
                        <th rowSpan='2' style={{ width: '50%', verticalAlign: 'middle' }}>Tên học phần</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Số tín chỉ</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Tổng số tiết</th>
                        <th colSpan='6' rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết
                        </th>
                        <th rowSpan='2' style={{ width: '50%', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Khoa/Bộ môn</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TH</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TT</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TL</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐA</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LA</th>
                    </tr>
                </>),
            renderRow: (
                item, index) => (
                <tr key={index}>
                    <TableCell style={{ width: 'auto', textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.maHocKy} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={'0' + item.nhom} />
                    <TableCell type='link' content={item.tenMonHoc} onClick={() => this.modal.show(item)} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.soTinChi} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.tongSoTiet} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietLt} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietTh} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietTt} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietTl} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietDa} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.soTietLa} />
                    <TableCell style={{}} content={item.tenKhoaBoMon} />
                    <TableCell type='buttons' content={item} permission={permission}
                    // onEdit={() => this.modal.show(item)} //TODO: Sắp xếp thời khóa biểu cho phòng đào tạo
                    // onDelete={this.delete}
                    />
                </tr>)
        });

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Thời khoá biểu',
            breadcrumb: [
                <Link key={0} to='/user/pdt'>Đào tạo</Link>,
                'Thời khoá niểu'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDtThoiKhoaBieuPage} />
                <EditModal ref={e => this.modal = e} permission={permission} getDonViSelect={this.props.getDmDonViAll} getMonHocSelect={this.props.getDmMonHocAll} getPhongSelect={this.props.getDmPhongAll}
                    create={this.props.createDtThoiKhoaBieu} update={this.props.updateDtThoiKhoaBieu} permissions={currentPermissions} />
            </>,
            backRoute: '/user/pdt',
            onCreate: null, //TODO: Sắp xếp thời khóa biểu cho phòng đào tạo
            // permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { getDmPhongAll, getDmMonHocAll, getDmDonViAll, getDtThoiKhoaBieuPage, createDtThoiKhoaBieu, updateDtThoiKhoaBieu, deleteDtThoiKhoaBieu };
export default connect(mapStateToProps, mapActionsToProps)(DtThoiKhoaBieuPage);