import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormCheckbox, FormSelect, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtHopDongLaoDongPage, getQtHopDongLaoDongAll, updateQtHopDongLaoDong,
    deleteQtHopDongLaoDong, createQtHopDongLaoDong, getQtHopDongLaoDongGroupPage, downloadWord
} from './redux';
import { getDmDonViAll, SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';

class QtHopDongLaoDongPage extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                this.maDonVi?.value('');
                this.mulCanBo?.value('');
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
        let { pageNumber, pageSize } = this.props && this.props.qtHopDongLaoDong && this.props.qtHopDongLaoDong.page ? this.props.qtHopDongLaoDong.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const listDv = this.maDonVi?.value().toString() || '';
        const listShcc = this.mulCanBo?.value().toString() || '';
        const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi?.value(filter.listDv);
                    this.mulCanBo?.value(filter.listShcc);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.listShcc || filter.listDv)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        if (this.checked) this.props.getQtHopDongLaoDongGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtHopDongLaoDongPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    downloadWord = (item) => {
        downloadWord(item.ma, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.shcc + '_hopdong.docx');
        });
    }

    download = (e) => {
        e.preventDefault();
        T.download(T.url('/api/tccb/qua-trinh/hop-dong-lao-dong/download-excel'), 'HDLD.xlsx');
    }
    list = (text, i, j) => {
        if (i == 0 || text == ' ') return [];
        let deTais = text.split('??').map(str => <div key={i--}>Lần {j - i}: <b>{T.dateToText(Number(str.slice(0, -1)), 'dd/mm/yyyy')}</b><br /></div>);
        return deTais;
    }

    delete = (e, item) => {
        T.confirm('Xóa hợp đồng', 'Bạn có chắc bạn muốn xóa hợp đồng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHopDongLaoDong(item.ma, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá hợp đồng bị lỗi!', 'danger');
                else T.alert('Xoá hợp đồng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('qtHopDongLaoDong', ['read', 'write', 'delete', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ?
            (this.props.qtHopDongLaoDong && this.props.qtHopDongLaoDong.pageGr ?
                this.props.qtHopDongLaoDong.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list })
            : (this.props.qtHopDongLaoDong && this.props.qtHopDongLaoDong.page ? this.props.qtHopDongLaoDong.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        // let maDonVi = this.curState;        
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Số hợp đồng</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>}
                        {!this.checked && <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày tái ký HĐ</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ ký</th>}
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số HĐ đã ký</th>}
                        {this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Danh sách</th>}
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>

                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <a onClick={() => permission.write ? this.props.history.push(`/user/tccb/qua-trinh/hop-dong-lao-dong/${item.ma}`) : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning')}>
                                    <span>{(item.hoBenA ? item.hoBenA : '') + ' ' + (item.tenBenA ? item.tenBenA : '')}</span><br />
                                    <span>{item.shcc}</span></a>
                            </>
                        )}
                        />
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Số: {item.soHopDong}</span><br />
                                <span>Ngày ký: <span style={{ color: 'blue' }}>{item.ngayKyHopDong ? new Date(item.ngayKyHopDong).ddmmyyyy() : ''}</span></span>
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' style={{ textAlign: 'justify' }} content={(
                            item.loaiHopDong != '07' ?
                                <p>
                                    <b style={{ whiteSpace: 'nowrap' }}>{item.tenLoaiHopDong.replace('Hợp đồng lao động', 'Hợp đồng')}</b><br />
                                    <span style={{ whiteSpace: 'nowrap' }}>Từ ngày: <span style={{ color: 'blue' }}>{item.batDauLamViec ? new Date(item.batDauLamViec).ddmmyyyy() : ''}</span></span><br />
                                    <span style={{ whiteSpace: 'nowrap' }}>Đến ngày: <span style={{ color: 'blue' }}>{item.ketThucHopDong ? new Date(item.ketThucHopDong).ddmmyyyy() : ''}</span></span>
                                </p> :
                                <p>
                                    <span>{item.tenLoaiHopDong.replace('Hợp đồng lao động', 'Hợp đồng')}</span><br />
                                </p>
                        )}
                        />}
                        {!this.checked ? (item.loaiHopDong != '07' ? <TableCell type='text' style={{ textAlign: 'center' }} content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap', color: 'red' }}>{item.ngayKyHopDongTiepTheo ? new Date(item.ngayKyHopDongTiepTheo).ddmmyyyy() : ''}</span>
                            </>
                        )} /> : <TableCell />
                        ) : null
                        }
                        {!this.checked && <TableCell style={{ whiteSpace: 'nowrap' }} type='text' content={(
                            <>
                                <span>{item.hoNguoiKy + ' ' + item.tenNguoiKy}<br /></span>
                                <Link to={'/user/tccb/staff/' + item.shccNguoiKy}>{item.shccNguoiKy}</Link>
                            </>
                        )} />}
                        {
                            this.checked && <TableCell style={{ textAlign: 'right' }} content={item.soHd} />
                        }
                        {
                            this.checked && <TableCell style={{ whiteSpace: 'nowrap' }} content={this.list(item.danhSachHd, item.soHd, item.soHd)} />
                        }
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => permission.write ? this.props.history.push(`/user/tccb/qua-trinh/hop-dong-lao-dong/${item.ma}`) : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning')} onDelete={this.delete} >
                                {permission.export && <a href="#" className="btn btn-primary" style={{ width: '45px' }} onClick={e => e.preventDefault() || this.downloadWord(item)}>
                                    <i className='fa fa-lg fa-file-word-o' />
                                </a>}
                            </TableCell>
                        }
                        {
                            this.checked &&
                            <TableCell type='buttons' style={{ textAlign: 'center', width: '45px' }} content={item} permission={permission} >
                                <Link className='btn btn-success' to={'/user/tccb/qua-trinh/hop-dong-lao-dong/group/' + item.shcc} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-briefcase',
            title: 'Hợp đồng Lao động',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Hợp đồng Lao động'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormDatePicker type='date-mask' ref={e => this.fromYear = e} className='col-12 col-md-3' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />
                    <FormDatePicker type='date-mask' ref={e => this.toYear = e} className='col-12 col-md-3' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                {permission.export &&
                    <button className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }} onClick={this.download} >
                        <i className='fa fa-lg fa-print' />
                    </button>
                }
            </>,
            backRoute: '/user/tccb',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/tccb/qua-trinh/hop-dong-lao-dong/new') : null
            ,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHopDongLaoDong: state.tccb.qtHopDongLaoDong });
const mapActionsToProps = {
    getQtHopDongLaoDongAll, getQtHopDongLaoDongPage, deleteQtHopDongLaoDong, createQtHopDongLaoDong,
    updateQtHopDongLaoDong, getQtHopDongLaoDongGroupPage, getDmDonViAll
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongLaoDongPage);