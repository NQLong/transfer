import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, CirclePageButton, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DtNganhDaoTao } from '../dtNganhDaoTao/redux';
import TaoThoiGianMoMon from '../dtThoiGianMoMon/ThoiGianMoMonModal';
import { getDtDangKyMoMonPage, createDangKyMoMon } from './redux';

class NganhModal extends AdminModal {
    onShow = () => {
        const { batDau, ketThuc, hocKy, nam } = this.props.thoiGianMoMon;
        this.batDau.value(T.dateToText(batDau, 'dd/mm/yyyy'));
        this.ketThuc.value(T.dateToText(ketThuc, 'dd/mm/yyyy'));
        this.hocKy.value(hocKy);
        this.namHoc.value(nam);
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
        };
        this.props.create(data, item => {
            this.hide();
            this.props.history.push(`/user/dao-tao/dang-ky-mo-mon/${item.id}`);
        });

    }
    render = () => {
        return this.renderModal({
            title: 'Tạo mới đăng ký mở môn',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-6' ref={e => this.hocKy = e} readOnly label='Học kỳ' />
                <FormTextBox className='col-md-6' ref={e => this.namHoc = e} readOnly label='Năm' />
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
            this.setState({ donViFilter: this.props.system.user.staff?.maDonVi });
            // T.onSearch = (searchText) => this.props.getDmMonHocPage(undefined, undefined, {
            //     searchTerm: searchText || ''
            // });
            T.showSearchBox();
            this.props.getDtDangKyMoMonPage(undefined, undefined, {
                searchTerm: '',
                donViFilter: this.props.system.user.staff?.maDonVi
            });
        });
    }

    render() {
        let permissionDaoTao = this.getUserPermission('dtDangKyMoMon', ['read', 'write', 'delete', 'manage']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list, thoiGianMoMon } = this.props.dtDangKyMoMon && this.props.dtDangKyMoMon.page ?
            this.props.dtDangKyMoMon.page : {
                pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {
                    searchTerm: '', donViFilter: this.state.donViFilter
                }, totalItem: 0, list: [], thoiGianMoMon: null
            };
        const { batDau, ketThuc, hocKy, nam } = thoiGianMoMon ? thoiGianMoMon : {
            batDau: '', ketThuc: '', hocKy: '', nam: ''
        }, today = new Date().getTime();
        let permission = {
            write: permissionDaoTao.write || (permissionDaoTao.manage && today >= batDau && today <= ketThuc),
            delete: permissionDaoTao.delete || (permissionDaoTao.manage && today >= batDau && today <= ketThuc)
        };
        let table = renderTable({
            getDataSource: () => list,
            stickyHead: false,
            emptyTable: 'Chưa có dữ liệu',
            renderHead: () => (<>
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa, bộ môn</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học kỳ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm học</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ghi chú</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            </>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell contentClassName='multiple-lines-2' content={item.tenKhoaBoMon} />
                    <TableCell contentClassName='multiple-lines-4' content={`${item.maNganh}: ${item.tenNganh}`} />
                    <TableCell content={'HK' + item.hocKy} />
                    <TableCell style={{ textAlign: 'center' }} content={item.namHoc} />
                    <TableCell type='date' dateFormat='HH:MM:ss dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.thoiGian} />
                    <TableCell contentClassName='multiple-lines-4' content={item.isDuyet ? 'Phòng Đào tạo đã xác nhận' : 'Phòng Đào tạo chưa xác nhận'} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => this.props.history.push(`/user/dao-tao/dang-ky-mo-mon/${item.id}`)} />
                </tr>)
        });
        return this.renderPage({
            title: 'Danh sách các đợt mở môn học trong học kỳ',
            icon: 'fa fa-paper-plane-o',
            subTitle: thoiGianMoMon && <span style={{ color: 'red' }}>Học kỳ {hocKy} - năm {nam}: Từ <b>{T.dateToText(batDau, 'dd/mm/yyyy')}</b> đến <b>{T.dateToText(ketThuc, 'dd/mm/yyyy')}</b></span>,
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
                <div className='tile'>{table}</div>
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
                if (permissionDaoTao.manage) {
                    this.nganhModal.show();
                } else T.notify('Bạn không có quyền đăng ký tại đây!', 'danger');
            }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDangKyMoMon: state.daoTao.dtDangKyMoMon });
const mapActionsToProps = { getDtDangKyMoMonPage, createDangKyMoMon };
export default connect(mapStateToProps, mapActionsToProps)(DtDangKyMoMonPage);
