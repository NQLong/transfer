import React from 'react';
import { connect } from 'react-redux';
import { getDtThoiKhoaBieuPage, createDtThoiKhoaBieu, updateDtThoiKhoaBieu, deleteDtThoiKhoaBieu, initSchedule } from './redux';
import { Link } from 'react-router-dom';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { } from '../dmMonHoc/redux';
import { getDmPhongAll, SelectAdapter_DmPhong } from 'modules/mdDanhMuc/dmPhong/redux';
import { AdminModal, AdminPage, CirclePageButton, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import T from 'view/js/common';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';

const dataThu = [2, 3, 4, 5, 6, 7], dataTiet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
class AdjustModal extends AdminModal {

    onShow = (item) => {
        let { id, giangVien } = item;
        this.setState({ id });
        this.giangVien.value(giangVien);
    }
    onSubmit = (e) => {
        e.preventDefault();
        let data = {
            giangVien: this.giangVien.value()
        };
        if (!data.giangVien) {
            T.notify('Vui lòng chọn giảng viên', 'danger');
            this.giangVien.focus();
        } else {
            this.props.update(this.state.id, data, () => {
                this.hide();
                this.props.initData();
            });
        }
    }
    render = () => {
        return this.renderModal({
            title: 'Điều chỉnh',
            size: 'large',
            body: <div className='row'>
                <FormSelect ref={e => this.giangVien = e} className='form-group col-md-12' data={SelectAdapter_FwCanBoGiangVien} label='Chọn giảng viên' />
            </div>
        });
    }
}
class DtThoiKhoaBieuPage extends AdminPage {
    soTiet = {}
    thu = {}
    tietBatDau = {}
    phong = {}
    state = { page: null, isEdit: {} }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.props.getDtThoiKhoaBieuPage(undefined, undefined, searchText || '');
            T.showSearchBox();
        });
        this.initData();
    }

    initData = () => {
        this.props.getDtThoiKhoaBieuPage(undefined, undefined, '', page => {
            this.setState({ page }, () => {
                let { pageNumber, pageSize, list } = page;
                list.forEach((item, index) => {
                    this.soTiet[(pageNumber - 1) * pageSize + index + 1].value(item.soTiet);
                    this.thu[(pageNumber - 1) * pageSize + index + 1].value(item.thu);
                    this.tietBatDau[(pageNumber - 1) * pageSize + index + 1].value(item.tietBatDau);
                    this.phong[(pageNumber - 1) * pageSize + index + 1].value(item.phong);
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
        if (!this.soTiet[index].value() || !this.thu[index].value() || !this.tietBatDau[index].value() || !this.phong[index].value()) T.notify('Vui lòng nhập giá trị', 'danger');
        else this.props.updateDtThoiKhoaBieu(item.id, {
            soTiet: this.soTiet[index].value(),
            phong: this.phong[index].value(),
            tietBatDau: this.tietBatDau[index].value(),
            thu: this.thu[index].value()
        }, this.initData());
    };

    render() {
        const permission = this.getUserPermission('dtThoiKhoaBieu', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.state.page ? this.state.page : { pageNumber: 1, pageSize: 1, pageTotal: 1, totalItem: 1, pageCondition: '' };
        let table = this.state.page ? renderTable({
            emptyTable: 'Không có dữ liệu thời khóa biểu',
            getDataSource: () => this.state.page.list, stickyHead: false,
            header: 'thead-light',
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>Học kỳ</th>
                        <th rowSpan='2' style={{ width: '25%', textAlign: 'center', verticalAlign: 'middle' }}>Mã</th>
                        <th rowSpan='2' style={{ width: '50%', verticalAlign: 'middle' }}>Môn học</th>
                        <th rowSpan='2' style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Phòng</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Nhóm</th>
                        <th colSpan='3' rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian
                        </th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }}>Khoa <br />Bộ môn</th>
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
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.maMonHoc} />
                    <TableCell style={{}} contentClassName='multiple-lines-4' content={<>
                        <span style={{ color: 'blue' }}>{T.parse(item.tenMonHoc, { vi: '' }).vi}</span> <br />
                        <i> {item.tenKhoaBoMon}</i>
                    </>} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                        <FormSelect ref={e => this.phong[(pageNumber - 1) * pageSize + index + 1] = e} style={{ marginBottom: '0' }} readOnly={!this.state.isEdit[(pageNumber - 1) * pageSize + index + 1]} data={SelectAdapter_DmPhong} placeholder='Phòng' />
                    } onClick={e => {
                        e.preventDefault();
                        if (e.type == 'click') this.setState({
                            isEdit: { ...this.state.isEdit, [(pageNumber - 1) * pageSize + index + 1]: !item.phong }
                        }, () => this.phong[(pageNumber - 1) * pageSize + index + 1].focus());
                    }}
                    />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.nhom} />
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
                            onKeyPress={e => e.key == 'Enter' && this.setState({ isEdit: { ...this.state.isEdit, [(pageNumber - 1) * pageSize + index + 1]: false } }, () => {
                                this.updateSoTiet((pageNumber - 1) * pageSize + index + 1, item);
                            })}
                        />
                    }
                        onClick={e => {
                            e.preventDefault();
                            if (e.type == 'click') this.setState({
                                isEdit: { ...this.state.isEdit, [(pageNumber - 1) * pageSize + index + 1]: !item.phong }
                            }, () => this.soTiet[(pageNumber - 1) * pageSize + index + 1].focus());
                        }}
                    />
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
                        {item.phong && <Tooltip title='Chọn giảng viên' arrow>
                            <button className='btn btn-success' onClick={e => e.preventDefault() || this.modal.show(item)}>
                                <i className='fa fa-lg fa-user-plus' />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>)
        }) : '';

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
                <AdjustModal ref={e => this.modal = e}
                    update={this.props.updateDtThoiKhoaBieu}
                    initData={this.initData}
                />
                <CirclePageButton type='custom' customIcon='fa fa-lg fa-calendar' tooltip='Tạo thời khóa biểu cho danh sách hiện tại' onClick={e => e.preventDefault()
                    || this.taoThoiKhoaBieu()} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: null, //TODO: Sắp xếp thời khóa biểu cho phòng đào tạo
            // permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { getDmPhongAll, getDmDonViAll, getDtThoiKhoaBieuPage, createDtThoiKhoaBieu, updateDtThoiKhoaBieu, deleteDtThoiKhoaBieu, initSchedule };
export default connect(mapStateToProps, mapActionsToProps)(DtThoiKhoaBieuPage);