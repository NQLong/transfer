import React from 'react';
import { connect } from 'react-redux';
import { getDmTinhTrangCongTacAll, createDmTinhTrangCongTac, updateDmTinhTrangCongTac, deleteDmTinhTrangCongTac } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };

        this.setState({ ma, item });
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0
        };
        if (changes.ten == '') {
            T.notify('Tên không được bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Tạo mới Tình trạng công tác' : 'Cập nhật Tình trạng công tác',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class dmTinhTrangCongTacPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmTinhTrangCongTacAll());
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Tình trạng công tác', `Bạn có chắc bạn muốn xóa Tình trạng công tác ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmTinhTrangCongTac(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Tình trạng công tác ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá Tình trạng công tác ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmTinhTrangCongTac', ['read', 'write', 'delete']);

        let items = this.props.dmTinhTrangCongTac && this.props.dmTinhTrangCongTac.items;

        const table = !(items && items.length > 0) ? 'Không có dữ liệu Tình trạng công tác' :
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên tình trạng công tác</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} style={{ textAlign: 'right' }} />
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmTinhTrangCongTac(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Tình trạng công tác',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Tình trạng công tác'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmTinhTrangCongTac} update={this.props.updateDmTinhTrangCongTac} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmTinhTrangCongTac: state.danhMuc.dmTinhTrangCongTac });
const mapActionsToProps = { getDmTinhTrangCongTacAll, createDmTinhTrangCongTac, updateDmTinhTrangCongTac, deleteDmTinhTrangCongTac };
export default connect(mapStateToProps, mapActionsToProps)(dmTinhTrangCongTacPage);