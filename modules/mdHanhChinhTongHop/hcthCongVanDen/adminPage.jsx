import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, AdminModal, FormDatePicker, renderTable, FormTextBox, FormSelect, TableCell } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { getHcthCongVanDenAll, getHcthCongVanDenPage, createHcthCongVanDen, updateHcthCongVanDen, deleteHcthCongVanDen } from './redux';
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
        let { id, ngayCongVan, ngayNhan, ngayHetHan, soCongVan, donViGui, donViNhan, canBoNhan, noiDung, chiDao } = item ? item : { id: '', ngayCV: '', ngayNhan: '', ngayHetHan: '', soCongVan: '', donViGuiCongVan: '', donViNhanCongVan: '', canBoNhanCongVan: '', noiDung: '', chiDao: '' };
        // console.log(donViGui)
        this.setState({ id, item });
        this.ngayCV.value(ngayCongVan);
        this.ngayNhan.value(ngayNhan);
        this.ngayHetHan.value(ngayHetHan);
        this.soCV.value(soCongVan);
        this.donViGuiCongVan.value(donViGui);
        this.donViNhanCongVan.value(donViNhan ? donViNhan : '');
        this.canBoNhanCongVan.value(canBoNhan ? canBoNhan : '');
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
        const readOnly = false;
        return this.renderModal({
            title: typeof this.state.item == 'object' ? 'Cập nhật Công văn đến' : 'Tạo mới Công văn đến',
            size: 'large',
            body: (
                <div className='form-group row'>
                    <FormDatePicker type='date' className='col-md-6' ref={e => this.ngayCV = e} label='Ngày CV' readOnly={readOnly} required />
                    <FormDatePicker type='date' className='col-md-6' ref={e => this.ngayNhan = e} label='Ngày nhận' readOnly={readOnly} required />
                    <FormDatePicker type='date' className='col-md-6' ref={e => this.ngayHetHan = e} label='Ngày hết hạn' readOnly={readOnly} />
                    <FormTextBox type='text' className='col-md-6' ref={e => this.soCV = e} label='Mã số CV' readOnly={readOnly} />
                    <FormSelect className='col-md-12' ref={e => this.donViGuiCongVan = e} label='Đơn vị gửi công văn' data={SelectAdapter_DmDonViGuiCongVan} readOnly={readOnly} required />
                    <FormSelect className='col-md-12' ref={e => this.donViNhanCongVan = e} label='Đơn vi nhận nhân văn' data={SelectAdapter_DmDonVi} readOnly={readOnly} />
                    <FormSelect className='col-md-12' ref={e => this.canBoNhanCongVan = e} label='Cán bộ nhận công văn' data={SelectAdapter_FwCanBo} readOnly={readOnly} />
                    <FormTextBox type='text' className='col-md-12' ref={e => this.noiDung = e} label='Nội dung' readOnly={readOnly} required />
                    <FormTextBox type='text' className='col-md-12' ref={e => this.chiDao = e} label='Chỉ đạo' readOnly={readOnly} />
                </div>
            )
        });
    }
}


class HcthCongVanDen extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        this.getPage(1, 50, '');
        T.ready('/user/hcth');
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getHcthCongVanDenPage(pageN, pageS, pageC, {}, done);
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
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đơn vị nhận</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ nhận</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Noi dung</th>
                        <th style={{ width: '20%' }}>Chỉ đạo</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index} />
                        <TableCell type='text' style={{ textAlign: 'center' ,whiteSpace: 'nowrap'}} content={item.soCongVan} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayCongVan, 'dd/mm/yyyy')} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayNhan, 'dd/mm/yyyy')} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngayHetHan ? T.dateToText(item.ngayHetHan, 'dd/mm/yyyy') : ''} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.tenDonViGui} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.tenDonViNhan} />
                        <TableCell type='text' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            item.canBoNhan &&
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                {item.canBoNhan}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{}} content={item.noiDung} />
                        <TableCell type='text' style={{}} content={item.chiDao} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={() => this.onDelete(item.id)} permissions={currentPermissions}/>

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
        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongVanDen: state.hcth.hcthCongVanDen });
const mapActionsToProps = { getHcthCongVanDenAll, getHcthCongVanDenPage, createHcthCongVanDen, updateHcthCongVanDen, deleteHcthCongVanDen };
export default connect(mapStateToProps, mapActionsToProps)(HcthCongVanDen);
