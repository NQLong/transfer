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

class EditModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => { }));
    }

    onShow = (item) => {
        let { id, ngayCongVan, ngayNhan, ngayHetHan, soCongVan, maDonViGuiCV, maDonVi, shcc, noiDung, chiDao } = item ? item : { id: '', ngayCV: '', ngayNhan: '', ngayHetHan: '', soCongVan: '', maDonViGuiCV: '', maDonVi: '', shcc: '', noiDung: '', chiDao: '' };
        // console.log(donViGui)
        this.setState({ id, item });
        this.ngayCV.value(ngayCongVan);
        this.ngayNhan.value(ngayNhan);
        this.ngayHetHan.value(ngayHetHan);
        this.soCV.value(soCongVan);
        this.donViGuiCongVan.value(maDonViGuiCV);
        this.donViNhanCongVan.value(maDonVi ? maDonVi : '');
        this.canBoNhanCongVan.value(shcc ? shcc : '');
        this.noiDung.value(noiDung);
        this.chiDao.value(chiDao);
    };


    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ngayCongVan: Number(this.ngayCV.value()),
            ngayNhan: Number(this.ngayNhan.value()),
            ngayHetHan: Number(this.ngayHetHan.value()),
            soCongVan: this.soCV.value(),
            donViGui: this.donViGuiCongVan.value(),
            donViNhan: this.donViNhanCongVan.value(),
            canBoNhan: this.canBoNhanCongVan.value(),
            noiDung: this.noiDung.value(),
            chiDao: this.chiDao.value()
        };
        console.log(changes);
        if (!changes.ngayCongVan) {
            T.notify('Ngày công văn bị trống', 'danger');
            this.ngayCV.focus();
        } else if (!changes.ngayNhan) {
            T.notify('Ngày nhận công văn bị trống', 'danger');
            this.ngayNhan.focus();
        } else if (!changes.donViGui) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.donViGuiCongVan.focus();
        } else if (!changes.noiDung) {
            T.notify('Nội dung công văn bị trống', 'danger');
            this.noiDung.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: typeof this.state.item == 'object' ? 'Cập nhật Công văn đến' : 'Tạo mới Công văn đến',
            size: 'large',
            body: (
                <div className='form-group row'>
                    <FormTextBox type='text' className='col-md-12' ref={e => this.soCV = e} label='Mã số CV' readOnly={readOnly} />
                    <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayCV = e} label='Ngày CV' readOnly={readOnly} required />
                    <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayNhan = e} label='Ngày nhận' readOnly={readOnly} required />
                    <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayHetHan = e} label='Ngày hết hạn' readOnly={readOnly} />
                    <FormSelect className='col-md-12' ref={e => this.donViGuiCongVan = e} label='Đơn vị gửi công văn' data={SelectAdapter_DmDonViGuiCongVan} readOnly={readOnly} required />
                    <FormRichTextBox type='text' className='col-md-12' ref={e => this.noiDung = e} label='Nội dung' readOnly={readOnly} required />
                    <FormSelect className='col-md-12' ref={e => this.donViNhanCongVan = e} label='Đơn vi nhận công văn' data={SelectAdapter_DmDonVi} readOnly={readOnly} />
                    <FormSelect className='col-md-12' ref={e => this.canBoNhanCongVan = e} label='Cán bộ nhận công văn' data={SelectAdapter_FwCanBo} readOnly={readOnly} />
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
                this.maDonViGuiCV?.value(0);
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
        const donViGuiCongVan = this.donViGuiCongVan?.value();
        const donViNhanCongVan = this.donViNhanCongVan?.value();
        const canBoNhanCongVan = this.canBoNhanCongVan?.value();
        const pageFilter = isInitial ? {}: {donViGuiCongVan, donViNhanCongVan, canBoNhanCongVan};
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

    onDelete = (id) => {
        this.props.deleteHcthCongVanDen(id);
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('hcthCongVanDen', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.hcthCongVanDen ? this.props.hcthCongVanDen.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list,
                stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Số CV</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày CV</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày nhận</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày hết hạn</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đơn vị gửi</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Nội dung</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Đơn vị nhận</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Cán bộ nhận</th>
                        <th style={{ width: '20%' }}>Chỉ đạo</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soCongVan} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayCongVan, 'dd/mm/yyyy')} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayNhan, 'dd/mm/yyyy')} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', color: 'red' }} content={item.ngayHetHan ? T.dateToText(item.ngayHetHan, 'dd/mm/yyyy') : ''} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.tenDonViGuiCV} />
                        <TableCell type='text' style={{}} content={item.noiDung} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.tenDonVi?.normalizedName()} />
                        <TableCell type='text' onClick={() => this.modal.show(item)} style={{}} content={(
                            item.shcc &&
                            <>
                                <span>{((item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')).normalizedName()}</span><br />
                                {item.tenDonViCanBo?.normalizedName()}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{}} content={item.chiDao} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={() => this.onDelete(item.id)} permissions={currentPermissions} />

                    </tr>)
            });
        }
        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Công văn đến',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                'Văn bản đến'
            ],
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            backRoute: '/user/hcth',
            content: <div className='tile'>
                {table}
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={false} create={this.props.createHcthCongVanDen} update={this.props.updateHcthCongVanDen} />
            </div>,
            advanceSearch: <>
                <div className='row'>
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViGuiCongVan = e} label='Đơn vị gửi công văn' data={SelectAdapter_DmDonViGuiCongVan} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViNhanCongVan = e} label='Đơn vị nhận công văn' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.canBoNhanCongVan = e} label='Cán bộ nhận công văn' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>,
        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongVanDen: state.hcth.hcthCongVanDen });
const mapActionsToProps = { getHcthCongVanDenAll, getHcthCongVanDenPage, createHcthCongVanDen, updateHcthCongVanDen, deleteHcthCongVanDen, getHcthCongVanDenSearchPage };
export default connect(mapStateToProps, mapActionsToProps)(HcthCongVanDen);
