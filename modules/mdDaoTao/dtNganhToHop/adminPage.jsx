import React from 'react';
import { connect } from 'react-redux';
import { getDtNganhToHopPage, deleteDtNganhToHop, createDtNganhToHop, updateDtNganhToHop } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DtNganhDaoTao } from '../dtNganhDaoTao/redux';
import { SelectAdapter_DmSvToHopTs } from 'modules/mdDanhMuc/dmSvToHopTs/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';

class EditModal extends AdminModal {

    onShow = (item) => {
        let { maNganh, maToHop, kichHoat, id } = item ? item : { maNganh: '', maToHop: '', kichHoat: 1, id: null };

        this.setState({ id });
        this.maNganh.value(maNganh);
        this.maToHop.value(maToHop);
        this.kichHoat.value(Number(kichHoat));
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.maNganh.value(),
            maToHop: this.maToHop.value(),
            kichHoat: Number(this.kichHoat.value())
        };
        if (!this.state.maNganh && !this.maNganh.value()) {
            T.notify('Ngành không được trống!', 'danger');
            this.maNganh.focus();
        } else if (changes.maToHop == '') {
            T.notify('Tổ hợp thi không được bị trống!', 'danger');
            this.maToHop.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Chỉnh sửa' : 'Tạo mới',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-12' ref={e => this.maNganh = e} label='Ngành' readOnly={this.state.id ? true : readOnly} data={SelectAdapter_DtNganhDaoTao} required />
                <FormSelect className='col-12' ref={e => this.maToHop = e} label='Tổ hợp' readOnly={readOnly} data={SelectAdapter_DmSvToHopTs} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class DtNganhToHopPage extends AdminPage {
    state = { donViFilter: '' }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.props.getDtNganhToHopPage(undefined, undefined, { searchTerm: searchText || '' });
            T.showSearchBox();
            this.props.getDtNganhToHopPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa tổ hợp thi', `Bạn có chắc bạn muốn xóa tổ hợp thi ${item.tenNganh ? `<b>${item.tenNganh}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDtNganhToHop(item.maNganh, error => {
                if (error) T.notify(error.message ? error.message : `Xoá tổ hợp thi ${item.tenNganh} bị lỗi!`, 'danger');
                else T.alert(`Xoá tổ hợp thi ${item.tenNganh} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permissionNganhToHop = this.getUserPermission('dtNganhToHop'),
            permissionDaoTao = this.getUserPermission('dtChuongTrinhDaoTao', ['manage']),
            permission = {
                write: permissionNganhToHop.write || permissionDaoTao.manage,
                delete: permissionNganhToHop.delete || permissionDaoTao.manage
            };

        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtNganhToHop && this.props.dtNganhToHop.page ?
            this.props.dtNganhToHop.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: { donViFilter: this.state.donViFilter }, totalItem: 0, list: null };
        const table = !(list && list.length > 0) ? 'Không có dữ liệu tổ hợp thi' :
            renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Tên Ngành</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tổ hợp thi</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Danh sách môn thi</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maNganh} />
                        <TableCell type='link' content={item.tenNganh} onClick={() => this.modal.show(item)} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maToHop} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.tenMon1 ? item.tenMon1 + ' -' : ''} ${item.tenMon2 ? item.tenMon2 + ' -' : ''} ${item.tenMon3 || ''}`} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission} onChanged={value => this.props.updateDtNganhToHop(item.id, { kichHoat: Number(value) })} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                )
            });


        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Ngành theo tổ hợp thi',
            breadcrumb: [
                <Link key={0} to='/user/category'>Đào tạo</Link>,
                'Ngành theo tổ hợp thi'
            ],
            header: permissionNganhToHop.read && <FormSelect ref={e => this.donViFilter = e} data={SelectAdapter_DmDonViFaculty_V2} style={{ width: '400px', marginBottom: '0' }} placeholder='Chọn khoa/bộ môn' onChange={value => {
                T.clearSearchBox();
                this.setState({ donViFilter: value ? value.id : null });
                this.props.getDtNganhToHopPage(undefined, undefined, { donViFilter: value ? value.id : null, searchTerm: '' });
            }} allowClear />,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDtNganhToHopPage} />
                <EditModal ref={e => this.modal = e} permission={permission} readOnly={!permission.write} create={this.props.createDtNganhToHop} update={this.props.updateDtNganhToHop} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtNganhToHop: state.danhMuc.dtNganhToHop });
const mapActionsToProps = { getDtNganhToHopPage, deleteDtNganhToHop, createDtNganhToHop, updateDtNganhToHop };
export default connect(mapStateToProps, mapActionsToProps)(DtNganhToHopPage);