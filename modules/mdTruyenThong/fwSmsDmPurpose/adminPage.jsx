import React from 'react';
import { connect } from 'react-redux';
import { getFwSmsDmPurposePage, deleteFwSmsDmPurpose, createFwSmsDmPurpose, updateFwSmsDmPurpose } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, getValue, FormRichTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { id, ten, ghiChu, kichHoat, canBoThucHien } = item ? item : { id: '', ten: '', ghiChu: '', kichHoat: 1, canBoThucHien: '' };
        this.setState({ id });
        this.ten.value(ten);
        this.ghiChu.value(ghiChu);
        this.canBoThucHien.value(canBoThucHien);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: getValue(this.ten),
            ghiChu: getValue(this.ghiChu),
            canBoThucHien: getValue(this.canBoThucHien),
            kichHoat: Number(this.kichHoat.value())
        };
        this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
    };

    changeKichHoat = value => this.kichHoat.value(Number(value));

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: !this.state.id ? 'Tạo mới' : 'Cập nhật',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
                <FormRichTextBox className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
                <FormSelect data={SelectAdapter_FwCanBo} className='col-12' ref={e => this.canBoThucHien = e} label='Cán bộ thực hiện' readOnly={readOnly} required />
                <FormCheckbox isSwitch ref={e => this.kichHoat = e} label='Kích hoạt' className='col-12' multiple />
            </div>
        }
        );
    }
}

class FwSmsDmPurposePage extends AdminPage {
    componentDidMount() {
        T.onSearch = (searchText) => this.props.getFwSmsDmPurposePage(undefined, undefined, searchText || '');
        T.showSearchBox();
        this.props.getFwSmsDmPurposePage();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa mục đích', `Bạn có chắc bạn muốn xóa mục đích ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteFwSmsDmPurpose(item.id, error => {
                if (error) T.notify(error.message ? error.message : `Xoá mục đích ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá mục đích ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('fwSmsDmPurpose', ['read', 'write', 'delete']);

        const { pageNumber, pageSize, pageCondition, pageTotal, totalItem, list } = this.props.fwSmsDmPurpose && this.props.fwSmsDmPurpose.page ? this.props.fwSmsDmPurpose.page : {
            pageNumber: 1, pageSize: 50, pageCondition: '', pageTotal: 1, totalItem: 0, list: null
        };
        const table = renderTable({
            getDataSource: () => list,
            stickyHead: false,
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '50%' }}>Tên</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Ghi chú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.ghiChu || ''} />
                    <TableCell type='checkbox' permission={permission} content={item.kichHoat} onChanged={value => this.props.updateFwSmsDmPurpose(item.id, { kichHoat: value })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-crosshairs',
            title: 'Mục đích sử dụng SMS',
            breadcrumb: [
                <Link key={0} to='/user/truyen-thong'>Truyền thông</Link>,
                'Mục đích sử dụng SMS'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmKhoiKienThucPage} />
                <EditModal ref={e => this.modal = e} permission={permission} readOnly={!permission.write} create={this.props.createFwSmsDmPurpose} update={this.props.updateFwSmsDmPurpose} />
            </>,
            backRoute: '/user/truyen-thong',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, fwSmsDmPurpose: state.doiNgoai.fwSmsDmPurpose });
const mapActionsToProps = { getFwSmsDmPurposePage, deleteFwSmsDmPurpose, createFwSmsDmPurpose, updateFwSmsDmPurpose };
export default connect(mapStateToProps, mapActionsToProps)(FwSmsDmPurposePage);