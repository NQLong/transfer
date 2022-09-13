import React from 'react';
import { connect } from 'react-redux';
import { getDmHuongPhuCapPage, getDmHuongPhuCapAll, deleteDmHuongPhuCap, createDmHuongPhuCap, updateDmHuongPhuCap } from './reduxHuongPhuCap';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    state = { kichHoat: true };

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
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống');
            this.ma.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
        e.preventDefault();
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật hình thức hưởng phụ cấp' : 'Tạo mới hình thức hưởng phụ cấp',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-6' maxLength={2} ref={e => this.ma = e} label='Mã'
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên'
                    readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmHuongPhuCapPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmHuongPhuCapPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmHuongPhuCapPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => {
        this.props.updateDmHuongPhuCap(item.ma, { kichHoat: Number(!item.kichHoat) });
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa hình thức hưởng phụ cấp', 'Bạn có chắc bạn muốn xóa hưởng phụ cấp này?', true, isConfirm =>
            isConfirm && this.props.deleteDmHuongPhuCap(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmHuongPhuCap', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmHuongPhuCap && this.props.dmHuongPhuCap.page ?
            this.props.dmHuongPhuCap.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} >
                        <TableCell type='text' content={item.ma ? item.ma : ''} />
                        <TableCell type='link' content={item.ten ? item.ten : ''}
                            onClick={() => this.modal.show(item)} />
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
            title: 'Danh mục Hình thức hưởng phụ cấp',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Hình thức hưởng phụ cấp'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmHuongPhuCapPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmHuongPhuCap} update={this.props.updateDmHuongPhuCap} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmHuongPhuCap: state.danhMuc.dmHuongPhuCap });
const mapActionsToProps = { getDmHuongPhuCapPage, getDmHuongPhuCapAll, deleteDmHuongPhuCap, createDmHuongPhuCap, updateDmHuongPhuCap };
export default connect(mapStateToProps, mapActionsToProps)(DmHuongPhuCapPage);