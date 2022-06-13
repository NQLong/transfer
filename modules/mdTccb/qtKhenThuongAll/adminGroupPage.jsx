import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtKhenThuongAllGroupPageMa, updateQtKhenThuongAllGroupPageMa,
    deleteQtKhenThuongAllGroupPageMa, createQtKhenThuongAllGroupPageMa,
} from './redux';

import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmKhenThuongKyHieuV2 } from 'modules/mdDanhMuc/dmKhenThuongKyHieu/redux';
import { SelectAdapter_DmKhenThuongChuThichV2 } from 'modules/mdDanhMuc/dmKhenThuongChuThich/redux';
import { getDmKhenThuongLoaiDoiTuongAll } from 'modules/mdDanhMuc/dmKhenThuongLoaiDoiTuong/redux';
import { SelectAdapter_DmBoMon } from 'modules/mdDanhMuc/dmBoMon/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

class EditModal extends AdminModal {
    state = { id: '', doiTuong: '' };
    componentDidMount() {
        this.props.getLoaiDoiTuong(items => {
            if (items) {
                this.loaiDoiTuongTable = [];
                items.forEach(item => this.loaiDoiTuongTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
    }

    onShow = (item) => {
        let { id, maLoaiDoiTuong, ma, namDatDuoc, maThanhTich, maChuThich, diemThiDua, soQuyetDinh } = item ? item : {
            id: '', maLoaiDoiTuong: '', ma: '', namDatDuoc: '', maThanhTich: '', maChuThich: '', diemThiDua: '', soQuyetDinh: ''
        };

        if (!maLoaiDoiTuong) maLoaiDoiTuong = this.props.loaiDoiTuong;
        this.setState({
            id: id, doiTuong: maLoaiDoiTuong
        });

        setTimeout(() => {
            this.loaiDoiTuong.value(maLoaiDoiTuong || '');
            if (maLoaiDoiTuong == '02') this.maCanBo.value(ma ? ma : this.props.ma);
            else if (maLoaiDoiTuong == '03') this.maDonVi.value(ma ? ma : this.props.ma);
            else if (maLoaiDoiTuong == '04') this.maBoMon.value(ma ? ma : this.props.ma);

            this.namDatDuoc.value(namDatDuoc || '');
            this.thanhTich.value(maThanhTich || '');
            this.chuThich.value(maChuThich || '');
            this.diemThiDua.value(diemThiDua);
            this.soQuyetDinh.value(soQuyetDinh || '');
        }, 100);
    };

    onSubmit = (e) => {
        e.preventDefault();
        let ma = '-1';
        if (this.loaiDoiTuong.value() == '02') ma = this.maCanBo.value();
        if (this.loaiDoiTuong.value() == '03') ma = this.maDonVi.value();
        if (this.loaiDoiTuong.value() == '04') ma = this.maBoMon.value();

        const changes = {
            loaiDoiTuong: this.loaiDoiTuong.value(),
            ma: ma,
            namDatDuoc: this.namDatDuoc.value(),
            thanhTich: this.thanhTich.value(),
            chuThich: this.chuThich.value(),
            diemThiDua: this.diemThiDua.value(),
            soQuyetDinh: this.soQuyetDinh.value(),
        };
        if (!this.loaiDoiTuong.value()) {
            T.notify('Loại đối tượng trống', 'danger');
            this.loaiDoiTuong.focus();
        } else if (!ma) {
            T.notify('Danh sách mã số trống', 'danger');
            if (this.loaiDoiTuong.value() == '02') this.maCanBo.focus();
            if (this.loaiDoiTuong.value() == '03') this.maDonVi.focus();
            if (this.loaiDoiTuong.value() == '04') this.maBoMon.focus();
        } else if (!this.thanhTich.value()) {
            T.notify('Thành tích trống', 'danger');
            this.thanhTich.focus();
        } else this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
    }

    onChangeDT = (value) => {
        this.setState({ doiTuong: value });
    }
    render = () => {
        const doiTuong = this.state.doiTuong;
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình khen thưởng' : 'Tạo mới quá trình khen thưởng',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-4' ref={e => this.loaiDoiTuong = e} label='Loại đối tượng' data={this.loaiDoiTuongTable} readOnly={true} />

                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo}
                    style={doiTuong == '02' ? {} : { display: 'none' }}
                    readOnly={true} />

                <FormSelect className='col-md-12' ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi}
                    style={doiTuong == '03' ? {} : { display: 'none' }}
                    readOnly={true} />

                <FormSelect className='col-md-12' ref={e => this.maBoMon = e} label='Bộ môn' data={SelectAdapter_DmBoMon} style={doiTuong == '04' ? {} : { display: 'none' }} readOnly={true} />

                <FormTextBox className='col-md-4' ref={e => this.soQuyetDinh = e} type='text' label='Số quyết định' readOnly={readOnly} />
                <FormSelect className='col-md-8' ref={e => this.thanhTich = e} label='Thành tích' data={SelectAdapter_DmKhenThuongKyHieuV2} readOnly={readOnly} required />
                <FormTextBox className='col-md-4' ref={e => this.namDatDuoc = e} label='Năm đạt được (yyyy)' type='year' readOnly={readOnly} />
                <FormSelect className='col-md-8' ref={e => this.chuThich = e} label='Chú thích' data={SelectAdapter_DmKhenThuongChuThichV2} readOnly={readOnly} />
                <FormTextBox className='col-md-4' ref={e => this.diemThiDua = e} type='number' label='Điểm thi đua' readOnly={readOnly} />

            </div>
        });
    }
}
class QtKhenThuongAllGroupPage extends AdminPage {
    state = { filter: { loaiDoiTuong: '-1' } };
    ma = ''; loaiDoiTuong = '-1';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            const route = T.routeMatcher('/user/tccb/qua-trinh/khen-thuong-all/groupDt/:loaiDoiTuong/:ma'),
                params = route.parse(window.location.pathname);
            this.loaiDoiTuong = params.loaiDoiTuong;
            this.ma = params.ma;
            this.setState({ filter: { loaiDoiTuong: this.loaiDoiTuong, listShcc: this.loaiDoiTuong == '02' ? this.ma : '', listDv: ''} });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            
            T.showSearchBox(() => {
                let filterCookie = T.getCookiePage('groupPageMaQtKhenThuongAll', 'F'), {
                    fromYear = null, toYear = null, listThanhTich = ''
                } = filterCookie;
                fromYear && this.fromYear.value(fromYear);
                toYear && this.toYear.value(toYear);
                this.listThanhTich.value(listThanhTich);
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.qtKhenThuongAll && this.props.qtKhenThuongAll.pageMa ? this.props.qtKhenThuongAll.pageMa : { pageNumber: 1, pageSize: 50, pageCondition: {}};

        if (pageCondition && (typeof pageCondition == 'string')) T.setTextSearchBox(pageCondition);

        const fromYear = this.fromYear.value() == '' ? null : Number(this.fromYear.value());
        const toYear = this.toYear.value() == '' ? null : Number(this.toYear.value());
        const loaiDoiTuong = this.state.filter.loaiDoiTuong;
        const listShcc = this.state.filter.listShcc;
        const listDv = this.state.filter.listDv;
        const listThanhTich = this.listThanhTich.value().toString() || '';
        const pageFilter = (isInitial || isReset) ? { listShcc, listDv, loaiDoiTuong } : { fromYear, toYear, loaiDoiTuong, listDv, listShcc, listThanhTich };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const filter = page.filter || { listShcc, listDv, loaiDoiTuong };
                    const filterCookie = T.getCookiePage('groupPageMaQtKhenThuongAll', 'F');
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });

                    this.fromYear.value(filter.fromYear || filterCookie.fromYear || '');
                    this.toYear.value(filter.toYear || filterCookie.toYear || '');
                    this.listThanhTich.value(filter.listThanhTich || filterCookie.listThanhTich || '');
                    if (this.fromYear.value() || this.toYear.value() || this.listThanhTich.value()) this.showAdvanceSearch();
                } else if (isReset) {
                    this.fromYear.value('');
                    this.toYear.value('');
                    this.listThanhTich.value('');
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtKhenThuongAllGroupPageMa(pageN, pageS, pageC, this.state.filter, done);

    }
    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa khen thưởng', 'Bạn có chắc bạn muốn xóa khen thưởng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKhenThuongAllGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá khen thưởng bị lỗi!', 'danger');
                else T.alert('Xoá khen thưởng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtKhenThuongAll', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtKhenThuongAll && this.props.qtKhenThuongAll.pageMa ? this.props.qtKhenThuongAll.pageMa : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại đối tượng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cá nhân</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tập thể</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm đạt được</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Thành tích</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                        <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>Điểm thi đua</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.tenLoaiDoiTuong} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            item.maLoaiDoiTuong == '02' ?
                                <>
                                    <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                                    {item.maCanBo}
                                </>
                                : item.maLoaiDoiTuong == '04' ? item.tenBoMon : ''

                        )} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            item.maLoaiDoiTuong == '01' ? 'Trường Đại học Khoa học Xã hội và Nhân Văn, TP. HCM'
                                : item.maLoaiDoiTuong == '02' ? item.tenDonViCanBo
                                    : item.maLoaiDoiTuong == '03' ? item.tenDonVi
                                        : item.tenDonViBoMon
                        )} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(item.namDatDuoc)} />
                        <TableCell type='text' content={(item.tenThanhTich)} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(item.soQuyetDinh || '')} />
                        <TableCell type='text' style={{ textAlign: 'right' }} content={item.diemThiDua} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-gift',
            title: 'Quá trình khen thưởng - ' + (this.loaiDoiTuong == '01' ? 'Trường' :
                this.loaiDoiTuong == '02' ? 'Cán bộ' :
                    this.loaiDoiTuong == '03' ? 'Đơn vị' :
                        'Bộ môn'),
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={0} to='/user/tccb/qua-trinh/khen-thuong/all'>Quá trình khen thưởng</Link>,
                'Quá trình khen thưởng - ' + (this.loaiDoiTuong == '01' ? 'Trường' :
                    this.loaiDoiTuong == '02' ? 'Cán bộ' :
                        this.loaiDoiTuong == '03' ? 'Đơn vị' :
                            'Bộ môn')
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormTextBox className='col-md-2' ref={e => this.fromYear = e} label='Năm đạt được (yyyy)' type='year' />
                    <FormTextBox className='col-md-2' ref={e => this.toYear = e} label='Năm đạt được (yyyy)' type='year' />
                    <FormSelect className='col-12 col-md-8' multiple ref={e => this.listThanhTich = e} label='Thành tích' data={SelectAdapter_DmKhenThuongKyHieuV2} allowClear minimumResultsForSearch={-1} />
                    <div className='form-group col-12' style={{ justifyContent: 'end', display: 'flex' }}>
                        <button className='btn btn-danger' style={{ marginRight: '10px' }} type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch(null, true)}>
                            <i className='fa fa-fw fa-lg fa-times' />Xóa bộ lọc
                        </button>
                        <button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                            <i className='fa fa-fw fa-lg fa-search-plus' />Tìm kiếm
                        </button>
                    </div>
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <div style={{ marginBottom: '10px' }}>Tìm thấy: <b>{totalItem}</b> kết quả.</div>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtKhenThuongAllGroupPageMa} update={this.props.updateQtKhenThuongAllGroupPageMa}
                    permissions={currentPermissions} ma={this.ma} loaiDoiTuong={this.loaiDoiTuong}
                    getLoaiDoiTuong={this.props.getDmKhenThuongLoaiDoiTuongAll}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/khen-thuong-all',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onExport: (e) => {
                e.preventDefault();
                const filter = T.stringify(this.state.filter);

                T.download(T.url(`/api/qua-trinh/khen-thuong-all/download-excel/${filter}`), 'khenthuong.xlsx');
            }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtKhenThuongAll: state.tccb.qtKhenThuongAll });
const mapActionsToProps = {
    getQtKhenThuongAllGroupPageMa, deleteQtKhenThuongAllGroupPageMa, createQtKhenThuongAllGroupPageMa,
    updateQtKhenThuongAllGroupPageMa, getDmKhenThuongLoaiDoiTuongAll,
};
export default connect(mapStateToProps, mapActionsToProps)(QtKhenThuongAllGroupPage);