import React from 'react';
import { connect } from 'react-redux';
import {
    getHcthCongVanDiPage,
    getHcthCongVanDiAll,
    createHcthCongVanDi,
    updateHcthCongVanDi,
    deleteHcthCongVanDi,
    getHcthCongVanDiSearchPage
} from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import {
    AdminPage,
    renderTable,
    FormSelect,
    TableCell,
} from 'view/component/AdminPage';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

export class HcthCongVanDi extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/hcth', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.maDonViGui?.value('');
                this.maDonViNhan?.value('');
                this.maCanBoNhan?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthCongVanDi && this.props.hcthCongVanDi.page ? this.props.hcthCongVanDi.page : { pageNumber: 1, pageSize: 50 };
        let donViGui = this.donViGui?.value() || null;
        let donViNhan = this.donViNhan?.value() || null;
        let canBoNhan = this.canBoNhan?.value() || null;
        const pageFilter = isInitial ? {} : { donViGui, donViNhan, canBoNhan };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.donViGui?.value(filter.donViGui || '');
                    this.donViNhan?.value(filter.donViNhan || '');
                    this.canBoNhan?.value(filter.canBoNhan || '');
                    if (!$.isEmptyObject(filter) && filter && (filter.donViGui || filter.donViNhan || filter.canBoNhan)) this.showAdvanceSearch();
                }
            });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getHcthCongVanDiSearchPage(pageN, pageS, pageC, this.state.filter, done);
    }

    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa công văn', 'Bạn có chắc bạn muốn xóa công văn này?', true,
            isConfirm => isConfirm && this.props.deleteHcthCongVanDi(item.id));

    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('hcthCongVanDi', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.hcthCongVanDi && this.props.hcthCongVanDi.page ?
            this.props.hcthCongVanDi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderTable({
            emptyTable: 'Chưa có dữ liệu công văn các phòng',
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Nội dung</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: 'auto' }}>Đơn vị gửi</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đơn vị, nguời nhận</th>
                    <th style={{ width: 'auto' }}>Tình trạng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                let danhSachDonViNhan = item.danhSachDonViNhan?.split(';');
                let danhSachCanBoNhan = item.danhSachCanBoNhan?.split(';');
                let hasFile;
                try {
                    hasFile = item.linkCongVan && JSON.parse(item.linkCongVan).length > 0;
                }
                catch (error) {
                    hasFile = false;
                }
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.noiDung || ''} onClick={() => this.props.history.push(`/user/hcth/cong-van-di/${item.id}`)} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                            <>
                                {
                                    item.ngayGui ? (<>
                                        <span>Ngày gửi:</span><span style={{ color: 'blue' }}> {T.dateToText(item.ngayGui, 'dd/mm/yyyy')}</span>
                                    </>) : null
                                }
                                {item.ngayKy && item.ngayKy ? <br /> : null}
                                {
                                    item.ngayKy ? (<>
                                        <span>Ngày ký:</span><span style={{ color: 'red' }}> {T.dateToText(item.ngayKy, 'dd/mm/yyyy')}</span>
                                    </>) : null
                                }
                            </>
                        } />
                        <TableCell type='text' contentClassName='multiple-lines' content={item.tenDonViGui ? item.tenDonViGui.normalizedName() : ''} />
                        <TableCell type='text' style={{}} contentStyle={{ width: '10rem' }} content={
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
                        } />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                            hasFile ?
                                (<span style={{ color: 'blue' }}>Đã có tệp tin</span>) :
                                (<span style={{ color: 'red' }}>Chưa có tệp tin</span>)
                        } />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => this.props.history.push(`/user/hcth/cong-van-di/${item.id}`)} onDelete={(e) => this.onDelete(e, item)} permissions={currentPermissions} />
                    </tr>

                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Công văn đi của các đơn vị',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hơp</Link>,
                'Công văn đi của các đơn vị'
            ],
            onCreate: permission && permission.write ? () => this.props.history.push('/user/hcth/cong-van-di/new') : null,
            content: <>
                <div className="tile">{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute: '/user/hcth',
            advanceSearch: <>
                <div className="row">
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViGui = e} label='Đơn vị gửi' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViNhan = e} label='Đơn vị nhận' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.canBoNhan = e} label='Cán bộ nhận' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>

        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi });
const mapActionsToProps = {
    getHcthCongVanDiAll,
    getHcthCongVanDiPage,
    createHcthCongVanDi,
    updateHcthCongVanDi,
    deleteHcthCongVanDi,
    getHcthCongVanDiSearchPage
};
export default connect(mapStateToProps, mapActionsToProps)(HcthCongVanDi);
