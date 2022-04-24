import React from 'react';
import { connect } from 'react-redux';
import { getDtThoiKhoaBieuPage, createDtThoiKhoaBieu, updateDtThoiKhoaBieu, deleteDtThoiKhoaBieu, initSchedule } from './redux';
import { Link } from 'react-router-dom';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { } from '../dmMonHoc/redux';
import { getDmPhongAll } from 'modules/mdDanhMuc/dmPhong/redux';
import { AdminPage, CirclePageButton, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import T from 'view/js/common';

class DtThoiKhoaBieuPage extends AdminPage {
    soTiet = {}
    state = { page: null, isEdit: {} }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.props.getDtThoiKhoaBieuPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.initData();
        });
    }

    initData = () => {
        this.props.getDtThoiKhoaBieuPage(undefined, undefined, '', page => {
            this.setState({ page }, () => {
                let { pageNumber, pageSize, list } = page;
                list.forEach((item, index) => {
                    !item.phong && this.soTiet[(pageNumber - 1) * pageSize + index + 1].value(item.soTiet);
                });
            });
        });
    };



    taoThoiKhoaBieu = () => {
        T.confirmLoading('Tạo thời khóa biểu', 'Xác nhận tạo thời khóa biểu tự động?', 'Tạo thời gian thời khóa biểu thành công', 'info', 'Tạo', () => this.props.initSchedule(() => this.initData()));
    }
    updateSoTiet = (index, item) => {
        if (!this.soTiet[index].value()) T.notify('Vui lòng nhập giá trị', 'danger');
        else this.props.updateDtThoiKhoaBieu(item.id, { soTiet: this.soTiet[index].value() });
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa học phần', 'Bạn có chắc bạn muốn xóa học phần này?', true, isConfirm =>
            isConfirm && this.props.deleteDtThoiKhoaBieu(item.id));
    }

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
                        <th rowSpan='2' style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Học kỳ</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>Mã</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }}>Môn học</th>
                        <th rowSpan='2' style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Phòng</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Nhóm</th>
                        <th colSpan='4' rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian
                        </th>
                        <th rowSpan='2' style={{ width: '50%', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Khoa/Bộ môn</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thứ</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Tiết bắt đầu</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Tiết kết thúc</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Số tiết</th>
                    </tr>
                </>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ width: 'auto', textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item.nam + ' - HK' + item.hocKy} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.maMonHoc} />
                    <TableCell style={{}} contentClassName='multiple-lines-4' content={T.parse(item.tenMonHoc, { vi: '' }).vi} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.phong} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.nhom} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={item.thu} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.tietBatDau} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.phong ? Number(item.tietBatDau) + Number(item.soTiet) - 1 : ''} />
                    <TableCell style={{ textAlign: 'center' }} content={item.phong ? item.soTiet :
                        <FormTextBox type='number' ref={e => this.soTiet[(pageNumber - 1) * pageSize + index + 1] = e} style={{ width: '50px', marginBottom: '0' }} readOnly={!this.state.isEdit[(pageNumber - 1) * pageSize + index + 1]} />} />
                    <TableCell style={{}} content={item.tenKhoaBoMon} />
                    <TableCell type='buttons' content={item} permission={permission}
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
                                !item.phong && this.soTiet[(pageNumber - 1) * pageSize + index + 1].value(item.soTiet);
                            });
                        });
                    }} />
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