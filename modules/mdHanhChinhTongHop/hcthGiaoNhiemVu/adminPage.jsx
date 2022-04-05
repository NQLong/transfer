import React from 'react';
import { connect } from 'react-redux';
import { createHcthGiaoNhiemVu, getHcthGiaoNhiemVuSearchPage, getHcthGiaoNhiemVuPage, updateHcthGiaoNhiemVu, deleteHcthGiaoNhiemVu } from './redux';
import { getDmLoaiDonViAll } from 'modules/mdDanhMuc/dmLoaiDonVi/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormSelect, FormDatePicker} from 'view/component/AdminPage';
// import { SelectAdapter_DmDonViGuiCongVan } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class hcthGiaoNhiemVuPage extends AdminPage {
    state = { searching: false, loaiDonVi: [] };

    componentDidMount() {
        T.ready('/user/hcth', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.props.getHcthGiaoNhiemVuPage(undefined, undefined, searchText || '');
            console.log(new Date());
            T.showSearchBox(() => {
                this.donViNhan?.value('');
                this.canBoNhan?.value('');
                this.ngayHetHan?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
            this.changeAdvancedSearch(true);
            //this.props.getHcthGiaoNhiemVuPage();
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        console.log(Number(this.ngayHetHan?.value()));
        let { pageNumber, pageSize } = this.props && this.props.hcthCongVanDen && this.props.hcthCongVanDen.page ? this.props.hcthCongVanDen.page : { pageNumber: 1, pageSize: 50 };
        let donViNhan = this.donViNhan?.value().toString() || null;
        let canBoNhan = this.canBoNhan?.value() || null;
        // let timeType = this.timeType?.value() || null;
        // let fromTime = this.fromTime?.value() ? Number(this.fromTime.value()) : null;
        let ngayHetHan = this.ngayHetHan?.value() ? Number(this.ngayHetHan.value()) : null;
        console.log(ngayHetHan);
        const userId = this.props.system.user.ma;
        console.log('uswser id : ', userId);
        const pageFilter = isInitial ? { userId } : { donViNhan, canBoNhan, userId , ngayHetHan};
        
        this.setState({ filter: pageFilter }, () => {
            console.log(this.state.filter);
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.donViNhan?.value(filter.donViNhan || '');
                    this.canBoNhan?.value(filter.canBoNhan || '');
                    this.ngayHetHan?.value(filter.ngayHetHan || '');
                    // this.timeType?.value(filter.timeType || '');
                    // this.fromTime?.value(filter.fromTime || '');
                    
                    if (!$.isEmptyObject(filter) && filter && (filter.donViNhan || filter.canBoNhan || filter.ngayHetHan)) this.showAdvanceSearch();
                }
            });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getHcthGiaoNhiemVuSearchPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateHcthGiaoNhiemVu(item.id, { id: item.id, kichHoat: item.kichHoat ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục đơn vị', 'Bạn có chắc bạn muốn xóa đơn vị gửi công văn này?', true, isConfirm =>
            isConfirm && this.props.deleteHcthGiaoNhiemVu(item.id));
    }

    render() {
        //const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [], 
        const permission = this.getUserPermission('hcthGiaoNhiemVu', ['read', 'write', 'delete']);
        //presidentPermission = this.getUserPermission('president', ['login']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.hcthGiaoNhiemVu && this.props.hcthGiaoNhiemVu.page ?
            this.props.hcthGiaoNhiemVu.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        console.log('data :', this.props.hcthGiaoNhiemVu);
        console.log('list user :', this.props.system);
        let table = 'Không có danh sách giao nhiệm vụ!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Nội dung</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đơn vị, người nhận</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày hết hạn</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => {
                    let danhSachCanBoNhan = item.danhSachCanBoNhan?.split(';');
                    let danhSachDonViNhan = item.danhSachDonViNhan?.split(';');
                    return (
                        <tr key={index}>
                            <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell type='text' content={item.noiDung ? item.noiDung : ''} />
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
                            
                            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayHetHan, 'dd/mm/yyyy')} />
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.props.history.push(`/user/hcth/giao-nhiem-vu/${item.id}`)} onDelete={e => this.delete(e, item)} />
                        </tr>
                    );
                }
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Giao nhiệm vụ',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Giao nhiệm vụ'
            ],
            advanceSearch: <>
                <div className='row'>
                    {/* <div className='col-12 col-md-12 row'>
                        <FormCheckbox className='col-md-6' ref={e => this.isTimeSearch = e} label='Theo thời gian hết hạn' isSwitch={false} />
            
                        {this.isTimeSearch?.value() === true && (<>
                            <FormDatePicker type='date' className='col-md-3' ref={e => this.fromTime = e} label='Từ ngày' onChange={() => this.changeAdvancedSearch()} />
                            <FormDatePicker type='date' className='col-md-3' ref={e => this.toTime = e} label='Đến ngày' onChange={() => this.changeAdvancedSearch()} />
                        </>)}
                    </div> */}

                    <FormSelect multiple={true} allowClear={true} className='col-md-4' ref={e => this.donViNhan = e} label='Đơn vị nhận' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.canBoNhan = e} label='Cán bộ nhận' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} />
                    <FormDatePicker allowClear={true} type='date' className='col-md-4' ref={e => this.ngayHetHan = e} label='Ngày hết hạn' onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                {/* <EditModal ref={e => this.modal = e}
                    permission={permission}
                    create={this.props.createHcthGiaoNhiemVu}
                    update={this.props.updateHcthGiaoNhiemVu}
                    permissions={currentPermissions}
                /> */}
            </>,
            backRoute: '/user/hcth',
            onCreate: permission && permission.write ? () => this.props.history.push('/user/hcth/giao-nhiem-vu/new') : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthGiaoNhiemVu: state.hcth.hcthGiaoNhiemVu });
const mapActionsToProps = { getHcthGiaoNhiemVuPage, getHcthGiaoNhiemVuSearchPage, createHcthGiaoNhiemVu, updateHcthGiaoNhiemVu, deleteHcthGiaoNhiemVu, getDmLoaiDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(hcthGiaoNhiemVuPage);