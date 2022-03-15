import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect, FormDatePicker, FormCheckbox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    getQtDaoTaoPage, getQtDaoTaoGroupPage, updateQtDaoTao,
    deleteQtDaoTao, createQtDaoTao
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectApdater_DmBangDaoTao } from 'modules/mdDanhMuc/dmBangDaoTao/redux';
import { SelectAdapter_DmHinhThucDaoTaoV2 } from 'modules/mdDanhMuc/dmHinhThucDaoTao/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectApdaterDmTrinhDoDaoTaoFilter } from 'modules/mdDanhMuc/dmTrinhDoDaoTao/redux';

const chuyenNganhSupportText = {
    5: 'Ngoại ngữ',
    6: 'Tin học',
    7: 'Lý luận chính trị',
    8: 'Quản lý nhà nước'
};

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
        id: null,
        item: null,
        shcc: '',
        email: '',
        batDau: '',
        ketThuc: '',
        loaiBangCap: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    }

    multiple = false;
    componentDidMount() {
    }

    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { shcc, tenCoSoDaoTao, chuyenNganh, batDau, ketThuc, hinhThuc, loaiBangCap, id,
            batDauType, ketThucType, trinhDo, kinhPhi } = item ? item : {
                shcc: '', tenCoSoDaoTao: '', chuyenNganh: '', batDau: '', ketThuc: '', hinhThuc: '', loaiBangCap: '', id: null,
                batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', thoiGian: '', trinhDo: '', kinhPhi: ''
            };

        this.setState({
            id,
            batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc, loaiBangCap
        },
            () => {
                this.maCanBo.value(shcc ? shcc : '');
                this.loaiBangCap.value(loaiBangCap ? loaiBangCap : '');
                this.trinhDo?.value(trinhDo ? trinhDo : '');
                this.chuyenNganh?.value(chuyenNganh ? chuyenNganh : (this.state.loaiBangCap ? chuyenNganhSupportText[this.state.loaiBangCap] : ''));
                this.tenCoSoDaoTao?.value(tenCoSoDaoTao ? tenCoSoDaoTao : '');
                this.hinhThuc?.value(hinhThuc ? hinhThuc : '');
                this.batDauType?.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
                this.ketThucType?.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
                this.batDau?.setVal(batDau ? batDau : '');
                this.ketThuc?.setVal(ketThuc ? ketThuc : '');
                this.kinhPhi?.value(kinhPhi ? kinhPhi : '');
            }
        );
    };

    onSubmit = (e) => {
        e.preventDefault();
        let list_ma = this.maCanBo.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
            T.notify('Cán bộ trống', 'danger');
            this.maCanBo.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu quá trình đào tạo trống', 'danger');
            this.batDau.focus();
        } else if (!this.chuyenNganh.value()) {
            T.notify('Nội dung đào tạo không được trống', 'danger');
            this.chuyenNganh.focus();
        } else {
            list_ma.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    tenCoSoDaoTao: this.tenCoSoDaoTao.value(),
                    chuyenNganh: this.chuyenNganh.value(),
                    batDau: Number(this.batDau.getVal()),
                    ketThuc: Number(this.ketThuc.getVal()),
                    hinhThuc: this.hinhThuc.value(),
                    loaiBangCap: this.loaiBangCap.value(),
                    batDauType: this.state.batDauType,
                    ketThucType: this.state.ketThucType,
                    kinhPhi: this.kinhPhi.value(),
                };
                if (index == list_ma.length - 1) {
                    this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide, false);
                    this.setState({
                        id: ''
                    });
                    this.maCanBo.reset();
                }
                else {
                    this.state.id ? this.props.update(this.state.id, changes) : this.props.create(changes, null, false);
                }
            });
        }
    }

    handleBang = (value) => {
        this.setState({ loaiBangCap: value.id }, () => {
            this.trinhDo?.value(this.state.item?.trinhDo ? this.state.item?.trinhDo : '');
            this.chuyenNganh?.value(this.state.item?.chuyenNganh ? this.state.item?.chuyenNganh : chuyenNganhSupportText[value.id]);
        });

    }

    checkBang = (loaiBangCap) => {
        return (loaiBangCap != '' && loaiBangCap != '1' && loaiBangCap != '2' && loaiBangCap != '9');
    };

    render = () => {
        const displayElement = this.state.loaiBangCap == '' ? 'none' : 'block';
        const canEdit = this.state.id ? false : true;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình đào tạo' : 'Tạo mới quá trình đào tạo',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} data={SelectAdapter_FwCanBo} label='Mã thẻ cán bộ' readOnly={!canEdit} required />
                <FormSelect className='form-group col-md-6' ref={e => this.loaiBangCap = e} label='Loại bằng cấp' data={SelectApdater_DmBangDaoTao} onChange={this.handleBang} required />
                {
                    (this.state.loaiBangCap != '5' && this.state.loaiBangCap != '9') ?
                        <FormSelect ref={e => this.trinhDo = e} data={SelectApdaterDmTrinhDoDaoTaoFilter(this.state.loaiBangCap)}
                            className='col-md-6' style={{ display: this.checkBang(this.state.loaiBangCap) ? 'block' : 'none' }} label='Trình độ/Kết quả' />
                        :
                        <FormTextBox ref={e => this.trinhDo = e} className='form-group col-md-6' label='Trình độ/Kết quả' required={this.state.loaiBangCap != '9'} />
                }
                <FormRichTextBox ref={e => this.chuyenNganh = e} className='form-group col-md-12' label='Nội dung bồi dưỡng, đào tạo' style={{ display: displayElement }} required />
                <FormRichTextBox ref={e => this.tenCoSoDaoTao = e} className='form-group col-md-12' label='Tên cơ sở bồi dưỡng, đào tạo' style={{ display: displayElement }} />
                <FormSelect ref={e => this.hinhThuc = e} className='form-group col-md-6' label='Hình thức' data={SelectAdapter_DmHinhThucDaoTaoV2} style={{ display: displayElement }} />
                <FormTextBox ref={e => this.kinhPhi = e} className='form-group col-md-6' label='Kinh phí' style={{ display: displayElement }} />
                <div className='form-group col-md-6' style={{ display: displayElement }}><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
                <div className='form-group col-md-6' style={{ display: displayElement }}><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} />)</div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
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
                this.loaiBang?.value('');
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
        const list_loaiBang = this.loaiBang?.value().toString() || '';
        const pageFilter = isInitial ? null : { list_dv, fromYear, toYear, list_shcc, list_loaiBang };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.maDonVi?.value(filter.list_dv);
                    this.mulCanBo?.value(filter.list_shcc);
                    this.loaiBang?.value(filter.list_loaiBang);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.list_shcc || filter.list_dv || filter.list_loaiBang)) this.showAdvanceSearch();
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
        if (i == 0) return [];
        let deTais = text.split('??').map(str => <div key={i--}>{j - i}.  {str}</div>);
        return deTais;
    }

    delete = (e, item) => {
        T.confirm('Xóa quá trình đào tạo', 'Bạn có chắc bạn muốn xóa quá trình đào tạo này', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtDaoTao(item.id);
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
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br/>Đơn vị công tác</th>
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung đào tạo, bồi dưỡng</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên cơ sở đào tạo, bồi dưỡng</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hình thức</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết quả</th>}
                        {this.checked && <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Số quá trình đào tạo</th>}
                        {this.checked && <th style={{ width: '100%', textAlign: 'center' }}>Danh sách chuyên ngành đào tạo</th>}
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                                {item.shcc} <br/>
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                {item.tenHocVi ? item.tenHocVi : ''}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                {item.tenChucDanhNgheNghiep ? item.tenChucDanhNgheNghiep : ''}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span> { item.tenChucVu ? item.tenChucVu : '' } <br/> </span>
                                {item.tenDonVi ? item.tenDonVi.normalizedName() : ''}
                            </>
                        )}
                        />
                        {!this.checked && <TableCell type='text' style={{}} content={item.chuyenNganh} />}
                        {!this.checked && <TableCell type='text' style={{}} content={item.tenCoSoDaoTao} />}
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hinhThuc ? item.tenHinhThuc : ''} />}
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                            {item.batDau && <span>Bắt đầu: <span style={{ color: 'blue' }}>{T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')}</span><br /></span>}
                            {item.ketThuc ? <span>Kết thúc: <span style={{ color: 'blue' }}>{T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')}</span></span> : null}
                        </>} />}
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.kinhPhi ? item.kinhPhi : ''} />}
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                            {item.loaiBangCap && <span style={{ color: 'red' }}>{item.tenLoaiBangCap}<br /></span>}
                            {item.trinhDo && <span>Kết quả, trình độ: <span style={{ color: 'red' }}>{item.tenTrinhDo ? item.tenTrinhDo : item.trinhDo}<br /></span></span>}
                        </>} />}
                        {this.checked && <TableCell type='text' style={{ textAlign: 'center' }} content={item.soQuaTrinh} />}
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
                    <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-4' label='Từ thời gian (bắt đầu)' onChange={() => this.changeAdvancedSearch()} />
                    <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-4' label='Đến thời gian (bắt đầu)' onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect className='col-12 col-md-4' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.loaiBang = e} label='Loại bằng cấp' data={SelectApdater_DmBangDaoTao} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
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
            onExport: !this.checked ? (e) => {
                e.preventDefault();
                const { fromYear, toYear, list_shcc, list_dv, list_loaiBang } = (this.state.filter && this.state.filter != '%%%%%%%%') ? this.state.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, list_loaiBang: null };
                T.download(T.url(`/api/qua-trinh/dao-tao/download-excel/${list_shcc ? list_shcc : null}/${list_dv ? list_dv : null}/${fromYear ? fromYear : null}/${toYear ? toYear : null}/${list_loaiBang ? list_loaiBang : null}`), 'daotaoboiduong.xlsx');
            } : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtDaoTao: state.tccb.qtDaoTao });
const mapActionsToProps = {
    getQtDaoTaoPage, deleteQtDaoTao, createQtDaoTao,
    updateQtDaoTao, getQtDaoTaoGroupPage
};
export default connect(mapStateToProps, mapActionsToProps)(QtDaoTao);