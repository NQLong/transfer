import React from 'react';
import { connect } from 'react-redux';
import { getTccbNhomDanhGiaNhiemVuPage, createTccbNhomDanhGiaNhiemVu, updateTccbNhomDanhGiaNhiemVu, deleteTccbNhomDanhGiaNhiemVu } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, AdminModal, FormTextBox, FormCheckbox, getValue } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() =>
            this.ten.focus()
        ));
    }

    onShow = (item) => {
        let { ten, ghiChu, nam, kichHoat } = item ? item : { ten: '', nam: 0, ghiChu: '', kichHoat: 0 };
        this.setState({ item });
        this.ten.value(ten);
        this.ghiChu.value(ghiChu);
        this.nam.value(nam ? Number(nam) : '');
        this.kichHoat.value(kichHoat ? Number(kichHoat) : 1);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: getValue(this.ten),
            ghiChu: getValue(this.ghiChu),
            nam: Number(getValue(this.nam)),
            kichHoat: getValue(this.kichHoat)
        };
        if (!this.state.item) {
            this.props.createTccbNhomDanhGiaNhiemVu(changes, this.hide);
        } else {
            this.props.updateTccbNhomDanhGiaNhiemVu(this.state.item.id, changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(Number(value));

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.item ? 'Cập nhật nhóm đánh giá' : 'Tạo mới nhóm đánh giá',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormTextBox className='col-12' ref={e => this.ghiChu = e} label='Ghi Chú' readOnly={readOnly} placeholder='Ghi chú' />
                <FormTextBox type='year' ref={e => this.nam = e} label='Năm' className='col-12' required readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
                    onChange={value => this.changeKichHoat(value)} required />
            </div>
        });
    }
}

class TccbNhomDanhGiaNhiemVuPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.showSearchBox();
            this.props.getTccbNhomDanhGiaNhiemVuPage(undefined, undefined, { searchTerm: '' });
        });
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa nhóm đánh giá', 'Bạn có chắc bạn muốn xóa nhóm đánh giá này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbNhomDanhGiaNhiemVu(item.id));
    }

    render() {
        const permission = this.getUserPermission('tccbDanhGiaNam');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tccbNhomDanhGiaNhiemVu && this.props.tccbNhomDanhGiaNhiemVu.page ?
            this.props.tccbNhomDanhGiaNhiemVu.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu nhóm đánh giá',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ghi chú</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'center' }} content={item.ten} />
                    <TableCell style={{ textAlign: 'center' }} content={item.ghiChu} />
                    <TableCell style={{ textAlign: 'center' }} content={item.nam} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateTccbNhomDanhGiaNhiemVu(item.id, { kichHoat: Number(value) })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Nhóm đánh giá nhiệm vụ',
            breadcrumb: [
                <Link key={0} to='/user/tccb/'>Tổ chức cán bộ</Link>,
                'Nhóm đánh giá nhiệm vụ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmSvKhuVucTuyenSinhPage} />
                <EditModal ref={e => this.modal = e}
                    createTccbNhomDanhGiaNhiemVu={this.props.createTccbNhomDanhGiaNhiemVu}
                    updateTccbNhomDanhGiaNhiemVu={this.props.updateTccbNhomDanhGiaNhiemVu}
                    readOnly={!permission.write} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? () => this.modal.show(null) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbNhomDanhGiaNhiemVu: state.tccb.tccbNhomDanhGiaNhiemVu });
const mapActionsToProps = { getTccbNhomDanhGiaNhiemVuPage, createTccbNhomDanhGiaNhiemVu, updateTccbNhomDanhGiaNhiemVu, deleteTccbNhomDanhGiaNhiemVu };
export default connect(mapStateToProps, mapActionsToProps)(TccbNhomDanhGiaNhiemVuPage);