import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormSelect, FormTextBox, getValue, renderTable, TableCell, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';
import { SelectAdapter_TcLoaiPhi } from '../tcLoaiPhi/redux';
import { getTcHocPhiPage, updateHocPhi, getHocPhi, createMultipleHocPhi } from './redux';
import CountUp from 'view/js/countUp';
import { Link } from 'react-router-dom';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';

class NumberIcon extends React.Component {
    componentDidMount() {
        setTimeout(() => {
            const endValue = this.props.value ? parseInt(this.props.value) : 0;
            new CountUp(this.valueElement, 0, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
        }, 100);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value)
            setTimeout(() => {
                const endValue = this.props.value ? parseInt(this.props.value) : 0;
                new CountUp(this.valueElement, prevProps.value, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
            }, 100);
    }

    render() {
        let isShow = true;
        if (this.props.isShowValue != undefined) {
            if (this.props.isShowValue == false) isShow = false;
        }
        const content = (
            <div className={'widget-small coloured-icon ' + this.props.type}>
                <i className={'icon fa fa-3x ' + this.props.icon} />
                <div className='info'>
                    <h4>
                        {this.props.title}
                    </h4>
                    {isShow && <p style={{ fontWeight: 'bold' }} ref={e => this.valueElement = e} />}
                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

class Detail extends AdminModal {
    onShow = (item) => {
        let { mssv, namHoc, hocKy } = item;
        this.props.getHocPhi(mssv, result => {
            this.setState({ hocPhiDetail: result.hocPhiDetail || [], mssv, hocKy, namHoc });
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const { isChanged, hocPhiDetail } = this.state;
        if (!isChanged) {
            T.notify('Không có sự thay đổi nào', 'danger');
        } else {
            this.props.create(hocPhiDetail, () => {
                T.notify('Cập nhật học phí hiện tại thành công', 'success');
                this.hide();
            });

        }
    }

    onAdd = (e) => {
        e.preventDefault();
        let { mssv, namHoc, hocKy, hocPhiDetail } = this.state;
        try {
            const data = {
                mssv, namHoc, hocKy,
                loaiPhi: getValue(this.loaiPhi),
                soTien: getValue(this.soTien),
                tenLoaiPhi: this.loaiPhi.data().text,
                ngayTao: Date.now()
            };
            if (hocPhiDetail.some(item => item.loaiPhi == data.loaiPhi)) {
                T.confirm('Đã tồn tại loại phí này', 'Bạn có muốn ghi đè số tiền hiện tại không?', 'warning', true, isConfirm => {
                    if (isConfirm) {
                        T.notify('Ghi đè thành công!', 'success');
                        hocPhiDetail.map(item => {
                            if (item.loaiPhi == data.loaiPhi) item.soTien = parseInt(data.soTien);
                            item.ngayTao = data.ngayTao;
                            return item;
                        });
                        this.setState({ hocPhiDetail, isChanged: true });
                        this.loaiPhi.clear();
                        this.soTien.value('');
                    }
                });
            }
            else {
                this.setState({ hocPhiDetail: [...this.state.hocPhiDetail, data], isChanged: true });
                this.loaiPhi.clear();
                this.soTien.value('');
            }
        } catch (input) {
            T.notify(`${input?.props?.label || 'Dữ liệu'} bị trống`, 'danger');
            input.focus();
        }
    }

    render = () => {
        const style = (width = 'auto', textAlign = 'left') => ({ width, textAlign, whiteSpace: 'nowrap', backgroundColor: '#1b489f', color: '#fff' }),
            hocPhiDetail = this.state.hocPhiDetail;
        let table = renderTable({
            emptyTable: 'Không có dữ liệu học phí',
            header: 'thead-light',
            size: 'medium',
            getDataSource: () => hocPhiDetail,
            renderHead: () => (
                <tr>
                    <th style={style()}>STT</th>
                    <th style={style('100%')}>Loại phí</th>
                    <th style={style('auto', 'right')}>Số tiền</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiPhi} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.soTien || ''} />
                </tr>
            )
        });
        return this.renderModal({
            title: 'Chi tiết học phí học kỳ hiện tại',
            body: <div className='row'>
                <div className='form-group col-md-12' style={{ marginBottom: '30px' }}>{table}</div>
                <FormSelect className='col-md-6' data={SelectAdapter_TcLoaiPhi} ref={e => this.loaiPhi = e} label='Loại phí' required onChange={() => this.soTien.focus()} />
                <FormTextBox className='col-md-4' type='number' ref={e => this.soTien = e} label='Số tiền' required />
                <div className='form-group col-md-2 d-flex align-items-end justify-content-end' >
                    <Tooltip title='Thêm' arrow>
                        <button className='btn btn-success' onClick={e => this.onAdd(e)}>
                            <i className='fa fa-lg fa-plus' />
                        </button>
                    </Tooltip>
                </div>
            </div>
        });
    }
}
class EditModal extends AdminModal {
    state = { mssv: '', namHoc: '', hocKy: '', hocPhi: '' };

    componentDidMount() {
    }

    onShow = (item) => {
        const { mssv, hocPhi, namHoc, hocKy, hoTenSinhVien } = item ? item : {
            mssv: '', hocPhi: '', namHoc: '', hocKy: '', hoTenSinhVien: ''
        };

        this.setState({ mssv: mssv, namHoc: namHoc, hocKy: hocKy, hocPhi: hocPhi }, () => {
            this.mssv.value(mssv || '');
            this.hocPhi.value(hocPhi || 0);
            this.namHoc.value(namHoc || 0);
            this.hocKy.value(hocKy || 0);
            this.hoTenSinhVien.value(hoTenSinhVien || 0);
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const { mssv, namHoc, hocKy, hocPhi } = this.state;
        if (!this.hocPhi.value()) {
            T.notify('Học phí trống', 'danger');
            this.hocPhi.focus();
        } else {
            const changes = {
                hocPhi: this.hocPhi.value(),
            };
            if (changes.hocPhi == hocPhi) return;
            this.props.update({ mssv, namHoc, hocKy }, changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật dữ liệu học phí',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.namHoc = e} type='text' label='Năm học' readOnly={true} />
                <FormTextBox className='col-md-12' ref={e => this.hocKy = e} type='text' label='Học kỳ' readOnly={true} />
                <FormTextBox className='col-md-6' ref={e => this.mssv = e} type='text' label='MSSV' readOnly={true} />
                <FormTextBox className='col-md-6' ref={e => this.hoTenSinhVien = e} type='text' label='Họ và tên' readOnly={true} />
                <FormTextBox className='col-md-12' ref={e => this.hocPhi = e} type='number' label='Học phí (VNĐ)' readOnly={readOnly} />
            </div>
        });
    }
}

class TcHocPhiAdminPage extends AdminPage {
    state = {
        filter: {},
        totalCurrent: 0,
        totalPaid: 0
    }
    componentDidMount() {
        T.ready('/user/finance/hoc-phi', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                let filterCookie = T.getCookiePage('pageTcHocPhi', 'F'),
                    { daDong = '', listBacDaoTao = '', listLoaiHinhDaoTao = '', listNganh = '', listKhoa = '' } = filterCookie;
                this.daDong.value(daDong);
                this.bacDaoTao.value(listBacDaoTao);
                this.loaiHinhDaoTao.value(listLoaiHinhDaoTao);
                this.nganh.value(listNganh);
                this.khoa.value(listKhoa);
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.tcHocPhi && this.props.tcHocPhi.page ? this.props.tcHocPhi.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        // if (pageCondition && (typeof pageCondition == 'string')) {
        //     T.setTextSearchBox(pageCondition);
        // }
        const daDong = this.daDong.value(),
            listBacDaoTao = this.bacDaoTao.value().toString(),
            listLoaiHinhDaoTao = this.loaiHinhDaoTao.value().toString(),
            listNganh = this.nganh.value().toString(),
            listKhoa = this.khoa.value().toString(),
            namHoc = this.year.value(),
            hocKy = this.term.value(),
            {tuNgay, denNgay} = this.getTimeFilter();
        const pageFilter = (isInitial || isReset) ? {} : { daDong, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa, namHoc, hocKy, tuNgay, denNgay };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const { settings: { namHoc, hocKy, totalPaid, totalCurrent } } = page;
                    this.year.value(namHoc);
                    this.term.value(hocKy);
                    this.setState({ totalCurrent, totalPaid });
                    const filter = page.filter || {};
                    const filterCookie = T.getCookiePage('pageTcHocPhi', 'F');
                    let { daDong, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa } = filter;
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });

                    this.daDong.value(daDong || filterCookie.daDong || '');
                    this.bacDaoTao.value(listBacDaoTao || filterCookie.listBacDaoTao || '');
                    this.loaiHinhDaoTao.value(listLoaiHinhDaoTao || filterCookie.listLoaiHinhDaoTao || '');
                    this.nganh.value(listNganh || filterCookie.listNganh || '');
                    this.khoa.value(listKhoa || filterCookie.listKhoa || '');
                } else if (isReset) {
                    ['daDong', 'bacDaoTao', 'loaiHinhDaoTao', 'nganh', 'khoa'].forEach(e => this[e].value(''));
                    this.hideAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTcHocPhiPage(pageN, pageS, pageC, this.state.filter, done);
    }

    getTimeFilter = () => {
        let tuNgay = this.tuNgay.value() || null,
            denNgay = this.denNgay.value() || null;
        if (tuNgay) {
            tuNgay.setHours(0, 0, 0, 0);
            tuNgay = tuNgay.getTime();
        }
        if (denNgay) {
            denNgay.setHours(23, 59, 59, 999);
            denNgay = denNgay.getTime();
        }
        return { tuNgay, denNgay };
    }

    onDownloadPsc = (e) => {
        e.preventDefault();
        T.download(`/api/finance/hoc-phi/download-psc?filter=${T.stringify(this.state.filter)}`, 'HOC_PHI.xlsx');
    }

    render() {
        let permission = this.getUserPermission('tcHocPhi');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcHocPhi && this.props.tcHocPhi.page ? this.props.tcHocPhi.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null
        };
        let table = renderTable({
            getDataSource: () => list,
            stickyHead: true,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu học phí học kỳ hiện tại',
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center' }}>Học kỳ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Điện thoại</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email cá nhân</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học phí (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Công nợ (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian đóng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa/Bộ môn</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bậc</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc} - HK${item.hocKy}`} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.mssv} url={`/user/finance/hoc-phi/${item.mssv}`} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.hoTenSinhVien} url={`/user/finance/hoc-phi/${item.mssv}`} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} cotent={item.soDienThoai} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} cotent={item.emailCaNhan} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.hocPhi} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.congNo} />
                    <TableCell type={item.lastTransaction ? 'date' : 'text'} dateFormat='HH:MM:ss dd/mm/yyyy' style={{ whiteSpace: 'nowrap' }} content={item.lastTransaction ? Number(item.lastTransaction) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.maNganh}: ${item.tenNganh}`} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenBacDaoTao} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiHinhDaoTao} />

                    <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item} permission={permission}
                        onEdit={() => this.modal.show(item)}>
                        <Tooltip title='Chi tiết' arrow>
                            <button className='btn btn-success' onClick={e => e.preventDefault() || this.detailModal.show(item)}>
                                <i className='fa fa-lg fa-eye' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>
            ),
        });
        return this.renderPage({
            title: 'Học phí',
            icon: 'fa fa-money',
            header: <><FormSelect ref={e => this.year = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm học' data={yearDatas()} onChange={
                () => this.changeAdvancedSearch()
            } /><FormSelect ref={e => this.term = e} style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' data={termDatas} onChange={
                () => this.changeAdvancedSearch()
            } /></>,
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.daDong = e} label='Tình trạng' data={[{ id: 0, text: 'Chưa đóng' }, { id: 1, text: 'Đã đóng' }]} className='col-md-4' onChange={() => this.changeAdvancedSearch()} allowClear />
                <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-4' onChange={() => this.changeAdvancedSearch()} allowClear multiple />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-4' onChange={() => this.changeAdvancedSearch()} allowClear multiple />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-6' onChange={() => this.changeAdvancedSearch()} allowClear multiple />
                <FormSelect ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-6' onChange={() => this.changeAdvancedSearch()} allowClear multiple />
                <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.tuNgay = e} label='Từ ngày' onChange={() => this.changeAdvancedSearch()} allowClear />
                <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.denNgay = e} label='Đến ngày' onChange={() => this.changeAdvancedSearch()} allowClear />
            </div>,
            breadcrumb: ['Học phí'],
            content:
                <div className='row'>
                    <div className='col-md-6'>
                        <NumberIcon type='primary' icon='fa-users' title='Tổng số sinh viên đóng học phí' value={this.state.totalCurrent || 0} />
                    </div>
                    <div className='col-md-6'>
                        <NumberIcon type='info' icon='fa-users' title='Số sinh viên đã đóng đủ' value={this.state.totalPaid || 0} />
                    </div>
                    <div className='col-md-12'>
                        <div className='tile'>
                            {table}
                            <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                                getPage={this.props.getTcHocPhiPage} />
                            <EditModal ref={e => this.modal = e} permission={permission} update={this.props.updateHocPhi} />
                            <Detail ref={e => this.detailModal = e} getHocPhi={this.props.getHocPhi} create={this.props.createMultipleHocPhi} />
                        </div>
                    </div>
                </div>,
            onImport: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/finance/import-hoc-phi') : null,
            onExport: permission.write ? (e) => e.preventDefault() || T.download(`/api/finance/hoc-phi/download-excel?filter=${T.stringify(this.state.filter)}`, 'HOC_PHI.xlsx') : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcHocPhi: state.finance.tcHocPhi });
const mapActionsToProps = {
    getTcHocPhiPage, updateHocPhi, getHocPhi, createMultipleHocPhi
};
export default connect(mapStateToProps, mapActionsToProps)(TcHocPhiAdminPage);