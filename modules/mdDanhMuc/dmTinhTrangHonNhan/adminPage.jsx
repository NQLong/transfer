import React from 'react';
import { connect } from 'react-redux';
import { getDmTinhTrangHonNhanPage, createDmTinhTrangHonNhan, getDmTinhTrangHonNhanAll, updateDmTinhTrangHonNhan, deleteDmTinhTrangHonNhan } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true };

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
            T.notify('Mã tình trạng hôn nhân bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên tình trạng hôn nhân bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật tình trạng hôn nhân' : 'Tạo mới tình trạng hôn nhân',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-6' maxLength={2} ref={e => this.ma = e} label='Mã tình trạng hôn nhân'
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Mô tả tình trạng hôn nhân'
                    readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmTinhTrangHonNhanPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmTinhTrangHonNhanPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmTinhTrangHonNhanPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmTinhTrangHonNhan(item.ma, { ma: item.ma, kichHoat: item.kichHoat == 1 ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục tình trạng hôn nhân', 'Bạn có chắc bạn muốn xóa tình trạng hôn nhân này?', true, isConfirm =>
            isConfirm && this.props.deleteDmTinhTrangHonNhan(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmTinhTrangHonNhan', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmTinhTrangHonNhan && this.props.dmTinhTrangHonNhan.page ?
            this.props.dmTinhTrangHonNhan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách tình trạng hôn nhân!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên tình trạng hôn nhân</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' content={item.ma ? item.ma : ''}
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
            title: 'Danh mục Tình trạng hôn nhân',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Tình trạng hôn nhân'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmTinhTrangHonNhanPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmTinhTrangHonNhan} update={this.props.updateDmTinhTrangHonNhan} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmTinhTrangHonNhan: state.danhMuc.dmTinhTrangHonNhan });
const mapActionsToProps = { getDmTinhTrangHonNhanPage, getDmTinhTrangHonNhanAll, createDmTinhTrangHonNhan, updateDmTinhTrangHonNhan, deleteDmTinhTrangHonNhan };
export default connect(mapStateToProps, mapActionsToProps)(DmTinhTrangHonNhanPage);