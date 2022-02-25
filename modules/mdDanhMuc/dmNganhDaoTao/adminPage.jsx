import React from 'react';
import { connect } from 'react-redux';
import { getDmNganhDaoTaoPage, createDmNganhDaoTao, deleteDmNganhDaoTao, updateDmNganhDaoTao } from './redux';
import { getDmDonViAll, getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormEditor, FormTabs, FormSelect} from 'view/component/AdminPage';


class EditModal extends AdminModal {
    state = { kichHoat: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, moTa, maDonVi, kichHoat } = item ? item : { ma: null, ten: '', moTa: '', maDonVi: null, kichHoat: true };
        let name = ten ? JSON.parse(ten) : {},
            description = moTa ? JSON.parse(moTa) : {};
        this.setState({ma, item});
        this.ten.value((name && name.vi) ? name.vi : '');
        this.tenTiengAnh.value((name && name.en) ? name.en : '');
        this.moTa.value((description && description.vi) ? description.vi : '');
        this.moTaTiengAnh.value((description && description.en) ? description.en : '');
        this.maDonVi.value(maDonVi ? maDonVi : '');
        this.kichHoat.value(kichHoat);
    };

    onSubmit = e => {
        e.preventDefault();
        const changes = {
            ten: {vi: this.ten.value(), en: this.tenTiengAnh.value() }, 
            moTa: {vi: this.moTa.value(), en: this.moTaTiengAnh.value() },
            maDonVi: this.maDonVi.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.ten.vi == '') {
            T.notify('Tên ngành đào tạo bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.ten.en == '') {
            T.notify('Tên ngành đào tạo bị trống!', 'danger');
            this.tenTiengAnh.focus();
        } else if (changes.maDonVi == null) {
            T.notify('Đơn vị chưa được chọn!', 'danger');
        } else {
            changes.ten = JSON.stringify(changes.ten);
            changes.moTa = JSON.stringify(changes.moTa);
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
                <FormEditor className='col-12 col-sm-12' ref={e => this.moTa = e} label='Mô tả' height='200px' />
            </div>
        },
        {
            title: 'English',
            component: <div style={{ marginTop: 8 }}>
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenTiengAnh = e} readOnly={readOnly} 
                    label='Name' required /> 
                <FormEditor className='col-12 col-sm-12' ref={e => this.moTaTiengAnh = e} label='Description' height='200px' />
            </div>
        },];

        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật ngành đào tạo' : 'Tạo mới ngành đào tạo',
            body: <div className='row'> {/* need fixed */}
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} 
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormTabs tabClassName='col-12 col-sm-12' tabs={viEnTabs} />
                <FormSelect className='col-md-12' ref={e => this.maDonVi = e} data={this.props.optionsDonVi} 
                    label='Mã đơn vị' required />
            </div>
        });
    }
}

class DmNganhDaoTaoPage extends AdminPage {
    state = { searching: false };
    mapperDonVi = [];
    optionsDonVi = [];

    componentDidMount() {
        this.props.getDmDonViAll(items => {
            if (items) {
                const mapper = {};
                items.forEach(item => {
                    mapper[item.ma] = item.ten;
                    if (item.kichHoat == 1 && item.maPl == '01') {
                        this.optionsDonVi.push({ 'id': item.ma, 'text': item.ten });
                    }
                });
                this.mapperDonVi = mapper;
            }
        });
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmNganhDaoTaoPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmNganhDaoTaoPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmNganhDaoTao(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa ngành đào tạo', 'Bạn có chắc bạn muốn xóa ngành đào tạo này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNganhDaoTao(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmNganhDaoTao', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNganhDaoTao && this.props.dmNganhDaoTao.page ?
            this.props.dmNganhDaoTao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let table = 'Không có ngành đào tạo!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '50%' }}>Ngành đào tạo</th>
                        <th style={{ width: '50%' }}>Đơn vị</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} >
                        <TableCell type='number' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={JSON.parse(item.ten, true).vi}
                            onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={this.mapperDonVi[item.maDonVi] ? this.mapperDonVi[item.maDonVi] : ''} />
                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                            onChanged={() => this.changeActive(item)} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Ngành đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Ngành đào tạo'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} 
                    getPage={this.props.getDmNganhDaoTaoPage} />
                <EditModal ref={e => this.modal = e} permission={permission} optionsDonVi={this.optionsDonVi}
                    create={this.props.createDmNganhDaoTao} update={this.props.updateDmNganhDaoTao} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNganhDaoTao: state.danhMuc.dmNganhDaoTao, dmDonVi: state.danhMuc.dmDonVi });
const mapActionsToProps = { getDmNganhDaoTaoPage, getDmDonViAll, getDmDonVi, createDmNganhDaoTao, deleteDmNganhDaoTao, updateDmNganhDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DmNganhDaoTaoPage);
