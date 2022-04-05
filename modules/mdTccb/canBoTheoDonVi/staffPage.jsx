import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import { getNhanSuDonVi } from './redux';
import { getDmDonVi, SelectAdapter_DmDonViFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmChucVu } from 'modules/mdDanhMuc/dmChucVu/redux';

const CRUD = {
    'C': 'Tạo',
    'R': 'Đọc',
    'U': 'Cập nhật',
    'D': 'Xóa'
};
class CanBoTheoDonVi extends AdminPage {
    state = { tenDonVi: '', listStaffAll: [], listNhanSu: [], listDonViQuanLy: [], shcc: null };

    defaultCRUDRowStyle = (log) => ({
        whiteSpace: 'nowrap',
        textAlign: 'center',
        backgroundColor: log ? '#90EE90' : '#FFCCCC'
    })

    componentDidMount() {
        T.ready('/user', () => {
            let listDonViQuanLy = this.props.system && this.props.system.user.staff && this.props.system.user.staff.donViQuanLy ? this.props.system.user.staff.donViQuanLy : [];
            this.getData(listDonViQuanLy.filter(item => item.isManager).map(item => item.maDonVi));
        });
    }

    getData = (listDonVi, maDonVi = listDonVi[0]) => {
        this.setState({ listDonVi, maDonVi });
        this.props.getNhanSuDonVi(listDonVi, items => {
            this.setState({
                listDonViQuanLy: listDonVi,
                listNhanSuAll: items.filter(item => !item.ngayNghi).groupBy('maDonVi')
            }, () => {
                this.setData(this.state.listNhanSuAll, maDonVi);
            });
        });
    }

    setData = (data, maDonVi) => {
        this.donVi.value(maDonVi);
        this.setState({ listNhanSu: data[maDonVi] });
    }

    normalHeader = () => (
        <tr>
            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ và tên</th>
            <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Email</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số điện thoại</th>
            {/* Gán quyền xử lý công việc */}
        </tr>
    );

    tccbHeader = () => (
        <>
            <tr>
                <th rowSpan={2} style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th rowSpan={2} style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                <th rowSpan={2} style={{ width: '70%', whiteSpace: 'nowrap' }}>Email</th>
                <th rowSpan={2} style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số điện thoại</th>
                <th rowSpan={1} colSpan={3} style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác hệ thống Tổ chức cán bộ</th>
                {/* Gán quyền xử lý công việc */}
            </tr>
            <tr>
                <th rowSpan={1} style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                <th rowSpan={1} style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Quá trình</th>
                <th rowSpan={1} style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời điểm</th>
            </tr>
        </>
    );

    normalRows = (item, index) => <tr key={index}>
        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
        <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={
            (item.ho + ' ' + item.ten)
        } url={`tccb/staff/${item.shcc}`} />
        <TableCell type='text' style={{ whiteSpace: 'nowrap', fontStyle: 'italic' }} content={item.email} />
        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.dienThoaiCaNhan} />
    </tr>

    tccbRows = (item, index) => <tr key={index}>
        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
            <>
                <a href={`tccb/staff/${item.shcc}`}>{item.ho + ' ' + item.ten}<br /></a>
                {item.ngach + ': ' + item.tenNgach}
            </>
        } />
        <TableCell type='text' style={{ whiteSpace: 'nowrap', fontStyle: 'italic' }} content={item.email} />
        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.dienThoaiCaNhan} />
        <TableCell type='text' style={this.defaultCRUDRowStyle(item.tccbLog)} content={CRUD[item.tccbLog?.thaoTac] || ''} />
        <TableCell type='text' style={this.defaultCRUDRowStyle(item.tccbLog)} content={item.tccbLog?.quaTrinh || ''} />
        <TableCell type='date' dateFormat='HH:MM:ss dd/mm/yy'
            style={this.defaultCRUDRowStyle(item.tccbLog)} content={item.tccbLog?.ngay || null} />
    </tr>

    render() {
        let table = renderTable({
            emptyTable: 'Đơn vị chưa có cán bộ',
            getDataSource: () => this.state.listNhanSu
            , stickyHead: false,
            renderHead: () => this.state.maDonVi ? (this.state.maDonVi == '30' ? this.tccbHeader() : this.normalHeader()) : this.normalHeader(),
            renderRow: (item, index) =>
                this.state.maDonVi ? ((this.state.maDonVi == '30') ? this.tccbRows(item, index) : this.normalRows(item, index)) : this.normalRows(item, index)
        });
        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            header: <FormSelect style={{ width: '300px', marginBottom: '0' }} placeholder='Danh sách đơn vị quản lý' ref={e => this.donVi = e} onChange={value => this.getData(this.state.listDonVi, value.id)} data={SelectAdapter_DmDonViFilter(this.state.listDonViQuanLy)
            } minimumResultsForSearch={-1}
            // disabled={this.state.listDonViQuanLy.length == 1}
            />,
            title: 'Danh sách nhân sự thuộc đơn vị quản lý',
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Danh sách nhân sự'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
            </>,
            backRoute: '/user',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, canBoTheoDonVi: state.tccb.canBoTheoDonVi });
const mapActionsToProps = {
    getNhanSuDonVi, getDmDonVi, getDmChucVu
};
export default connect(mapStateToProps, mapActionsToProps)(CanBoTheoDonVi);