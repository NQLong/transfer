import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormCheckbox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtGiaiThuongPage, updateQtGiaiThuongStaff,
    deleteQtGiaiThuongStaff, createQtGiaiThuongMultiple, getQtGiaiThuongGroupPage,
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

class EditModal extends AdminModal {
    state = {
        id: '',
    };
    multiple = false;

    onShow = (item, multiple = true) => {
        this.multiple = multiple;

        let { id, shcc, tenGiaiThuong, noiDung, noiCap, namCap, soQuyetDinh } = item ? item : {
            id: null, shcc: '', tenGiaiThuong: '', noiDung: null, noiCap: '', namCap: '', soQuyetDinh: '',
        };

        this.setState({ id: id });

        setTimeout(() => {
            this.maCanBo.value(shcc);
            this.tenGiaiThuong.value(tenGiaiThuong ? tenGiaiThuong : '');
            this.namCap.value(namCap ? namCap : '');
            this.noiDung.value(noiDung ? noiDung : '');
            this.noiCap.value(noiCap ? noiCap : '');
            this.soQuyetDinh.value(soQuyetDinh || '');
        }, 500);
    };

    onSubmit = (e) => {
        e.preventDefault();
        let listMa = this.maCanBo.value();
        if (!Array.isArray(listMa)) {
            listMa = [listMa];
        }
        let changes = {
            tenGiaiThuong: this.tenGiaiThuong.value(),
            noiDung: this.noiDung.value(),
            noiCap: this.noiCap.value(),
            namCap: this.namCap.value(),
            soQuyetDinh: this.soQuyetDinh.value(),
        };
        if (listMa.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.maCanBo.focus();
        } else if (!this.tenGiaiThuong.value()) {
            T.notify('Tên giải thưởng trống', 'danger');
            this.tenGiaiThuong.focus();
        } else if (!this.namCap.value()) {
            T.notify('Năm đạt giải trống', 'danger');
            this.namCap.focus();
        } else {
            if (this.state.id) {
                changes.shcc = listMa[0];
                this.props.update(this.state.id, changes, this.hide);
            } else {
                changes.listShcc = listMa;
                this.props.create(changes, this.hide);
            }
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật giải thưởng' : 'Tạo mới giải thưởng',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={this.state.id ? true : false} required />
                <FormTextBox className='col-12' ref={e => this.soQuyetDinh = e} label={'Số quyết định'} type='text' readOnly={readOnly} />
                <FormRichTextBox className='col-12' ref={e => this.tenGiaiThuong = e} label={'Giải thưởng'} type='text' required readOnly={readOnly} />
                <FormRichTextBox className='col-12' ref={e => this.noiDung = e} label={'Nội dung giải thưởng'} type='text' readOnly={readOnly} />
                <FormTextBox className='col-9' ref={e => this.noiCap = e} label={'Nơi cấp giải thưởng'} type='text' readOnly={readOnly} />
                <FormTextBox className='col-md-3' ref={e => this.namCap = e} label='Năm đạt giải (yyyy)' type='year' required readOnly={readOnly} />
            </div>
        });
    }
}

class QtGiaiThuong extends AdminPage {
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

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }


    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtGiaiThuong && this.props.qtGiaiThuong.page ? this.props.qtGiaiThuong.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : Number(this.fromYear?.value());
        const toYear = this.toYear?.value() == '' ? null : Number(this.toYear?.value());
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
        if (this.checked) this.props.getQtGiaiThuongGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtGiaiThuongPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (text, i, listYear) => {
        if (!text) return [];
        let deTais = text.split('??');
        let years = listYear.split('??');
        let results = [];
        let choose = i > 5 ? 5 : i;
        for (let k = 0; k < choose; k++) {
            results.push(<div key={results.length}> <span>
                {k + 1}. {deTais[k]} ({years[k].trim()})
            </span></div>);
        }
        if (i > 5) {
            results.push(<div key={results.length}> <span>
                .........................................
            </span></div>);
            let k = i - 1;
            results.push(<div key={results.length}> <span>
                {k + 1}. {deTais[k]} ({years[k].trim()})
            </span></div>);
        }
        return results;
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa giải thưởng', 'Bạn có chắc bạn muốn xóa giải thưởng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtGiaiThuongStaff(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá giải thưởng bị lỗi!', 'danger');
                else T.alert('Xoá giải thưởng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('qtGiaiThuong', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtGiaiThuong && this.props.qtGiaiThuong.pageGr ?
                this.props.qtGiaiThuong.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtGiaiThuong && this.props.qtGiaiThuong.page ? this.props.qtGiaiThuong.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br />Đơn vị công tác</th>
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Giải thưởng</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm đạt giải</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi cấp</th>}
                        {this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Số giải thưởng</th>}
                        {this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Danh sách giải thưởng</th>}
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHocVi || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span> {item.tenChucVu || ''}<br /> </span>
                                {(item.tenDonVi || '')}
                            </>
                        )} />
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.soQuyetDinh} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span><b>{item.tenGiaiThuong}</b></span> <br />
                                <span><i>{item.noiDung}</i></span>
                            </>

                        )} />}
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue' }} content={(item.namCap)} />}
                        {!this.checked && <TableCell type='text' content={(<i>{item.noiCap}</i>)} />}
                        {this.checked && <TableCell type='text' content={item.soGiaiThuong} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachGiaiThuong, item.soGiaiThuong, item.danhSachNamCap)} />}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/giai-thuong/group/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-trophy',
            title: 'Quá trình giải thưởng',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình giải thưởng'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormTextBox className='col-md-4' ref={e => this.fromYear = e} label='Từ năm đạt giải (yyyy)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormTextBox className='col-md-4' ref={e => this.toYear = e} label='Đến năm đạt giải (yyyy)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createQtGiaiThuongMultiple} update={this.props.updateQtGiaiThuongStaff}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtGiaiThuong: state.tccb.qtGiaiThuong });
const mapActionsToProps = {
    getQtGiaiThuongPage, deleteQtGiaiThuongStaff, createQtGiaiThuongMultiple,
    updateQtGiaiThuongStaff, getQtGiaiThuongGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtGiaiThuong);