import React from 'react';
import { connect } from 'react-redux';
import { getDmNghiCongTacAll, createDmNghiCongTac, updateDmNghiCongTac, deleteDmNghiCongTac } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.moTa.focus();
        }));
    }

    onShow = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: '', moTa: '', kichHoat: 1 };
        this.setState({ ma, item });

        this.ma.value(ma);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            moTa: this.moTa.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        } else if (changes.moTa == '') {
            T.notify('Mô tả không được trống!', 'danger');
            this.moTa.focus();
        } else this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);

    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật nghỉ công tác' : 'Tạo mới nghỉ công tác',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã nghỉ công tác' required />
                <FormTextBox type='text' className='col-12' ref={e => this.moTa = e} label='Mô tả' readOnly={readOnly} placeholder='Mô tả' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }

        );
    };
}

class dmNghiCongTacPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmNghiCongTacAll());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Nghỉ công tác', `Bạn có chắc bạn muốn xóa Nghỉ công tác ${item.moTa ? `<b>${item.moTa}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmNghiCongTac(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Nghỉ công tác ${item.moTa} bị lỗi!`, 'danger');
                else T.alert(`Xoá Nghỉ công tác ${item.moTa} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmNghiCongTac', ['read', 'write', 'delete']);

        let items = this.props.dmNghiCongTac && this.props.dmNghiCongTac.items;

        const table = !(items && items.length > 0) ? 'Không có dữ liệu nghỉ công tác' :
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Mô tả</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ma ? item.ma : ''} style={{ textAlign: 'center' }} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.moTa ? item.moTa : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmNghiCongTac(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Nghỉ công tác',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Nghỉ công tác'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmNghiCongTac} update={this.props.updateDmNghiCongTac} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNghiCongTac: state.danhMuc.dmNghiCongTac });
const mapActionsToProps = { getDmNghiCongTacAll, createDmNghiCongTac, updateDmNghiCongTac, deleteDmNghiCongTac };
export default connect(mapStateToProps, mapActionsToProps)(dmNghiCongTacPage);
