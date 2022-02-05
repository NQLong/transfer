import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtKeoDaiCongTacGroupPageMa, deleteQtKeoDaiCongTacGroupPageMa,
    createQtKeoDaiCongTacGroupPageMa, getQtKeoDaiCongTacPage,
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { DateInput } from 'view/component/Input';
import Dropdown from 'view/component/Dropdown';

const EnumDateType = Object.freeze({
    0: { text: '' },
    1: { text: 'dd/mm/yyyy' },
    2: { text: 'mm/yyyy' },
    3: { text: 'yyyy' },
}), typeMapper = {
    'yyyy': 'year',
    'mm/yyyy': 'month',
    'dd/mm/yyyy': 'date'
};

class EditModal extends AdminModal {
    state = {
        id: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    };    

    onShow = (item) => {
        let { id, shcc, soHieuVanBan, batDau, batDauType, ketThuc, ketThucType } = item ? item : {
            id: '', ho: '', ten: '', shcc: '', soHieuVanBan: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: ''
        };
        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc
        });
        setTimeout(() => {
            this.shcc.value(shcc ? shcc : this.props.shcc);
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.batDau.setVal(batDau ? batDau : '');
            this.ketThuc.setVal(ketThuc);
            this.soHieuVanBan.value(soHieuVanBan ? soHieuVanBan : '');
        }, 500);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: this.state.ketThucType,
            ketThuc: this.ketThuc.getVal(),
            soHieuVanBan: this.soHieuVanBan.value()
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
            this.maCanBo.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu kéo dài công tác trống', 'danger');
            this.batDau.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật thông tin kéo dài công tác' : 'Tạo mới thông tin kéo dài công tác',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly />
                <FormTextBox className='col-md-12' ref={e => this.soHieuVanBan = e} label='Số hiệu văn bản' readOnly={readOnly} />
                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)</div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} readOnly={readOnly} /></div>
            </div>
        });
    }
}

class QtKeoDaiCongTacGroupPage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/keo-dai-cong-tac/:shcc'),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.setState({ filter: { list_shcc: params.shcc, list_dv: '' } });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');

            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.props.getQtKeoDaiCongTacPage(undefined, undefined, undefined, this.state.filter, () => {
                T.updatePage('pageQtKeoDaiCongTac', undefined, undefined, undefined, this.state.filter);
            });
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtKeoDaiCongTac && this.props.qtKeoDaiCongTac.page ? this.props.qtKeoDaiCongTac.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const list_dv = this.state.filter.list_dv;
        const list_shcc = this.state.filter.list_shcc;
        const pageFilter = isInitial ? null : { list_dv, fromYear, toYear, list_shcc };
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
        this.props.getQtKeoDaiCongTacPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin kéo dài công tác', 'Bạn có chắc bạn muốn xóa thông tin kéo dài công tác này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKeoDaiCongTacGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin kéo dài công tác bị lỗi!', 'danger');
                else T.alert('Xoá thông tin kéo dài công tác thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtKeoDaiCongTac', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtKeoDaiCongTac && this.props.qtKeoDaiCongTac.page ? this.props.qtKeoDaiCongTac.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Số hiệu văn bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br/></span> : null}
                                {item.ketThuc ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br/></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{  whiteSpace: 'nowrap' }} content={item.soHieuVanBan}/>            
                        {
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Quá trình kéo dài công tác - Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={0} to='/user/tccb/qua-trinh/keo-dai-cong-tac'>Quá trình kéo dài, công tác</Link>,
                'Quá trình kéo dài, công tác - Cán bộ'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-3' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />
                    <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-3' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions} shcc={this.shcc}
                    create={this.props.createQtKeoDaiCongTacGroupPageMa} update={this.props.updateQtKeoDaiCongTacGroupPageMa}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/keo-dai-cong-tac',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtKeoDaiCongTac: state.qtKeoDaiCongTac });
const mapActionsToProps = {
    updateQtKeoDaiCongTacGroupPageMa, deleteQtKeoDaiCongTacGroupPageMa,
    createQtKeoDaiCongTacGroupPageMa, getQtKeoDaiCongTacPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtKeoDaiCongTacGroupPage);