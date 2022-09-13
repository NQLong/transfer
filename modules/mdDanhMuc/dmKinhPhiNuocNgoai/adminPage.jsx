import React from 'react';
import { connect } from 'react-redux';
import { getDmKinhPhiNuocNgoaiAll, deleteDmKinhPhiNuocNgoai, createDmKinhPhiNuocNgoai, updateDmKinhPhiNuocNgoai } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, ghiChu, kichHoat } = item ? item : { ma: '', ten: '', ghiChu: '', kichHoat: true };
        this.ma.value(ma);
        this.ten.value(ten);
        this.ghiChu.value(ghiChu);
        this.setState({ kichHoat });
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ma: this.ma.value().trim(),
                ten: this.ten.value().trim(),
                ghiChu: this.ghiChu.value().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Mô tả danh mục bị trống');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật Kinh Phí đi Nước Ngoài' : 'Tạo mới Kinh Phí đi Nước Ngoài',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã' placeholder='Mã danh mục' maxLength={2} readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên' placeholder='Tên' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi Chú' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
            </div>
        }));
    }
}

class DmKinhPhiNuocNgoaiPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmKinhPhiNuocNgoaiAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmKinhPhiNuocNgoaiAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmKinhPhiNuocNgoai(item.ma, { kichHoat: Number(!item.kichHoat) });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa kinh phí đi nước ngoài', 'Bạn có chắc bạn muốn xóa kinh phí này?', true, isConfirm =>
            isConfirm && this.props.deleteDmKinhPhiNuocNgoai(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmKinhPhiNuocNgoai', ['read', 'write', 'delete']);
        let table = 'Không có danh sách!',
            items = this.props.dmKinhPhiNuocNgoai && this.props.dmKinhPhiNuocNgoai.items ? this.props.dmKinhPhiNuocNgoai.items : [];
        if (items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '40%' }}>Tên</th>
                        <th style={{ width: '60%' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma} />
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ghiChu} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmKinhPhiNuocNgoai(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Kinh phí đi nước ngoài',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Kinh phí đi nước ngoài'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmKinhPhiNuocNgoai} update={this.props.updateDmKinhPhiNuocNgoai} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmKinhPhiNuocNgoai: state.danhMuc.dmKinhPhiNuocNgoai });
const mapActionsToProps = { getDmKinhPhiNuocNgoaiAll, deleteDmKinhPhiNuocNgoai, createDmKinhPhiNuocNgoai, updateDmKinhPhiNuocNgoai };
export default connect(mapStateToProps, mapActionsToProps)(DmKinhPhiNuocNgoaiPage);