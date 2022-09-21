import React from 'react';
import { connect } from 'react-redux';
import { getAllSmsParameter, deleteFwSmsParameter, createFwSmsParameter, updateFwSmsParameter } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, getValue, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        // let { modelName, columnName, ten, kichHoat } = item ? item : { modelName: '', columnName: '', ten: '', kichHoat: 1 };
        this.setState({ item });
        ['modelName', 'columnName', 'ten', 'chuThich', 'kichHoat'].forEach(key => this[key].value(item ? item[key] : ''));

    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            modelName: getValue(this.modelName),
            columnName: getValue(this.columnName),
            ten: getValue(this.ten),
            chuThich: getValue(this.chuThich),
            kichHoat: Number(this.kichHoat.value())
        };
        this.state.item ? this.props.update(this.state.item.id, changes, this.hide) : this.props.create(changes, this.hide);
    };

    changeKichHoat = value => this.kichHoat.value(Number(value));

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: !this.state.item ? 'Tạo mới' : 'Cập nhật',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.modelName = e} label='Model' readOnly={readOnly} required />
                <FormTextBox className='col-12' ref={e => this.columnName = e} label='Column' readOnly={readOnly} required />
                <FormTextBox className='col-12' ref={e => this.ten = e} label='Name' readOnly={readOnly} required />
                <FormTextBox className='col-12' ref={e => this.chuThich = e} label='Details' readOnly={readOnly} required />
                <FormCheckbox isSwitch ref={e => this.kichHoat = e} label='Active' className='col-12' multiple />
            </div>
        }
        );
    }
}

class FwSmsParameterPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/truyen-thong', () => {
            T.onSearch = (searchText) => this.props.getAllSmsParameter(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getAllSmsParameter();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa tham số', `Bạn có chắc bạn muốn xóa tham số ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteFwSmsParameter(item.id, error => {
                if (error) T.notify(error.message ? error.message : `Xoá tham số ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá tham số ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('developer', ['login', 'write']);

        const items = this.props.fwSmsParameter && this.props.fwSmsParameter.items ? this.props.fwSmsParameter.items : [];
        const table = renderTable({
            getDataSource: () => items,
            stickyHead: false,
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cột</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Model</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={`${item.ten}: ${item.chuThich}`} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.columnName || ''} />
                    <TableCell content={item.modelName || ''} />
                    <TableCell type='checkbox' permission={permission} content={item.kichHoat} onChanged={value => this.props.updateFwSmsParameter(item.id, { kichHoat: value })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-crosshairs',
            title: 'Tham số SMS',
            breadcrumb: [
                <Link key={0} to='/user/truyen-thong'>Truyền thông</Link>,
                'Tham số SMS'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission} readOnly={!permission.write} create={this.props.createFwSmsParameter} update={this.props.updateFwSmsParameter} />
            </>,
            backRoute: '/user/truyen-thong',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, fwSmsParameter: state.doiNgoai.fwSmsParameter });
const mapActionsToProps = { getAllSmsParameter, deleteFwSmsParameter, createFwSmsParameter, updateFwSmsParameter };
export default connect(mapStateToProps, mapActionsToProps)(FwSmsParameterPage);