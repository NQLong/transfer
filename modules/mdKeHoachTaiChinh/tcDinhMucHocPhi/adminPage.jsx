import React from 'react';
import { connect } from 'react-redux';
import { getTcDinhMucHocPhiPage, createTcDinhMucHocPhi, updateTcDinhMucHocPhi, deleteTcDinhMucHocPhi } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_TcLoaiPhi } from 'modules/mdKeHoachTaiChinh/tcLoaiPhi/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';

const dataHocKy = [
    { id: 1, text: 'Học kỳ 1' },
    { id: 2, text: 'Học kỳ 2' },
    { id: 3, text: 'Học kỳ 3' }
];

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.namHoc.focus();
        }));
    }

    onShow = (item) => {
        let { ma, namBatDau, namKetThuc, hocKy, loaiPhi, soTien, loaiDaoTao } = item ? item : { ma: null, namBatDau: '', namKetThuc: '', hocKy: null, loaiPhi: null, soTien: '', loaiDaoTao: null };

        this.namBatDau.value(namBatDau);
        this.namKetThuc.value(namKetThuc);
        this.hocKy.value(hocKy);
        this.loaiPhi.value(loaiPhi);
        this.loaiDaoTao.value(loaiDaoTao);
        this.soTien.value(soTien);
        this.setState({ ma, item });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            namBatDau: this.namBatDau.value(),
            namKetThuc: this.namKetThuc.value(),
            hocKy: this.hocKy.value(),
            loaiPhi: this.loaiPhi.value(),
            loaiDaoTao: this.loaiDaoTao.value(),
            soTien: this.soTien.value()
        };
        if (changes.namHoc == '') {
            T.notify('Năm học không được trống!', 'danger');
            this.namHoc.focus();
        } else if (changes.hocKy == '') {
            T.notify('Học kỳ không được trống!', 'danger');
            this.hocKy.focus();
        } else if (changes.loaiPhi == '') {
            T.notify('Loại phí không được trống!', 'danger');
            this.loaiPhi.focus();
        } else if (changes.loaiDaoTao == '') {
            T.notify('Loại hình đào tạo không được trống!', 'danger');
            this.loaiDaoTao.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) :
                this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật định mức học phí' : 'Tạo mới định mức học phí',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='year' className='col-md-3' ref={e => this.namBatDau = e} label='Năm học (bắt đầu)' readOnly={readOnly} required />
                <FormTextBox type='year' className='col-md-3' ref={e => this.namKetThuc = e} label='Năm học (kết thúc)' readOnly={readOnly} required />
                <FormSelect className='col-md-4' ref={e => this.hocKy = e} label='Học kỳ' data={dataHocKy} required />
                <FormSelect className='col-md-4' ref={e => this.loaiPhi = e} label='Loại phí' data={SelectAdapter_TcLoaiPhi} required />
                <FormSelect className='col-md-4' ref={e => this.loaiDaoTao = e} label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} required />
                <FormTextBox className='col-md-4' ref={e => this.soTien = e} label='Số tiền (VNĐ)' />
            </div>
        });
    }
}

class TcDinhMucHocPhiAdminPage extends AdminPage {
    state = { searching: false, filter: {} };

    componentDidMount() {
        T.ready('/user/finance/loai-phi', () => {
            T.onSearch = (searchText) => this.props.getTcDinhMucHocPhiPage(undefined, undefined, searchText || '', this.state.filter);
            T.showSearchBox();
            T.showSearchBox(() => {
                this.searchNamBatDau?.value('');
                this.searchNamKetThuc?.value('');
                this.searchHocKy?.value('');
                this.searchLoaiPhi?.value('');
                this.searchLoaiDaoTao?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.props.getTcDinhMucHocPhiPage(undefined, undefined, '', this.state.filter);
            this.changeAdvancedSearch(true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa định mức học phí', 'Bạn có chắc bạn muốn xóa loại phí này ?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteTcDinhMucHocPhi(item.ma);
        });
        e.preventDefault();
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.tcDinhMucHocPhi && this.props.tcDinhMucHocPhi.page ? this.props.tcDinhMucHocPhi.page : { pageNumber: 1, pageSize: 50 };
        const namBatDau = this.searchNamBatDau.value().toString() || '';
        const namKetThuc = this.searchNamKetThuc.value().toString() || '';
        const hocKy = this.searchHocKy.value() || '';
        const loaiPhi = this.searchLoaiPhi.value() || '';
        const loaiDaoTao = this.searchLoaiDaoTao.value() || '';
        const pageFilter = isInitial ? null : { namBatDau, namKetThuc, hocKy, loaiPhi, loaiDaoTao };
        this.setState({ filter: pageFilter }, () => {
            this.props.getTcDinhMucHocPhiPage(pageNumber, pageSize, '', this.state.filter, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    let { namBatDau, namKetThuc, hocKy, loaiPhi, loaiDaoTao } = filter;
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.searchNamBatDau?.value(filter.namBatDau || '');
                    this.searchNamKetThuc?.value(filter.namKetThuc || '');
                    this.searchHocKy?.value(filter.hocKy || '');
                    this.searchLoaiPhi?.value(filter.loaiPhi || '');
                    this.searchLoaiDaoTao?.value(filter.loaiDaoTao || '');

                    if (!$.isEmptyObject(filter) && filter && ({ namBatDau, namKetThuc, hocKy, loaiPhi, loaiDaoTao })) this.showAdvanceSearch();
                }
            });
        });
    }


    render() {
        const permission = this.getUserPermission('tcDinhMucHocPhi', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcDinhMucHocPhi && this.props.tcDinhMucHocPhi.page ?
            this.props.tcDinhMucHocPhi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu loại phí',
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }} nowrap='true'>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Năm học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Học kỳ</th>
                    <th style={{ width: '50%', textAlign: 'center' }} nowrap='true'>Loại hình đào tạo</th>
                    <th style={{ width: '50%', textAlign: 'center' }} nowrap='true'>Loại phí</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền (VNĐ)</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={pageSize * (pageNumber - 1) + index + 1} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={`${item.namBatDau} - ${item.namKetThuc}`} onClick={() => this.modal.show(item)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={`Học kì ${item.hocKy}`} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.tenLoaiDaoTao} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.tenLoaiPhi} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.soTien} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete}></TableCell>
                </tr>
            )

        });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Định mức học phí',
            breadcrumb: [
                'Định mức học phí'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormTextBox type='year' className='col-md-3' ref={e => this.searchNamBatDau = e} label='Năm bắt đầu' placeholder='Năm bắt đầu' />
                    <FormTextBox type='year' className='col-md-3' ref={e => this.searchNamKetThuc = e} label='Năm kết thúc' placeholder='Năm kết thúc' />
                    <FormSelect className='col-md-4' ref={e => this.searchHocKy = e} label='Học kỳ' data={dataHocKy} />
                    <FormSelect className='col-md-4' ref={e => this.searchLoaiPhi = e} label='Loại phí' data={SelectAdapter_TcLoaiPhi} />
                    <FormSelect className='col-md-4' ref={e => this.searchLoaiDaoTao = e} label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} />
                    <div className='col-12 text-right'>
                        <button className='btn btn-primary' onClick={() => this.changeAdvancedSearch()}>Tìm kiếm</button>
                    </div>
                </div>
            </>,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getTcDinhMucHocPhiPage} />
                <EditModal ref={e => this.modal = e}
                    create={this.props.createTcDinhMucHocPhi} update={this.props.updateTcDinhMucHocPhi} readOnly={!permission.write} />
            </>,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcDinhMucHocPhi: state.finance.tcDinhMucHocPhi });
const mapActionsToProps = { getTcDinhMucHocPhiPage, createTcDinhMucHocPhi, updateTcDinhMucHocPhi, deleteTcDinhMucHocPhi };
export default connect(mapStateToProps, mapActionsToProps)(TcDinhMucHocPhiAdminPage);