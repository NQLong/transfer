import React from 'react';
import { connect } from 'react-redux';
import { getDmNgachCdnnPage, createDmNgachCdnn, deleteDmNgachCdnn, updateDmNgachCdnn } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

const typeNhomNgach = {
    1: 'Viên chức giảng dạy',
    2: 'Viên chức chuyên ngành khoa học',
    3: 'Viên chức hành chính',
    4: 'Nhân viên',
    5: 'Khác',
};
const nhomNgachList = Object.keys(typeNhomNgach).map(key => ({ id: key, text: typeNhomNgach[key] }));
class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        const { id, ma, ten, nhom, kichHoat } = item ? item : { id: '', ma: '', ten: '', nhom: '', kichHoat: true };
        this.setState({ id, ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.nhom.value(nhom ? nhom : '');
        this.kichHoat.value(kichHoat ? 1 : 0);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            nhom: this.nhom.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0
        };

        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        } else if (!changes.ten) {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật ngạch chức năng nghề nghiệp' : 'Tạo mới ngạch chức năng nghề nghiệp',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên ngạch' readOnly={readOnly} placeholder='Tên ngạch' required />
                <FormSelect className='col-12' ref={e => this.nhom = e} label='Nhóm ngạch' data={nhomNgachList} readOnly={readOnly} placeholder='Nhóm ngạch' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class DmNgachCdnnPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmNgachCdnnPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmNgachCdnnPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Ngạch chức năng nghề nghiệp', `Bạn có chắc bạn muốn xóa Ngạch chức năng nghề nghiệp ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmNgachCdnn(item.id, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Ngạch chức năng nghề nghiệp ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá Ngạch chức năng nghề nghiệp ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmNgachCdnn', ['read', 'write', 'delete']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } =
            this.props.dmNgachCdnn && this.props.dmNgachCdnn.page ?
                this.props.dmNgachCdnn.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };
        const table = !(list && list.length > 0) ? 'Không có dữ liệu Ngạch chức năng nghề nghiệp' :
            renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã ngạch</th>
                        <th style={{ width: '50%' }}>Tên ngạch</th>
                        <th style={{ width: '50%' }}>Nhóm ngạch</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} style={{ textAlign: 'right' }} />
                        <TableCell type='link' content={item.ma} style={{ textAlign: 'right' }} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='text' content={item.nhom ? typeNhomNgach[item.nhom] : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmNgachCdnn(item.id, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Ngạch chức năng nghề nghiệp',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Ngạch chức năng nghề nghiệp'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmNgachCdnnPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmNgachCdnn} update={this.props.updateDmNgachCdnn} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNgachCdnn: state.danhMuc.dmNgachCdnn });
const mapActionsToProps = { getDmNgachCdnnPage, createDmNgachCdnn, deleteDmNgachCdnn, updateDmNgachCdnn };
export default connect(mapStateToProps, mapActionsToProps)(DmNgachCdnnPage);