import React from 'react';
import { connect } from 'react-redux';
import { createDmDonViGuiCv, getDmDonViGuiCongVanPage, updateDmDonViGuiCv, deleteDmDonViGuiCv } from './redux';
import { getDmLoaiDonViAll } from 'modules/mdDanhMuc/dmLoaiDonVi/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.id.value() ? this.id.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        const { id, ten, kichHoat} = item && typeof item !== 'undefined' ? item : { id: null, ten: '', kichHoat: true };
        this.setState({ id, item });
        this.id.value(id);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
    }

    onSubmit = (e) => {
        const changes = {
            id: this.id.value(),
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.id == '') {
            T.notify('Mã đơn vị gửi công văn bị trống!', 'danger');
            this.id.focus();
        } else
            if (changes.ten == '') {
                T.notify('Tên đơn vị công văn bị trống!', 'danger');
                this.ten.focus();
            } else {
                this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
            }
        e.preventDefault();
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật đơn vị gửi công văn' : 'Tạo mới đơn vị gửi công văn',
            body: <div className='row'>
                <FormTextBox type='number' className='col-md-6' ref={e => this.id = e} label='Mã đơn vị'
                    readOnly={this.state.id ? true : readOnly} required />  
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên đơn vị'
                    readOnly={readOnly} required />
            </div>
        });
    }
}

class DmDonViGuiCvPage extends AdminPage {
    state = { searching: false, loaiDonVi: [] };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmDonViGuiCongVanPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmDonViGuiCongVanPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmDonViGuiCv(item.id, { id: item.id, kichHoat: item.kichHoat ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục đơn vị', 'Bạn có chắc bạn muốn xóa đơn vị gửi công văn này?', true, isConfirm =>
            isConfirm && this.props.deleteDmDonViGuiCv(item.id));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [], permission = this.getUserPermission('dmDonViGuiCv', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmDonViGuiCv && this.props.dmDonViGuiCv.page ?
            this.props.dmDonViGuiCv.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách đơn vị!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                        <th style={{ width: '50%' }}>Tên đơn vị</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' style={{ textAlign: 'right' }} content={item.id ? item.id : ''}
                            onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                            onChanged={() => this.changeActive(item)} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục đơn vị gửi công văn',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục đơn vị gửi công Văn'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmDonViGuiCongVanPage} />
                <EditModal ref={e => this.modal = e} 
                    permission={permission} 
                    create={this.props.createDmDonViGuiCv} 
                    update={this.props.updateDmDonViGuiCv} 
                    permissions={currentPermissions} 
                />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmDonViGuiCv: state.danhMuc.dmDonViGuiCv });
const mapActionsToProps = { getDmDonViGuiCongVanPage, createDmDonViGuiCv, updateDmDonViGuiCv, deleteDmDonViGuiCv, getDmLoaiDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(DmDonViGuiCvPage);