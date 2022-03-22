import React from 'react';
import { connect } from 'react-redux';
import { getHcthCongVanDiPage, getHcthCongVanDiAll, createHcthCongVanDi, updateHcthCongVanDi, deleteHcthCongVanDi, getHcthCongVanDiSearchPage } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormDatePicker, renderTable, FormRichTextBox, FormSelect, TableCell, FormCheckbox} from 'view/component/AdminPage';
import T from 'view/js/common';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';


class EditModal extends AdminModal {
    state = {id: null, isDonVi: 0, isCanBo: 0};
    componentDidMount() {
        // T.ready(() => this.onShown(() => this.ngayGui.focus()));
    }

    onShow = (item) => {
        let { id, noiDung, ngayGui, ngayKy, maDonViGui, maDonViNhan, maCanBoNhan, isDonVi, isCanBo } = item ? item : { id: '', noiDung: '', ngayGui: '', ngayKy: '', maDonViGui: '', maDonViNhan: '', maCanBoNhan: '', isDonVi: 0, isCanBo: 0};
        this.setState({id, isDonVi, isCanBo});
        // console.log(item);
        this.setState({
            isDonVi: isDonVi == 1 | isDonVi == '1',
            isCanBo: isCanBo == 1 | isCanBo == '1'
        }, () => {
            this.noiDung.value(noiDung);
            this.ngayGui.value(ngayGui);
            this.ngayKy.value(ngayKy);
            this.donViGui.value(maDonViGui);
            // console.log("state don vi: " + maDonViNhan);
            // console.log("state can bo: " + maCanBoNhan);
            this.isDonVi.value(this.state.isDonVi);
            this.isCanBo.value(this.state.isCanBo);
            if (this.state.isDonVi) {
                $('#isdv').show();
                if (maDonViNhan) {
                    maDonViNhan = maDonViNhan.split(',');
                    this.donViNhan.value(maDonViNhan);
                }
            } else {
                $('#isdv').hide();
                this.donViNhan.value('');
            }
            
            if (this.state.isCanBo) {
                $('#iscb').show();
                if (maCanBoNhan) {
                    maCanBoNhan = maCanBoNhan.split(',');
                    this.canBoNhan.value(maCanBoNhan);
                } 
                // else this.canBoNhan.value('');
            } else {
                $('#iscb').hide();
                this.canBoNhan.value('');
            }
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            noiDung: this.noiDung.value(),
            ngayGui: Number(this.ngayGui.value()),
            ngayKy: Number(this.ngayKy.value()),
            donViGui: this.donViGui.value(),
            donViNhan: this.state.isDonVi ? this.donViNhan.value().toString() : '',
            canBoNhan: this.state.isCanBo ? this.canBoNhan.value().toString() : '',
            isDonVi: this.state.isDonVi ? 1 : 0,
            isCanBo: this.state.isCanBo ? 1 : 0,
        };
        console.log(changes);
        // console.log("don vi " + this.state.isDonVi);
        // console.log("can bo " + this.state.isCanBo);
        if (!changes.noiDung) {
            T.notify('Nội dung bị trống', 'danger');
            this.noiDung.focus();
        } else if (!changes.ngayGui) {
            T.notify('Ngày gửi công văn bị trống', 'danger');
            this.ngayGui.focus();
        } else if (!changes.ngayKy) {
            T.notify('Ngày ký công văn bị trống', 'danger');
            this.ngayKy.focus();
        } else if (!changes.donViGui) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.donViGui.focus();
        } else if (changes.isDonVi == 1 && !changes.donViNhan) {
            T.notify('Đơn vị nhận bị trống', 'danger');
            this.donViNhan.focus();
        } else if (changes.isCanBo == 1 && !changes.canBoNhan) {
            T.notify('Cán bộ nhận bị trống', 'danger');
            this.canBoNhan.focus();
        } else {
            (this.state.id && this.props.permission.write)? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật' : 'Tạo mới',
            size: 'large',
            body: (
                <div className='form-group row'>
                    <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayGui = e} label='Ngày gửi' readOnly={readOnly} required />
                    <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayKy = e} label='Ngày ký' readOnly={readOnly} required />
                    <FormSelect className='col-md-12' ref={e => this.donViGui = e} label='Đơn vị gửi công văn' data={SelectAdapter_DmDonVi} readOnly={readOnly} required />
                    <div className='col-md-12'>
                        <div className='row'>
                            <FormCheckbox isSwitch ref={e => this.isDonVi = e} className='col-md-12 formCheckDv' label='Đơn vị nhận' onChange={value => { value ? $('#isdv').show() : $('#isdv').hide(); this.setState({ isDonVi: value });}} />
                            <div className='col-md-12' id='isdv'><FormSelect multiple={true} ref={e => this.donViNhan = e} data={SelectAdapter_DmDonVi} readOnly={readOnly} required={this.state.isDonVi} /></div>
                        </div>
                    </div>                    
                    <div className='col-md-12'>
                        <div className='row'>
                            <FormCheckbox isSwitch ref={e => this.isCanBo = e} className='col-md-12 formCheckCb' label='Cán bộ nhận' onChange={value => { value ? $('#iscb').show() : $('#iscb').hide(); this.setState({ isCanBo: value});}} />
                            <div className='col-md-12' id='iscb'><FormSelect multiple={true} ref={e => this.canBoNhan = e} data={SelectAdapter_FwCanBo} readOnly={readOnly} required={this.state.isCanBo} /></div>
                        </div>
                    </div>                    
                    <FormRichTextBox type='text' className='col-md-12' ref={e => this.noiDung = e} label='Nội dung' readOnly={readOnly} required />
                </div>
            )
        });
    }
}
class HcthCongVanDi extends AdminPage {    
    state = { filter: {} };

    // modal = React.createRef();

    componentDidMount() {
        T.ready('/user/hcth', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');      
            T.showSearchBox(() => {
                this.maDonViGui?.value('');
                this.maDonViNhan?.value('');
                this.maCanBoNhan?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthCongVanDi && this.props.hcthCongVanDi.page ? this.props.hcthCongVanDi.page : { pageNumber: 1, pageSize: 50 };
        let donViGui = this.donViGui?.value();
        let donViNhan = this.donViNhan?.value();
        let canBoNhan = this.canBoNhan?.value();
        const pageFilter = isInitial ? {} : { donViGui, donViNhan, canBoNhan };
        this.setState({ filter: pageFilter }, () => {
            // console.log(this.state.filter);
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    // console.log('page filter' + page.filter);
                    
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.donViGui.value(filter.donViGui || '');
                    this.donViNhan.value(filter.donViNhan || '');
                    this.canBoNhan.value(filter.canBoNhan || '');
                    if (!$.isEmptyObject(filter) && filter && (filter.donViGui || filter.donViNhan || filter.canBoNhan)) this.showAdvanceSearch();
                }
            });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getHcthCongVanDiSearchPage(pageN, pageS, pageC, this.state.filter, done);
        console.log('state.filter ' + this.state.filter);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    onDelete = (id) => {
        console.log(id);
        T.confirm('Xóa công văn', 'Xác nhận?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteHcthCongVanDi(id, false, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá công văn bị lỗi!', 'danger');
                else T.alert('Xoá công văn đi thành công!', 'success', false, 800);
            });
        });
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
        permission = this.getUserPermission('hcthCongVanDi', ['read', 'write', 'delete']);
        let readOnly = !permission.write;
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.hcthCongVanDi ?
            this.props.hcthCongVanDi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách công văn đi!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '45%'}}>Nội dung</th>
                        <th style={{ width: 'auto'}}>Ngày gửi</th>
                        <th style={{ width: 'auto'}}>Ngày ký</th>
                        <th style={{ width: '15%'}}>Đơn vị gửi</th>
                        <th style={{ width: '15%'}}>Đơn vị nhận</th>
                        <th style={{ width: '15%'}}>Cán bộ nhận</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => {
                    let danhSachCanBoNhan = item.danhSachCanBoNhan?.split(';');
                    let danhSachDonViNhan = item.danhSachDonViNhan?.split(';');

                    // console.log(danhSachCanBoNhan);
                    return(
                        <tr key={index}>
                            <TableCell type='text' style={{textAlign: 'center'}} content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell type='link' content={item.noiDung ? item.noiDung : ''} onClick={() => this.modal.show(item)}/>
                            <TableCell type='text' content={T.dateToText(item.ngayGui, 'dd/mm/yyyy')} />
                            <TableCell type='text' content={T.dateToText(item.ngayKy, 'dd/mm/yyyy')} />
                            <TableCell type='text' content={item.tenDonViGui ? item.tenDonViGui : ''} />
                            <TableCell type='text' content={
                                danhSachDonViNhan && danhSachDonViNhan.length > 0 ? danhSachDonViNhan.map((item, index) => (
                                    <span key={index}>
                                        <span >{item?.normalizedName()}</span>
                                        <br />
                                    </span>
                                )) : null
                            } />                             
                            <TableCell type='text' content={
                                danhSachCanBoNhan && danhSachCanBoNhan.length > 0 ? danhSachCanBoNhan.map((item, index) => (
                                    <span key={index}>
                                        <span >{item?.normalizedName()}</span>
                                        <br />
                                    </span>
                                )) : null} />                            
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} 
                                onEdit={() => this.modal.show(item)} onDelete={() => this.onDelete(item.id)} permissions={currentPermissions}/>                    
                            </tr>

                    );
                }
            });
        }
        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Công văn đi',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hơp</Link>,
                'Công văn đi'
            ],
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            content:<>
                <div className="tile">{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={readOnly} permission={permission}
                create={this.props.createHcthCongVanDi} update={this.props.updateHcthCongVanDi} permissions={currentPermissions} />
                </>,
            backRoute: '/user/hcth',
            advanceSearch: <>
                <div className="row">
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViGui = e} label='Đơn vị gửi' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.donViNhan = e} label='Đơn vị nhận' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} />
                    <FormSelect allowClear={true} className='col-md-4' ref={e => this.canBoNhan = e} label='Cán bộ nhận' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} />
                </div>
            </>

        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi});
const mapActionsToProps = { getHcthCongVanDiAll, getHcthCongVanDiPage, createHcthCongVanDi, updateHcthCongVanDi, deleteHcthCongVanDi, getHcthCongVanDiSearchPage};
export default connect(mapStateToProps, mapActionsToProps)(HcthCongVanDi);
