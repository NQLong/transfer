import React from 'react';
import { connect } from 'react-redux';
import { getDmSoHuuTriTueAll, deleteDmSoHuuTriTue, createDmSoHuuTriTue, updateDmSoHuuTriTue } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, ghiChu, kichHoat } = item ? item : { ma: '', ten: '', ghiChu: '', kichHoat: true };

        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.ghiChu.value(ghiChu);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            ghiChu: this.ghiChu.value(),
            kichHoat: Number(this.kichHoat.value())
        };
        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
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
            title: this.state.ma ? 'Tạo mới sở hữu trí tuệ' : 'Cập nhật sở hữu trí tuệ',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : readOnly} placeholder='Mã' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} placeholder='Ghi chú' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class DmSoHuuTriTuePage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmSoHuuTriTueAll());
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Sở hữu trí tuệ', `Bạn có chắc bạn muốn xóa Sở hữu trí tuệ ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmSoHuuTriTue(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Sở hữu trí tuệ ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá Sở hữu trí tuệ ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmSoHuuTriTue', ['read', 'write', 'delete']);

        let items = this.props.dmSoHuuTriTue && this.props.dmSoHuuTriTue.items ? this.props.dmSoHuuTriTue.items : [];

        items.sort((a, b) => a.ma < b.ma ? -1 : 1);
        const table = !(items && items.length > 0) ? 'Không có dữ liệu Sở hữu trí tuệ' :
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '40%' }}>Tên</th>
                        <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} style={{ textAlign: 'right' }} />
                        <TableCell type='link' content={item.ma} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='text' content={item.ghiChu} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmSoHuuTriTue(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Sở hữu trí tuệ',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Sở hữu trí tuệ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmSoHuuTriTue} update={this.props.updateDmSoHuuTriTue} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmSoHuuTriTue: state.danhMuc.dmSoHuuTriTue });
const mapActionsToProps = { getDmSoHuuTriTueAll, deleteDmSoHuuTriTue, createDmSoHuuTriTue, updateDmSoHuuTriTue };
export default connect(mapStateToProps, mapActionsToProps)(DmSoHuuTriTuePage);