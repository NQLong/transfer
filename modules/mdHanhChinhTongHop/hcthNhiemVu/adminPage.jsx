import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmLoaiDonViAll } from 'modules/mdDanhMuc/dmLoaiDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { createNhiemVu, deleteNhiemVu, getHcthNhiemVuPage, searchNhiemVu, updateNhiemVu } from './redux';

const { doUuTienMapper, nhiemVuSelector } = require('../constant');

class hcthNhiemVuPage extends AdminPage {
    state = { searching: false, loaiDonVi: [] };

    componentDidMount() {
        T.ready(this.getSiteSetting().readyUrl, () => {
            const currentPermissions = this.getCurrentPermissions();
            if (currentPermissions.some(item => ['rectors:login', 'hcth:manage'].includes(item))) {
                this.loaiNhiemVu?.value(nhiemVuSelector.NHIEM_VU_CUA_BAN.id);
            }
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.donViNhan?.value('');
                this.canBoNhan?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.changeAdvancedSearch(true);
        });
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    'Danh sách nhiệm vụ',
                ],
                backRoute: '/user/hcth',
                baseUrl: '/user/hcth/nhiem-vu',
            };
        else
            return {
                readyUrl: '/user',
                breadcrumb: [
                    <Link key={0} to='/user/'>Trang cá nhân</Link>,
                    'Danh sách nhiệm vụ',
                ],
                backRoute: '/user',
                baseUrl: '/user/nhiem-vu',
            };
    }


    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.HcthNhiemVu && this.props.HcthNhiemVu.page ? this.props.HcthNhiemVu.page : { pageNumber: 1, pageSize: 50 };
        let donViNhan = this.donViNhan?.value() || null;
        let canBoNhan = this.canBoNhan?.value() || null;
        let lienPhong = this.lienPhong?.value() || null;
        let loaiNhiemVu = this.loaiNhiemVu?.value() || null;
        let doUuTien = this.doUuTien?.value() || null;
        let nguoiTao = this.nguoiTao?.value() || null;
        const pageFilter = isInitial ? { loaiNhiemVu } : { nguoiTao, doUuTien, lienPhong, donViNhan, canBoNhan, loaiNhiemVu };

        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.donViNhan?.value(filter.donViNhan || '');
                    this.canBoNhan?.value(filter.canBoNhan || '');

                    if (!$.isEmptyObject(filter) && filter && (filter.donViNhan || filter.canBoNhan)) this.showAdvanceSearch();
                }
            });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.searchNhiemVu(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateNhiemVu(item.id, { id: item.id, kichHoat: item.kichHoat ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục đơn vị', 'Bạn có chắc bạn muốn xóa đơn vị gửi công văn này?', true, isConfirm =>
            isConfirm && this.props.deleteNhiemVu(item.id));
    }

    formatText = (str, numOfChar) => {
        return str.length > numOfChar ? `${str.slice(0, numOfChar)}...` : str;
    }

    getItems = () => {
        return this.state.loading ? null : (this.props.hcthNhiemVu?.page?.list || []);
    }

    clearAdvanceSearch = (e) => {
        e.preventDefault();
        this.donViNhan?.clear();
        this.canBoNhan?.clear();
        this.nguoiTao?.clear();
        this.lienPhong?.clear();
        this.doUuTien?.clear();
        this.changeAdvancedSearch();
    }

    render() {
        const
            currentPermissions = this.getCurrentPermissions(),
            { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list = null } = this.props.hcthNhiemVu?.page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null },
            canCreate = currentPermissions.includes('rectors:login') || currentPermissions.includes('manager:write'),
            { baseUrl, breadcrumb, backRoute } = this.getSiteSetting();

        let table = renderTable({
            emptyTable: 'Không có danh sách nhiệm vụ!',
            getDataSource: () => list,
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Tiêu đề</th>
                    <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Nội dung</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đơn vị, người nhận</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Độ ưu tiên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người tạo</th>
                    {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th> */}
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày kết thúc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                let danhSachCanBoNhan = item.danhSachCanBoNhan?.split(';');
                let danhSachDonViNhan = item.danhSachDonViNhan?.split(';');
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' contentClassName='multiple-lines-2' contentStyle={{ width: '100%' }} content={<Link to={`${baseUrl}/${item.id}`}>{<span style={{ color: 'red' }}>{item.lienPhong ? '(liên phòng) ' : ''}</span>}  {item.tieuDe}</Link>} />
                        <TableCell type='text' contentClassName='multiple-lines-2' contentStyle={{ width: '100%' }} content={item.noiDung} />
                        <TableCell type='text' content={
                            <>
                                <span>{danhSachDonViNhan && danhSachDonViNhan.length > 0 ? danhSachDonViNhan.map((item, index) => (
                                    <span key={index}>
                                        <b>{item?.normalizedName()}</b>
                                        <br />
                                    </span>
                                )) : null
                                }</span>
                                <span>{danhSachCanBoNhan && danhSachCanBoNhan.length > 0 ? danhSachCanBoNhan.map((item, index) => (
                                    <span key={index}>
                                        <b style={{ color: 'blue' }}>{item.normalizedName()}</b>
                                        <br />
                                    </span>
                                )) : null}
                                </span>
                            </>
                        } style={{ whiteSpace: 'nowrap' }} contentClassName='multiple-lines-5' contentStyle={{ width: '100%' }} />
                        <TableCell type='text' content={item.doUuTien ? doUuTienMapper[item.doUuTien].text : ''} style={{ color: item.doUuTien ? doUuTienMapper[item.doUuTien].color : '#000000' }} />
                        <TableCell type='text' content={item.tenNguoiTao.normalizedName()} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                            item.ngayBatDau ? (<>
                                <span style={{ color: 'blue' }}> {T.dateToText(item.ngayBatDau, 'dd/mm/yyyy')}</span>
                            </>) : null
                        } />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                            item.ngayKetThuc ? (<>
                                <span style={{ color: 'red' }}> {T.dateToText(item.ngayKetThuc, 'dd/mm/yyyy')}</span>
                            </>) : null
                        } />

                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={{}}
                            onEdit={`${baseUrl}/${item.id}`} onDelete={e => this.delete(e, item)} />
                    </tr>
                );
            }
        });

        const nhiemVuTypeSelector = [];
        if (currentPermissions.some(item => ['rectors:login', 'hcth:manage'].includes(item))) {
            nhiemVuTypeSelector.push(nhiemVuSelector.NHIEM_VU_CAC_DON_VI);
        }
        if (currentPermissions.includes('manager:write')) {
            nhiemVuTypeSelector.push(nhiemVuSelector.NHIEM_VU_DON_VI);
        }
        if (currentPermissions.some(item => ['manager:write', 'rectors:login', 'hcth:manage'].includes(item))) {
            nhiemVuTypeSelector.push(nhiemVuSelector.NHIEM_VU_CUA_BAN, nhiemVuSelector.NHIEM_VU_THAM_GIA);
        }

        const advanceSearch = (<div className='col-12 row form-group'>
            <FormSelect data={SelectAdapter_FwCanBo} ref={e => this.nguoiTao = e} allowClear={true} className='col-md-4' label='Người tạo' />
            <FormSelect data={[{ id: 0, text: 'Thường' }, { id: 1, text: 'Liên phòng' }]} ref={e => this.lienPhong = e} allowClear={true} className='col-md-4' label='Loại nhiệm vụ' />
            <FormSelect data={Object.keys(doUuTienMapper).map(key => doUuTienMapper[key])} ref={e => this.doUuTien = e} allowClear={true} className='col-md-4' label='Độ ưu tiên' />
            <FormSelect data={SelectAdapter_DmDonVi} ref={e => this.donViNhan = e} allowClear={true} className='col-md-6' label='Đơn vị nhận' />
            <FormSelect data={SelectAdapter_FwCanBo} ref={e => this.canBoNhan = e} allowClear={true} className='col-md-6' label='Cán bộ nhận' />
            <div className='col-md-12 form-group d-flex justify-content-end' style={{ gap: '10px' }}>
                <button type='submit' className='btn btn-danger' onClick={this.clearAdvanceSearch}>
                    <i className='fa fa-times' /> Xóa bộ lọc
                </button>
                <button type='submit' className='btn btn-success' onClick={() => this.changeAdvancedSearch()}>
                    <i className='fa fa-search' /> Tìm kiếm
                </button>
            </div>
        </div>);

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Nhiệm vụ',
            breadcrumb,
            header: <>
                {nhiemVuTypeSelector.length > 0 && <FormSelect onChange={() => this.changeAdvancedSearch()} ref={e => this.loaiNhiemVu = e} allowClear={true} placeholder='Loại nhiệm vụ' data={nhiemVuTypeSelector} style={{ margin: 0, minWidth: '250px' }} />}
            </>,
            advanceSearch,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute,
            onCreate: canCreate ? () => this.props.history.push(`${baseUrl}/new`) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthNhiemVu: state.hcth.hcthNhiemVu });
const mapActionsToProps = { getHcthNhiemVuPage, searchNhiemVu, createNhiemVu, updateNhiemVu, deleteNhiemVu, getDmLoaiDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(hcthNhiemVuPage);
