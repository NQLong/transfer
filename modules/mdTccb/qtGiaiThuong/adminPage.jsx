import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormCheckbox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtGiaiThuongPage, updateQtGiaiThuongStaff,
    deleteQtGiaiThuongStaff, createQtGiaiThuongStaff, getQtGiaiThuongGroupPage,
} from './redux';
import { DateInput } from 'view/component/Input';
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
            if (namCap) this.namCap.setVal(new Date(namCap.toString()));
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
            T.notify('Tên tác giả trống', 'danger');
            this.tenGiaiThuong.focus();
        } else if (!this.namCap.getVal()) {
            T.notify('Năm xuất bản trống', 'danger');
            this.namCap.focus();
        } else {
            list_ma.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    tenGiaiThuong: this.tenGiaiThuong.value(),
                    noiDung: this.noiDung.value(),
                    noiCap: this.noiCap.value(),
                    namCap: this.namCap.getVal() ? new Date(this.namCap.getVal()).getFullYear() : null,
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
        const readOnly = this.state.id ? true : this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật giải thưởng' : 'Tạo mới giải thưởng',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} required />
                <FormRichTextBox className='col-12' ref={e => this.tenGiaiThuong = e} label={'Giải thưởng'} type='text' required/>
                <FormRichTextBox className='col-12' ref={e => this.noiDung = e} label={'Nội dung giải thưởng'} type='text' />
                <FormTextBox className='col-9' ref={e => this.noiCap = e} label={'Nơi cấp giải thưởng'} type='text' />
                <div className='form-group col-md-3'><DateInput ref={e => this.namCap = e} label='Năm đạt giải' type='year' required /></div>
            </div>
        });
    }
}

class QtGiaiThuong extends AdminPage {
    checked = false;
    curState = [];
    searchText = '';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => {
                this.searchText = searchText;
                if (this.checked) this.props.getQtGiaiThuongGroupPage(undefined, undefined, this.curState, this.searchText || '');
                else this.props.getQtGiaiThuongPage(undefined, undefined, this.curState, this.searchText || '');
            };
            T.showSearchBox(() => {
                this.loaiDoiTuong?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
                setTimeout(() => this.showAdvanceSearch(), 1000);
            });
            this.changeAdvancedSearch();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = () => {
        let { pageNumber, pageSize } = this.props && this.props.qtGiaiThuong && this.props.qtGiaiThuong.page ? this.props.qtGiaiThuong.page : { pageNumber: 1, pageSize: 50 };
        const loaiDoiTuong = this.loaiDoiTuong?.value() || [];
        this.curState = loaiDoiTuong;
        if (this.checked) this.props.getQtGiaiThuongGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtGiaiThuongPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    groupPage = () => {
        let { pageNumber, pageSize } = this.props && this.props.qtGiaiThuong && this.props.qtGiaiThuong.page ? this.props.qtGiaiThuong.page : { pageNumber: 1, pageSize: 50 };
        this.checked = !this.checked;
        if (this.checked) this.props.getQtGiaiThuongGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtGiaiThuongPage(pageNumber, pageSize, this.curState, this.searchText || '');
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
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Giải thưởng</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi cấp, năm cấp</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' content={(
                            <>
                                <span><b>{item.tenGiaiThuong}</b></span> <br/>
                                <span><i>{item.noiDung}</i></span> <br/> <br/>
                                <span>Cán bộ đạt giải:
                                    <a href='#' onClick={() => this.modal.show(item, false)}>
                                        <span style={{color: 'blue'}}>{' ' + (item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ') + ' - ' + item.shcc} </span>
                                    </a>
                                </span>

                            </>
                            
                        )} />
                        <TableCell type='text' content={(
                            <>
                                <span>Nơi cấp giải thưởng: <span><i>{item.noiCap}</i></span></span> <br/> <br/>
                                <span>Năm cấp giải thưởng: <span style={{color: 'blue'}}>{item.namCap}</span></span> 

                            </>         
                        )} 
                        />
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/giai-thuong/group_gt/-1/${item.shcc}`} >
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
                <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.loaiDoiTuong = e} label='Chọn loại đơn vị (có thể chọn nhiều loại)' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} />
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.checked ? this.props.getQtGiaiThuongGroupPage : this.props.getQtGiaiThuongPage} />
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

const mapStateToProps = state => ({ system: state.system, qtGiaiThuong: state.qtGiaiThuong });
const mapActionsToProps = {
    getQtGiaiThuongPage, deleteQtGiaiThuongStaff, createQtGiaiThuongStaff,
    updateQtGiaiThuongStaff, getQtGiaiThuongGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtGiaiThuong);