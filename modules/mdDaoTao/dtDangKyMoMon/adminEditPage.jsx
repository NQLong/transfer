import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, CirclePageButton, FormCheckbox, FormSelect, FormTabs, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { createDangKyMoMon, saveDangKyMoMon } from './redux';
import { getDtDanhSachMonMoCurrent, createDtDanhSachMonMo, deleteDtDanhSachMonMo } from '../dtDanhSachMonMo/redux';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmMonHocAll } from '../dmMonHoc/redux';
import { createDtThoiKhoaBieu } from '../dtThoiKhoaBieu/redux';
import Loading from 'view/component/Loading';
import MonHocCtdtModal from './DangKyModal';
class SubjectModal extends AdminModal {
    state = { item: {} }
    onShow = (khoaSv) => {
        this.setState({ khoaSv });
    }
    onSubmit = (e) => {
        e && e.preventDefault();
        let item = this.state.item;
        const data = {
            maDangKy: this.props.maDangKy,
            maMonHoc: this.monHoc.value(),
            monHocKhoa: item.khoa,
            khoaSv: this.state.khoaSv,
            tenMonHoc: T.parse(item.ten).vi,
            loaiMonHoc: Number(this.tuChon.value()),
            soTietLyThuyet: Number(item.tinChiLt) * 15,
            soTietThucHanh: Number(item.tinChiTh) * 30
        };
        if (!data.maMonHoc) {
            T.notify('Môn học bị trống', 'danger');
            this.monHoc.focus();
        } else {
            this.props.create(data, this.hide);
        }
    }
    render = () => {
        return this.renderModal({
            title: 'Bổ sung môn học',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect ref={e => this.monHoc = e} data={SelectAdapter_DmMonHocAll(true)} className='col-md-12' label='Môn học' onChange={value => this.setState({ item: value.item }, () => {
                    this.tietLt.value(value.item.tietLt || '0');
                    this.tietTh.value(value.item.tietTh || '0');
                })} />
                <FormTextBox ref={e => this.tietLt = e} className='col-md-6' label='Số tiết lý thuyết' readOnly />
                <FormTextBox ref={e => this.tietTh = e} className='col-md-6' label='Số tiết thực hành' readOnly />
                <FormCheckbox ref={e => this.tuChon = e} className='form-group col-md-12' label='Tự chọn' />
            </div>
        });
    }
}
class DtDsMonMoEditPage extends AdminPage {
    state = { isDaoTao: false, data: {}, isLoading: true }
    soTiet = {}
    soBuoi = {}
    soLop = {}
    soLuongDuKien = []
    id = null
    isDuyet = 1
    cookieTab = 0
    componentDidMount() {
        this.init();
    }

    init = () => {
        const route = T.routeMatcher('/user/dao-tao/dang-ky-mo-mon/:id').parse(window.location.pathname);
        this.id = route.id;
        T.ready('/user/dao-tao', () => {
            this.props.getDtDanhSachMonMoCurrent(this.id, data => {
                let { thoiGianMoMon, thongTinKhoaNganh } = data;
                this.setState({ settings: { bacDaoTao: thoiGianMoMon.bacDaoTao, loaiHinhDaoTao: thoiGianMoMon.loaiHinhDaoTao, maNganh: thongTinKhoaNganh.maNganh, idMoMon: this.id }, nam: thoiGianMoMon.nam });
            });
        });

    }

    addRow = (item, index, done) => {
        let ctdt = this.state.data[index].ctdt;
        this.setState({
            data: {
                ...this.state.data, [index]: { items: [...this.state.data[index].items, item], ctdt }
            }
        }, () => { done && done(); });
    }

    deleteRow = (item) => {
        T.confirm('Xác nhận xóa', 'Bạn có chắc bạn muốn xóa môn học này?', true, isConfirm => {
            if (isConfirm) {
                this.props.deleteDtDanhSachMonMo(item.id);
            }
        });
    }

