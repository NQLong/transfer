import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormCheckbox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtGiaiThuongPage, updateQtGiaiThuongStaff,
    deleteQtGiaiThuongStaff, createQtGiaiThuongStaff, getQtGiaiThuongGroupPage,
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

        let { id, shcc, tenGiaiThuong, noiDung, noiCap, namCap } = item ? item : {
            id: null, shcc: '', tenGiaiThuong: '', noiDung: null, noiCap: '', namCap: ''
        };

        this.setState({ id: id });

        setTimeout(() => {
            this.maCanBo.value(shcc);
            this.tenGiaiThuong.value(tenGiaiThuong ? tenGiaiThuong : '');
            this.namCap.value(namCap ? namCap : '');
            this.noiDung.value(noiDung ? noiDung : '');
            this.noiCap.value(noiCap ? noiCap : '');
        }, 500);
    };

    onSubmit = (e) => {
        e.preventDefault();
        let list_ma = this.maCanBo.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.maCanBo.focus();
        } else if (!this.tenGiaiThuong.value()) {
            T.notify('Tên giải thưởng trống', 'danger');
            this.tenGiaiThuong.focus();
        } else if (!this.namCap.value()) {
            T.notify('Năm đạt giải trống', 'danger');
            this.namCap.focus();
        } else {
            list_ma.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    tenGiaiThuong: this.tenGiaiThuong.value(),
                    noiDung: this.noiDung.value(),
                    noiCap: this.noiCap.value(),
                    namCap: this.namCap.value(),
                };
                if (index == list_ma.length - 1) {
                    this.state.id ? this.props.update(this.state.id, changes, this.hide, false) : this.props.create(changes, this.hide, false);
                    this.setState({
                        id: ''
                    });
                    this.maCanBo.reset();
                }
                else {
                    this.state.id ? this.props.update(this.state.id, changes, null, false) : this.props.create(changes, null, false);
                }
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật giải thưởng' : 'Tạo mới giải thưởng',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={this.state.id ? true : false} required />
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
                this.props.getQtGiaiThuongGroupPage();
            } else {
                this.props.getQtGiaiThuongPage();
            }
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
        const list_dv = this.maDonVi?.value().toString() || '';
        const list_shcc = this.mulCanBo?.value().toString() || '';
        const pageFilter = isInitial ? null : { list_dv, fromYear, toYear, list_shcc };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi?.value(filter.list_dv);
                    this.mulCanBo?.value(filter.list_shcc);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.list_shcc || filter.list_dv)) this.showAdvanceSearch();
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

    list = (text, i, j) => {
        if (!text) return '';
        let deTais = text.split('??').map(str => <p key={i--} style={{ textTransform: 'uppercase' }}>{j - i}. {str}</p>);
        return deTais;
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa giải thưởng', 'Bạn có chắc bạn muốn xóa giải thưởng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtGiaiThuongStaff(item.id, false, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá giải thưởng bị lỗi!', 'danger');
                else T.alert('Xoá giải thưởng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtGiaiThuong', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtGiaiThuong && this.props.qtGiaiThuong.page_gr ?
                this.props.qtGiaiThuong.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtGiaiThuong && this.props.qtGiaiThuong.page ? this.props.qtGiaiThuong.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>}
                        {this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Số giải thưởng</th>}
                        {this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Danh sách giải thưởng</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Giải thưởng</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi cấp, năm đạt giải</th>}
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        {this.checked && <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />}
                        {this.checked && <TableCell type='text' content={item.soGiaiThuong} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachGiaiThuong, item.soGiaiThuong, item.soGiaiThuong)} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span><b>{item.tenGiaiThuong}</b></span> <br />
                                <span><i>{item.noiDung}</i></span> <br /> <br />
                                <span>Cán bộ đạt giải:
                                    <a href='#' onClick={() => this.modal.show(item, false)}>
                                        <span style={{ color: 'blue' }}>{' ' + (item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ') + ' - ' + item.shcc} </span>
                                    </a>
                                </span>

                            </>

                        )} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span>Nơi cấp giải thưởng: <span><i>{item.noiCap}</i></span></span> <br /> <br />
                                <span>Năm đạt giải: <span style={{ color: 'blue' }}>{item.namCap}</span></span>

                            </>
                        )}
                        />}
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
                    <FormTextBox className='col-md-3' ref={e => this.fromYear = e} label='Từ năm đạt giải(yyyy)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormTextBox className='col-md-3' ref={e => this.toYear = e} label='Đến năm đạt giải (yyyy)' type='year' onChange={() => this.changeAdvancedSearch()} />
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
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                    create={this.props.createQtGiaiThuongStaff} update={this.props.updateQtGiaiThuongStaff}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtGiaiThuong: state.tccb.qtGiaiThuong });
const mapActionsToProps = {
    getQtGiaiThuongPage, deleteQtGiaiThuongStaff, createQtGiaiThuongStaff,
    updateQtGiaiThuongStaff, getQtGiaiThuongGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtGiaiThuong);