import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs, renderTable, TableCell } from 'view/component/AdminPage';
import { getAllSvBaoHiemYTe } from './redux';
class BaoHiemAdminPage extends AdminPage {
    componentDidMount() {
        this.props.getAllSvBaoHiemYTe(2022);
    }

    tableDangKyMoi = () => renderTable({

    })

    component12Thang = () => <FormTabs tabs={[
        { title: 'Gia hạn (đã có mã BHXH)', component: this.componentTableMienDong(12) },
        { title: 'Đăng ký mới (chưa có mã BHXH)' },
    ]} />

    component15Thang = () => <FormTabs tabs={[
        { title: 'Gia hạn (đã có mã BHXH)', component: this.componentTableMienDong(15) },
        { title: 'Đăng ký mới (chưa có mã BHXH)' },
    ]} />

    componentTableMienDong = (dienDong = 0) => renderTable({
        getDataSource: () => (this.props.svBaoHiemYTe?.items || []).filter(item => item.dienDong == dienDong && !!item.maBhxhHienTai),
        renderHead: () => <tr>
            <td style={{ width: 'auto' }}>#</td>
            <td style={{ width: '20%' }}>MSSV</td>
            <td style={{ width: '40%', whiteSpace: 'nowrap' }}>Họ tên</td>
            <td style={{ width: '10%', whiteSpace: 'nowrap' }}>SĐT cá nhân</td>
            <td style={{ width: '30%', whiteSpace: 'nowrap' }}>Thường trú</td>
            <td style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã số BHXH hiện tại</td>
            <td style={{ width: 'auto', whiteSpace: 'nowrap', display: dienDong != 0 ? '' : 'none' }}>Cơ sở KCB</td>
            <td style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mặt trước thẻ BHYT</td>
            <td style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mặt sau thẻ BHYT</td>
        </tr>,
        renderRow: (item, index) => <tr key={index}>
            <TableCell type='number' content={index + 1} />
            <TableCell content={item.mssv} nowrap />
            <TableCell content={`${item.ho?.toUpperCase() || ''} ${item.ten?.toUpperCase() || ''}`} nowrap />
            <TableCell type='text' content={item.soDienThoaiCaNhan} nowrap />
            <TableCell nowrap content={<>{item.soNhaThuongTru}<br />{item.xaThuongTru}<br />{item.huyenThuongTru}<br />{item.tinhThuongTru}<br /></>} />
            <TableCell style={{ textAlign: 'center' }} content={item.maBhxhHienTai} />
            <TableCell style={{ display: dienDong != 0 ? '' : 'none' }} content={item.tenBenhVien} />
            <TableCell content={<a target='_blank' rel='noreferrer' href={`/api/student/front-bhyt-admin?id=${item.id}`}><img src={`/api/student/front-bhyt-admin?id=${item.id}`} style={{ height: '150px' }} /></a>} />
            <TableCell content={<a target='_blank' rel='noreferrer' href={`/api/student/back-bhyt-admin?id=${item.id}`}><img src={`/api/student/back-bhyt-admin?id=${item.id}`} style={{ height: '150px' }} /></a>} />
        </tr>
    });
    render() {
        return this.renderPage({
            title: 'Quản lý thông tin bảo hiểm y tế',
            content: <FormTabs contentClassName='tile' tabs={[
                { id: 0, title: 'Miễn đóng', component: this.componentTableMienDong() },
                { id: 12, title: '12 tháng', component: this.component12Thang() },
                { id: 0, title: '15 tháng', component: this.component15Thang() }
            ]} />
        });
    }
}
const mapStateToProps = state => ({ system: state.system, svBaoHiemYTe: state.sinhVien.svBaoHiemYTe });
const mapActionsToProps = {
    getAllSvBaoHiemYTe
};
export default connect(mapStateToProps, mapActionsToProps)(BaoHiemAdminPage);