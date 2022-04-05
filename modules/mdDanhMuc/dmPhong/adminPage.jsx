import React from 'react';
import { connect } from 'react-redux';
import { getDmPhongAll, deleteDmPhong, createDmPhong, updateDmPhong } from './redux';
import { getDmCoSoAll } from 'modules/mdDanhMuc/dmCoSo/redux';
import { getDmToaNhaAll } from 'modules/mdDanhMuc/dmToaNha/redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormSelect, FormRichTextBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: 1 };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ten, toaNha, moTa, kichHoat } = item ? item : { ten: '', toaNha: '', moTa: '', kichHoat: 1 };

        this.toaNha.value(toaNha ? item.toaNha : '');
        this.ten.value(ten);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat);
        this.setState({ item });
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ten: this.ten.value().trim(),
                toaNha: this.toaNha.value(),
                moTa: this.moTa.value(),
                kichHoat: this.state.kichHoat,
            };
        if (changes.ten == '') {
            T.notify('Tên phòng học bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.toaNha == null) {
            T.notify('Toà nhà chưa được chọn!', 'danger');
            this.toaNha.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        let listToaNha = this.props.building;
        if (typeof listToaNha == 'object') listToaNha = Object.values(listToaNha);
        const listToaNhaOption = [];
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật Phòng' : 'Tạo mới Phòng',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên phòng học' readOnly={readOnly} required />
                <FormSelect className='col-md-12' ref={e => this.toaNha = e} label='Tòa nhà' data={listToaNhaOption} />
                <FormRichTextBox className='col-md-12' ref={e => this.moTa = e} label='Mô tả' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }));
    }
}

class DmPhongPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category');
        T.showSearchBox();
        this.props.getDmPhongAll();
        this.props.getDmToaNhaAll();
        this.props.getDmCoSoAll();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa phòng', 'Bạn có chắc bạn muốn xóa phòng này?', true, isConfirm =>
            isConfirm && this.props.deleteDmPhong(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmPhong', ['read', 'write', 'delete', 'upload']);
        let listToaNha = this.props.dmToaNha && this.props.dmToaNha.items ? this.props.dmToaNha.items : [],
            toaNhaMapper = {};
        listToaNha.forEach(item => toaNhaMapper[item.ma] = item.ten);

        let table = 'Không có phòng học!',
            items = this.props.dmPhong && this.props.dmPhong.items ? this.props.dmPhong.items : [];
        if (items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '20%' }}>Tên phòng</th>
                        <th style={{ width: '20%' }}>Tòa nhà</th>
                        <th style={{ width: '60%' }}>Ghi chú</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={toaNhaMapper[item.toaNha] || ''} />
                        <TableCell type='text' content={item.moTa} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmPhong(item.ten, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Phòng',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Phòng'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmPhong} update={this.props.updateDmPhong} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            // onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/phong/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmPhong: state.danhMuc.dmPhong, categoryCampus: state.danhMuc.dmCoSo, dmToaNha: state.danhMuc.dmToaNha });
const mapActionsToProps = { getDmCoSoAll, getDmToaNhaAll, getDmPhongAll, deleteDmPhong, createDmPhong, updateDmPhong };
export default connect(mapStateToProps, mapActionsToProps)(DmPhongPage);