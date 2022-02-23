import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormDatePicker, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtHopDongDvtlTnPage, getQtHopDongDvtlTnAll, updateQtHopDongDvtlTn,
    deleteQtHopDongDvtlTn, createQtHopDongDvtlTn, downloadWord, getQtHopDongDvtlTnGroupPage
} from './redux';
import { getDmChucVuAll } from 'modules/mdDanhMuc/dmChucVu/redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmBoMonAll } from 'modules/mdDanhMuc/dmBoMon/redux';
import { getStaffAll } from 'modules/mdTccb/tccbCanBo/redux';


class QtHopDongDvtlTn extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            if (this.checked) {
                this.hienThiTheoCanBo.value(true);
            }
            this.getPage();
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtHopDongDvtlTn && this.props.qtHopDongDvtlTn.page ? this.props.qtHopDongDvtlTn.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const pageFilter = isInitial ? null : { fromYear, toYear };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        if (this.checked) this.props.getQtHopDongDvtlTnGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtHopDongDvtlTnPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    downloadWord = (item) => {
        downloadWord(item.ma, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.shcc + '_hopdong.docx');
        });
    }

    delete = (e, item) => {
        T.confirm('Xóa hợp đồng', 'Bạn có chắc bạn muốn xóa hợp đồng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHopDongDvtlTn(item.ma, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá hợp đồng bị lỗi!', 'danger');
                else T.alert('Xoá hợp đồng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    list = (text, i, j) => {
        if (i == 0 || text == ' ') return [];
        let deTais = text.split('??').map(str => <div key={i--}>Lần {j - i}: <b>{str.trim() ? T.dateToText(Number(str.trim().slice(0, -1)), 'dd/mm/yyyy') : null}</b><br /></div>);
        return deTais;
    }

    render() {
        const permission = this.getUserPermission('qtHopDongDvtlTn', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ?
            (this.props.qtHopDongDvtlTn && this.props.qtHopDongDvtlTn.page_gr ?
                this.props.qtHopDongDvtlTn.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list })
            : (this.props.qtHopDongDvtlTn && this.props.qtHopDongDvtlTn.page ? this.props.qtHopDongDvtlTn.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Số hợp đồng</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ duyệt hồ sơ</th>}
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số hợp đồng đã ký</th>}
                        {this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Danh sách</th>}
                        {!this.checked && <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>}

                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <a href={'/user/tccb/qua-trinh/hop-dong-dvtl-tn/' + item.ma} >
                                    <span>{item.ho + ' ' + item.ten}</span><br />
                                    <span>{item.shcc}</span>
                                </a>
                            </>
                        )}
                        />
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>Số: {item.soHopDong}</span><br />
                                <span>{item.dienHopDong}</span><br />
                                <span>Ngày ký: <span style={{ color: 'blue' }}>{item.ngayKyHopDong ? new Date(item.ngayKyHopDong).ddmmyyyy() : ''}</span></span>
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Từ ngày: <span style={{ color: 'blue' }}>{item.hieuLucHopDong ? new Date(item.hieuLucHopDong).ddmmyyyy() : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đến ngày: <span style={{ color: 'blue' }}>{item.ketThucHopDong ? new Date(item.ketThucHopDong).ddmmyyyy() : ''}</span></span>
                            </>
                        )}
                        />}
                        {
                            this.checked && <TableCell style={{ textAlign: 'right' }} content={item.soHd} />
                        }
                        {
                            this.checked && <TableCell style={{ whiteSpace: 'nowrap' }} content={this.list(item.danhSachHd, item.soHd, item.soHd)} />
                        }
                        {!this.checked && <TableCell style={{ whiteSpace: 'nowrap' }} type='text' content={(
                            <>
                                <span>{item.hoNguoiKy + ' ' + item.tenNguoiKy}<br /></span>
                                <Link to={'/user/tccb/staff/' + item.shccNguoiKy}>{item.shccNguoiKy}</Link>
                            </>
                        )} />}
                        {!this.checked && <TableCell type='buttons' content={item} onEdit={`/user/tccb/qua-trinh/hop-dong-dvtl-tn/${item.ma}`} onDelete={this.delete} permission={permission} >
                            <a href="#" className="btn btn-primary" style={{ width: '45px' }} onClick={e => e.preventDefault() || this.downloadWord(item)}>
                                <i className='fa fa-lg fa-file-word-o' />
                            </a>
                        </TableCell>}
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-pencil',
            title: 'Hợp đồng Đơn vị trả lương - Trách nhiệm',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Hợp đồng Đơn vị trả lương - Trách nhiệm'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormDatePicker type='date-mask' ref={e => this.fromYear = e} className='col-12 col-md-3' label='Từ thời gian (ngày ký)' onChange={() => this.changeAdvancedSearch()} />
                    <FormDatePicker type='date-mask' ref={e => this.toYear = e} className='col-12 col-md-3' label='Đến thời gian (ngày ký)' onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/tccb/qua-trinh/hop-dong-dvtl-tn/new') : null
            ,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHopDongDvtlTn: state.tccb.qtHopDongDvtlTn });
const mapActionsToProps = {
    getQtHopDongDvtlTnAll, getQtHopDongDvtlTnPage, deleteQtHopDongDvtlTn, getDmDonViAll, createQtHopDongDvtlTn,
    updateQtHopDongDvtlTn, getDmChucVuAll, getDmBoMonAll, getStaffAll, getQtHopDongDvtlTnGroupPage
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongDvtlTn);