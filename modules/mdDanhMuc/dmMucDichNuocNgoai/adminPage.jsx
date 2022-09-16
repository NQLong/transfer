import React from 'react';
import { connect } from 'react-redux';
import { getDmMucDichNuocNgoaiAll, deleteDmMucDichNuocNgoai, createDmMucDichNuocNgoai, updateDmMucDichNuocNgoai } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: true };

    componentDidMount() {
        T.ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.moTa.focus();
        }));
    }

    onShow = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: '', moTa: '', kichHoat: true };
        this.ma.value(ma);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat ? 1 : 0);
        this.setState({ kichHoat: kichHoat ? 1 : 0, ma: ma ? ma : null });
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ma: this.ma.value(),
                moTa: this.moTa.value(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống');
            this.ma.focus();
        } else if (changes.moTa == '') {
            T.notify('Mô tả danh mục bị trống');
            this.moTa.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật Mục đích đi nước ngoài' : 'Tạo mới Mục đích đi nước ngoài',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã' placeholder='Mã danh mục' maxLength={2} readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.moTa = e} label='Tên' placeholder='Mô tả' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }));
    }
}

class DmMucDichNuocNgoaiPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmMucDichNuocNgoaiAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmMucDichNuocNgoaiAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }


    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa mục đích đi nước ngoài', 'Bạn có chắc bạn muốn xóa Mục đích đi nước ngoài này?', true, isConfirm =>
            isConfirm && this.props.deleteDmMucDichNuocNgoai(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmMucDichNuocNgoai', ['read', 'write', 'delete']);
        let table = 'Không có danh sách!',
            items = this.props.dmMucDichNuocNgoai && this.props.dmMucDichNuocNgoai.items ? this.props.dmMucDichNuocNgoai.items : [];
        if (items && items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Mô tả</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma ? item.ma : ''} />
                        <TableCell type='link' content={item.moTa} onClick={() => this.modal.show(item)} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmMucDichNuocNgoai(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Mục đích đi nước ngoài',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Mục đích đi nươc ngoài'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmMucDichNuocNgoai} update={this.props.updateDmMucDichNuocNgoai} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });

    }
}

const mapStateToProps = state => ({ system: state.system, dmMucDichNuocNgoai: state.danhMuc.dmMucDichNuocNgoai });
const mapActionsToProps = { getDmMucDichNuocNgoaiAll, deleteDmMucDichNuocNgoai, createDmMucDichNuocNgoai, updateDmMucDichNuocNgoai };
export default connect(mapStateToProps, mapActionsToProps)(DmMucDichNuocNgoaiPage);