import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormSelect, FormTextBox, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_FwCanBo } from '../../mdTccb/tccbCanBo/redux';
import {
    getQtBangPhatMinhPage, deleteQtBangPhatMinhStaff, createQtBangPhatMinhStaff,
    updateQtBangPhatMinhStaff, getQtBangPhatMinhGroupPage
}
    from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

class EditModal extends AdminModal {
    state = {
        id: null,
    };
    multiple = false;

    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { id, shcc, tenBang, soHieu, namCap, noiCap, tacGia, sanPham, loaiBang } = item ? item : {
            id: '', shcc: '', tenBang: '', soHieu: '', namCap: '', noiCap: '', tacGia: '', sanPham: '', loaiBang: ''
        };

        this.setState({
            id
        }, () => {
            const d = new Date(namCap, 1);
            this.maCanBo.value(shcc);
            this.tenBang.value(tenBang ? tenBang : '');
            this.soHieu.value(soHieu ? soHieu : '');
            this.namCap.value(d ? d.getTime() : '');
            this.noiCap.value(noiCap ? noiCap : '');
            this.tacGia.value(tacGia ? tacGia : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.loaiBang.value(loaiBang ? loaiBang : '');
        });
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
        } else if (!this.tenBang.value()) {
            T.notify('Tên bằng phát minh trống', 'danger');
            this.tenBang.focus();
        } else if (!this.soHieu.value()) {
            T.notify('Số hiệu bằng phát minh trống', 'danger');
            this.soHieu.focus();
        } else if (!this.namCap.value()) {
            T.notify('Năm cấp bằng phát minh trống', 'danger');
            this.namCap.focus();
        } else {
            list_ma.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    tenBang: this.tenBang.value(),
                    soHieu: this.soHieu.value(),
                    namCap: this.namCap.value().getYear() + 1900,
                    noiCap: this.noiCap.value(),
                    tacGia: this.tacGia.value(),
                    sanPham: this.sanPham.value(),
                    loaiBang: this.loaiBang.value(),
                };
                if (index == list_ma.length - 1) {
                    this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
                    this.setState({
                        id: ''
                    });
                    this.maCanBo.reset();
                }
                else {
                    this.state.id ? this.props.update(this.state.id, changes, null) : this.props.create(changes, null);
                }
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình bằng phát minh' : 'Tạo mới quá trình bằng phát minh',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={this.state.id ? true : false} required />
                <FormTextBox className='col-md-12' ref={e => this.tenBang = e} label='Tên bằng phát minh' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.soHieu = e} label='Số hiệu bằng phát minh' readOnly={readOnly}/>
                <FormDatePicker className='col-md-6' type='year-mask' ref={e => this.namCap = e} label='Năm cấp bằng phát minh' placeholder='Năm cấp' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.noiCap = e} label='Nơi cấp bằng phát minh' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.tacGia = e} label='Tác giả bằng phát minh' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.sanPham = e} label='Sản phẩm' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.loaiBang = e} label='Loại bằng phát minh' readOnly={readOnly}/>
            </div>
        });
    }
}

class QtBangPhatMinh extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {} };
    menu = '';
    componentDidMount() {
        this.menu = T.routeMatcher('/user/:tccb/qua-trinh/bang-phat-minh').parse(window.location.pathname).tccb;
        T.ready('/user/' + this.menu, () => {
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
        let { pageNumber, pageSize } = this.props && this.props.qtBangPhatMinh && this.props.qtBangPhatMinh.page ? this.props.qtBangPhatMinh.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : (this.fromYear?.value().getYear() == 0 ? null : this.fromYear?.value().getYear() + 1900);
        const toYear = this.toYear?.value() == '' ? null : (this.toYear?.value().getYear() == 0 ? null : this.toYear?.value().getYear() + 1900);
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
        if (this.checked) this.props.getQtBangPhatMinhGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtBangPhatMinhPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (text, i, j) => {
        if (!text) return [];
        let items = text.split('??').map(str => <p key={i--}>{j - i}. {str}</p>);
        return items;
    }

    delete = (e, item) => {
        T.confirm('Xóa quá trình bằng phát minh', 'Bạn có chắc bạn muốn xóa quá trình bằng phát minh này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtBangPhatMinhStaff(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá quá trình bằng phát minh bị lỗi!', 'danger');
                else T.alert('Xoá quá trình bằng phát minh thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtBangPhatMinh', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtBangPhatMinh && this.props.qtBangPhatMinh.page_gr ?
                this.props.qtBangPhatMinh.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtBangPhatMinh && this.props.qtBangPhatMinh.page ? this.props.qtBangPhatMinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên bằng</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số hiệu</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Năm cấp</th>}
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số bằng phát minh</th>}
                        {this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Danh sách tên bằng</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Nơi cấp</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tác giả</th>}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.tenBang ? item.tenBang : ''}
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.soHieu ? item.soHieu : ''}
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                <span style={{ color: 'blue' }}>{item.namCap}</span>
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.noiCap}
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.tacGia}
                            </>
                        )}
                        />}
                        {this.checked && <TableCell type='text' content={item.soBang} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachTenBang, item.soBang, item.soBang)} />}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/${this.menu}/qua-trinh/bang-phat-minh/group/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-cogs',
            title: ' Quá trình bằng phát minh',
            breadcrumb: [
                <Link key={0} to='/user/khcn'>Tổ chức cán bộ</Link>,
                'Quá trình bằng phát minh'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormDatePicker type='year-mask' ref={e => this.fromYear = e} className='col-12 col-md-3' label='Từ thời gian (năm cấp)' onChange={() => this.changeAdvancedSearch()} />
                    <FormDatePicker type='year-mask' ref={e => this.toYear = e} className='col-12 col-md-3' label='Đến thời gian (năm cấp)' onChange={() => this.changeAdvancedSearch()} />
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
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtBangPhatMinhStaff} update={this.props.updateQtBangPhatMinhStaff}
                    permissions={currentPermissions}
                />
            </>,
            backRoute: '/user/' + this.menu,
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtBangPhatMinh: state.khcn.qtBangPhatMinh });
const mapActionsToProps = {
    getQtBangPhatMinhPage, deleteQtBangPhatMinhStaff, createQtBangPhatMinhStaff,
    updateQtBangPhatMinhStaff, getQtBangPhatMinhGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtBangPhatMinh);