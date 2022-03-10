import React from 'react';
import { connect } from 'react-redux';
import { getDnNguoiLienHeAll, deleteDnNguoiLienHe, createDnNguoiLienHe, updateDnNguoiLienHe, getDnNguoiLienHePage } from './reduxNguoiLienHe';
import { SelectAdapter_DnDoanhNghiep } from './reduxDoanhNghiep';
import { SelectAdapter_DnDonViKhac } from 'modules/mdDoiNgoai/dnDonViKhac/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminModal, FormSelect, FormTextBox, renderTable, TableCell, AdminPage, getValue } from 'view/component/AdminPage';

export class EditModal extends AdminModal {
    state = { doanhNghiep: null, item: {}, id: null, type: 0 };
    listDoiTac = [
        { id: 0, text: 'Chọn đối tác' },
        { id: 1, text: 'Doanh nghiệp' },
        { id: 2, text: 'Đơn vị khác' }
    ];

    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.dnNguoiLienHeHo.focus()));
    }

    onShow = (item = {}) => {
        let { id = '', type = 0, doanhNghiepId = null, donViId = null, ho = '', ten = '', chucVu = '', email = '', soDienThoai = '', gioiTinh = '' } = item;
        this.dnNguoiLienHeHo.value(ho || '');
        this.dnNguoiLienHeTen.value(ten || '');
        this.dnNguoiLienHeChucVu.value(chucVu || '');
        this.dnNguoiLienHeEmail.value(email || '');
        this.dnNguoiLienHeSoDienThoai.value(soDienThoai || '');

        this.dnNguoiLienHeDoiTac.value(type);
        this.doanhNghiep.value(doanhNghiepId);
        this.dnNguoiLienHeDonVi.value(donViId);
        this.gioiTinh.value(gioiTinh);

        this.setState({ id, type });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let type = this.state.type, id = this.state.id,
            changes = {
                ho: getValue(this.dnNguoiLienHeHo).trim(),
                ten: getValue(this.dnNguoiLienHeTen).trim(),
                chucVu: getValue(this.dnNguoiLienHeChucVu).trim(),
                email: getValue(this.dnNguoiLienHeEmail).trim(),
                soDienThoai: getValue(this.dnNguoiLienHeSoDienThoai),
                type,
                doanhNghiepId: type == 1 ? getValue(this.doanhNghiep) : '',
                donViId: type == 2 ? getValue(this.dnNguoiLienHeDonVi) : '',
                gioiTinh: getValue(this.gioiTinh)
            };

        if (/[a-zA-Z`~!@#$%^&* (){ } \[\] |\\;: '"<>,.?/ ]/.test(changes.soDienThoai)) {
            T.notify('Số điện thoại chỉ có thể là số', 'danger');
            this.dnNguoiLienHeSoDienThoai.focus();
        } else if (type == 0) {
            T.notify('Đối tác chưa được chọn!', 'danger');
            this.dnNguoiLienHeDoiTac.focus();
        } else {
            if (id) {
                this.props.updateDnNguoiLienHe(id, changes, (data) => {
                    if (data.duplicateEmail) {
                        this.dnNguoiLienHeEmail.focus();
                    } else if (!data.error) {
                        this.hide();
                    }
                });
            } else {
                this.props.createDnNguoiLienHe(changes, (data) => {
                    if (data.duplicateEmail) {
                        this.dnNguoiLienHeEmail.focus();
                    } else if (!data.error) {
                        this.props.done && this.props.done(data.item);
                        this.hide();
                    }
                });
            }
        }
    }

    handleChonDoiTac = (data) => {
        this.setState({ type: data.id });
    }

    render = () => {
        const readOnly = this.props.readOnly, type = this.state.type;
        return this.renderModal({
            size: 'large',
            title: this.state.id ? 'Cập nhật thông tin người liên hệ' : 'Tạo thông tin người liên hệ mới',
            body:
                <div className='row'>
                    <FormTextBox ref={e => this.dnNguoiLienHeHo = e} className='col-md-6' label='Họ' required readOnly={readOnly} />
                    <FormTextBox ref={e => this.dnNguoiLienHeTen = e} className='col-md-6' label='Tên' required readOnly={readOnly} />
                    <FormSelect ref={e => this.dnNguoiLienHeDoiTac = e} className='col-md-12' label='Đối tác' data={this.listDoiTac} onChange={this.handleChonDoiTac} required />
                    <FormSelect ref={e => this.doanhNghiep = e} className='col-md-12' style={{ display: type == 1 ? '' : 'none' }} data={SelectAdapter_DnDoanhNghiep} label='Doanh nghiệp' readOnly={readOnly} required />
                    <FormSelect ref={e => this.dnNguoiLienHeDonVi = e} className='col-md-12' style={{ display: type == 2 ? '' : 'none' }} data={SelectAdapter_DnDonViKhac} label='Đơn vị' readOnly={readOnly} required />

                    <FormSelect ref={e => this.gioiTinh = e} className='col-md-6' data={SelectAdapter_DmGioiTinhV2} label='Giới tính' readOnly={readOnly} required />
                    <FormTextBox ref={e => this.dnNguoiLienHeChucVu = e} className='col-md-6' label='Chức vụ' readOnly={readOnly} />
                    <FormTextBox ref={e => this.dnNguoiLienHeEmail = e} className='col-md-6' label='Email' required readOnly={readOnly} />
                    <FormTextBox ref={e => this.dnNguoiLienHeSoDienThoai = e} className='col-md-6' label='Số điện thoại' readOnly={readOnly} />
                </div>
        });
    }
}

class DnNguoiLienHePage extends AdminPage {
    componentDidMount() {
        this.props.getDnNguoiLienHePage();
        T.ready('/user/ero');
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa người liên hệ', 'Bạn có chắc bạn muốn xóa người liên hệ này?', true, isConfirm =>
            isConfirm && this.props.deleteDnNguoiLienHe(item.id));
    }

    render() {
        const permission = this.getUserPermission('dnNguoiLienHe', ['write', 'delete']),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.nguoiLienHe && this.props.nguoiLienHe.page ?
                this.props.nguoiLienHe.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };

        const table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có người liên hệ!',
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '40%' }}>Họ tên</th>
                    <th style={{ width: 'auto' }}>Email</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: '60%' }} nowrap='true'>Doanh nghiệp / Đơn vị</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} style={{ textAlign: 'right' }} />
                    <TableCell type='link' onClick={e => this.edit(e, item)} content={item.ho + ' ' + item.ten} />
                    <TableCell content={item.email} />
                    <TableCell content={item.soDienThoai} />
                    {item.doanhNghiepId ?
                        <TableCell type='link' url={`/user/ero/doanh-nghiep/edit/${item.doanhNghiepId}`} content={item.tenDoanhNghiep.viText()} /> :
                        <TableCell type='link' contentStyle={{ color: '#28a745' }} url={`/user/ero/don-vi-khac/edit/${item.donViId}`} content={(item.tenDonViKhac || '').viText()} />
                    }
                    <TableCell content={item} type='buttons' style={{ textAlign: 'center' }} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-smile-o',
            title: 'Người liên hệ',
            breadcrumb: [<Link to='/user/ero' key={0}>Quan hệ đối ngoại</Link>, 'Người liên hệ'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageDnNguoiLienHe' style={{ marginLeft: '70px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getDnNguoiLienHePage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} createDnNguoiLienHe={this.props.createDnNguoiLienHe} updateDnNguoiLienHe={this.props.updateDnNguoiLienHe} />
            </>,
            backRoute: '/user/ero',
            onCreate: permission.write ? this.edit : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, nguoiLienHe: state.doiNgoai.nguoiLienHe });
const mapActionsToProps = { getDnNguoiLienHeAll, deleteDnNguoiLienHe, createDnNguoiLienHe, updateDnNguoiLienHe, getDnNguoiLienHePage };
export default connect(mapStateToProps, mapActionsToProps)(DnNguoiLienHePage);