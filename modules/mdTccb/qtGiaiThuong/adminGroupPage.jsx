import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtGiaiThuongGroupPageMa, deleteQtGiaiThuongGroupPageMa,
    createQtGiaiThuongGroupPageMa, getQtGiaiThuongGroupPageMa,
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';


class EditModal extends AdminModal {
    state = {
        id: '',
    };
    multiple = false;

    onShow = (item) => {
        let { id, shcc, tenGiaiThuong, noiDung, noiCap, namCap, soQuyetDinh } = item ? item : {
            id: null, shcc: '', tenGiaiThuong: '', noiDung: null, noiCap: '', namCap: '', soQuyetDinh: ''
        };

        this.setState({ id: id });

        setTimeout(() => {
            this.maCanBo.value(shcc ? shcc : this.props.shcc);
            this.tenGiaiThuong.value(tenGiaiThuong ? tenGiaiThuong : '');
            this.namCap.value(namCap ? namCap : '');
            this.noiDung.value(noiDung ? noiDung : '');
            this.noiCap.value(noiCap ? noiCap : '');
            this.soQuyetDinh.value(soQuyetDinh || '');
        }, 500);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.maCanBo.value(),
            tenGiaiThuong: this.tenGiaiThuong.value(),
            noiDung: this.noiDung.value(),
            noiCap: this.noiCap.value(),
            namCap: this.namCap.value(),
            soQuyetDinh: this.soQuyetDinh.value(),
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
            this.maCanBo.focus();
        } else if (!this.tenGiaiThuong.value()) {
            T.notify('Tên giải thưởng trống', 'danger');
            this.tenGiaiThuong.focus();
        } else if (!this.namCap.value()) {
            T.notify('Năm đạt giải trống', 'danger');
            this.namCap.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật giải thưởng' : 'Tạo mới giải thưởng',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} required />
                <FormTextBox className='col-12' ref={e => this.soQuyetDinh = e} label={'Số quyết định'} type='text' readOnly={readOnly} />
                <FormRichTextBox className='col-12' ref={e => this.tenGiaiThuong = e} label={'Giải thưởng'} type='text' required readOnly={readOnly} />
                <FormRichTextBox className='col-12' ref={e => this.noiDung = e} label={'Nội dung giải thưởng'} type='text' readOnly={readOnly} />
                <FormTextBox className='col-9' ref={e => this.noiCap = e} label={'Nơi cấp giải thưởng'} type='text' readOnly={readOnly} />
                <FormTextBox className='col-md-3' ref={e => this.namCap = e} label='Năm đạt giải (yyyy)' type='year' required readOnly={readOnly} />
            </div>
        });
    }
}

class QtGiaiThuongGroupPage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            const route = T.routeMatcher('/user/tccb/qua-trinh/giai-thuong/group/:shcc'),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.setState({ filter: { listShcc: params.shcc, listDv: '' } });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');

            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtGiaiThuong && this.props.qtGiaiThuong.pageMa ? this.props.qtGiaiThuong.pageMa : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : Number(this.fromYear?.value());
        const toYear = this.toYear?.value() == '' ? null : Number(this.toYear?.value());
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
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtGiaiThuongGroupPageMa(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa giải thưởng', 'Bạn có chắc bạn muốn xóa giải thưởng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtGiaiThuongGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá giải thưởng bị lỗi!', 'danger');
                else T.alert('Xoá giải thưởng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('qtGiaiThuong', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtGiaiThuong && this.props.qtGiaiThuong.pageMa ? this.props.qtGiaiThuong.pageMa : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
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
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Giải thưởng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm đạt giải</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi cấp</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
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
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.soQuyetDinh} />
                        <TableCell type='text' content={(
                            <>
                                <span><b>{item.tenGiaiThuong}</b></span> <br />
                                <span><i>{item.noiDung}</i></span>
                            </>

                        )} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue' }} content={(item.namCap)} />
                        <TableCell type='text' content={(<i>{item.noiCap}</i>)} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                        </TableCell>
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
                    <FormTextBox className='col-md-3' ref={e => this.fromYear = e} label='Từ năm đạt giải (yyyy)' type='year' onChange={() => this.changeAdvancedSearch()} />
                    <FormTextBox className='col-md-3' ref={e => this.toYear = e} label='Đến năm đạt giải (yyyy)' type='year' onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} shcc={this.shcc}
                    create={this.props.createQtGiaiThuongGroupPageMa} update={this.props.updateQtGiaiThuongGroupPageMa}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/giai-thuong',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtGiaiThuong: state.tccb.qtGiaiThuong });
const mapActionsToProps = {
    updateQtGiaiThuongGroupPageMa, deleteQtGiaiThuongGroupPageMa,
    createQtGiaiThuongGroupPageMa, getQtGiaiThuongGroupPageMa,
};
export default connect(mapStateToProps, mapActionsToProps)(QtGiaiThuongGroupPage);