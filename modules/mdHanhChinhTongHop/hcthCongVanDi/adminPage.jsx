import React from 'react';
import { connect } from 'react-redux';
import { getHcthCongVanDiPage, getHcthCongVanDiAll, createHcthCongVanDi, updateHcthCongVanDi, deleteHcthCongVanDi } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormDatePicker, renderTable, FormRichTextBox, FormSelect, TableCell } from 'view/component/AdminPage';
import T from 'view/js/common';
import { SelectAdapter_DmDonViGuiCongVan } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';


class EditModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => { }));
    }

    onShow = (item) => {
        let { id, noiDung, ngayGui, ngayKy, maDonViGuiCV, maDonVi} = item ? item : { id: '', noiDung: '', ngayGui: '', ngayKy: '', maDonViGuiCV: '', maDonVi: ''};
        console.log(item);
        this.setState({ id, item });
        this.noiDung.value(noiDung);
        this.ngayGui.value(ngayGui);
        this.ngayKy.value(ngayKy);
        this.donViGui.value(maDonViGuiCV);
        this.donViNhan.value(maDonVi);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            noiDung: this.noiDung.value(),
            ngayGui: Number(this.ngayGui.value()),
            ngayKy: Number(this.ngayKy.value()),
            donViGui: this.donViGui.value(),
            donViNhan: this.donViNhan.value()
        };
        console.log(changes);
        if (!changes.noiDung) {
            T.notify('Nội dung bị trống', 'danger');
            this.noiDung.focus();
        } else if (!changes.ngayGui) {
            T.notify('Ngày gửi công văn bị trống', 'danger');
            this.ngayGui.focus();
        } else if (!changes.ngayKy) {
            T.notify('Ngày ký công văn bị trống', 'danger');
            this.ngayKy.focus();
        } else if (!changes.donViGui) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.donViGui.focus();
        } else if (!changes.donViNhan) {
            T.notify('Đơn vị nhận bị trống', 'danger');
            this.donViNhan.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật' : 'Tạo mới',
            size: 'large',
            body: (
                <div className='form-group row'>
                    <FormDatePicker type='date' className='col-md-6' ref={e => this.ngayGui = e} label='Ngày gửi' readOnly={readOnly} required />
                    <FormDatePicker type='date' className='col-md-6' ref={e => this.ngayKy = e} label='Ngày ký' readOnly={readOnly} required />
                    <FormSelect className='col-md-12' ref={e => this.donViGui = e} label='Đơn vị gửi công văn' data={SelectAdapter_DmDonViGuiCongVan} readOnly={readOnly} required />
                    <FormSelect className='col-md-12' ref={e => this.donViNhan = e} label='Đơn vi nhận công văn' data={SelectAdapter_DmDonVi} readOnly={readOnly} />
                    <FormRichTextBox type='text' className='col-md-12' ref={e => this.noiDung = e} label='Nội dung' readOnly={readOnly} required />
                </div>
            )
        });
    }
}
class HcthCongVanDi extends AdminPage {    
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/hcth', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.props.getHcthCongVanDiPage(undefined, undefined, searchText || '');      
            this.props.getHcthCongVanDiPage(undefined, undefined, '');
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    onDelete = (id) => {
        console.log(id);
        T.confirm('Xóa công văn', 'Xác nhận?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteHcthCongVanDi(id, false, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá công văn bị lỗi!', 'danger');
                else T.alert('Xoá công văn đi thành công!', 'success', false, 800);
            });
        });
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
        permission = this.getUserPermission('hcthCongVanDi', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.hcthCongVanDi ?
            this.props.hcthCongVanDi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách công văn đi!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '50%'}}>Nội dung</th>
                        <th style={{ width: 'auto'}}>Ngày gửi</th>
                        <th style={{ width: 'auto'}}>Ngày ký</th>
                        <th style={{ width: '20%'}}>Đơn vị gửi</th>
                        <th style={{ width: '20%'}}>Đơn vị nhận</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{textAlign: 'center'}} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.noiDung ? item.noiDung : ''} />
                        <TableCell type='text' content={T.dateToText(item.ngayGui, 'dd/mm/yyyy')} />
                        <TableCell type='text' content={T.dateToText(item.ngayKy, 'dd/mm/yyyy')} />
                        <TableCell type='text' content={item.tenDonViGuiCV ? item.tenDonViGuiCV : ''} />
                        <TableCell type='text' content={item.tenDonVi? item.tenDonVi : ''} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} 
                        onEdit={() => this.modal.show(item)} onDelete={() => this.onDelete(item.id)} permissions={currentPermissions}/>                    
                    </tr>
                )
            });
        }
        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Công văn đi',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hơp</Link>,
                'Công văn đi'
            ],
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            content:<>
                <div className="tile">{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getHcthCongVanDiPage} />
                <EditModal ref={e => this.modal = e} readOnly={false} permission={permission}
                create={this.props.createHcthCongVanDi} update={this.props.updateHcthCongVanDi} permissions={currentPermissions} />
                </>,
            backRoute: '/user/hcth',
        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi});
const mapActionsToProps = { getHcthCongVanDiAll, getHcthCongVanDiPage, createHcthCongVanDi, updateHcthCongVanDi, deleteHcthCongVanDi};
export default connect(mapStateToProps, mapActionsToProps)(HcthCongVanDi);
