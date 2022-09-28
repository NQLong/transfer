import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getSdhDmKhoiKienThucPage, deleteSdhDmKhoiKienThuc, createSdhDmKhoiKienThuc, updateSdhDmKhoiKienThuc, SelectAdapter_SdhDmKhoiKienThucAll } from './redux';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ma.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, khoiCha } = item ? item : { ma: '', ten: '', khoiCha: '' };

        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.khoiCha.value(khoiCha);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            khoiCha: this.khoiCha.value()
        };
        if (changes.ma == '') {
            T.notify('mã không được bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên không được bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.item ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.item ? 'Tạo mới' : 'Cập nhật khối kiến thức',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.item} required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
                <FormSelect data={SelectAdapter_SdhDmKhoiKienThucAll()} className='col-12' ref={e => this.khoiCha = e} label='Khối cha' readOnly={readOnly} placeholder='Khối cha' />
            </div>
        }
        );
    }
}

class SdhDmKhoiKienThucPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc');
        T.onSearch = (searchText) => this.props.getSdhDmKhoiKienThucPage(undefined, undefined, searchText || '');
        T.showSearchBox();
        this.props.getSdhDmKhoiKienThucPage();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa khối kiến thức', `Bạn có chắc bạn muốn xóa khối kiến thức ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSdhDmKhoiKienThuc(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá khối kiến thức ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá khối kiến thức ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('sdhDmKhoiKienThuc', ['write', 'delete']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sdhDmKhoiKienThuc && this.props.sdhDmKhoiKienThuc.page ?
            this.props.sdhDmKhoiKienThuc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const table = renderTable({
            getDataSource: () => list,
            stickyHead: false,
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '50%' }}>Tên</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Khối cha</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' style={{ textAlign: 'center' }} content={item.ma} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.ten} />
                    <TableCell content={item.tenKhoiCha || ''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-crosshairs',
            title: 'Khối kiến thức',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                'Khối kiến thức'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getSdhDmKhoiKienThucPage} />
                <EditModal ref={e => this.modal = e} permission={permission} readOnly={!permission.write} create={this.props.createSdhDmKhoiKienThuc} update={this.props.updateSdhDmKhoiKienThuc} />
            </>,
            backRoute: '/user/sau-dai-hoc',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhDmKhoiKienThuc: state.sdh.sdhDmKhoiKienThuc });
const mapActionsToProps = { getSdhDmKhoiKienThucPage, deleteSdhDmKhoiKienThuc, createSdhDmKhoiKienThuc, updateSdhDmKhoiKienThuc };
export default connect(mapStateToProps, mapActionsToProps)(SdhDmKhoiKienThucPage);