import React from 'react';
import { connect } from 'react-redux';
import { getDmNgayLePage, createDmNgayLe, updateDmNgayLe, deleteDmNgayLe, SelectAdapter_DmNgayLeGetYear } from './redux';
import { Link } from 'react-router-dom';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { AdminPage, AdminModal, renderTable, TableCell, FormCheckbox, FormRichTextBox, FormDatePicker, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    state = { id: '', visibleKetThuc: false, isCreate: false };

    componentDidMount() {
    }

    onShow = (item) => {
        let { id, ngay, moTa, kichHoat } = item ? item : { id: 0, ngay: '', moTa: '', kichHoat: 1 };

        this.ngay.value(ngay);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat);
        this.setState({ id: id, isCreate: id ? false : true, visibleKetThuc: false });
        $('#ketThuc').hide();
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ngay: this.ngay.value(),
            moTa: this.moTa.value(),
            kichHoat: Number(this.kichHoat.value()),
            ketThuc: this.state.visibleKetThuc ? this.ketThuc.value() : null,
        };
        const doSave = () => {
            let start = this.ngay.value();
            const end = (this.state.visibleKetThuc == false) ? this.ngay.value() : this.ketThuc.value();
            while (start <= end) {
                const data = {
                    ngay: start.getTime(),
                    moTa: this.moTa.value(),
                    kichHoat: Number(this.kichHoat.value()),
                };
                let hide = (start.getDate() == end.getDate() && start.getMonth() == end.getMonth() && start.getFullYear() == end.getFullYear()) ? this.hide : null;
                this.state.id ? this.props.update(this.state.id, data, hide) : this.props.create(data, hide);
                start = start.nextDate();
            }
        };
        if (!changes.ngay) {
            T.notify('Ngày lễ bị trống!', 'danger');
            this.ngay.focus();
        } else if (changes.moTa == '') {
            T.notify('Mô tả bị trống!', 'danger');
            this.moTa.focus();
        } else if ((this.state.visibleKetThuc == true) && !changes.ketThuc) {
            T.notify('Ngày kết thúc bị trống!', 'danger');
            this.ketThuc.focus();
        } else if ((this.state.visibleKetThuc == true) && this.ngay.value() > this.ketThuc.value()) {
            T.notify('Ngày bắt đầu lớn hơn ngày kết thúc!', 'danger');
            this.ngay.focus();
        } else if ((this.state.visibleKetThuc == true) && T.monthDiff(this.ngay.value(), this.ketThuc.value()) >= 6) { //>= 6 tháng
            T.confirm('Chênh lệch giữa ngày bắt đầu và kết thúc là rất lớn', 'Bạn có chắc bạn muốn tiếp tục thực hiện?', 'warning', true, isConfirm => {
                if (isConfirm) {
                    doSave();
                }
            });
        } else {
            doSave();
        }
    }

    changeKetThuc = (value) => {
        if (value) {
            this.setState({ visibleKetThuc: true }, () => {
                $('#ketThuc').show();
            });
        } else {
            this.setState({ visibleKetThuc: false }, () => {
                $('#ketThuc').hide();
            });
        }
    }
    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật ngày lễ' : 'Tạo mới ngày lễ',
            size: 'large',
            body: <div className='row'>
                <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngay = e} label={this.state.visibleKetThuc ? 'Ngày bắt đầu lễ' : 'Ngày lễ'} readOnly={this.state.ma ? true : readOnly} placeholder={this.state.visibleKetThuc ? 'Ngày bắt đầu lễ' : 'Ngày lễ'} required />
                {this.state.isCreate && <FormCheckbox className='col-md-6' label='Bấm vào đây nếu nhập nhiều ngày' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} onChange={this.changeKetThuc} />}
                <div className='col-md-6' id='ketThuc'> <FormDatePicker type='date-mask' ref={e => this.ketThuc = e} label={'Ngày kết thúc lễ'} readOnly={this.state.ma ? true : readOnly} placeholder='Ngày kết thúc lễ' required /> </div>
                <FormRichTextBox rows='3' className='col-12' ref={e => this.moTa = e} label='Mô tả' readOnly={readOnly} placeholder='Mô tả' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmNgayLePage extends AdminPage {
    DayStrs = ['Chủ Nhật', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy']
    componentDidMount() {
        let route = T.routeMatcher('/user/:menu/ngay-le');
        this.menu = route.parse(window.location.pathname).menu;
        T.ready(this.menu == 'danh-muc' ? '/user/category' : '/user/dao-tao', () => {
            this.year.value(new Date().getFullYear());
            T.onSearch = (searchText) => this.props.getDmNgayLePage(undefined, undefined, {
                searchText: searchText || '', year: this.year.value()
            });
            T.showSearchBox();
            this.props.getDmNgayLePage(undefined, undefined, { year: this.year.value() }, (page) => {
                page && page.pageCondition && this.year.value(page.pageCondition?.year || new Date().getFullYear());
            });
        });
    }

    getDay = (value) => {
        const d = new Date(value);
        // const day = d.getDay() === 0 ? 'Chủ Nhật' : `${d.getDay() + 1}`;
        return this.DayStrs[d.getDay()];
    }


    getFullDate = (value) => {
        const d = new Date(value);
        const date = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
        const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
        const year = d.getFullYear();
        return `${date}/${month}/${year}`;
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa ngày lễ', 'Bạn có chắc bạn muốn xóa ngày lễ này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNgayLe(item.id));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmNgayLe', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNgayLe && this.props.dmNgayLe.page ?
            this.props.dmNgayLe.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu ngày lễ',
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                        <th rowSpan='2' style={{ width: '20%', textAlign: 'center' }}>Thứ</th>
                        <th rowSpan='2' style={{ width: '30%', textAlign: 'center' }}>Ngày</th>
                        <th rowSpan='2' style={{ width: '50%', verticalAlign: 'left' }}>Mô tả</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }} nowrap='true'>Kích hoạt</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                    </tr>

                </>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={this.getDay(item.ngay)} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={this.getFullDate(item.ngay)} />
                    <TableCell type='link' style={{ textAlign: 'left' }} content={item.moTa} onClick={() => this.modal.show(item)} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateDmNgayLe(item.id, { kichHoat: value ? 1 : 0, })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>)
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Ngày Lễ',
            header: <FormSelect ref={e => this.year = e} style={{ width: '200px', marginBottom: '0' }} placeholder='Năm' data={SelectAdapter_DmNgayLeGetYear} onChange={
                value => this.props.getDmNgayLePage(undefined, undefined, {
                    searchText: '',
                    year: value && value.id
                })
            } />,
            breadcrumb: [
                <Link key={0} to={this.menu == 'danh-muc' ? '/user/category' : '/user/dao-tao'}>{this.menu == 'danh-muc' ? 'Danh mục' : 'Đào tạo'}</Link>,
                'Ngày Lễ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmNgayLePage} />
                <EditModal ref={e => this.modal = e} permission={permission} getDataSelect={this.props.getDmDonViAll}
                    create={this.props.createDmNgayLe} update={this.props.updateDmNgayLe} permissions={currentPermissions} />
            </>,
            backRoute: this.menu == 'danh-muc' ? '/user/category' : '/user/dao-tao',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNgayLe: state.danhMuc.dmNgayLe, dmDonVi: state.danhMuc.dmDonVi });
const mapActionsToProps = { getDmDonViAll, getDmNgayLePage, createDmNgayLe, updateDmNgayLe, deleteDmNgayLe };
export default connect(mapStateToProps, mapActionsToProps)(DmNgayLePage);