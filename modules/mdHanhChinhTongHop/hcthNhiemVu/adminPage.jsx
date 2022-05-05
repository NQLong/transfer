import React from 'react';
import { connect } from 'react-redux';
import { createNhiemVu, searchNhiemVu, getHcthNhiemVuPage, updateNhiemVu, deleteNhiemVu } from './redux';
import { getDmLoaiDonViAll } from 'modules/mdDanhMuc/dmLoaiDonVi/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

const { doUuTienMapper } = require('../constant');
class hcthNhiemVuPage extends AdminPage {
    state = { searching: false, loaiDonVi: [] };

    componentDidMount() {
        T.ready(this.getSiteSetting().readyUrl, () => {
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
                backRoute: '/user/nhiem-vu/hcth'
            }
        else
            return {
                readyUrl: '/user',
                breadcrumb: [
                    <Link key={0} to='/user/'>Trang cá nhân</Link>,
                    'Danh sách nhiệm vụ',
                ],
                backRoute: '/user'
            }
    }


    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.HcthNhiemVu && this.props.HcthNhiemVu.page ? this.props.HcthNhiemVu.page : { pageNumber: 1, pageSize: 50 };
        let donViNhan = this.donViNhan?.value().toString() || null;
        let canBoNhan = this.canBoNhan?.value() || null;
        const pageFilter = isInitial ? {} : { donViNhan, canBoNhan };

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

    render() {
        const
            currentPermissions = this.getCurrentPermissions(),
            { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list = null } = this.props.hcthNhiemVu?.page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null },
            canCreate = currentPermissions.includes('rectors:login') || currentPermissions.includes('manager:write');

        let table = renderTable({
            emptyTable: 'Không có danh sách nhiệm vụ!',
            getDataSource: () => list,
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tiêu đề</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đơn vị, người nhận</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Độ ưu tiên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Người tạo</th>
                    <th style={{ width: 'atuo', whiteSpace: 'nowrap' }}>Ngày tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày kết thúc</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                let danhSachCanBoNhan = item.danhSachCanBoNhan?.split(';');
                let danhSachDonViNhan = item.danhSachDonViNhan?.split(';');
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' contentClassName='multiple-lines-2' contentStyle={{ width: '100%' }} content={<Link to={`/user/hcth/nhiem-vu/${item.id}`}>{item.tieuDe}</Link>} />
                        <TableCell type='text' contentClassName='multiple-lines-2' contentStyle={{ width: '100%' }} content={item.noiDung} />
                        <TableCell type='text' content={
                            <>
                                <span>{danhSachCanBoNhan && danhSachCanBoNhan.length > 0 ? danhSachCanBoNhan.map((item, index) => (
                                    <span key={index}>
                                        <b style={{ color: 'blue' }}>{item.normalizedName()}</b>
                                        <br />
                                    </span>
                                )) : null}
                                </span>
                                <span>{danhSachDonViNhan && danhSachDonViNhan.length > 0 ? danhSachDonViNhan.map((item, index) => (
                                    <span key={index}>
                                        <b>{item?.normalizedName()}</b>
                                        <br />
                                    </span>
                                )) : null
                                }</span>
                            </>
                        } style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.doUuTien ? doUuTienMapper[item.doUuTien].text : ''} style={{ color: item.doUuTien ? doUuTienMapper[item.doUuTien].color : '#000000' }} />
                        <TableCell type='text' content={item.lienPhong ? 'Liên phòng' : 'Thường'} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.tenNguoiTao} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                            item.ngayTao ? (<>
                                <span> {T.dateToText(item.ngayTao, 'dd/mm/yyyy')}</span>
                            </>) : null
                        } />

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
                            onEdit={`/user/hcth/nhiem-vu/${item.id}`} onDelete={e => this.delete(e, item)} />
                    </tr>
                );
            }
        });
        // }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Giao nhiệm vụ',
            breadcrumb: [
                <Link key={0} to='/user/'>Danh mục</Link>,
                'Nhiệm vụ'
            ],
            advanceSearch: <>
                <div className='row'>
                    {/* <FormSelect multiple={true} allowClear={true} className='col-md-4' ref={e => this.donViNhan = e} label='Đơn vị nhận' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.canBoNhan = e} label='Cán bộ nhận' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} /> */}
                </div>
            </>,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute: '/user/hcth',
            onCreate: canCreate ? () => this.props.history.push('/user/hcth/nhiem-vu/new') : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthNhiemVu: state.hcth.hcthNhiemVu });
const mapActionsToProps = { getHcthNhiemVuPage, searchNhiemVu, createNhiemVu, updateNhiemVu, deleteNhiemVu, getDmLoaiDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(hcthNhiemVuPage);
