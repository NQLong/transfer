import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_FwCanBo } from '../../mdTccb/tccbCanBo/redux';
import {
    getQtBangPhatMinhGroupPageMa, deleteQtBangPhatMinhGroupPageMa, createQtBangPhatMinhGroupPageMa,
    updateQtBangPhatMinhGroupPageMa
}
    from './redux';

class EditModal extends AdminModal {
    state = {
        id: null,
    };

    onShow = (item) => {
        let { id, shcc, tenBang, soHieu, namCap, noiCap, tacGia, sanPham, loaiBang } = item ? item : {
            id: '', shcc: '', tenBang: '', soHieu: '', namCap: '', noiCap: '', tacGia: '', sanPham: '', loaiBang: ''
        };

        this.setState({
            id
        }, () => {
            const d = new Date(namCap, 1);
            this.maCanBo.value(shcc ? shcc : this.props.shcc);
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
        const changes = {
            shcc: this.maCanBo.value(),
            tenBang: this.tenBang.value(),
            soHieu: this.soHieu.value(),
            namCap: this.namCap.value().getYear() + 1900,
            noiCap: this.noiCap.value(),
            tacGia: this.tacGia.value(),
            sanPham: this.sanPham.value(),
            loaiBang: this.loaiBang.value(),
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
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
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình bằng phát minh' : 'Tạo mới quá trình bằng phát minh',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} required />
                <FormTextBox className='col-md-12' ref={e => this.tenBang = e} label='Tên bằng phát minh' readOnly={readOnly} required />
                <FormTextBox className='col-md-6' ref={e => this.soHieu = e} label='Số hiệu bằng phát minh' readOnly={readOnly} required />
                <FormDatePicker className='col-md-6' type='year-mask' ref={e => this.namCap = e} label='Năm cấp bằng phát minh' placeholder='Năm cấp' readOnly={readOnly} required />
                <FormTextBox className='col-md-6' ref={e => this.noiCap = e} label='Nơi cấp bằng phát minh' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.tacGia = e} label='Tác giả bằng phát minh' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.sanPham = e} label='Sản phẩm' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.loaiBang = e} label='Loại bằng phát minh' readOnly={readOnly}/>
            </div>
        });
    }
}

class QtBangPhatMinhGroupPage extends AdminPage {
    state = { filter: {} };
    menu = '';
    componentDidMount() {
        this.menu = T.routeMatcher('/user/:tccb/qua-trinh/bang-phat-minh/group/:shcc').parse(window.location.pathname).tccb;
        T.ready('/user/' + this.menu, () => {
            T.clearSearchBox();
            const route = T.routeMatcher('/user/' + this.menu + '/qua-trinh/bang-phat-minh/group/:shcc'),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.setState({ filter: { listShcc: params.shcc, listDv: '', timeType: 0 } });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');

            T.showSearchBox(() => {
                this.timeType?.value(0);
                this.fromYear?.value('');
                this.toYear?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtBangPhatMinh && this.props.qtBangPhatMinh.pageMa ? this.props.qtBangPhatMinh.pageMa : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : (this.fromYear?.value().getYear() == 0 ? null : this.fromYear?.value().getYear() + 1900);
        const toYear = this.toYear?.value() == '' ? null : (this.toYear?.value().getYear() == 0 ? null : this.toYear?.value().getYear() + 1900);
        const listDv = this.state.filter.listDv;
        const listShcc = this.state.filter.listShcc;
        const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.timeType)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtBangPhatMinhGroupPageMa(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin bằng phát minh', 'Bạn có chắc bạn muốn xóa thông tin bằng phát minh này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtBangPhatMinhGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin bằng phát minh bị lỗi!', 'danger');
                else T.alert('Xoá thông tin bằng phát minh thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }


    render() {
        const permission = this.getUserPermission('qtBangPhatMinh', ['read', 'write', 'delete', 'readOnly']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtBangPhatMinh && this.props.qtBangPhatMinh.pageMa ? this.props.qtBangPhatMinh.pageMa : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên bằng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số hiệu</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm cấp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Nơi cấp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tác giả</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br/>Đơn vị công tác</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={(item.tenBang || '')} />
                        <TableCell type='text' content={(item.soHieu || '')} />
                        <TableCell type='text' content={(<span style={{ color: 'blue' }}>{item.namCap}</span>)} />
                        <TableCell type='text' content={(item.noiCap)} />
                        <TableCell type='text' content={(item.tacGia)}/>
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
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
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-cogs',
            title: 'Quá trình bằng phát minh - Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/khcn'>Tổ chức cán bộ</Link>,
                <Link key={0} to='/user/khcn/qua-trinh/bang-phat-minh'>Quá trình bằng phát minh</Link>,
                'Quá trình bằng phát minh - Cán bộ'
            ],
            advanceSearch: <>
                <div className='row'>
                <FormDatePicker type='year-mask' ref={e => this.fromYear = e} className='col-12 col-md-3' label='Từ thời gian (năm cấp)' onChange={() => this.changeAdvancedSearch()} />
                <FormDatePicker type='year-mask' ref={e => this.toYear = e} className='col-12 col-md-3' label='Đến thời gian (năm cấp)' onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    shcc={this.shcc}
                    create={this.props.createQtBangPhatMinhGroupPageMa} update={this.props.updateQtBangPhatMinhGroupPageMa}
                />
            </>,
            backRoute: '/user/' + this.menu + '/qua-trinh/bang-phat-minh',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtBangPhatMinh: state.khcn.qtBangPhatMinh });
const mapActionsToProps = {
    getQtBangPhatMinhGroupPageMa, deleteQtBangPhatMinhGroupPageMa,
    updateQtBangPhatMinhGroupPageMa, createQtBangPhatMinhGroupPageMa,
};
export default connect(mapStateToProps, mapActionsToProps)(QtBangPhatMinhGroupPage);