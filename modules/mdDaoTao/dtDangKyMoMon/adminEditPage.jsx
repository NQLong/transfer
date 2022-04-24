import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, CirclePageButton, FormCheckbox, FormSelect, FormTabs, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { createDangKyMoMon, saveDangKyMoMon } from './redux';
import { getDanhSachMonMo } from '../dtDanhSachMonMo/redux';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmMonHocAll } from '../dmMonHoc/redux';
import { SelectAdapter_DtNganhDaoTao } from '../dtNganhDaoTao/redux';
import Loading from 'view/component/Loading';
import { createDtThoiKhoaBieu } from '../dtThoiKhoaBieu/redux';
class SubjectModal extends AdminModal {
    state = { item: {} }
    onSubmit = (e) => {
        e && e.preventDefault();
        let item = this.state.item;
        const data = {
            maMonHoc: item.ma,
            tenMonHoc: T.parse(item.ten).vi,
            loaiMonHoc: Number(this.tuChon.value()),
            soTietLyThuyet: Number(item.tinChiLt) * 15,
            soTietThucHanh: Number(item.tinChiTh) * 30
        };
        this.props.addRow(data, this.props.tab, () => {
            T.notify('Bổ sung môn thành công!', 'success');
            this.hide();
        });
    }
    render = () => {
        return this.renderModal({
            title: 'Bổ sung môn học',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect ref={e => this.monHoc = e} data={SelectAdapter_DmMonHocAll} className='col-md-12' label='Môn học' onChange={value => this.setState({ item: value.item }, () => {
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
    soTiet = []
    soBuoi = []
    soNhom = {}
    soLuongDuKien = []
    id = null
    cookieTab = 0
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            [0, 1, 2, 3].forEach(item => this.setData(item));
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
                T.alert('Xóa thành công! Bấm lưu để lưu lại kết quả', 'success', false, 2000);
                let tab = this.tabs.selectedTabIndex(),
                    ctdt = this.state.data[tab].ctdt;
                this.setState({
                    data: {
                        ...this.state.data, [tab]: { items: this.state.data[tab].items.filter(monHoc => monHoc.maMonHoc != item.maMonHoc), ctdt }
                    }
                });
            }
        });


    }

    initData = (item, index, today, done) => this.setState({
        data: {
            ...this.state.data, [index]: item
        },
        isLoading: false,
        isDuyet: item.dotDangKy.isDuyet,
        hocKy: item.thoiGianMoMon.hocKy,
        nam: item.thoiGianMoMon.nam,
        expired: today >= item.thoiGianMoMon.ketThuc || today <= item.thoiGianMoMon.batDau,
        title: `HK${item.thoiGianMoMon.hocKy} - ${item.thoiGianMoMon.nam}`,
        startTime: T.dateToText(item.thoiGianMoMon.batDau, 'dd/mm/yyyy'),
        endTime: T.dateToText(item.thoiGianMoMon.ketThuc, 'dd/mm/yyyy')
    }, () => {
        this.soTiet[index].forEach((monHoc, count) => {
            monHoc.value(item.items[count].soTietBuoi || '0');
        });
        this.soNhom[index].forEach((monHoc, count) => {
            monHoc.value(item.items[count].soNhom || '0');
        }); this.soBuoi[index].forEach((monHoc, count) => {
            monHoc.value(item.items[count].soBuoiTuan || '0');
        }); this.soLuongDuKien[index].forEach((monHoc, count) => {
            monHoc.value(item.items[count].soLuongDuKien || '0');
        });
        !this.nganh.value() && this.nganh.value(this.state.data[index].dotDangKy.maNganh);
        !this.donViDangKy.value() && this.donViDangKy.value(this.state.data[index].dotDangKy.khoa);
        done && done();
    })

    setData = (index, done) => {
        this.setState({ index });
        const route = T.routeMatcher('/user/dao-tao/dang-ky-mo-mon/:id').parse(window.location.pathname);
        this.id = route.id == 'new' ? null : route.id;
        let condition = {
            yearth: index,
            id: this.id
        }, today = new Date().getTime();
        if (!this.state.data[index]) {
            this.props.getDanhSachMonMo(condition, item => {
                this.initData(item, index, today, done);
            });
        }
    }

    onSave = () => {
        let data = [];
        [0, 1, 2, 3].forEach((index) => data = [...data, this.create(this.state.data[index], index)].flat());
        this.props.saveDangKyMoMon(this.id, { data, nam: this.state.nam, hocKy: this.state.hocKy });
    }

    create = (data, index) => {
        if (data) {
            let ctdt = data.ctdt;
            data.items.map((item, count) => {
                item.soNhom = this.soNhom[index][count].value() || 0;
                item.soBuoiTuan = this.soBuoi[index][count].value() || 0;
                item.soTietBuoi = this.soTiet[index][count].value() || 0;
                item.soLuongDuKien = this.soLuongDuKien[index][count].value() || 0;
                item.maCtdt = ctdt.id;
                item.maNganh = ctdt.maNganh;
                item.khoa = ctdt.maKhoa;
                item.hocKy = this.state.hocKy + index * 2;
                item.maDangKy = this.id;
                return item;
            });
            return data.items;
        } else return [];
    }

    duyetDangKy = (e) => {
        e.preventDefault();
        let data = [];
        [0, 1, 2, 3].forEach((index) => data = [...data, this.create(this.state.data[index], index)].flat().map(item => {
            delete item.id;
            return item;
        }));
        this.props.saveDangKyMoMon(this.id, { isDuyet: 1 }, () => {
            this.props.createDtThoiKhoaBieu(data, () => {
                location.reload();
            });
        });
    }
    renderMonHocTable = (yearth, data) => renderTable({
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
                    <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }}>Số lượng SV dự kiến</th>
                    {!(this.state.expired || this.state.isDuyet) && <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>}
                </tr>
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết LT</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết TN/TH</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số nhóm</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết / buổi</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số buổi / tuần</th>
                </tr>
            </>
        ),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell style={{ width: 'auto', textAlign: 'right' }} content={index + 1} />
                <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.maMonHoc} />
                <TableCell style={{ width: 'auto' }} content={item.tenMonHoc} />
                <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.loaiMonHoc ? 'x' : ''} />
                <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.soTietLyThuyet} />
                <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.soTietThucHanh} />
                <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                    <FormTextBox type='number' ref={e => this.soNhom[yearth][index] = e} style={{ marginBottom: '0' }} readOnly={this.state.expired || this.state.isDuyet} />
                } />
                <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                    <FormTextBox type='number' ref={e => this.soTiet[yearth][index] = e} style={{ marginBottom: '0' }} readOnly={this.state.expired || this.state.isDuyet} />
                } />
                <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                    <FormTextBox type='number' ref={e => this.soBuoi[yearth][index] = e} style={{ marginBottom: '0' }} readOnly={this.state.expired || this.state.isDuyet} />
                } />
                <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                    <FormTextBox type='number' ref={e => this.soLuongDuKien[yearth][index] = e} style={{ marginBottom: '0', width: '100px' }} readOnly={this.state.expired || this.state.isDuyet} />
                } />
                {!(this.state.expired || this.state.isDuyet) && <TableCell type='buttons' style={{ textAlign: 'center' }} permission={{ delete: true }} onDelete={e => e.preventDefault() || this.deleteRow(item, index)} />}
            </tr>
        )
    })

    tabsYearth = (index, item) => ({
        title: `Năm ${index + 1}`,
        component: <>
            <div className='tile'>
                <h5 className='tile-title'>{this.id ? 'Danh sách gửi Phòng Đào tạo' : 'Danh sách dự kiến'}</h5>
                {this.renderMonHocTable(index, item)}
                <div className='tile-footer' />
                {(!this.state.expired && !this.state.isDuyet) ? <div style={{ textAlign: 'right' }}>
                    <Tooltip title='Thêm môn học' arrow>
                        <button className='btn btn-success' onClick={e => e.preventDefault() || this.addMonHoc.show()}>
                            <i className='fa fa-lg fa-plus' /> Bổ sung môn học
                        </button>
                    </Tooltip>
                </div> : null}
            </div>
        </>
    });
    render() {
        this.cookieTab = T.cookie('tab');
        [0, 1, 2, 3].forEach(tab => {
            this.soNhom[tab] = [];
            this.soTiet[tab] = [];
            this.soBuoi[tab] = [];
            this.soLuongDuKien[tab] = [];
        });
        let permission = this.getUserPermission('dtDangKyMoMon', ['read', 'write', 'delete', 'manage']);
        return this.renderPage({
            title: <>Mở môn học: {this.state.title || ''}</>,
            icon: 'fa fa-paper-plane-o',
            subTitle: <div className='row'>
                <FormSelect label='Khoa, bộ môn' ref={e => this.donViDangKy = e} data={SelectAdapter_DmDonViFaculty_V2} readOnly style={{ marginBottom: '0', marginTop: '10px' }} className='col-12' />
                <FormSelect label='Ngành' ref={e => this.nganh = e} data={SelectAdapter_DtNganhDaoTao} readOnly style={{ marginBottom: '0' }} className='col-12' />
            </div>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/dang-ky-mo-mon'>Danh sách các đợt</Link>,
                'Danh sách các môn mở'
            ],
            content: <>
                {this.state.isLoading && <Loading />}
                <FormTabs ref={e => this.tabs = e} tabs={
                    [0, 1, 2, 3].map(index =>
                        this.tabsYearth(index, this.state.data && this.state.data[index] ?
                            this.state.data[index].items : []))}
                    header={
                        <span style={{ color: 'red', position: 'absolute', top: 30, right: 25, zIndex: 1 }}>Thời gian đăng ký: <b>{this.state.startTime}</b> - <b>{this.state.endTime}</b></span>}
                />
                <SubjectModal ref={e => this.addMonHoc = e} addRow={this.addRow} tab={this.tabs ? this.tabs.selectedTabIndex() : 0} />
                {(permission.write && !this.state.isDuyet) ? <CirclePageButton type='custom' tooltip='Phòng Đào Tạo xác nhận' customIcon='fa-check-square-o' style={{ marginRight: '65px' }} onClick={e => this.duyetDangKy(e)} /> : null}
            </>,
            backRoute: '/user/dao-tao/dang-ky-mo-mon',
            onSave: (this.state.expired || this.state.isDuyet) ? null : ((e) => e.preventDefault() || this.onSave())
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDsMonMo: state.daoTao.dtDsMonMo });
const mapActionsToProps = {
    createDangKyMoMon, getDanhSachMonMo, saveDangKyMoMon, createDtThoiKhoaBieu
};
export default connect(mapStateToProps, mapActionsToProps)(DtDsMonMoEditPage);