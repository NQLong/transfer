import React from 'react';
import { connect } from 'react-redux';
import { getTccbCaNhanDangKyByYear, createTccbCaNhanDangKy, updateTccbCaNhanDangKy } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';

class TccbCaNhanDangKyDetails extends AdminPage {

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/ca-nhan-dang-ky/:nam');
            this.nam = parseInt(route.parse(window.location.pathname)?.nam);
            this.props.getTccbCaNhanDangKyByYear(this.nam);
        });
    }

    dangKy = (item, value) => {
        if (item.id) {
            this.props.updateTccbCaNhanDangKy(item.id, { dangKy: value }, item.idNhomDangKy);
        } else {
            this.props.createTccbCaNhanDangKy({ dangKy: value }, item.nhom.id);
        }
    }

    render() {
        const permission = {
            write: true,
        };
        const list = this.props.tccbCaNhanDangKy?.items || [];
        let table = renderTable({
            className: 'dmcv',
            emptyTable: 'Không có dữ liệu đăng ký',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>STT</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: '' }}>Chức danh</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Số giờ làm việc/Số điểm</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nhiệm vụ giảng dạy</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nhiệm vụ nghiên cứu khoa học</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nhiệm vụ khác</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Đăng ký</th>
                </tr>
            ),
            multipleTbody: true,
            renderRow: (item, index) => (
                <tbody key={index} style={{ backgroundColor: 'white' }}>
                    <tr>
                        <TableCell style={{ textAlign: 'center' }} className='text-primary' content={<b>{(index + 1).intToRoman()}</b>} />
                        <TableCell style={{ textAlign: 'left' }} className='text-primary' colSpan={5} content={<b>{item.nhom.ten}</b>} />
                        <TableCell type='checkbox' rowSpan={1 + item.submenus.length * 2} content={item.dangKy || 0} permission={permission} onChanged={value => this.dangKy(item, value)} />
                    </tr>
                    {
                        item.submenus.length > 0 &&
                        item.submenus.map((menu, stt) => [
                            <tr key={`${index}-${stt}-1`}>
                                <TableCell style={{ textAlign: 'center' }} rowSpan={2} content={stt + 1} />
                                <TableCell style={{ textAlign: 'left' }} rowSpan={2} content={menu.chucDanhs} />
                                <TableCell style={{ textAlign: 'left' }} content={'Số giờ làm việc'} />
                                <TableCell style={{ textAlign: 'right' }} content={menu.soGioGiangDay} />
                                <TableCell style={{ textAlign: 'right' }} content={menu.soGioNghienCuuKhoaHoc} />
                                <TableCell style={{ textAlign: 'right' }} content={menu.soGioKhac} />
                            </tr>,
                            <tr key={`${index}-${stt}-2`}>
                                <TableCell style={{ textAlign: 'left' }} content={'Số điểm'} />
                                <TableCell style={{ textAlign: 'right' }} content={Number(menu.soDiemGiangDay).toFixed(2)} />
                                <TableCell style={{ textAlign: 'right' }} content={Number(menu.soDiemNghienCuuKhoaHoc).toFixed(2)} />
                                <TableCell style={{ textAlign: 'right' }} content={Number(menu.soDiemKhac).toFixed(2)} />
                            </tr>
                        ])
                    }
                </tbody>
            )
        });

        return this.renderPage({
            icon: 'fa fa-pencil',
            title: 'Thông tin đăng ký',
            breadcrumb: [
                <Link key={0} to='/user/tccb/'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/ca-nhan-dang-ky/'>Cá nhân đăng ký</Link>,
                'Thông tin đăng ký'
            ],
            content: <div className='tile'>{table}</div>,
            backRoute: '/user/tccb/ca-nhan-dang-ky',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbCaNhanDangKy: state.tccb.tccbCaNhanDangKy });
const mapActionsToProps = { getTccbCaNhanDangKyByYear, createTccbCaNhanDangKy, updateTccbCaNhanDangKy };
export default connect(mapStateToProps, mapActionsToProps)(TccbCaNhanDangKyDetails);