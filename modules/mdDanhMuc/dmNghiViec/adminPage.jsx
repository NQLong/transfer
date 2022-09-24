import React from 'react';
import { connect } from 'react-redux';
import { getDmNghiViecAll, createDmNghiViec, updateDmNghiViec, deleteDmNghiViec } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: 1 };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kichHoat: Number(this.kichHoat.value()),
        };
        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã lý do không được trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên lý do không được trống!', 'danger');
            this.ten.focus();
        } else {
            if (this.state.ma) {
                this.props.update(this.state.ma, changes, this.hide);
            } else {
                this.props.create(changes, this.hide);
            }
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Tạo mới lý do' : 'Cập nhật lý do',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã lý do' readOnly={this.state.ma ? true : readOnly} placeholder='Mã lý do' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên lý do' readOnly={readOnly} placeholder='Tên lý do' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class dmNghiViecAdminPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmNghiViecAll());
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa lý do', `Bạn có chắc bạn muốn xóa lý do: ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmNghiViec(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá lý do ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá lý do ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmNghiViec', ['read', 'write', 'delete']);
        let items = this.props.dmNghiViec && this.props.dmNghiViec.items ? this.props.dmNghiViec.items : [];

        const table = renderTable({
            emptyTable: 'Chưa có dữ liệu',
            getDataSource: () => items, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>Mã</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.ma} style={{ textAlign: 'center' }} />
                    <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateDmNghiViec(item.ma, { kichHoat: value ? 1 : 0, })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            ),
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Lý do nghỉ công tác',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Lý do nghỉ công tác'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmNghiViec} update={this.props.updateDmNghiViec} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNghiViec: state.danhMuc.dmNghiViec });
const mapActionsToProps = { getDmNghiViecAll, createDmNghiViec, updateDmNghiViec, deleteDmNghiViec };
export default connect(mapStateToProps, mapActionsToProps)(dmNghiViecAdminPage);