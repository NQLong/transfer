import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, AdminModal, FormDatePicker, renderTable, FormTextBox, FormSelect, TableCell, FormRichTextBox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { getHcthCongVanDenAll, getHcthCongVanDenPage, createHcthCongVanDen, updateHcthCongVanDen, deleteHcthCongVanDen, getHcthCongVanDenSearchPage } from './redux';
import { SelectAdapter_DmDonViGuiCongVan } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import T from 'view/js/common';
import Pagination from 'view/component/Pagination';

const timeList = [
    { id: 1, text: 'Theo ngày công văn' },
    { id: 2, text: 'Theo ngày nhận' },
    { id: 3, text: 'Theo ngày hết hạn' },
]


class EditModal extends AdminModal {
    state = { id: null };
    componentDidMount() {
        T.ready(() => this.onShown(() => { this.soCongVan.focus(); }));
    }

    onShow = (item) => {
        let { id, ngayCongVan, ngayNhan, ngayHetHan, soCongVan, maDonViGuiCV, maDonViNhan, maCanBoNhan, noiDung, chiDao } = item ? item :
            { id: '', ngayCongVan: '', ngayNhan: '', ngayHetHan: '', soCongVan: '', maDonViGuiCV: '', maDonViNhan: '', shcc: '', noiDung: '', chiDao: '' };
        if (maDonViNhan) {
            maDonViNhan = maDonViNhan.split(',')
        }
        if (maCanBoNhan) {
            maCanBoNhan = maCanBoNhan.split(',')
        }
        this.setState({ id });
        this.ngayCongVan.value(ngayCongVan);
        this.ngayNhan.value(ngayNhan);
        this.ngayHetHan.value(ngayHetHan);
        this.soCongVan.value(soCongVan ? soCongVan : '');
        this.maDonViGuiCV.value(maDonViGuiCV);
        this.maDonViNhan.value(maDonViNhan ? maDonViNhan : '');
        this.maCanBoNhan.value(maCanBoNhan ? maCanBoNhan : '');
        this.noiDung.value(noiDung);
        this.chiDao.value(chiDao);
    };


    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ngayCongVan: Number(this.ngayCongVan.value()),
            ngayNhan: Number(this.ngayNhan.value()),
            ngayHetHan: Number(this.ngayHetHan.value()),
            soCongVan: this.soCongVan.value(),
            donViGui: this.maDonViGuiCV.value(),
            donViNhan: this.maDonViNhan.value().toString() || null,
            canBoNhan: this.maCanBoNhan.value().toString() || null,
            noiDung: this.noiDung.value(),
            chiDao: this.chiDao.value()
        };
        if (!changes.ngayCongVan) {
            T.notify('Ngày công văn bị trống', 'danger');
            this.ngayCongVan.focus();
        } else if (!changes.ngayNhan) {
            T.notify('Ngày nhận công văn bị trống', 'danger');
            this.ngayNhan.focus();
        } else if (!changes.donViGui || (Array.isArray(changes.donViGui) && changes.donViGui.length === 0)) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.maDonViGuiCV.focus();
        } else if (!changes.noiDung) {
            T.notify('Nội dung công văn bị trống', 'danger');
            this.noiDung.focus();
        } else if (changes.ngayNhan < changes.ngayCongVan) {
            T.notify('Ngày nhận công văn trước ngày công văn', 'danger');
            this.ngayNhan.focus();
        } else if (changes.ngayHetHan && changes.ngayHetHan < changes.ngayCongVan) {
            T.notify('Ngày công văn hết hạn trước ngày công văn', 'danger');
            this.ngayNhan.focus();
        }
        else {
            if (this.props.permission.write) {
                if (this.state.id) {
                    this.props.update(this.state.id, changes, this.hide);
                } else {
                    this.props.create(changes, this.hide);
                }
            }
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật Công văn đến' : 'Tạo mới Công văn đến',
            size: 'large',
            body: (
                <div className='form-group row'>
                    <FormTextBox type='text' className='col-md-12' ref={e => this.soCongVan = e} label='Mã số CV' readOnly={readOnly} />
                    <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayCongVan = e} label='Ngày CV' readOnly={readOnly} required />
                    <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayNhan = e} label='Ngày nhận' readOnly={readOnly} required />
                    <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayHetHan = e} label='Ngày hết hạn' readOnly={readOnly} />
                    <FormSelect className='col-md-12' ref={e => this.maDonViGuiCV = e} label='Đơn vị gửi công văn' data={SelectAdapter_DmDonViGuiCongVan} readOnly={readOnly} required />
                    <FormRichTextBox type='text' className='col-md-12' ref={e => this.noiDung = e} label='Nội dung' readOnly={readOnly} required />
                    <FormSelect multiple={true} className='col-md-12' ref={e => this.maDonViNhan = e} label='Đơn vi nhận công văn' data={SelectAdapter_DmDonVi} readOnly={readOnly} />
                    <FormSelect multiple={true} className='col-md-12' ref={e => this.maCanBoNhan = e} label='Cán bộ nhận công văn' data={SelectAdapter_FwCanBo} readOnly={readOnly} />
                    <FormRichTextBox type='text' className='col-md-12' ref={e => this.chiDao = e} label='Chỉ đạo' readOnly={readOnly} />
                </div>
            )
        });
    }
}


