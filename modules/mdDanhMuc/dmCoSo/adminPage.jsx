import React from 'react';
import { connect } from 'react-redux';
import { createDmCoSo, getDmCoSoAll, updateDmCoSo, deleteDmCoSo } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormEditor, FormTabs } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        const { ma, ten, diaChi, tenVietTat, moTa, kichHoat } = item ? item : { ma: '', ten: '', diaChi: '', tenVietTat: '', moTa: '', kichHoat: true };
        this.setState({ ma, item });
        const name = ten ? JSON.parse(ten) : {};
        const address = diaChi ? JSON.parse(diaChi) : {};
        const abbreviation = tenVietTat ? JSON.parse(tenVietTat) : {};
        const description = moTa ? JSON.parse(moTa) : {};

        this.ten.value(name.vi ? name.vi : '');
        this.tenTiengAnh.value(name.en ? name.en : '');
        this.diaChi.value(address.vi ? address.vi : '');
        this.diaChiTiengAnh.value(address.en ? address.en : '');
        this.tenVietTat.value(abbreviation.vi ? abbreviation.vi : '');
        this.tenVietTatTiengAnh.value(abbreviation.en ? abbreviation.en : '');
        this.moTa.value(description.vi ? description.vi : '');
        this.moTaTiengAnh.value(description.en ? description.en : '');
        this.kichHoat.value(kichHoat);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: JSON.stringify({ vi: this.ten.value(), en: this.tenTiengAnh.value() }),
            diaChi: JSON.stringify({ vi: this.diaChi.value(), en: this.diaChiTiengAnh.value() }),
            tenVietTat: JSON.stringify({ vi: this.ten.value(), en: this.tenVietTatTiengAnh.value() }),
            moTa: JSON.stringify({ vi: this.moTa.value(), en: this.moTaTiengAnh.value() }),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };

        if (changes.ten.vi == '') {
            T.notify('Tên cơ sở bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.ten.en == '') {
            T.notify('Tên cơ sở bị trống!', 'danger');
            this.tenTiengAnh.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        let viEnTabs = [
            {
                title: 'Tiếng Việt',
                component: <div style={{ marginTop: 8 }}>
                    <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} readOnly={readOnly}
                        label='Tên cơ sở' required />
                    <FormTextBox type='text' className='col-md-12' ref={e => this.diaChi = e} readOnly={readOnly}
                        label='Địa chỉ' />
                    <FormTextBox type='text' className='col-md-12' ref={e => this.tenVietTat = e} readOnly={readOnly}
                        label='Tên viết tắt' />
                    <FormEditor className='col-12 col-sm-12' ref={e => this.moTa = e} label='Mô tả' height='200px' />
                </div>
            },
            {
                title: 'English',
                component: <div style={{ marginTop: 8 }}>
                    <FormTextBox type='text' className='col-md-12' ref={e => this.tenTiengAnh = e} readOnly={readOnly}
                        label='Name' required />
                    <FormTextBox type='text' className='col-md-12' ref={e => this.diaChiTiengAnh = e} readOnly={readOnly}
                        label='Address' />
                    <FormTextBox type='text' className='col-md-12' ref={e => this.tenVietTatTiengAnh = e} readOnly={readOnly}
                        label='Abbreviation' />
                    <FormEditor className='col-12 col-sm-12' ref={e => this.moTaTiengAnh = e} label='Description' height='200px' />
                </div>
            },];

        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật cơ sở' : 'Tạo mới cơ sở',
            size: 'elarge',
            body: <div className='row' style={{ height: '70vh', overflow: 'scroll' }}>
                <FormCheckbox className='col-md-12' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <div className='form-group col-12'>
                    <FormTabs tabClassName='col-12' contentClassName='col-12' tabs={viEnTabs} />
                </div>
            </div>
        });
    }
}

class DmCoSoPage extends AdminPage {
    state = { searching: false };
    menu = ''
    componentDidMount() {
        let route = T.routeMatcher('/user/:menu/co-so').parse(window.location.pathname);
        this.menu = route.menu;
        T.ready(`/user/${this.menu == 'dao-tao' ? 'dao-tao' : 'category'}`, () => {
            this.props.getDmCoSoAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => {
        this.props.updateDmCoSo(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục cơ sở', 'Bạn có chắc bạn muốn xóa cơ sở này?', true, isConfirm =>
            isConfirm && this.props.deleteDmCoSo(item.ma));
    }

    render() {
        const permission = this.getUserPermission('dmCoSo', ['read', 'write', 'delete']);
        let items = this.props.dmCoSo?.items || [];
        const table = renderTable({
            getDataSource: () => items, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '40%' }}>Tên cơ sở</th>
                    <th style={{ width: '60%' }}>Địa chỉ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={JSON.parse(item.ten, true).vi} onClick={() => this.modal.show(item)} />
                    <TableCell type='text' content={JSON.parse(item.diaChi, true).vi} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)}></TableCell>
                </tr>)
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục cơ sở',
            breadcrumb: [
                <Link key={0} to={`/user/${this.menu}`}>{this.menu == 'dao-tao' ? 'Đào tạo' : 'Danh mục'}</Link>,
                'Danh mục cơ sở'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createDmCoSo} update={this.props.updateDmCoSo} />
            </>,
            backRoute: `/user/${this.menu}`,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }

}

const mapStateToProps = state => ({ system: state.system, dmCoSo: state.danhMuc.dmCoSo });
const mapActionsToProps = { getDmCoSoAll, createDmCoSo, updateDmCoSo, deleteDmCoSo };
export default connect(mapStateToProps, mapActionsToProps)(DmCoSoPage);