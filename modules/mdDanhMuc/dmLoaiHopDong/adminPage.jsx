import React from 'react';
import { connect } from 'react-redux';
import { getDmLoaiHopDongPage, createDmLoaiHopdong, getdmLoaiHopDongAll, updateDmLoaiHopDong, deleteDmLoaiHopDong } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        const { ma, ten, thoiGian, kichHoat } = item ? item : { ma: null, ten: '', thoiGian: null, kichHoat: 0 };
        this.setState({ ma, item });
        this.ma.value(ma ? ma : '');
        this.ten.value(ten);
        this.thoiGian.value(thoiGian);
        this.kichHoat.value(kichHoat);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            ma: this.ma.value(),
            thoiGian: this.thoiGian.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };

        if (changes.ten == '') {
            T.notify('Tên loại hợp đồng bị trống!', 'danger');
            this.ten.focus();
        } else {
            changes.khongXacDinhTh = changes.thoiGian ? 1 : 0;
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật loại hợp đồng' : 'Tạo mới hợp đồng',
            body: <div className='row'>
                <FormTextBox type='number' className='col-md-6' ref={e => this.ma = e} label='Mã hợp đồng'
                    readOnly={this.state.ma ? true : readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên loại hợp đồng'
                    readOnly={readOnly} required />
                <FormTextBox type='number' className='col-md-12' ref={e => this.thoiGian = e} label='Thời gian loại hợp đồng'
                    readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmLoaiHopDongPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmLoaiHopDongPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmLoaiHopDongPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmLoaiHopDong(item.ma, { ma: item.ma, kichHoat: item.kichHoat == 1 ? 0 : 1, khongXacDinhTh: item.khongXacDinhTh == 1 ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục loại hợp đồng', 'Bạn có chắc bạn muốn xóa loại hợp đồng này?', true, isConfirm =>
            isConfirm && this.props.deleteDmLoaiHopDong(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmLoaiHopDong', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmLoaiHopDong && this.props.dmLoaiHopDong.page ?
            this.props.dmLoaiHopDong.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách loại hợp đồng!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '80%' }}>Tên loại hợp đồng</th>
                        <th style={{ width: '20%' }}>Thời gian (tháng)</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} >
                        <TableCell type='link' style={{ textAlign: 'right' }} content={item.ma ? item.ma : ''}
                            onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='text' style={{ textAlign: 'right' }} content={item.thoiGian ? item.thoiGian : ''} />
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
            title: 'Danh mục Loại hợp đồng',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Loại hợp đồng'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmLoaiHopDongPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmLoaiHopdong} update={this.props.updateDmLoaiHopDong} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmLoaiHopDong: state.danhMuc.dmLoaiHopDong });
const mapActionsToProps = { getDmLoaiHopDongPage, getdmLoaiHopDongAll, createDmLoaiHopdong, updateDmLoaiHopDong, deleteDmLoaiHopDong };
export default connect(mapStateToProps, mapActionsToProps)(DmLoaiHopDongPage);
