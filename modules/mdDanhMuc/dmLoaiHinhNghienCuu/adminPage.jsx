import React from 'react';
import { connect } from 'react-redux';
import { getDmLoaiHinhNghienCuuAll, deleteDmLoaiHinhNghienCuu, createDmLoaiHinhNghienCuu, updateDmLoaiHinhNghienCuu } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: 1 };
        this.setState({ma, item});
        this.ma = ma;
        this.ten = ten;
        this.kichHoat = kichHoat;
    };

    getValue = input => {
        const data = input.getVal();
        if (data) return data;
        if (input.required) throw { input };
        return data;
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const changes = {
                ma: this.getValue(this.ma),
                ten: this.getValue(this.ten),
                kichHoat: this.getValue(this.kichHoat)
            };
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
        catch (error) {
            if (error.input) {
                error.input.focus();
                T.notify('<b>' + (error.input.label || 'Dữ liệu') + '</b> bị trống!!', 'danger');
            }
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật Loại hình nghiên cứu' : 'Tạo mới Loại hình nghiên cứu',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã sở hữu trí tuệ' readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }));
    }
}

class DmLoaiHinhNghienCuuPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmLoaiHinhNghienCuuAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmLoaiHinhNghienCuuAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmLoaiHinhNghienCuu(item.ma, { kichHoat: Number(!item.kichHoat) })

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa loại hình nghiên cứu', 'Bạn có chắc bạn muốn xóa danh mục này?', true, isConfirm =>
            isConfirm && this.props.deleteDmLoaiHinhNghienCuu(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmLoaiHinhNghienCuu', ['read', 'write', 'delete']);
        let table = 'Không có danh sách!',
            items = this.props.dmLoaiHinhNghienCuu && this.props.dmLoaiHinhNghienCuu.items ? this.props.dmLoaiHinhNghienCuu.items : [];
        if (items && items.length > 0) {
            items.sort((a, b) => a.ma < b.ma ? -1 : 1);
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='link' content={item.ma ? item.ma : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmLoaiHinhNghienCuu(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Loại hình nghiên cứu',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Loại hình nghiên cứu'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmLoaiHinhNghienCuu} update={this.props.updateDmLoaiHinhNghienCuu} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmLoaiHinhNghienCuu: state.danhMuc.dmLoaiHinhNghienCuu });
const mapActionsToProps = { getDmLoaiHinhNghienCuuAll, deleteDmLoaiHinhNghienCuu, createDmLoaiHinhNghienCuu, updateDmLoaiHinhNghienCuu };
export default connect(mapStateToProps, mapActionsToProps)(DmLoaiHinhNghienCuuPage);