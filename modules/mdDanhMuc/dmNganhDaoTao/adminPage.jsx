import React from 'react';
import { connect } from 'react-redux';
import { getDmNganhDaoTaoPage, createDmNganhDaoTao, deleteDmNganhDaoTao, updateDmNganhDaoTao } from './redux';
import { getDmDonViAll, getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormRichTextBox } from 'view/component/AdminPage';


class EditModal extends AdminModal {
    state = { kichHoat: true, ma: null };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, ghiChu, kichHoat } = item ? item : { ma: null, ten: '', ghiChu: '', kichHoat: true };
        this.ten.value(ten);
        this.ma.value(ma || '');
        this.ghiChu.value(ghiChu);
        this.kichHoat.value(kichHoat);
        this.setState({ ma });
    };

    onSubmit = e => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            ma: this.ma.value(),
            ghiChu: this.ghiChu.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0
        };
        if (changes.ten == '') {
            T.notify('Tên ngành đào tạo bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.ma == '') {
            T.notify('Mã ngành đào tạo bị trống!', 'danger');
            this.tenTiengAnh.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật ngành đào tạo' : 'Tạo mới ngành đào tạo',
            body: <div className='row'>
                <FormTextBox ref={e => this.ma = e} label='Mã' readOnly={readOnly} className='col-12' require />
                <FormTextBox ref={e => this.ten = e} label='Tên' readOnly={readOnly} className='col-12' require />
                <FormRichTextBox ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} className='col-12' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmNganhDaoTaoPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
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
        const permission = this.getUserPermission('dmNganhDaoTao', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNganhDaoTao && this.props.dmNganhDaoTao.page ?
            this.props.dmNganhDaoTao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let table = 'Không có ngành đào tạo!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã ngành</th>
                        <th style={{ width: '50%' }}>Tên ngành</th>
                        <th style={{ width: '50%' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ textAlign: 'right' }} content={item.ma} />
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' style={{ textAlign: 'right' }} content={item.moTa} />
                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission} onChanged={() => this.changeActive(item)} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
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
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmNganhDaoTaoPage} />
                <EditModal ref={e => this.modal = e} permission={permission} create={this.props.createDmNganhDaoTao} update={this.props.updateDmNganhDaoTao} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNganhDaoTao: state.danhMuc.dmNganhDaoTao, dmDonVi: state.danhMuc.dmDonVi });
const mapActionsToProps = { getDmNganhDaoTaoPage, getDmDonViAll, getDmDonVi, createDmNganhDaoTao, deleteDmNganhDaoTao, updateDmNganhDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DmNganhDaoTaoPage);
