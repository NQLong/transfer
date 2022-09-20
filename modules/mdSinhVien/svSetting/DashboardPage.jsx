
import { ChartArea } from 'modules/mdHanhChinhTongHop/dashboardHCTH/adminPage';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';
import { DefaultColors } from 'view/component/Chart';
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
                    <h4>
                        {this.props.title}
                    </h4>
                    {isShow && <p style={{ fontWeight: 'bold' }} ref={e => this.valueElement = e} />}
                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}


class DashboardCtsv extends AdminPage {
    state = {}
    componentDidMount() {
        this.props.GetDashboard(result => {
            let { data, dataFee } = result;
            let dataNgayNhapHoc = data.filter(item => item.ngayNhapHoc != null && item.ngayNhapHoc != -1).map(item => ({ ...item, ngayNhapHoc: T.dateToText(item.ngayNhapHoc, 'dd/mm/yyyy') })).groupBy('ngayNhapHoc');
            this.setState({
                data,
                dataFee: dataFee.rows[0]['COUNT(*)'],
                sumNewStud: data.length,
                clc: data.filter(item => item.loaiHinhDaoTao == 'CLC').length,
                cq: data.filter(item => item.loaiHinhDaoTao == 'CQ').length,
                dataChart: {
                    labels: Object.keys(dataNgayNhapHoc),
                    datas: {
                        'CLC': Object.keys(dataNgayNhapHoc).map(key => dataNgayNhapHoc[key].filter(item => item.loaiHinhDaoTao == 'CLC').length),
                        'CQ': Object.keys(dataNgayNhapHoc).map(key => dataNgayNhapHoc[key].filter(item => item.loaiHinhDaoTao == 'CQ').length),
                    },
                    colors: {
                        'CLC': DefaultColors.red,
                        'CQ': DefaultColors.blue
                    }

                },
            }, () => {
            });
        });
    }

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
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.gioiTinh ? (item.gioiTinh == 1 ? 'Nam' : 'Nữ') : ''} />
                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngaySinh} />
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhNoiSinh} /> */}
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa || ''} /> */}
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maNganh || ''} />
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh || ''} /> */}
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTuyenSinh || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTao || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailCaNhan || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailTruong || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dienThoaiCaNhan || ''} />
                <TableCell type='date' dateFormat='HH:MM:ss dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayNhapHoc} />
                { }
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tonGiao || ''} /> */}
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={item.quocTich || ''} /> */}
                {/* <TableCell type='text' contentClassName='multiple-lines-5' content={(item.soNhaThuongTru ? item.soNhaThuongTru + ', ' : '')
                    + (item.xaThuongTru ? item.xaThuongTru + ', ' : '')
                    + (item.huyenThuongTru ? item.huyenThuongTru + ', ' : '')
                    + (item.tinhThuongTru ? item.tinhThuongTru : '')} />
                <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoTenNguoiLienLac || ''} />
                <TableCell type='text' contentClassName='multiple-lines-5' content={(item.soNhaLienLac ? item.soNhaLienLac + ', ' : '')
                    + (item.xaLienLac ? item.xaLienLac + ', ' : '')
                    + (item.huyenLienLac ? item.huyenLienLac + ', ' : '')
                    + (item.tinhLienLac ? item.tinhLienLac : '')} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.sdtNguoiLienLac || ''} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayNhapHoc ? (item.ngayNhapHoc == -1 ? 'Đang chờ nhập học'
                    : (item.ngayNhapHoc.toString().length == 20 ? T.dateToText(new Date(item.ngayNhapHoc), 'dd/mm/yyyy') : '')) : ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrang || ''} />
                <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                    onDelete={this.delete}>
                    <Tooltip title={item.canEdit ? 'Khoá edit' : 'Cho phép edit'}>
                        <button className={item.canEdit ? 'btn btn-secondary' : 'btn btn-success'} type='button' onClick={e => e.preventDefault() ||
                            this.props.updateStudentAdmin(item.mssv, { canEdit: Number(!item.canEdit) })
                        }>
                            <i className={item.canEdit ? 'fa fa-lg fa-times' : 'fa fa-lg fa-check'} />
                        </button>
                    </Tooltip>
                    <Tooltip title='Tải SYLL'>
                        <button style={{ display: parseInt(item.namTuyenSinh) >= new Date().getFullYear() ? '' : 'none' }} className='btn btn-warning' type='button' onClick={e => e.preventDefault() ||
                            this.props.adminDownloadSyll(item.mssv, item.namTuyenSinh)
                        }>
                            <i className='fa fa-lg fa-arrow-down' />
                        </button>
                    </Tooltip>
                    {developer.login && <Tooltip title='BHYT'>
                        <button className='btn btn-secondary' type='button' onClick={e => {
                            e.preventDefault();
                            this.props.getMssvBaoHiemYTe({ mssv: item.mssv }, (bhyt) => {
                                if (!bhyt) return T.notify('Sinh viên chưa đăng ký bảo hiểm y tế');
                                this.bhytModal.initBhyt(bhyt.dienDong);
                                this.bhytModal.show(item.mssv);
                            });
                        }}>
                            <i className='fa fa-lg fa-cog' />
                        </button>
                    </Tooltip>}

                </TableCell> */}
            </tr>
        )
    });

    render() {
        return this.renderPage({
            title: 'Dashboard',
            icon: 'fa fa-tachometer',
            content: this.state.dataChart ? <div className='row'>
                <div className='col-md-3'>
                    <DashboardIcon type='info' icon='fa-users' title='Tổng sô tân sinh viên' value={this.state.sumNewStud || 0} link='/user/students/list' />
                </div>
                <div className='col-md-3'>
                    <DashboardIcon type='primary' icon='fa-users' title='Chính quy' value={this.state.cq || 0} link='/user/students/list' />
                </div>
                <div className='col-md-3'>
                    <DashboardIcon type='danger' icon='fa-users' title='Chất lượng cao' value={this.state.clc || 0} link='/user/students/list' />
                </div>
                <div className='col-md-3'>
                    <DashboardIcon type='info' icon='fa-money' title='Đã đóng học phí' value={this.state.dataFee || 0} link='/user/students/list' />
                </div>
                {this.state.dataChart && <ChartArea title='Mật độ số lượng nhập học' chartType='bar' data={this.state.dataChart} className='col-lg-12' aspectRatio={3} />}
                <div className='col-md-12'>
                    <h5 className='tile-title'>Danh sách đã xác nhận nhập học</h5>
                    <div className='tile'>
                        {this.table((this.state.data || []).filter(item => item.ngayNhapHoc != null && item.ngayNhapHoc != -1))}
                    </div>
                </div>
            </div> : loadSpinner()
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    GetDashboard
};
export default connect(mapStateToProps, mapActionsToProps)(DashboardCtsv);