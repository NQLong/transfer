import React from 'react';
import { connect } from 'react-redux';
import { getTcLoaiPhiPage, createTcLoaiPhi, updateTcLoaiPhi, deleteTcLoaiPhi } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { id, ten, kichHoat } = item ? item : { id: '', ten: '', kichHoat: 1 };

        this.setState({ id, item });
        this.ten.value(ten);
        this.kichHoat.value(kichHoat ? 1 : 0);


    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (changes.ten == '') {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) :
                this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật loại phí' : 'Tạo mới loại phí',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên loại phí' placeholder='Tên loại phí' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class tcLoaiPhiAdminPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/finance/loai-phi', () => {
            T.onSearch = (searchText) => this.props.getTcLoaiPhiPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getTcLoaiPhiPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa loại phí', `Bạn có chắc bạn muốn xóa loại phí ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteTcLoaiPhi(item.id, error => {
                if (error) T.notify(error.message ? error.message : `Xoá loại phí ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá loại phí ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }


    render() {
        const permission = this.getUserPermission('tcLoaiPhi', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcLoaiPhi && this.props.tcLoaiPhi.page ?
            this.props.tcLoaiPhi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu loại phí',
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>Mã</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell type='link' content={item.ten ? item.ten : ''} onClick={() => this.modal.show(item)} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateTcLoaiPhi(item.id, { kichHoat: value ? 1 : 0, })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete}></TableCell>
                </tr>
            )

        });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Loại phí',
            breadcrumb: [
                'Loại phí'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getTcLoaiPhiPage} />
                <EditModal ref={e => this.modal = e}
                    create={this.props.createTcLoaiPhi} update={this.props.updateTcLoaiPhi} readOnly={!permission.write} />
            </>,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcLoaiPhi: state.finance.tcLoaiPhi });
const mapActionsToProps = { getTcLoaiPhiPage, createTcLoaiPhi, updateTcLoaiPhi, deleteTcLoaiPhi };
export default connect(mapStateToProps, mapActionsToProps)(tcLoaiPhiAdminPage);