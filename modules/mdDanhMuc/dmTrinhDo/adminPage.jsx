import React from 'react';
import { connect } from 'react-redux';
import { getDmTrinhDoAll, createDmTrinhDo, updateDmTrinhDo, deleteDmTrinhDo } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, tenTiengAnh, vietTat, vietTatTiengAnh, kichHoat } = item ? item : { ma: '', ten: '', tenTiengAnh: '', vietTat: '', vietTatTiengAnh: '', kichHoat: 1 };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.tenTiengAnh.value(tenTiengAnh);
        this.vietTat.value(vietTat ? vietTat : '');
        this.vietTatTiengAnh.value(vietTatTiengAnh ? vietTatTiengAnh : '');
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            tenTiengAnh: this.tenTiengAnh.value(),
            vietTat: this.vietTat.value(),
            vietTatTiengAnh: this.vietTatTiengAnh.value(),
            kichHoat: Number(this.kichHoat.value()),
        };
        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã trình độ không được trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên trình độ không được trống!', 'danger');
            this.ten.focus();
        } else if (changes.tenTiengAnh == '') {
            T.notify('Tên trình độ tiếng Anh không được trống!', 'danger');
            this.tenTiengAnh.focus();
        } else {
            if (this.state.ma) {
                if (typeof this.state.ImportIndex == 'number') changes.ImportIndex = this.state.ImportIndex;
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
            title: this.state.ma ? 'Tạo mới trình độ' : 'Cập nhật trình độ',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã trình độ' readOnly={this.state.ma ? true : readOnly} placeholder='Mã trình độ' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên trình độ' readOnly={readOnly} placeholder='Tên trình độ' required />
                <FormTextBox type='text' className='col-12' ref={e => this.tenTiengAnh = e} label='Tên trình độ tiếng Anh' readOnly={readOnly} placeholder='Tên trình độ tiếng Anh' required />
                <FormTextBox type='text' className='col-12' ref={e => this.vietTat = e} label='Tên viết tắt' readOnly={readOnly} placeholder='Tên viết tắt' />
                <FormTextBox type='text' className='col-12' ref={e => this.vietTatTiengAnh = e} label='Tên viết tắt tiếng Anh' readOnly={readOnly} placeholder='Tên viết tắt Tiếng Anh' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class dmTrinhDoAdminPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmTrinhDoAll());
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa Trình độ', `Bạn có chắc bạn muốn xóa Trình độ ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmTrinhDo(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá Trình độ ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá Trình độ ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmTrinhDo', ['read', 'write', 'delete']);
        let items = this.props.dmTrinhDo && this.props.dmTrinhDo.items ? this.props.dmTrinhDo.items : [];

        const table = !(items && items.length > 0) ? 'Không có dữ liệu trình độ' :
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '25%' }}>Tên</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Tên tiếng Anh</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Viết tắt</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Viết tắt tiếng Anh</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma} style={{ textAlign: 'center' }} />
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.tenTiengAnh} />
                        <TableCell type='text' content={item.vietTat} />
                        <TableCell type='text' content={item.vietTatTiengAnh} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmTrinhDo(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Trình độ',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Trình độ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmTrinhDo} update={this.props.updateDmTrinhDo} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmTrinhDo: state.danhMuc.dmTrinhDo });
const mapActionsToProps = { getDmTrinhDoAll, createDmTrinhDo, updateDmTrinhDo, deleteDmTrinhDo };
export default connect(mapStateToProps, mapActionsToProps)(dmTrinhDoAdminPage);