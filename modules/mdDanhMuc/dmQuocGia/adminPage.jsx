import React from 'react';
import { connect } from 'react-redux';
import { createDmQuocGia, getDmQuocGiaPage, updateDmQuocGia, deleteDmQuocGia } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.maCode.value() ? this.maCode.focus() : this.tenQuocGia.focus();
        }));
    }
    onShow = (item) => {
        let { maCode, tenQuocGia, country, shortenName, codeAlpha, maKhuVuc, tenKhac, } = item ? item : { maCode: '', tenQuocGia: '', country: '', shortenName: '', codeAlpha: '', maKhuVuc: '', tenKhac: '', maCu: '' };
        this.setState({maCode, item});
        this.maCode.value(maCode);
        this.tenQuocGia.value(tenQuocGia);
        this.country.value(country);
        this.shortenName.value(shortenName ? shortenName : '');
        this.codeAlpha.value(codeAlpha ? codeAlpha : '');
        this.maKhuVuc.value(maKhuVuc ? maKhuVuc : '');
        this.tenKhac.value(tenKhac ? tenKhac : '');
    }

    onSubmit = e => {
        e.preventDefault();
        const changes = {
            maCode: this.maCode.value().toUpperCase(),
            tenQuocGia: this.tenQuocGia.value(),
            country: this.country.value(),
            shortenName: this.shortenName.value().toUpperCase(),
            codeAlpha: this.codeAlpha.value().toUpperCase(),
            maKhuVuc: this.maKhuVuc.value().toUpperCase(),
            tenKhac: this.tenKhac.value().toUpperCase(),
            maCu: '',
        };

        if (changes.maCode == '') {
            T.notify('Mã quốc gia bị trống!', 'danger');
            this.maCode.focus();
        } else if (changes.tenQuocGia == '') {
            T.notify('Tên quốc gia bị trống!', 'danger');
            this.tenQuocGia.focus();
        } else if (changes.country == '') {
            T.notify('Quốc gia bị trống!', 'danger');
            this.country.focus();
        } else {
            this.state.maCode ? this.props.update(this.state.maCode, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.maCode ? 'Cập nhật quốc gia' : 'Tạo mới quốc gia',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12 col-sm-4' maxLength={2} ref={e => this.maCode = e} label='Mã quốc gia' 
                    readOnly={this.state.maCode ? true : readOnly} required />
                <FormTextBox type='text' className='col-12 col-sm-4' ref={e => this.tenQuocGia = e} label='Tên quốc gia' 
                    readOnly={readOnly} required />
                <FormTextBox type='text' className='col-12 col-sm-4' ref={e => this.country = e} label='Quốc gia' 
                    readOnly={readOnly} required />

                <FormTextBox type='text' className='col-12 col-sm-4' maxLength={2} ref={e => this.shortenName = e} label='Tên viết tắt' 
                    readOnly={readOnly} />
                <FormTextBox type='text' className='col-12 col-sm-4' ref={e => this.codeAlpha = e} label='Code Alpha' 
                    readOnly={readOnly}  />
                <FormTextBox type='text' className='col-12 col-sm-4' ref={e => this.maKhuVuc = e} label='Mã khu vực' 
                    readOnly={readOnly}  />
                <div className='col-md-12'>
                    <FormTextBox type='text' ref={e => this.tenKhac = e} label='Tên khác' 
                        readOnly={readOnly}  />
                    <small className='form-text text-muted'>Có thể có nhiều tên. Mỗi tên cách nhau bằng dấu phẩy (,).</small>
                </div>
            </div>
        });
    }
}

class DmQuocGiaPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmQuocGiaPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmQuocGiaPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục quốc gia', 'Bạn có chắc bạn muốn xóa quốc gia này?', true, isConfirm =>
            isConfirm && this.props.deleteDmQuocGia(item.maCode));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmQuocGia', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmQuocGia && this.props.dmQuocGia.page ?
            this.props.dmQuocGia.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có dữ liệu quốc gia!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '40%' }} nowrap='true'>Tên quốc gia</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Code alpha</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Tên viết tắt</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã khu vực</th>
                        <th style={{ width: '60%' }}>Tên khác</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.maCode ? item.maCode : ''} />
                        <TableCell type='link' content={<b>{item.tenQuocGia} {item.country ? `(${item.country})` : ''}</b>}
                            onClick={() => this.modal.show(item)} />
                            <TableCell type='number' content={item.codeAlpha ? item.codeAlpha : ''} />
                        <TableCell type='text' content={item.shortenName ? item.shortenName : ''} />
                        <TableCell type='text' content={item.maKhuVuc ? item.maKhuVuc : ''} />
                        <TableCell type='text' content={item.tenKhac && item.tenKhac.length > 0 ? item.tenKhac.toString().replaceAll(',', ', ') : ''} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Quốc gia',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Quốc gia'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} 
                    getPage={this.props.getDmQuocGiaPage} />
                <EditModal ref={e => this.modal = e} permission={permission} getDataSelect = {this.props.getDmDonViAll}
                    create={this.props.createDmQuocGia} update={this.props.updateDmQuocGia} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/quoc-gia/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmQuocGia: state.dmQuocGia });
const mapActionsToProps = { getDmQuocGiaPage, createDmQuocGia, updateDmQuocGia, deleteDmQuocGia };
export default connect(mapStateToProps, mapActionsToProps)(DmQuocGiaPage);