class HcthCongVanDen extends AdminPage {
    modal = React.createRef();

    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/hcth', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.maDonViGuiCV?.value('');
                this.donViNhanCongVan?.value('');
                this.canBoNhanCongVan?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthCongVanDen && this.props.hcthCongVanDen.page ? this.props.hcthCongVanDen.page : { pageNumber: 1, pageSize: 50 };
        let donViGuiCongVan = this.donViGuiCongVan?.value().toString();
        let donViNhanCongVan = this.donViNhanCongVan?.value().toString();
        let canBoNhanCongVan = this.canBoNhanCongVan?.value().toString();
        const pageFilter = isInitial ? {} : { donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.donViGuiCongVan?.value(filter.donViGuiCongVan || '');
                    this.donViNhanCongVan?.value(filter.donViNhanCongVan || '');
                    this.canBoNhanCongVan?.value(filter.canBoNhanCongVan);
                    if (!$.isEmptyObject(filter) && filter && (filter.donViGuiCongVan || filter.donViNhanCongVan || filter.canBoNhanCongVan)) this.showAdvanceSearch();
                }
            });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getHcthCongVanDenSearchPage(pageN, pageS, pageC, this.state.filter, done);
    }


    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    onDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa công văn đến', 'Bạn có chắc bạn muốn xóa công văn này?', true,
            isConfirm => isConfirm && this.props.deleteHcthCongVanDen(item.id));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('hcthCongVanDen', ['read', 'write', 'delete']);
        let readOnly = !permission.write;
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.hcthCongVanDen ? this.props.hcthCongVanDen.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Không dữ liệu công văn đến',
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Số CV</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày nhận</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày hết hạn</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Đơn vị gửi</th>
                    <th style={{ width: '35%', whiteSpace: 'nowrap', textAlign: 'center' }}>Nội dung</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>Đơn vị nhận</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>Cán bộ nhận</th>
                    <th style={{ width: '20%' }}>Chỉ đạo</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                let danhSachCanBoNhan = item.danhSachCanBoNhan?.split(';');
                let danhSachDonViNhan = item.danhSachDonViNhan?.split(';');
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={item.soCongVan} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayCongVan, 'dd/mm/yyyy')} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayNhan, 'dd/mm/yyyy')} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', color: 'red' }} content={item.ngayHetHan ? T.dateToText(item.ngayHetHan, 'dd/mm/yyyy') : ''} />
                        <TableCell type='text' style={{}} content={item.tenDonViGuiCV} />
                        <TableCell type='text' style={{}} content={item.noiDung} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                            danhSachDonViNhan && danhSachDonViNhan.length > 0 ? danhSachDonViNhan.map((item, index) => (
                                <span key={index}>
                                    <span >{item?.normalizedName()}</span>
                                    <br />
                                </span>
                            )) : null
                        } />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                            danhSachCanBoNhan && danhSachCanBoNhan.length > 0 ? danhSachCanBoNhan.map((item, index) => (
                                <span key={index}>
                                    <span >{item?.normalizedName()}</span>
                                    <br />
                                </span>
                            )) : null} />
                        <TableCell type='text' style={{}} content={item.chiDao} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={(e) => this.onDelete(e, item)} permissions={currentPermissions} />
                    </tr>)
            }
        });
        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Công văn đến',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                'Công văn đến'
            ],
            advanceSearch: <>
                <div className='row'>
                    <div className='col-12 col-md-12 row'>

                        <FormSelect allowClear={true} className='col-md-3' ref={e => this.timeType = e} label='Theo thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} />
                        {this.timeType?.value() && (<>
                            <FormDatePicker type='date-mask' className='col-md-3' ref={e => this.fromDate = e} label='Từ ngày' />
                            <FormDatePicker type='date-mask' className='col-md-3' ref={e => this.toDate = e} label='Đến ngày' />
                        </>)}
                    </div>
                    <FormSelect multiple={true} allowClear={true} className='col-md-4' ref={e => this.donViGuiCongVan = e} label='Đơn vị gửi công văn' data={SelectAdapter_DmDonViGuiCongVan} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple={true} allowClear={true} className='col-md-4' ref={e => this.donViNhanCongVan = e} label='Đơn vị nhận công văn' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect multiple={true} allowClear={true} className='col-md-4' ref={e => this.canBoNhanCongVan = e} label='Cán bộ nhận công văn' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>,
            content: <div className='tile'>
                {table}
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={readOnly} create={this.props.createHcthCongVanDen} update={this.props.updateHcthCongVanDen} permission={permission} />
            </div>,

            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            backRoute: '/user/hcth',
        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongVanDen: state.hcth.hcthCongVanDen });
const mapActionsToProps = { getHcthCongVanDenAll, getHcthCongVanDenPage, createHcthCongVanDen, updateHcthCongVanDen, deleteHcthCongVanDen, getHcthCongVanDenSearchPage };
export default connect(mapStateToProps, mapActionsToProps)(HcthCongVanDen);
