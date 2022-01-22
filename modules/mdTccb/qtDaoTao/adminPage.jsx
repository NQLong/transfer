import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect, FormDatePicker, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    getQtDaoTaoPage, getQtDaoTaoGroupPage, getQtDaoTaoAll, updateQtDaoTao,
    deleteQtDaoTao, createQtDaoTao
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectApdater_DmBangDaoTao } from 'modules/mdDanhMuc/dmBangDaoTao/redux';
import { SelectAdapter_DmHinhThucDaoTaoV2 } from 'modules/mdDanhMuc/dmHinhThucDaoTao/redux';
import { SelectAdapter_DmDonVi} from 'modules/mdDanhMuc/dmDonVi/redux';

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
    state = { id: null };
    multiple = false;
    componentDidMount() {
    }

    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { shcc, tenTruong, chuyenNganh, batDau, ketThuc, hinhThuc, loaiBangCap, id,
        batDauType, ketThucType, thoiGian, trinhDo, kinhPhi } = item ? item : {
            shcc: '', tenTruong: '', chuyenNganh: '', batDau: '', ketThuc: '', hinhThuc: '', loaiBangCap: '', id: '',
            batDauType: '', ketThucType: '', thoiGian: '', trinhDo: '', kinhPhi: ''
            };

        this.setState({ id, 
            batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc });

        setTimeout(() => {
            this.maCanBo.value(shcc ? shcc : '');
            this.tenTruong.value(tenTruong ? tenTruong : '');
            this.chuyenNganh.value(chuyenNganh ? chuyenNganh : '');
            this.batDau.value(batDau ? batDau : '');
            this.ketThuc.value(ketThuc ? ketThuc : '');
            this.hinhThuc.value(hinhThuc ? hinhThuc : '');
            this.loaiBangCap.value(loaiBangCap ? loaiBangCap : '');
            this.batDauType.value(batDauType ? batDauType : 'dd/mm/yyyy');
            this.ketThucType.value(ketThucType ? ketThucType : 'dd/mm/yyyy');
            this.thoiGian.value(thoiGian ? thoiGian : '');
            this.trinhDo.value(trinhDo ? trinhDo : '');
            this.kinhPhi.value(kinhPhi ? kinhPhi : '');
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
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu quá trình đào tạo trống', 'danger');
            this.batDau.focus();
        } else {
            list_ma.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    tenTruong: this.tenTruong.value(),
                    chuyenNganh: this.chuyenNganh.value(),
                    batDau: Number(this.batDau.value()),
                    ketThuc: Number(this.ketThuc.value()),
                    hinhThuc: this.hinhThuc.value(),
                    loaiBangCap: this.loaiBangCap.value(),
                    batDauType: this.state.batDauType,
                    ketThucType: this.state.ketThucType,
                    thoiGian: Number(this.thoiGian.value()),
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
        const canEdit = this.state.id ? false : true;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình đào tạo' : 'Tạo mới quá trình đào tạo',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12'  multiple={this.multiple} ref={e => this.maCanBo = e} data={SelectAdapter_FwCanBo} label='Mã thẻ cán bộ' readOnly={!canEdit} required/>
                <FormTextBox type='text' className='col-md-6' ref={e => this.tenTruong = e} label='Tên trường' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.chuyenNganh = e} label='Chuyên ngành' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.hinhThuc = e} data={SelectAdapter_DmHinhThucDaoTaoV2} label='Hình thức' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.loaiBangCap = e} data={SelectApdater_DmBangDaoTao} label='Loại bằng cấp' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.trinhDo = e} label="Trình độ" readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.kinhPhi = e} label="Kinh phí" readOnly={readOnly} />
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
                <FormTextBox type='text' className='col-md-4' ref={e => this.thoiGian = e} label='Thời gian' readOnly={readOnly} />
            </div>
        });
    }
}

class QtDaoTao extends AdminPage {
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
                this.props.getQtDaoTaoGroupPage();
            } else {
                this.props.getQtDaoTaoPage();
            }
            this.changeAdvancedSearch(true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtDaoTao && this.props.qtDaoTao.page ? this.props.qtDaoTao.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
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
        if (this.checked) this.props.getQtDaoTaoGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtDaoTaoPage(pageN, pageS, pageC, '', this.state.filter, done);
    }
    
    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (text, i, j) => {
        let deTais = text.split('??').map(str => <p key={i--} style={{ textTransform: 'uppercase' }}>{j - i}. {str}</p>);
        return deTais;
    }

    delete = (e, item) => {
        T.confirm('Xóa quá trình đào tạo', 'Bạn có chắc bạn muốn xóa quá trình đào tạo này', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtDaoTao(item.stt, error => {
                if (error) T.notify(error.message ? error.message : `Xoá quá trình đào tạo ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá quá trình đào tạo ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtDaoTao', ['read', 'write', 'delete']);
        let loaiDoiTuong = this.curState;
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtDaoTao && this.props.qtDaoTao.page_gr ?
                this.props.qtDaoTao.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtDaoTao && this.props.qtDaoTao.page ? this.props.qtDaoTao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '30%', textAlign: 'center' }}>Cán bộ</th>
                        {!this.checked && <th style={{ width: '15%', textAlign: 'center' }}>Tên trường</th>}
                        {!this.checked && <th style={{ width: '15%', textAlign: 'center' }}>Chuyên ngành</th>}
                        {!this.checked && <th style={{ width: '20%', textAlign: 'center' }}>Thời gian đào tạo</th>}
                        {!this.checked && <th style={{ width: '20%', textAlign: 'center' }}>Hình thức</th>}
                        {!this.checked && <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Loại bằng cấp</th>}
                        {this.checked && <th style={{width: 'auto', textAlign: 'center', whiteSpace: 'nowrap'}}>Số quá trình đào tạo</th>}
                        {this.checked && <th style={{width: '100%', textAlign: 'center'}}>Danh sách chuyên nghành đào tạo</th>}
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />
                        {!this.checked && <TableCell type='text' style={{}} content={item.tenTruong} />}
                        {!this.checked && <TableCell type='text' style={{}} content={item.chuyenNganh} />}
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Từ: <span style={{ color: 'blue' }}>{item.batDau ? new Date(item.batDau).ddmmyyyy() : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đến: <span style={{ color: 'blue' }}>{item.ketThuc ? new Date(item.ketThuc).ddmmyyyy() : ''}</span></span><br />
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={item.tenHTDT} />}
                        {!this.checked && <TableCell type='text' content={item.tenBDT} />}
                        {this.checked && <TableCell type='text' content={item.soQuaTrinh} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachChuyenNganh, item.soQuaTrinh, item.soQuaTrinh)} />}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} > </TableCell>
                        }
                        {
                            this.checked &&
                            <TableCell type='buttons' style={{ textAlign: 'center', width: '45px' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/dao-tao/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-podcast',
            title: 'Quá trình đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình đào tạo'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-3' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />
                    <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-3' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1}/>
                    <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1}/>
                </div>
            </>,
            content: <>
                <div className='tile'>
                <FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition, loaiDoiTuong }}
                    getPage={this.checked ? this.props.getQtDaoTaoGroupPage : this.props.getQtDaoTaoPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtDaoTao} update={this.props.updateQtDaoTao}
                     permissions={currentPermissions}
                    />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtDaoTao: state.tccb.qtDaoTao });
const mapActionsToProps = {
    getQtDaoTaoAll, getQtDaoTaoPage, deleteQtDaoTao, createQtDaoTao,
    updateQtDaoTao, getQtDaoTaoGroupPage
};
export default connect(mapStateToProps, mapActionsToProps)(QtDaoTao);