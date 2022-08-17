import React from 'react';
import { connect } from 'react-redux';
import { getDmToaNhaAll, createDmToaNha, updateDmToaNha, deleteDmToaNha } from './redux';
import { getDmCoSoAll, SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormSelect, FormRichTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, moTa, coSo, kichHoat } = item ? item : { ma: null, ten: '', moTa: '', coSo: null, kichHoat: true };
        this.setState({ ma });
        this.ten.value(ten);
        this.coSo.value(coSo);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ten: this.ten.value(),
                moTa: this.moTa.value(),
                coSo: this.coSo.value(),
                kichHoat: Number(this.kichHoat.value()),
            };
        if (changes.ten == '') {
            T.notify('Tên tòa nhà bị trống!', 'danger');
            this.tenvi.focus();
        } else if (changes.coSo == null) {
            T.notify('Cơ sở chưa được chọn!', 'danger');
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Danh sách tòa nhà',
            body: <div className='row'>
                <FormTextBox ref={e => this.ten = e} label='Tên' className='col-md-6' />
                <FormSelect ref={e => this.coSo = e} label='Cơ sở' className='col-md-6' data={SelectAdapter_DmCoSo} />
                <FormRichTextBox ref={e => this.moTa = e} label='Mô tả' className='col-md-12' />
                <FormCheckbox ref={e => this.kichHoat = e} label='Kích hoạt' className='col-md-12' onChanged={value => this.changeKichHoat(value)} />
            </div>
        });
    }
}

class DmToaNhaPage extends AdminPage {
    componentDidMount() {
        let route = T.routeMatcher('/user/:menu/toa-nha').parse(window.location.pathname);
        this.menu = route.menu;
        T.ready(`/user/${this.menu}`);
        this.props.getDmToaNhaAll();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmToaNha(item.ma, { kichHoat: item.kichHoat == '1' ? '0' : '1' });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa tòa nhà', 'Bạn có chắc bạn muốn xóa tòa nhà này?', true, isConfirm =>
            isConfirm && this.props.deleteDmToaNha(item.ma));
    }

    render() {
        const permission = this.getUserPermission('dmToaNha', ['read', 'write', 'delete']);
        let items = this.props.dmToaNha ? this.props.dmToaNha.items : [];
        let table = renderTable({
            getDataSource: () => items, stickyHead: true,
            emptyTable: 'Không có tòa nhà',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }} nowrap='true'>Tòa nhà</th>
                    <th style={{ width: '50%' }} nowrap='true'>Cơ sở</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Mô tả</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                    <TableCell type='text' content={item.coSo} />
                    <TableCell type='text' content={item.moTa} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateDmToaNha(item.ma, { kichHoat: value ? 1 : 0, })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách tòa nhà',
            breadcrumb: [
                <Link key={0} to={`/user/${this.menu}`}>{this.menu == 'dao-tao' ? 'Đào tạo' : 'Danh mục'}</Link>,
                'Danh sách tòa nhà'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createDmToaNha} update={this.props.updateDmToaNha} />
            </>,
            backRoute: `/user/${this.menu}`,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmToaNha: state.danhMuc.dmToaNha, categoryCampus: state.danhMuc.dmCoSo });
const mapActionsToProps = { getDmCoSoAll, getDmToaNhaAll, createDmToaNha, updateDmToaNha, deleteDmToaNha };
export default connect(mapStateToProps, mapActionsToProps)(DmToaNhaPage);