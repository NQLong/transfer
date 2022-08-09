import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, CirclePageButton, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import { SelectAdapter_DtNganhDaoTao } from '../dtNganhDaoTao/redux';
import TaoThoiGianMoMon from '../dtThoiGianMoMon/ThoiGianMoMonModal';
import { getDtDangKyMoMonPage, createDangKyMoMon } from './redux';

class NganhModal extends AdminModal {
    onShow = () => {
        this.setState({ bacDaoTao: 'DH', loaiHinhDaoTao: '' });
        this.bacDaoTao.value('DH');
        this.loaiHinhDaoTao.value('');
        this.namHoc.value('');
        this.hocKy.value('');
        this.batDau.value('');
        this.ketThuc.value('');
        this.nganh.value('');
    }

    onSubmit = e => {
        e && e.preventDefault();
        if (!this.nganh.value()) {
            T.notify('Chưa chọn Ngành', 'danger');
            this.nganh.focus();
            return;
        }
        let data = {
            nam: this.namHoc.value(),
            hocKy: this.hocKy.value(),
            batDau: this.props.thoiGianMoMon.batDau,
            ketThuc: this.props.thoiGianMoMon.ketThuc,
            khoa: this.state.khoa,
            maNganh: this.nganh.value(),
        }, settings = {
            bacDaoTao: this.bacDaoTao.value(),
            loaiHinhDaoTao: this.loaiHinhDaoTao.value()
        };
        this.props.create(data, settings, item => {
            this.hide();
            this.props.history.push(`/user/dao-tao/dang-ky-mo-mon/${item.id}`);
        });

    }
    render = () => {
        let thoiGianMoMon = this.props.thoiGianMoMon;
        return this.renderModal({
            title: 'Tạo mới đăng ký mở môn',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-6' ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} onChange={e => {
                    this.setState({ bacDaoTao: e.id }, () => this.loaiHinhDaoTao.focus());
                }} readOnly />
                <FormSelect className='col-md-6' ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} onChange={e => {
                    this.setState({ loaiHinhDaoTao: e.id }, () => {
                        if (!this.bacDaoTao.value()) {
                            T.notify('Vui lòng chọn bậc đào tạo trước', 'danger');
                            this.loaiHinhDaoTao.value('');
                            this.bacDaoTao.focus();
                        }
                        else {
                            let currentData = thoiGianMoMon.filter(item => item.loaiHinhDaoTao == this.state.loaiHinhDaoTao && item.bacDaoTao == this.state.bacDaoTao)[0];
                            if (!currentData) {
                                T.notify('Bậc và hệ đào tạo chưa có thời gian đăng ký!', 'warning');
                                this.bacDaoTao.value('');
                                this.loaiHinhDaoTao.value('');
                                this.bacDaoTao.focus();
                            } else {
                                this.batDau.value(T.dateToText(currentData.batDau, 'dd/mm/yyyy'));
                                this.ketThuc.value(T.dateToText(currentData.ketThuc, 'dd/mm/yyyy'));
                                this.namHoc.value(currentData.nam);
                                this.hocKy.value(currentData.hocKy);
                                this.setState({ currentData });
                            }
                        }
                    });
                }} />

                <FormTextBox className='col-md-6' ref={e => this.hocKy = e} readOnly label='Học kỳ' />
                <FormSelect className='col-md-6' ref={e => this.namHoc = e} data={SelectAdapter_DtCauTrucKhungDaoTao} readOnly label='Năm' />
                <FormTextBox className='col-md-6' ref={e => this.batDau = e} readOnly label='Mở ngày' />
                <FormTextBox className='col-md-6' ref={e => this.ketThuc = e} readOnly label='Đóng ngày' />
                <FormSelect className='col-md-12' ref={e => this.nganh = e} label='Chọn ngành' data={SelectAdapter_DtNganhDaoTao} onChange={value => this.setState({ khoa: value.khoa })} />


            </div>
        });
    }
}
class DtDangKyMoMonPage extends AdminPage {
    state = { donViFilter: '' }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            let permission = this.getUserPermission('dtChuongTrinhDaoTao'),
                user = this.props.system.user,
                donViFilter = user.staff?.maDonVi;
            if (permission.read) donViFilter = '';
            this.setState({ donViFilter });
            T.showSearchBox();
            this.props.getDtDangKyMoMonPage(undefined, undefined, {
                searchTerm: '',
                donViFilter
            });
        });
    }

    render() {
        let permissionDaoTao = this.getUserPermission('dtDangKyMoMon', ['read', 'write', 'delete', 'manage']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list, thoiGianMoMon } = this.props.dtDangKyMoMon && this.props.dtDangKyMoMon.page ?
            this.props.dtDangKyMoMon.page : {
                pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {
                    searchTerm: '', donViFilter: this.state.donViFilter
                }, totalItem: 0, list: null, thoiGianMoMon: null
            };
        let permission = {
            write: permissionDaoTao.write || permissionDaoTao.manage,
            delete: permissionDaoTao.delete || permissionDaoTao.manage
        };
        let table = renderTable({
            getDataSource: () => list,
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu',
            renderHead: () => (<>
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa, bộ môn</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bậc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học kỳ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm học</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ghi chú</th>
                </tr>
            </>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell nowrap='true' content={item.tenKhoaBoMon} />
                    <TableCell contentClassName='multiple-lines-4' content={`${item.maNganh}: ${item.tenNganh}`} />
                    <TableCell content={item.bacDaoTao} />
                    <TableCell content={item.loaiHinhDaoTao} />
                    <TableCell content={'HK' + item.hocKy} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.namHoc} />
                    <TableCell type='date' dateFormat='HH:MM:ss dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.thoiGian} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={{ write: item.permissionWrite }} onEdit={() => permission.write ? this.props.history.push(`/user/dao-tao/dang-ky-mo-mon/${item.id}`) : T.notify('Vui lòng liên hệ người quản lý đào tạo!', 'danger')} />
                    <TableCell contentClassName='multiple-lines-4' content={item.isDuyet ? 'Đã xác nhận' : 'Chưa xác nhận'} />

                </tr>)
        });
        return this.renderPage({
            title: 'Danh sách các đợt mở môn học trong học kỳ',
            icon: 'fa fa-paper-plane-o',

            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Danh sách đợt mở môn học'
            ],
            header: permissionDaoTao.read && <FormSelect style={{ width: '300px', marginBottom: '0' }} placeholder='Danh sách khoa/bộ môn' ref={e => this.donVi = e} onChange={value => {
                T.clearSearchBox();
                this.setState({ donViFilter: value ? value.id : '' });
                this.props.getDtDangKyMoMonPage(undefined, undefined, {
                    searchTerm: '',
                    donViFilter: value && value.id
                });
            }} data={SelectAdapter_DmDonViFaculty_V2} allowClear={true} />,
            content: <>
                <div className='tile'>
                    <div style={{ marginBottom: '20px' }}>
                        {thoiGianMoMon && thoiGianMoMon.length ? thoiGianMoMon.map((item, index) => {
                            return <div key={`TGMM${index}`}>
                                <span style={{ marginTop: '20' }}>[{item.bacDaoTao} - {item.loaiHinhDaoTao}] Học kỳ <b>{item.hocKy}</b>, <b>{item.namDaoTao}</b>: Từ <b>{T.dateToText(item.batDau, 'dd/mm/yyyy')}</b> đến <b>{T.dateToText(item.ketThuc, 'dd/mm/yyyy')}</b></span>
                            </div>;
                        }) : ''}
                    </div>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDtDangKyMoMonPage} />
                <TaoThoiGianMoMon ref={e => this.thoiGianMoMon = e} permission={permission} />
                <NganhModal ref={e => this.nganhModal = e} permission={permission} thoiGianMoMon={thoiGianMoMon} create={this.props.createDangKyMoMon} history={this.props.history} />
                {permissionDaoTao.write &&
                    <CirclePageButton style={{ marginRight: '65px' }} type='custom' customClassName='btn-primary' customIcon='fa-bullhorn' tooltip='Mở thời gian đăng ký' onClick={e => e.preventDefault() || this.thoiGianMoMon.show()} />
                }
            </>,
            backRoute: '/user/dao-tao',
            onCreate: (e) => {
                e.preventDefault();
                if (permissionDaoTao.manage || permissionDaoTao.write) {
                    this.nganhModal.show();
                } else T.notify('Bạn không có quyền đăng ký tại đây!', 'danger');
            }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDangKyMoMon: state.daoTao.dtDangKyMoMon });
const mapActionsToProps = { getDtDangKyMoMonPage, createDangKyMoMon };
export default connect(mapStateToProps, mapActionsToProps)(DtDangKyMoMonPage);
