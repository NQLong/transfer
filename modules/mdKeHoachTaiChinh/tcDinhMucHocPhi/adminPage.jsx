import React from 'react';
import { connect } from 'react-redux';
import { getTcDinhMucHocPhiPage, createTcDinhMucHocPhi, updateTcDinhMucHocPhi, deleteTcDinhMucHocPhi } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_TcLoaiPhi } from 'modules/mdKeHoachTaiChinh/tcLoaiPhi/redux';
import { getDmSvLoaiHinhDaoTaoAll } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';

const dataHocKy = [
    { id: 1, text: 'Học kỳ 1'},
    { id: 2, text: 'Học kỳ 2'},
    { id: 3, text: 'Học kỳ 3'}
];

class EditModal extends AdminModal {
    state = { showDetail: false, isNew: true, listDinhMuc: [] }
    soTien = [];
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.namBatDau.focus();
        }));
    }

    onShow = (item) => {
        let { namBatDau, namKetThuc, hocKy, loaiPhi, soTienMacDinh } = item ? item : { namBatDau: '', namKetThuc: '', hocKy: null, loaiPhi: null, soTienMacDinh: ''};

        this.namBatDau.value(namBatDau);
        this.namKetThuc.value(namKetThuc);
        this.hocKy.value(hocKy);
        this.loaiPhi.value(loaiPhi);
        this.soTien.value(soTienMacDinh);
        this.setState({ isNew: item ? false : true, item, showDetail: false, listDinhMuc: item && item.loaiDaoTao ? item.loaiDaoTao : [] });
    };

    onSubmit = (e) => {
        e.preventDefault();
        

        if (this.state.showDetail) {
            const changes = {
                namBatDau: this.namBatDau.value(),
                namKetThuc: this.namKetThuc.value(),
                hocKy: this.hocKy.value(),
                loaiPhi: this.loaiPhi.value(),
                soTienMacDinh: this.soTien.value()
            };
            let loaiDaoTao = [],
                listDinhMuc = this.state.listDinhMuc ? this.state.listDinhMuc : [], 
                dinhMucMapping = {};
            listDinhMuc.forEach(item => dinhMucMapping[item.loaiDaoTao] = item.ma);
            
            this.props.loaiDaoTao.forEach(item => {
                loaiDaoTao.push({
                    ma: dinhMucMapping[item.ma],
                    loaiDaoTao: item.ma, 
                    soTien: this[item.ma].value()
                });
            });
            changes.loaiDaoTao = loaiDaoTao;

            if (changes.namBatDau == '') {
                T.notify('Năm bắt đầu không được trống!', 'danger');
                this.namBatDau.focus();
            } else if (changes.namKetThuc == '') {
                T.notify('Năm kết thúc không được trống!', 'danger');
                this.namKetThuc.focus();
            } else if (changes.hocKy == '') {
                T.notify('Học kỳ không được trống!', 'danger');
                this.hocKy.focus();
            } else if (changes.loaiPhi == '') {
                T.notify('Loại phí không được trống!', 'danger');
                this.loaiPhi.focus();
            } else {
                !this.state.isNew ? this.props.update(this.state.ma, changes, this.hide) :
                    this.props.create(changes, this.hide);
            }
        } else {
            let soTienMacDinh = this.soTien.value();
            if (!soTienMacDinh || soTienMacDinh == '') { 
                T.notify('Số tiền mặc định trống!', 'danger');
                this.soTien.focus();
            } else {
                let listDinhMuc = this.state.listDinhMuc ? this.state.listDinhMuc : [], 
                    dinhMucMapping = {};
                listDinhMuc.forEach(item => dinhMucMapping[item.loaiDaoTao] = item.soTien);
                this.setState({ showDetail: true }, () => {
                    this.props.loaiDaoTao.forEach((item) => {
                        this[item.ma].value(dinhMucMapping[item.ma] ? dinhMucMapping[item.ma] : soTienMacDinh);
                    });
                });
            }
        }
        
    };

    renderListLoaiDaoTao = (loaiDaoTao) => {
        return loaiDaoTao.map((item, index) => (
            <div key={index} className='col-6'>
                <div className='row'>
                    <div className='col-6'>{item.ten}</div>
                    <FormTextBox type='number' className='col-md-6' ref={e => this[item.ma] = e} label='' placeholder='Số tiền (VNĐ)'/>
                </div>
            </div>
        ));
    }

    render = () => {
        const readOnly = this.props.readOnly,
            loaiDaoTao = this.props.loaiDaoTao;

        return this.renderModal({
            title: this.state.ma ? 'Cập nhật định mức học phí' : 'Tạo mới định mức học phí',
            size: 'large',
            body: <>
                <div className='row'>
                    <FormTextBox type='year' className='col-md-4' ref={e => this.namBatDau = e} label='Năm bắt đầu' placeholder='Năm bắt đầu' min={1} max={9999} readOnly={readOnly} required />
                    <FormTextBox type='year' className='col-md-4' ref={e => this.namKetThuc = e} label='Năm kết thúc' placeholder='Năm kết thúc' min={1} max={9999} readOnly={readOnly} required />
                    <FormSelect className='col-md-4' ref={e => this.hocKy = e} label='Học kỳ' data={dataHocKy} required/>
                    <FormSelect className='col-md-4' ref={e => this.loaiPhi = e} label='Loại phí' data={SelectAdapter_TcLoaiPhi} required/>
                    <FormTextBox type='number' className='col-md-4' ref={e => this.soTien = e} label='Số tiền mặc định (VNĐ)' required/>
                </div>
                {this.state.showDetail ? <div className='row'>
                    <h5 className='col-12'>Định mức cho từng loại hình đào tạo (VNĐ)</h5>
                    {this.renderListLoaiDaoTao(loaiDaoTao)}
                </div> : ''}
            </>,
            submitText: this.state.showDetail ? 'Lưu' : 'Chi tiết'
        });
    }
}

class TcDinhMucHocPhiAdminPage extends AdminPage {
    state = { searching: false, filter: {}, loaiDaoTao: [] };

    componentDidMount() {
        T.ready('/user/finance/loai-phi', () => {
            // T.onSearch = (searchText) => this.props.getTcDinhMucHocPhiPage(undefined, undefined, searchText || '', this.state.filter);
            // T.showSearchBox();
            T.showSearchBox(() => {
                this.searchNamBatDau?.value('');
                this.searchNamKetThuc?.value('');
                this.searchHocKy?.value('');
                this.searchLoaiPhi?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.props.getTcDinhMucHocPhiPage(undefined, undefined, '', this.state.filter);
            this.props.getDmSvLoaiHinhDaoTaoAll(items => {
                this.setState({ loaiDaoTao: items });
            });
            this.changeAdvancedSearch(true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa định mức học phí', 'Bạn có chắc bạn muốn xóa định mức học phí này ?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteTcDinhMucHocPhi(item.loaiDaoTao.map(dtItem => dtItem.ma));
        });
        e.preventDefault();
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.tcDinhMucHocPhi && this.props.tcDinhMucHocPhi.page ? this.props.tcDinhMucHocPhi.page : { pageNumber: 1, pageSize: 50 };
        const namBatDau = this.searchNamBatDau.value().toString() || '';
        const namKetThuc = this.searchNamKetThuc.value().toString() || '';
        const hocKy = this.searchHocKy.value() || '';
        const loaiPhi = this.searchLoaiPhi.value() || '';
        const pageFilter = isInitial ? null : { namBatDau, namKetThuc, hocKy, loaiPhi };
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
                    <th style={{ width: '30%', textAlign: 'center' }} nowrap='true'>Học kỳ</th>
                    <th style={{ width: '70%', textAlign: 'center' }} nowrap='true'>Loại phí</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={pageSize*(pageNumber - 1) + index + 1} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap'}} content={`${item.namBatDau} - ${item.namKetThuc}`} onClick={() => this.modal.show(item)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap'}} content={`Học kì ${item.hocKy}`} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.tenLoaiPhi} />
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
                    <FormSelect className='col-md-4' ref={e => this.searchHocKy = e} label='Học kỳ' data={dataHocKy}/>
                    <FormSelect className='col-md-4' ref={e => this.searchLoaiPhi = e} label='Loại phí' data={SelectAdapter_TcLoaiPhi}/>
                    <div className='col-12 text-right'>
                        <button className='btn btn-primary' onClick={() => this.changeAdvancedSearch()}>Tìm kiếm</button>
                    </div>
                </div>
            </>,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getTcDinhMucHocPhiPage} />
                <EditModal ref={e => this.modal = e}
                    create={this.props.createTcDinhMucHocPhi} update={this.props.updateTcDinhMucHocPhi} readOnly={!permission.write} loaiDaoTao={this.state.loaiDaoTao}/>
            </>,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcDinhMucHocPhi: state.finance.tcDinhMucHocPhi });
const mapActionsToProps = { getTcDinhMucHocPhiPage, createTcDinhMucHocPhi, updateTcDinhMucHocPhi, deleteTcDinhMucHocPhi, getDmSvLoaiHinhDaoTaoAll };
export default connect(mapStateToProps, mapActionsToProps)(TcDinhMucHocPhiAdminPage);