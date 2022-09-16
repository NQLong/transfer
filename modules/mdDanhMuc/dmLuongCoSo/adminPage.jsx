import React from 'react';
import { connect } from 'react-redux';
import { getDmLuongCoSoPage, createDmLuongCoSo, updateDmLuongCoSo, deleteDmLuongCoSo } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormDatePicker } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.mucLuong.value() ? this.mucLuong.focus() : this.hieuLucTu.focus();
        }));
    }

    onShow = (item) => {
        let { ma, mucLuong, hieuLucTu, hieuLucDen, nghiDinhChinhPhu } = item ? item : { ma: null, mucLuong: '', hieuLucTu: '', hieuLucDen: '', nghiDinhChinhPhu: '' };
        this.setState({ ma, item });
        this.mucLuong.value(mucLuong);
        this.hieuLucTu.value(hieuLucTu);
        this.hieuLucDen.value(hieuLucDen ? hieuLucDen : '');
        this.nghiDinhChinhPhu.value(nghiDinhChinhPhu ? nghiDinhChinhPhu : '');
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            mucLuong: this.mucLuong.value(),
            hieuLucTu: Number(this.hieuLucTu.value()),
            hieuLucDen: Number(this.hieuLucDen.value()),
            nghiDinhChinhPhu: this.nghiDinhChinhPhu.value(),
        };
        if (changes.mucLuong == '') {
            T.notify('Mức lương cơ sở bị trống!', 'danger');
            this.mucLuong.focus();
        } else if (changes.hieuLucTu == '') {
            T.notify('Hiệu lực từ bị trống!', 'danger');
            this.hieuLucTu.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật lĩnh vực kinh doanh' : 'Tạo mới lĩnh vực kinh doanh',
            body: <div className='row'>
                <FormTextBox type='number' className='col-md-12' ref={e => this.mucLuong = e} label='Mức lương cơ sở'
                    readOnly={readOnly} required />
                <FormDatePicker type='date' className='col-md-12' ref={e => this.hieuLucTu = e} label='Hiệu lực từ'
                    readOnly={readOnly} required />
                <FormDatePicker type='date' className='col-md-12' ref={e => this.hieuLucDen = e} label='Hiệu lực đến'
                    readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.nghiDinhChinhPhu = e} label='Nghị định chính phủ'
                    readOnly={readOnly} />
            </div>
        });
    }
}

class dmLuongCoSoPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmLuongCoSoPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmLuongCoSoPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Lương cơ sở', 'Bạn có chắc bạn muốn xóa lương cơ sở này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmLuongCoSo(item.ma));
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmLuongCoSo', ['read', 'write', 'delete']);

        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmLuongCoSo && this.props.dmLuongCoSo.page ?
            this.props.dmLuongCoSo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có dữ liệu!';
        list.sort((a, b) => b.hieuLucTu - a.hieuLucTu);
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mức lương</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hiệu lực từ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hiệu lực đến</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Nghị định chính phủ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} >
                        <TableCell type='number' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' style={{ textAlign: 'right' }} content={item.mucLuong.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={T.dateToText(item.hieuLucTu, 'dd/mm/yyyy')} />
                        <TableCell type='text' content={item.hieuLucDen ? T.dateToText(item.hieuLucDen, 'dd/mm/yyyy') : ''} />
                        <TableCell type='text' content={item.nghiDinhChinhPhu ? item.nghiDinhChinhPhu : ''} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Lương cơ sở',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Lương cơ sở'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmLuongCoSoPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmLuongCoSo} update={this.props.updateDmLuongCoSo} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmLuongCoSo: state.danhMuc.dmLuongCoSo });
const mapActionsToProps = { getDmLuongCoSoPage, createDmLuongCoSo, updateDmLuongCoSo, deleteDmLuongCoSo };
export default connect(mapStateToProps, mapActionsToProps)(dmLuongCoSoPage);