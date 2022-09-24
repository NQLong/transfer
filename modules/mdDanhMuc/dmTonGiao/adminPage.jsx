import React from 'react';
import { connect } from 'react-redux';
import { getDmTonGiaoPage, createDmTonGiao, updateDmTonGiao, deleteDmTonGiao } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: true, visible: false };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten ? ten : '');
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.ma == '') {
            T.notify('Mã tôn giáo sách bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên tôn giáo bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.ma.length != 2) {
            this.setState({ visible: true });
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        let help = this.state.visible ? <small id='maHelp' className='form-text text-muted'>Mã tôn giáo chỉ gồm 2 kí tự</small> : null;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật tôn giáo' : 'Tạo mới tôn giáo',
            body: <div className='row'>
                <div className='col-md-12'>
                    <FormTextBox type='text' maxLength={2} ref={e => this.ma = e} label='Mã tôn giáo'
                        readOnly={this.state.ma ? true : readOnly} required />
                    {help}
                </div>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên tôn giáo'
                    readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmTonGiaoPage extends AdminPage {
    state = { searching: false };
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmTonGiaoPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmTonGiaoPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Tôn giáo', 'Bạn có chắc bạn muốn xóa tôn giáo này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmTonGiao(item.ma));
    };

    changeActive = item => this.props.updateDmTonGiao(item.ma, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmTonGiao', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmTonGiao && this.props.dmTonGiao.page ?
            this.props.dmTonGiao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' style={{ textAlign: 'center' }} content={item.ma ? item.ma : ''}
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
            title: 'Danh mục Tôn giáo',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Tôn giáo'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmTonGiaoPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmTonGiao} update={this.props.updateDmTonGiao} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmTonGiao: state.danhMuc.dmTonGiao });
const mapActionsToProps = { getDmTonGiaoPage, createDmTonGiao, updateDmTonGiao, deleteDmTonGiao };
export default connect(mapStateToProps, mapActionsToProps)(DmTonGiaoPage);