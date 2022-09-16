import React from 'react';
import { connect } from 'react-redux';
import { dtDmThoiGianDaoTaoGetAll, deleteDtDmThoiGianDaoTao, createDtDmThoiGianDaoTao, updateDtDmThoiGianDaoTao } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox, getValue } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    onShow = (item) => {
        let { soNam, kichHoat = 1 } = item || {};
        this.soNam.value(soNam || '');
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            soNam: getValue(this.soNam),
            kichHoat: Number(getValue(this.kichHoat))
        };
        this.props.create(changes, this.hide);
    };

    changeKichHoat = value => this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.item ? 'Tạo mới' : 'Cập nhật',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='number' step={1} className='col-12' ref={e => this.soNam = e} label='Số năm' readOnly={readOnly} required />
                <FormCheckbox isSwitch={true} className='col-12' ref={e => this.kichHoat = e} label='Kích hoạt' readOnly={readOnly} required onChange={this.changeKichHoat} />
            </div>
        }
        );
    }
}

class DmKhoiKienThucPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.props.dtDmThoiGianDaoTaoGetAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.dtDmThoiGianDaoTaoGetAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thời gian đào tạo', `Bạn có chắc bạn muốn xóa thời gian đào tạo ${item.ten ? `<b>${item.ten}</b> năm` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDtDmThoiGianDaoTao(item.soNam, error => {
                if (error) T.notify(error.message ? error.message : `Xoá thời gian đào tạo ${item.ten} năm bị lỗi!`, 'danger');
                else T.alert(`Xoá thời gian đào tạo ${item.ten} năm thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('dtDmThoiGianDaoTao', ['read', 'write', 'delete']);

        const items = this.props.dtDmThoiGianDaoTao?.items || [];
        const table = renderTable({
            getDataSource: () => items,
            stickyHead: false,
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Số năm</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='link' content={`${item.soNam} năm`} onClick={() => this.modal.show(item)} />

                    <TableCell type='checkbox' permission={permission} content={item.kichHoat} onChanged={value => this.props.updateDtDmThoiGianDaoTao(item.soNam, { kichHoat: Number(value) })} />
                    <TableCell type='buttons' content={item} permission={permission} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Thời gian đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Thời gian đào tạo'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission} readOnly={!permission.write} create={this.props.createDtDmThoiGianDaoTao} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmThoiGianDaoTao: state.daoTao.dtDmThoiGianDaoTao });
const mapActionsToProps = { dtDmThoiGianDaoTaoGetAll, deleteDtDmThoiGianDaoTao, createDtDmThoiGianDaoTao, updateDtDmThoiGianDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DmKhoiKienThucPage);