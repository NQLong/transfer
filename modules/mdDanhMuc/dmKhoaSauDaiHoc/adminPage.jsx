import React from 'react';
import { connect } from 'react-redux';
import { createDmKhoaSdh, getDmKhoaSdhPage, updateDmKhoaSdh, deleteDmKhoaSdh } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        const { ma, ten, tenTiengAnh, tenVietTat, ghiChu, kichHoat } = item ? item : { ma: null, ten: '', tenTiengAnh: '', tenVietTat: '', ghiChu: '', kichHoat: true };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.tenTiengAnh.value(tenTiengAnh ? tenTiengAnh : '');
        this.tenVietTat.value(tenVietTat ? tenVietTat : '');
        this.ghiChu.value(ghiChu ? ghiChu : '');
        this.kichHoat.value(kichHoat);
    }

    onSubmit = (e) => {
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            tenTiengAnh: this.tenTiengAnh.value(),
            tenVietTat: this.tenVietTat.value(),
            ghiChu: this.ghiChu.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.ma == '') {
            T.notify('Mã khoa sau đại học bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên khoa sau đại học bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
        e.preventDefault();
    }

    changeKichHoat = value => this.kichHoat.value(value) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật khoa sau đại học' : 'Tạo mới khoa sau đại học',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='number' className='col-md-6' ref={e => this.ma = e} label='Mã khoa'
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.ten = e} label='Tên khoa'
                    readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-6' ref={e => this.tenTiengAnh = e} label='Tên tiếng Anh' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.tenVietTat = e} label='Tên viết tắt' readOnly={readOnly} />
                <FormTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
            </div>
        });
    }
}

class DmDonViPage extends AdminPage {
    componentDidMount() {
        let route = T.routeMatcher('/user/:menu/khoa-sau-dai-hoc').parse(window.location.pathname);
        this.menu = route.menu == 'sau-dai-hoc' ? 'sau-dai-hoc' : 'category';
        T.ready(`/user/${this.menu}`, () => {
            T.onSearch = (searchText) => this.props.getDmKhoaSdhPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmKhoaSdhPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmKhoaSdh(item.ma, { kichHoat: item.kichHoat ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục khoa sau đại học', 'Bạn có chắc bạn muốn xóa khoa sau đại học này?', true, isConfirm =>
            isConfirm && this.props.deleteDmKhoaSdh(item.ma));
    }

    render() {
        const permission = this.getUserPermission('dmKhoaSdh', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmKhoaSdh && this.props.dmKhoaSdh.page ?
            this.props.dmKhoaSdh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách khoa sau đại học!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '50%' }}>Tên khoa</th>
                        <th style={{ width: '50%' }}>Tên tiếng Anh</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' style={{ textAlign: 'right' }} content={item.ma ? item.ma : ''}
                            onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='text' content={item.tenTiengAnh ? item.tenTiengAnh : ''} />
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
            title: 'Khoa sau đại học',
            breadcrumb: [
                <Link key={0} to={this.menu == 'category' ? '/user/category' : '/user/sau-dai-hoc'}>{this.menu == 'category' ? 'Danh mục' : 'Sau đại học'}</Link>,
                'Khoa sau đại học'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmKhoaSdhPage} />
                <EditModal ref={e => this.modal = e}
                    create={this.props.createDmKhoaSdh} update={this.props.updateDmKhoaSdh} readOnly={!permission.write} />
            </>,
            backRoute: `/user/${this.menu}`,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            // onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/don-vi/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmKhoaSdh: state.danhMuc.dmKhoaSdh });
const mapActionsToProps = { createDmKhoaSdh, getDmKhoaSdhPage, updateDmKhoaSdh, deleteDmKhoaSdh };
export default connect(mapStateToProps, mapActionsToProps)(DmDonViPage);