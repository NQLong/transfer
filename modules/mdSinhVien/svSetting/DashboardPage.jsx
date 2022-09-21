import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';
import { AdminChart, DefaultColors } from 'view/component/Chart';
import CountUp from 'view/js/countUp';
import { GetDashboard } from './redux';
class DashboardIcon extends React.Component {
    componentDidMount() {
        setTimeout(() => {
            const endValue = this.props.value ? parseInt(this.props.value) : 0;
            new CountUp(this.valueElement, 0, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
        }, 100);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value)
            setTimeout(() => {
                const endValue = this.props.value ? parseInt(this.props.value) : 0;
                new CountUp(this.valueElement, prevProps.value, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
            }, 100);
    }

    render() {
        let isShow = true;
        if (this.props.isShowValue != undefined) {
            if (this.props.isShowValue == false) isShow = false;
        }
        const content = (
            <div className={'widget-small coloured-icon ' + this.props.type}>
                <i className={'icon fa fa-3x ' + this.props.icon} />
                <div className='info'>
                    {isShow && <p style={{ fontWeight: 'bold' }} ref={e => this.valueElement = e} />}
                    <label>{this.props.title} </label>

                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}

class DashboardCtsv extends AdminPage {
    state = {}
    componentDidMount() {
        T.ready('/user/students', () => {
            this.props.GetDashboard(result => {
                let { data, dataFee, listThaoTac } = result,
                    dataFilter = data.filter(item => item.ngayNhapHoc != null && item.ngayNhapHoc != -1).map(item => ({ ...item, ngayNhapHoc: T.dateToText(item.ngayNhapHoc, 'dd/mm/yyyy') }));
                let dataNgayNhapHoc = dataFilter.groupBy('ngayNhapHoc');
                this.setState({
                    data, listThaoTac,
                    dataFee,
                    sumNewStud: data.length,
                    clc: data.filter(item => item.loaiHinhDaoTao == 'CLC').length,
                    cq: data.filter(item => item.loaiHinhDaoTao == 'CQ').length,
                    dataTong: this.setUp([...new Set(dataFilter)], 'ngayNhapHoc', DefaultColors.navy),
                    dataTable: Object.keys(dataNgayNhapHoc).map(date => ({ date, clc: dataNgayNhapHoc[date].filter(item => item.loaiHinhDaoTao == 'CLC').length, cq: dataNgayNhapHoc[date].filter(item => item.loaiHinhDaoTao == 'CQ').length }))
                }, () => {
                });
            });
        });
    }

    setUp = (data = [], keyGroup, colors, mapper) => {
        let dataGroupBy = data.groupBy(keyGroup);
        delete dataGroupBy[null];
        return {
            labels: Object.keys(dataGroupBy).sort().map(item => {
                if (mapper) return mapper[item] || 'Chưa xác định';
                else return item;
            }),
            datas: {
                'Số lượng': Object.values(dataGroupBy).sort().map(item => {
                    if (item[0] && item[0].numOfStaff) return item[0].numOfStaff;
                    else {
                        return item.length;
                    }
                })
            },
            colors: colors
        };
    }

    loaiHinhRender = (data) => renderTable({
        emptyTable: 'Chưa có dữ liệu',
        getDataSource: () => data,
        header: 'thead-light',
        renderHead: () => (
            <tr>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Ngày</th>
                <th style={{ whiteSpace: 'nowrap', width: '50%', textAlign: 'center' }}>CQ</th>
                <th style={{ whiteSpace: 'nowrap', width: '50%', textAlign: 'center' }}>CLC</th>
            </tr>
        ),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.date} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.cq} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.clc} />
            </tr>
        )
    });



    table = (list) => renderTable({
        emptyTable: 'Không có dữ liệu sinh viên',
        stickyHead: true,
        header: 'thead-light',
        getDataSource: () => list,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ và tên lót</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tình trạng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã ngành</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoá</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email cá nhân</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email sinh viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT cá nhân</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian nhập học</th>
            </tr>
        ),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell type='number' content={index + 1} />
                <TableCell type='link' url={`/user/students/profile/${item.mssv}`} style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={
                    <>
                        {item.hoTenNguoiLienLac ? <b className='text-success'>Đã lưu trực tuyến</b> : <b className='text-secondary'>Chưa lưu trực tuyến</b>}
                        < br />
                        {this.state.dataFee.find(fee => fee.mssv == item.mssv) ? <b className='text-primary'>Đã thanh toán HP</b> : <b className='text-danger'>Chưa thanh toán HP</b>}
                    </>
                } />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.gioiTinh ? (item.gioiTinh == 1 ? 'Nam' : 'Nữ') : ''} />
                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngaySinh} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maNganh || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTuyenSinh || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTao || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailCaNhan || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailTruong || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dienThoaiCaNhan || ''} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>{T.dateToText(item.ngayNhapHoc, 'HH:MM:ss dd/mm/yyyy')}<br /><i>{this.state.listThaoTac.find(thaoTac => thaoTac.mssv == item.mssv)?.email || ''}</i></>} />
            </tr>
        )
    });

    render() {
        let permission = this.getUserPermission('student', ['read', 'write', 'delete', 'export']);
        const filterTanSinhVien = {
            listKhoaSinhVien: '2022',
            listLoaiHinhDaoTao: ['CQ', 'CLC'].toString(),
            fromNhapHoc: 1663606800000,
            toNhapHoc: new Date().setHours(23, 59, 59, 0)
        }, filterInDate = {
            listKhoaSinhVien: '2022',
            listLoaiHinhDaoTao: ['CQ', 'CLC'].toString(),
            fromNhapHoc: new Date().setHours(0, 0, 0, 0),
            toNhapHoc: new Date().setHours(23, 59, 59, 0)
        };
        return this.renderPage({
            title: 'Dashboard nhập học USSH - 2022',
            icon: 'fa fa-tachometer',
            backRoute: '/user/students',
            breadcrumb: [
                <Link key={1} to='/user/students'>Sinh viên</Link>,
                'Dashboard'
            ],
            content: this.state.dataTong ? <div className='row'>
                <div className='col-md-3'>
                    <DashboardIcon type='info' icon='fa-users' title='Tổng tân sinh viên' value={this.state.sumNewStud || 0} link='/user/students/list' />
                </div>
                <div className='col-md-3'>
                    <DashboardIcon type='primary' icon='fa-users' title='Chính quy' value={this.state.cq || 0} link='/user/students/list' />
                </div>
                <div className='col-md-3'>
                    <DashboardIcon type='danger' icon='fa-users' title='Chất lượng cao' value={this.state.clc || 0} link='/user/students/list' />
                </div>
                <div className='col-md-3'>
                    <DashboardIcon type='warning' icon='fa-money' title='Đã đóng học phí' value={this.state.dataFee?.length || 0} />
                </div>
                <div className='col-lg-8'>
                    <div className='tile'>
                        <h5 className='tile-title'>Số lượng nhập học theo ngày</h5>
                        <AdminChart type='bar' data={this.state.dataTong} aspectRatio={3} />
                    </div>
                </div>
                <div className='col-lg-4'>
                    <div className='tile' style={{ height: '40vh', overflow: 'scroll' }}>
                        <h5 className='tile-title'>Số lượng theo hệ</h5>
                        {this.loaiHinhRender(this.state.dataTable)}
                    </div>
                </div>
                <div className='col-md-12'>
                    <div className='tile'>
                        <h5 className='tile-title'>Danh sách đã xác nhận nhập học</h5>
                        {this.table((this.state.data || []).filter(item => item.ngayNhapHoc != null && item.ngayNhapHoc != -1))}
                    </div>
                </div>
            </div> : loadSpinner(),
            buttons: [
                permission.export && { className: 'btn btn-danger', icon: 'fa-users', tooltip: 'Danh sách TSV đã nhập học', onClick: e => e.preventDefault() || T.download(`/api/students/download-excel?filter=${T.stringify(filterTanSinhVien)}`, 'ALL_STUDENTS.xlsx') },
                permission.export && { className: 'btn btn-info', icon: 'fa-file-excel-o', tooltip: `Danh sách ngày ${T.dateToText(new Date().getTime(), 'dd/mm/yyyy')}`, onClick: e => e.preventDefault() || T.download(`/api/students/download-excel?filter=${T.stringify(filterInDate)}`, `STUDENTS_${T.dateToText(new Date().getTime(), 'dd/mm/yyyy')}.xlsx`) }
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    GetDashboard
};
export default connect(mapStateToProps, mapActionsToProps)(DashboardCtsv);