import React from 'react';
import { connect } from 'react-redux';
import { createDmChungChiTiengAnh, getDmChungChiTiengAnhAll, updateDmChungChiTiengAnh, deleteDmChungChiTiengAnh } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormTextBox, FormTabs, AdminModal, FormEditor, FormCheckbox } from 'view/component/AdminPage';
class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, moTa, kichHoat } = item ? item : { ma: '', ten: '', moTa: '', kichHoat: true };

        this.setState({ ma, ten, item });
        let mo_ta = !moTa ? {} : JSON.parse(moTa);
        this.ten.value(ten);
        this.moTaVi.value(mo_ta.vi ? mo_ta.vi : '');
        this.moTaEn.value(mo_ta.en ? mo_ta.en : '');
        this.kichHoat.value(kichHoat ? 1 : 0);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ten: this.ten.value(),
                moTa: JSON.stringify({ vi: this.moTaVi.value(), en: this.moTaEn.value() }),
                kichHoat: Number(this.kichHoat.value() ? 1 : 0),
            };

        if (changes.ten == '') {
            T.notify('Tên chứng chỉ tiếng Anh bị trống!', 'danger');
            this.ten.focus();
        } else this.state.ten ? this.props.update(this.state.ma, changes, this.hide) :
            this.props.create(changes, this.hide);

    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);


    render = () => {
        const readOnly = this.props.readOnly;
        let viEnTabs = [
            {
                title: 'Tiếng Việt',
                component: <div style={{ marginTop: 8 }}>
                    <FormEditor className='col-12 col-sm-12' ref={e => this.moTaVi = e} label='Mô tả' height='200px' />
                </div>
            },
            {
                title: 'English',
                component: <div style={{ marginTop: 8 }}>
                    <FormEditor className='col-12 col-sm-12' ref={e => this.moTaEn = e} label='Description' height='200px' />
                </div>
            },];
        return this.renderModal({
            title: 'Chứng chỉ tiếng anh',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-12 col-sm-12' type='text' ref={e => this.ten = e} label='Tên chứng chỉ tiếng anh' placeholder='Tên chứng chỉ tiếng anh' readOnly={readOnly} required />
                <div style={{ position: 'absolute', top: '16px', right: '8px' }}><FormCheckbox style={{ display: 'inline-flex', width: '100%', margin: 0 }} ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} /></div>
                <FormTabs tabClassName='col-12 col-sm-12' tabs={viEnTabs} />

            </div>
        });
    }
}

class DmChungChiTiengAnhPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmChungChiTiengAnhAll());
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa chứng chỉ tiếng anh', `Bạn có chắc bạn muốn xóa chứng chỉ tiếng anh ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmChungChiTiengAnh(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá chứng chỉ tiếng anh ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá chứng chỉ tiếng anh ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmChungChiTiengAnh', ['read', 'write', 'delete']);
        let table = 'Không có dữ liệu chứng chỉ tiếng Anh!',
            items = this.props.dmChungChiTiengAnh && this.props.dmChungChiTiengAnh.items;
        if (items && items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Chứng chỉ tiếng Anh</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type="number" content={index + 1} style={{ textAlign: 'center' }} />
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmChungChiTiengAnh(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete}></TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Chứng chỉ tiếng anh',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Chứng chỉ tiếng anh'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmChungChiTiengAnh} update={this.props.updateDmChungChiTiengAnh} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmChungChiTiengAnh: state.danhMuc.dmChungChiTiengAnh });
const mapActionsToProps = { getDmChungChiTiengAnhAll, createDmChungChiTiengAnh, updateDmChungChiTiengAnh, deleteDmChungChiTiengAnh };
export default connect(mapStateToProps, mapActionsToProps)(DmChungChiTiengAnhPage);
