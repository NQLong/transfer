import React from 'react';
import { connect } from 'react-redux';
import { getDtThoiKhoaBieuPage, createDtThoiKhoaBieu, updateDtThoiKhoaBieu, deleteDtThoiKhoaBieu, initSchedule } from './redux';
import { Link } from 'react-router-dom';
import { getDmDonViAll, SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { } from '../dmMonHoc/redux';
import { getDmPhongAll, SelectAdapter_DmPhong } from 'modules/mdDanhMuc/dmPhong/redux';
import { AdminModal, AdminPage, CirclePageButton, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import T from 'view/js/common';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DtNganhDaoTao } from '../dtNganhDaoTao/redux';

const dataThu = [2, 3, 4, 5, 6, 7], dataTiet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
class AdjustModal extends AdminModal {

    onShow = (item) => {
        let { id, giangVien, maMonHoc, tenMonHoc, nhom, tenKhoaBoMon, phong, thu, tietBatDau, soTiet } = item;
        this.setState({ id, soTiet });
        this.giangVien.value(giangVien);
        this.monHoc.value(maMonHoc + ': ' + T.parse(tenMonHoc, { vi: '' }).vi);
        this.nhom.value(nhom);
        this.khoa.value(tenKhoaBoMon);
        this.phong.value(phong);
        this.thu.value(thu);
        this.tietBatDau.value(tietBatDau);
    }
    onSubmit = (e) => {
        e.preventDefault();
        let data = {
            phong: this.phong.value(),
            thu: this.thu.value(),
            tietBatDau: this.tietBatDau.value(),
            soTiet: this.state.soTiet,
            giangVien: this.giangVien.value()
        };
        if (!data.phong) {
            T.notify('Vui lòng chọn phòng', 'danger');
            this.phong.focus();
        } else if (!data.thu) {
            T.notify('Vui lòng chọn thứ', 'danger');
            this.thu.focus();
        } else if (!data.tietBatDau) {
            T.notify('Vui lòng chọn tiết bắt đầu', 'danger');
            this.tietBatDau.focus();
        } else {
            this.props.update(this.state.id, data, (result) => {
                if (result.item) {
                    this.hide();
                    this.props.initData();
                }
            });
        }
    }
    render = () => {
        let readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Điều chỉnh',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.monHoc = e} className='form-group col-md-12' readOnly label='Môn' />
                <FormTextBox ref={e => this.nhom = e} className='form-group col-md-4' readOnly label='Lớp' />
                <FormTextBox ref={e => this.khoa = e} className='form-group col-md-8' readOnly label='Khoa, bộ môn' />
                <FormSelect ref={e => this.phong = e} className='col-md-4' label='Phòng' data={SelectAdapter_DmPhong} readOnly={readOnly} />
                <FormSelect ref={e => this.thu = e} className='form-group col-md-4' label='Thứ' data={dataThu} readOnly={readOnly} />
                <FormSelect ref={e => this.tietBatDau = e} className='form-group col-md-4' label='Tiết bắt đầu' data={dataTiet} readOnly={readOnly} />
                <FormSelect ref={e => this.giangVien = e} className='form-group col-md-12' data={SelectAdapter_FwCanBoGiangVien} label='Chọn giảng viên' readOnly={readOnly} />
            </div>
        });
    }
}
class DtThoiKhoaBieuPage extends AdminPage {
    soTiet = {}
    thu = {}
    tietBatDau = {}
    phong = {}
    soLuongDuKien = {}
    sucChua = {}
    state = { page: null, isEdit: {}, sucChua: {}, filter: {} }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.initData(searchText || '');
            T.showSearchBox(() => { });
        });
        this.initData();
    }

    initData = (searchText = '', filter = this.state.filter) => {
        this.props.getDtThoiKhoaBieuPage(undefined, undefined, searchText, page => {
            let { nam = null, hocKy = null, maKhoaBoMon = null, maNganh = null } = filter;
            page.list = page.list.filter(item => {
                return (!maNganh || item.maNganh == maNganh)
                    && (!maKhoaBoMon || item.maKhoaBoMon == maKhoaBoMon)
                    && (!nam || item.nam == nam)
                    && (!hocKy || item.hocKy == hocKy);
            });
            this.setState({
                page,
                listYear: Object.keys(page.list.groupBy('nam')).sort().filter((value, index, list) => !index || value != list[index - 1]),
                listHocKy: Object.keys(page.list.groupBy('hocKy')).sort().filter((value, index, list) => !index || value != list[index - 1]),
            }, () => {
                let { pageNumber, pageSize, list } = page;
                list.forEach((item, index) => {
                    let line = (pageNumber - 1) * pageSize + index + 1;
                    this.soTiet[line].value(item.soTiet);
                    this.thu[line].value(item.thu);
                    this.tietBatDau[line].value(item.tietBatDau);
                    this.phong[line].value(item.phong);
                    this.soLuongDuKien[line].value(item.soLuongDuKien);
                    this.sucChua[line] = item.sucChua;
                    if (index == list.length - 1) this.setState({ sucChua: this.sucChua });
                });
            });
        });
    };


    taoThoiKhoaBieu = () => {
        T.confirmLoading('Tạo thời khóa biểu', 'Xác nhận tạo thời khóa biểu tự động?', 'Tạo thời khóa biểu thành công', 'Tạo thời khóa biểu thất bại', 'info', 'Tạo', () =>
            new Promise(resolve => {
                this.props.initSchedule((result) => {
                    result.success && setTimeout(() => location.reload(), 2000);
                    resolve(result);
                });
            }));
    }

    updateSoTiet = (index, item) => {
        if (this.phong[index].value() || this.thu[index].value() || this.tietBatDau[index].value() || this.soTiet[index].value() || this.soLuongDuKien[index].value())
            this.props.updateDtThoiKhoaBieu(item.id, {
                soTiet: this.soTiet[index].value(),
                phong: this.phong[index].value(),
                tietBatDau: this.tietBatDau[index].value(),
                thu: this.thu[index].value(),
                sucChua: this.state.sucChua[index],
                soLuongDuKien: this.soLuongDuKien[index].value()
            }, (item) => {
                this.tietBatDau[index].value(item.tietBatDau);
                this.phong[index].value(item.phong);
                this.thu[index].value(item.thu);
            });
        // location.reload();
    };

    render() {
        const permission = this.getUserPermission('dtThoiKhoaBieu', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.state.page ? this.state.page : { pageNumber: 1, pageSize: 1, pageTotal: 1, totalItem: 1, pageCondition: '' };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu thời khóa biểu',
            getDataSource: () => this.state.page ? this.state.page.list : null, stickyHead: false,
            header: 'thead-light',
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>Học kỳ</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>Ngành</th>
                        <th rowSpan='2' style={{ width: '25%', textAlign: 'center', verticalAlign: 'middle' }}>Mã</th>
                        <th rowSpan='2' style={{ width: '50%', verticalAlign: 'middle' }}>Môn học</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Lớp</th>
                        <th rowSpan='2' style={{ width: '25%', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Phòng</th>
                        <th colSpan='3' rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }}>SLDK</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Khoa <br />Bộ môn</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }}>Giảng viên</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thứ</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Tiết bắt đầu</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Số tiết</th>
                    </tr>
                </>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ width: 'auto', textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={<>{item.nam} <br /> {'HK' + item.hocKy}</>} />
                    <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={<>{item.maNganh} <br /> {item.tenNganh.getFirstLetters()}</>} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.maMonHoc} />
                    <TableCell style={{}} contentClassName='multiple-lines-4' content={<>
                        <span style={{ color: 'blue' }}>{T.parse(item.tenMonHoc, { vi: '' }).vi}</span> <br />
                        <i> {item.tenKhoaBoMon}</i>
                    </>} />
                    <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item.nhom} />
                    <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={
                        <>
                            <FormSelect ref={e => this.phong[(pageNumber - 1) * pageSize + index + 1] = e} style={{ marginBottom: '0', width: '120px' }} readOnly={!this.state.isEdit[(pageNumber - 1) * pageSize + index + 1]} data={SelectAdapter_DmPhong} placeholder='Phòng' onChange={value => this.setState({
                                sucChua: {
                                    ...this.state.sucChua,
                                    [(pageNumber - 1) * pageSize + index + 1]: value.sucChua
                                }
                            })} />
                            <div>{this.state.sucChua[(pageNumber - 1) * pageSize + index + 1]}</div>
                        </>
                    } onClick={e => {
                        e.preventDefault();
                        if (e.type == 'click') this.setState({
                            isEdit: { ...this.state.isEdit, [(pageNumber - 1) * pageSize + index + 1]: !item.phong }
                        }, () => this.phong[(pageNumber - 1) * pageSize + index + 1].focus());
                    }}
                    />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                        <FormSelect ref={e => this.thu[(pageNumber - 1) * pageSize + index + 1] = e} style={{ width: '70px', marginBottom: '0' }} readOnly={!this.state.isEdit[(pageNumber - 1) * pageSize + index + 1]} data={dataThu} minimumResultsForSearch={-1} placeholder='Thứ' />
                    }
                        onClick={e => {
                            e.preventDefault();
                            if (e.type == 'click') this.setState({
                                isEdit: { ...this.state.isEdit, [(pageNumber - 1) * pageSize + index + 1]: !item.phong }
                            }, () => this.thu[(pageNumber - 1) * pageSize + index + 1].focus());
                        }}
                    />
                    <TableCell style={{ textAlign: 'center' }} content={
                        <FormSelect ref={e => this.tietBatDau[(pageNumber - 1) * pageSize + index + 1] = e} style={{ width: '70px', marginBottom: '0' }} readOnly={!this.state.isEdit[(pageNumber - 1) * pageSize + index + 1]} data={dataTiet} minimumResultsForSearch={-1} placeholder='Tiết BĐ' />
                    }
                        onClick={e => {
                            e.preventDefault();
                            if (e.type == 'click') this.setState({
                                isEdit: { ...this.state.isEdit, [(pageNumber - 1) * pageSize + index + 1]: !item.phong }
                            }, () => this.tietBatDau[(pageNumber - 1) * pageSize + index + 1].focus());
                        }}
                    />
                    <TableCell style={{ textAlign: 'center' }} content={
                        <FormTextBox type='number' ref={e => this.soTiet[(pageNumber - 1) * pageSize + index + 1] = e} style={{ width: '50px', marginBottom: '0' }} readOnly={!this.state.isEdit[(pageNumber - 1) * pageSize + index + 1]}
                        />
                    }
                        onClick={e => {
                            e.preventDefault();
                            if (e.type == 'click') this.setState({
                                isEdit: { ...this.state.isEdit, [(pageNumber - 1) * pageSize + index + 1]: !item.phong }
                            }, () => this.soTiet[(pageNumber - 1) * pageSize + index + 1].focus());
                        }}
                    />
                    <TableCell content={
                        <FormTextBox type='number' ref={e => this.soLuongDuKien[(pageNumber - 1) * pageSize + index + 1] = e} style={{ width: '70px', marginBottom: '0' }} readOnly={!this.state.isEdit[(pageNumber - 1) * pageSize + index + 1]}
                            onKeyPress={e => e.key == 'Enter' && this.setState({ isEdit: { ...this.state.isEdit, [(pageNumber - 1) * pageSize + index + 1]: false } }, () => {
                                this.updateSoTiet((pageNumber - 1) * pageSize + index + 1, item);
                            })}
                        />
                    } onClick={e => {
                        e.preventDefault();
                        if (e.type == 'click') this.setState({
                            isEdit: { ...this.state.isEdit, [(pageNumber - 1) * pageSize + index + 1]: !item.phong }
                        }, () => this.soLuongDuKien[(pageNumber - 1) * pageSize + index + 1].focus());
                    }} />
                    <TableCell style={{}} content={item.tenKhoaDangKy.getFirstLetters().toUpperCase()} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.trinhDo || ''} ${(item.hoGiangVien || '').normalizedName()} ${(item.tenGiangVien || '').normalizedName()}`} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                    >
                        {!item.phong && <>
                            {!this.state.isEdit[(pageNumber - 1) * pageSize + index + 1] && <Tooltip title='Điều chỉnh' arrow>
                                <button className='btn btn-primary' onClick={e => e.preventDefault() || this.setState({ isEdit: { ...this.state.isEdit, [(pageNumber - 1) * pageSize + index + 1]: true } })}>
                                    <i className='fa fa-lg fa-edit' />
                                </button>
                            </Tooltip>}
                            {this.state.isEdit[(pageNumber - 1) * pageSize + index + 1] && <Tooltip title='Lưu' arrow>
                                <button className='btn btn-success' onClick={e => {
                                    e.preventDefault();
                                    this.setState({ isEdit: { ...this.state.isEdit, [(pageNumber - 1) * pageSize + index + 1]: false } }, () => {
                                        this.updateSoTiet((pageNumber - 1) * pageSize + index + 1, item);
                                    });
                                }}>
                                    <i className='fa fa-lg fa-check' />
                                </button>
                            </Tooltip>}</>}
                        {item.phong && <Tooltip title='Điều chỉnh' arrow>
                            <button className='btn btn-info' onClick={e => e.preventDefault() || this.modal.show(item)}>
                                <i className='fa fa-lg fa-cog' />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>)
        });

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Thời khoá biểu',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Thời khoá biểu'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDtThoiKhoaBieuPage} done={(page) => {
                        this.setState({ page }, () => {
                            let { pageNumber, pageSize, list } = page;
                            list.forEach((item, index) => {
                                this.soTiet[(pageNumber - 1) * pageSize + index + 1].value(item.soTiet);
                                this.thu[(pageNumber - 1) * pageSize + index + 1].value(item.thu);
                                this.tietBatDau[(pageNumber - 1) * pageSize + index + 1].value(item.tietBatDau);
                                this.phong[(pageNumber - 1) * pageSize + index + 1].value(item.phong);
                            });
                        });
                    }}
                />
                <AdjustModal ref={e => this.modal = e} readOnly={!permission.write}
                    update={this.props.updateDtThoiKhoaBieu}
                    initData={this.initData}
                />
                <CirclePageButton type='custom' customClassName='btn-success' customIcon='fa fa-lg fa-calendar' tooltip='Tạo thời khóa biểu cho danh sách hiện tại' onClick={e => e.preventDefault()
                    || this.taoThoiKhoaBieu()} />
            </>,
            backRoute: '/user/dao-tao',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.namFilter = e} className='col-md-2' label='Chọn năm' data={this.state.listYear || []} onChange={value => this.setState({ filter: { ...this.state.filter, nam: value.id } })} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-2' label='Chọn học kỳ' data={this.state.listHocKy || []} onChange={value => this.setState({ filter: { ...this.state.filter, hocKy: value.id } })} />
                <FormSelect ref={e => this.khoaFilter = e} className='col-md-4' label='Chọn khoa' data={SelectAdapter_DmDonVi} onChange={value => this.setState({ filter: { ...this.state.filter, maKhoaBoMon: value.id } })} />
                <FormSelect ref={e => this.nganhFilter = e} className='col-md-4' label='Chọn ngành' data={SelectAdapter_DtNganhDaoTao} onChange={value => this.setState({ filter: { ...this.state.filter, maNganh: value.id } })} />
                <div style={{ display: 'flex', justifyContent: 'end' }} className='form-group col-md-12'>
                    <button className='btn btn-secondary' onClick={
                        e => e.preventDefault() || this.setState({ filter: {} }, () => {
                            this.initData('', this.state.filter);
                            this.namFilter.value('');
                            this.hocKyFilter.value('');
                            this.khoaFilter.value('');
                            this.nganhFilter.value('');
                        })} style={{ marginRight: '15px' }}>
                        <i className='fa fa-lg fa-times' /> Reset
                    </button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.initData('', this.state.filter)}>
                        <i className='fa fa-lg fa-search-plus' /> Tìm
                    </button>
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { getDmPhongAll, getDmDonViAll, getDtThoiKhoaBieuPage, createDtThoiKhoaBieu, updateDtThoiKhoaBieu, deleteDtThoiKhoaBieu, initSchedule };
export default connect(mapStateToProps, mapActionsToProps)(DtThoiKhoaBieuPage);