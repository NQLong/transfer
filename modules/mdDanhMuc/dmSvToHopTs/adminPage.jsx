import React from 'react';
import { connect } from 'react-redux';
import { getDmSvToHopTsPage, deleteDmSvToHopTs, createDmSvToHopTs, updateDmSvToHopTs } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmSvMonThi } from '../dmSvMonThi/redux';

class EditModal extends AdminModal {

    onShow = (item) => {
        let { maToHop, mon1, mon2, mon3, ghiChu } = item ? item : { maToHop: '', mon1: '', mon2: '', mon3: '', ghiChu: '' };
        this.setState({ maToHop });
        this.maToHop.value(maToHop);
        this.mon1.value(mon1);
        this.mon2.value(mon2);
        this.mon3.value(mon3);
        this.ghiChu.value(ghiChu);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            maToHop: this.maToHop.value().trim(),
            mon1: Number(this.mon1.value()),
            mon2: Number(this.mon2.value()),
            mon3: Number(this.mon3.value()),
            ghiChu: this.ghiChu.value()
        };
        if (changes.maToHop == '') {
            T.notify('Tên không được bị trống!', 'danger');
            this.maToHop.focus();
        } else if (!changes.mon1) {
            T.notify('Môn 1 không được bị trống!', 'danger');
            this.mon1.focus();
        } else if (!changes.mon2) {
            T.notify('Môn 2 không được bị trống!', 'danger');
            this.mon2.focus();
        } else if (!changes.mon3) {
            T.notify('Môn 3 không được bị trống!', 'danger');
            this.mon3.focus();
        } else {
            this.state.maToHop ? this.props.update(changes.maToHop, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: !this.state.maToHop ? 'Tạo mới tổ hợp thi' : 'Cập nhật tổ hợp thi',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.maToHop = e} label='Mã tổ hợp' readOnly={readOnly} required />
                <FormSelect className='col-4' ref={e => this.mon1 = e} label='Môn 1' readOnly={readOnly} data={SelectAdapter_DmSvMonThi} required />
                <FormSelect className='col-4' ref={e => this.mon2 = e} label='Môn 2' readOnly={readOnly} data={SelectAdapter_DmSvMonThi} required />
                <FormSelect className='col-4' ref={e => this.mon3 = e} label='Môn 3' readOnly={readOnly} data={SelectAdapter_DmSvMonThi} required />
                <FormRichTextBox className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
            </div>
        }
        );
    }
}

class DmSvToHopTsPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.props.getDmSvToHopTsPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmSvToHopTsPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa tổ hợp thi', `Bạn có chắc bạn muốn xóa tổ hợp thi ${item.maToHop ? `<b>${item.maToHop}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmSvToHopTs(item.maNganh, error => {
                if (error) T.notify(error.message ? error.message : `Xoá tổ hợp thi ${item.maToHop} bị lỗi!`, 'danger');
                else T.alert(`Xoá tổ hợp thi ${item.maToHop} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmSvToHopTs', ['read', 'write', 'delete']);

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmSvToHopTs && this.props.dmSvToHopTs.page ?
            this.props.dmSvToHopTs.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const table = !(list && list.length > 0) ? 'Không có dữ liệu tổ hợp thi' :
            renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }} nowrap='true'>#</th>
                        <th style={{ width: '40%' }} nowrap='true'>Tổ hợp</th>
                        <th style={{ width: '20%' }} nowrap='true'>Môn 1</th>
                        <th style={{ width: '20%' }} nowrap='true'>Môn 2</th>
                        <th style={{ width: '20%' }} nowrap='true'>Môn 3</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Ghi chú</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='link' content={item.maToHop} onClick={() => this.modal.show(item)} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMon1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMon2} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMon3} />
                        <TableCell content={item.ghiChu} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmSvToHopTs(item.maToHop, { kichHoat: Number(value) })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                ),
            });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Ngành theo tổ hợp thi',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Ngành theo tổ hợp thi'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmSvToHopTsPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmSvToHopTs} update={this.props.updateDmSvToHopTs} permissions={currentPermissions} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmSvToHopTs: state.danhMuc.dmSvToHopTs });
const mapActionsToProps = { getDmSvToHopTsPage, deleteDmSvToHopTs, createDmSvToHopTs, updateDmSvToHopTs };
export default connect(mapStateToProps, mapActionsToProps)(DmSvToHopTsPage);