    onSave = () => {
        let data = [];
        [this.khoa, this.khoa - 1, this.khoa - 2, this.khoa - 3].forEach((khoaSv) => data = [...data, this.create(khoaSv)].flat());
        this.props.saveDangKyMoMon(this.id, this.state.settings, data);
    }

    create = (khoaSv) => {
        let currentDanhSachCuaKhoa = this.props.dtDanhSachMonMo.danhSachMonMo.groupBy('khoaSv')[khoaSv];
        currentDanhSachCuaKhoa?.map((item) => {
            item.loaiHinhDaoTao = this.state.loaiHinhDaoTao;
            item.bacDaoTao = this.state.bacDaoTao;
            item.khoaSinhVien = khoaSv;
        });
        return currentDanhSachCuaKhoa || [];
    }

    duyetDangKy = (e) => {
        e.preventDefault();
        let data = [];
        [this.khoa, this.khoa - 1, this.khoa - 2, this.khoa - 3].forEach((khoaSv) => data = [...data, this.create(khoaSv)].flat());
        this.props.createDtThoiKhoaBieu(data, this.state.settings, () => {
            location.reload();
        });
    }

    renderMonHocTable = (yearth, data) => {
        return renderTable({
            getDataSource: () => data,
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu',
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Mã môn</th>
                        <th rowSpan='2' style={{ width: '100%', verticalAlign: 'middle' }}>Tên</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Tự chọn</th>
                        <th rowSpan='1' colSpan='5' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Thời lượng</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }}>Số lượng SV dự kiến / lớp</th>
                        {!(this.state.expired || this.isDuyet) && <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>}
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết LT</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết TN/TH</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lớp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết / buổi</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số buổi / tuần</th>
                    </tr>
                </>
            ),
            renderRow: (item, index) => {
                let rowSpan = Array.isArray(item.soTietBuoi) ? item.soTietBuoi.length + 1 : 1, isCN = rowSpan > 1;
                return (
                    <React.Fragment key={index}>
                        <tr>
                            <TableCell style={{ width: 'auto', textAlign: 'right' }} content={index + 1} rowSpan={rowSpan} />
                            <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.maMonHoc} rowSpan={rowSpan} />
                            <TableCell style={{ width: 'auto' }} content={<><b>{item.tenMonHoc}</b> <br /> <div style={{ color: 'blue' }}>{typeof item.tenChuyenNganh == 'string' ? item.tenChuyenNganh : ''}</div></>} rowSpan={rowSpan} />
                            <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.loaiMonHoc ? 'x' : ''} rowSpan={rowSpan} />
                            <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.soTietLyThuyet} rowSpan={rowSpan} />
                            <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.soTietThucHanh} rowSpan={rowSpan} />
                            <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.soLop} />
                            <TableCell style={{ width: 'auto', textAlign: 'center' }} content={isCN ? '' : item.soTietBuoi} />
                            <TableCell style={{ width: 'auto', textAlign: 'center' }} content={isCN ? '' : item.soBuoiTuan} />
                            <TableCell style={{ width: 'auto', textAlign: 'center' }} content={isCN ? '' : item.soLuongDuKien} />
                            {!(this.state.expired || this.isDuyet) && <TableCell type='buttons' style={{ textAlign: 'center' }} permission={{ delete: true }} onDelete={e => e.preventDefault() || this.deleteRow(item, index)} />}
                        </tr>
                        {Array.isArray(item.soTietBuoi) && Array.from({ length: item.soTietBuoi.length }, (_, i) => i).map(i => {
                            return (
                                <tr key={i}>
                                    <TableCell style={{ textAlign: 'center' }} content={<b>{item.maMonHoc}_{i + 1}</b>} />
                                    <TableCell style={{ textAlign: 'center' }} content={item.soTietBuoi[i]} />
                                    <TableCell style={{ textAlign: 'center' }} content={item.soBuoiTuan[i]} />
                                    <TableCell style={{ textAlign: 'center' }} content={item.soLuongDuKien[i]} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenChuyenNganh[i].map(ten => <div key={ten}>{ten}</div>)} />
                                </tr>);
                        })}
                    </React.Fragment>
                );
            }
        });
    }

    tabsKhoaSinhVien = (khoaSv, item) => ({
        title: `Khóa ${khoaSv}`,
        component: <>
            <div className='tile'>
                <h5 className='tile-title'>{'Danh sách gửi Phòng Đào tạo'}</h5>
                {this.renderMonHocTable(khoaSv, item)}
                <div className='tile-footer' />
                {(!this.state.expired && !this.isDuyet) ? <div style={{ textAlign: 'right' }}>
                    <Tooltip title='Điều chỉnh' arrow>
                        <button className='btn btn-success' onClick={e => e.preventDefault() || this.monHocCtdt.show({ khoaSv, thongTinKhoaNganh: this.props.dtDanhSachMonMo.thongTinKhoaNganh, maDangKy: this.id, nam: this.state.nam })}>
                            <i className='fa fa-lg fa-plus' /> Điều chỉnh môn học
                        </button>
                    </Tooltip>
                </div> : null}
            </div>
        </>
    });

    render() {
        let { danhSachMonMo, thoiGianMoMon, thongTinKhoaNganh } = this.props.dtDanhSachMonMo || {},
            { khoa, hocKy, namDaoTao, batDau, ketThuc, bacDaoTao, loaiHinhDaoTao } = thoiGianMoMon || {}, //khoa: Khóa sinh viên (e.g 2021)
            { tenKhoaDangKy, tenNganh, maNganh, isDuyet } = thongTinKhoaNganh || {};
        this.khoa = khoa;
        this.isDuyet = isDuyet;
        let permission = this.getUserPermission('dtDangKyMoMon', ['read', 'write', 'delete', 'manage']);
        return this.renderPage({
            title: 'Kế hoạch mở môn học',
            icon: 'fa fa-paper-plane-o',
            subTitle: <>
                Bậc: {bacDaoTao || ''}. Hệ: {loaiHinhDaoTao || ''} <br />
                Năm: {namDaoTao || ''}. Học kỳ: {hocKy || ''} <br />
                Ngành: {tenNganh || ''} ({maNganh || ''}) - {tenKhoaDangKy || ''}
            </>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/dang-ky-mo-mon'>Danh sách</Link>,
                'Kế hoạch mở môn học'
            ],
            header: <>
                Từ: {T.dateToText(batDau)}<br />
                Đến: {T.dateToText(ketThuc)}
            </>,
            content: <>
                {!this.khoa && <Loading />}
                {thoiGianMoMon && <FormTabs ref={e => this.tabs = e} tabs={
                    [khoa, khoa - 1, khoa - 2, khoa - 3].map(khoaSv => this.tabsKhoaSinhVien(khoaSv, danhSachMonMo?.groupBy('khoaSv')[khoaSv] || []))
                }
                />}
                <SubjectModal ref={e => this.addMonHoc = e} create={this.props.createDtDanhSachMonMo} maDangKy={this.id} />
                <MonHocCtdtModal ref={e => this.monHocCtdt = e} reinit={this.init} />
                {(permission.write && !this.isDuyet) ? <CirclePageButton type='custom' tooltip='Phòng Đào Tạo xác nhận' customIcon='fa-check-square-o' style={{ marginRight: '65px' }} onClick={e => this.duyetDangKy(e)} /> : null}
            </>,
            backRoute: '/user/dao-tao/dang-ky-mo-mon',
            onSave: (this.state.expired || this.isDuyet) ? null : ((e) => e.preventDefault() || this.onSave())
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDanhSachMonMo: state.daoTao.dtDanhSachMonMo });
const mapActionsToProps = {
    createDangKyMoMon, saveDangKyMoMon, createDtThoiKhoaBieu, getDtDanhSachMonMoCurrent, createDtDanhSachMonMo, deleteDtDanhSachMonMo
};
export default connect(mapStateToProps, mapActionsToProps)(DtDsMonMoEditPage);
