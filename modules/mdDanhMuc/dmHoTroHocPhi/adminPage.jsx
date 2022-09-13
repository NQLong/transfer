import React from 'react';
import { connect } from 'react-redux';
import { getDmHoTroHocPhiAll, deleteDmHoTroHocPhi, createDmHoTroHocPhi, updateDmHoTroHocPhi } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, tyLe, ghiChu, kichHoat } = item ? item : { ma: '', tyLe: null, ghiChu: '', kichHoat: true };
        this.ma.value(ma);
        this.tyLe.value(tyLe);
        this.ghiChu.value(ghiChu);
        this.setState({ kichHoat });
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ma: this.ma.value().trim(),
                tyLe: Number(this.tyLe.value().trim()),
                ghiChu: this.ghiChu.value(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống');
            this.ma.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật Hỗ Trợ Học Phí' : 'Tạo mới Hỗ Trợ Học Phí',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã' placeholder='Mã danh mục' readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tyLe = e} label='Tỷ lệ' placeholder='Tỷ lệ' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmHoTroHocPhiPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmHoTroHocPhiAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmHoTroHocPhiAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa hỗ trợ học phí', 'Bạn có chắc bạn muốn xóa hỗ trợ học phí này?', true, isConfirm =>
            isConfirm && this.props.deleteDmHoTroHocPhi(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmHoTroHocPhi', ['read', 'write', 'delete']);
        let table = 'Không có danh sách!',
            items = this.props.dmHoTroHocPhi && this.props.dmHoTroHocPhi.items ? this.props.dmHoTroHocPhi.items : [];
        if (items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tỷ lệ (%)</th>
                        <th style={{ width: '100%' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma ? item.ma : ''} />
                        <TableCell type='link' content={item.tyLe} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ghiChu} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmHoTroHocPhi(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Hỗ trợ học phí',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Hỗ  trợ học phí'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmHoTroHocPhi} update={this.props.updateDmHoTroHocPhi} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmHoTroHocPhi: state.danhMuc.dmHoTroHocPhi });
const mapActionsToProps = { getDmHoTroHocPhiAll, deleteDmHoTroHocPhi, createDmHoTroHocPhi, updateDmHoTroHocPhi };
export default connect(mapStateToProps, mapActionsToProps)(DmHoTroHocPhiPage);