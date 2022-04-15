import React from 'react';
import { connect } from 'react-redux';
import { getDmMonHocPage, createDmMonHoc, updateDmMonHoc, deleteDmMonHoc, SelectAdapter_DmMonHocFacultyFilter, getDmMonHocPending } from './redux';
import { Link } from 'react-router-dom';
import { getDmDonViAll, SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, FormCheckbox, FormSelect, FormTabs, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    listMa = []
    componentDidMount() {
        this.onShown(() => {
            !this.props.permission.manage ? this.ma.focus() : this.tenVi.focus();
        });
    }

    onShow = (item) => {
        let { ma, ten, tinChiLt, tinChiTh, khoa, kichHoat, tienQuyet, id, phanHoi } = item ? item : { ma: null, ten: null, tinChiLt: 0, tinChiTh: 0, khoa: this.props.khoa, kichHoat: 1, tienQuyet: null, id: null, phanHoi: null };
        ten = ten && T.parse(ten, { vi: '', en: '' });
        ma ? this.listMa.push(ma) : this.listMa = [];
        this.setState({ ma, kichHoat, khoa, id, phanHoi }, () => {
            this.ma.value(ma || '');
            this.tenVi.value(ten ? ten.vi : '');
            this.tenEn.value(ten ? ten.en : '');
            this.tinChiLt.value(tinChiLt);
            this.tinChiTh.value(tinChiTh);
            this.khoa.value(khoa);
            this.tienQuyet.value(tienQuyet ? tienQuyet.split(',') : []);
            this.kichHoat.value(kichHoat);
            this.phanHoi.value(phanHoi);
        });

    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: T.stringify({
                vi: this.tenVi.value(),
                en: this.tenEn.value()
            }),
            tinChiLt: this.tinChiLt.value(),
            tinChiTh: this.tinChiTh.value(),
            khoa: this.khoa.value(),
            tienQuyet: this.tienQuyet.value() ? this.tienQuyet.value().join(',') : '',
            kichHoat: Number(this.kichHoat.value()),
            phanHoi: this.phanHoi.value()
        };
        if (changes.tenVi == '') {
            T.notify('Tên môn học (tiếng Việt) bị trống!', 'danger');
            this.tenVi.focus();
        } else if (changes.tinChiLt + changes.tinChiTh <= 0) {
            T.notify('Số tín chỉ phải lớn hơn 0!', 'danger');
            this.tinChiLt.focus();
        } else {
            changes.tongTinChi = changes.tinChiLt + changes.tinChiTh;
            changes.tietLt = changes.tinChiLt * 15;
            changes.tietTh = changes.tinChiTh * 30;
            changes.tongTiet = changes.tietLt + changes.tietTh;
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        const isDaoTao = this.props.permission.write;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật môn học' : 'Tạo mới môn học',
            size: 'large',
            body: <div className='row'>
                <FormTextBox style={{ display: this.state.ma ? 'block' : isDaoTao ? 'block' : 'none' }} className='col-12' ref={e => this.ma = e} label='Mã môn học' readOnly={!isDaoTao} required />

                <div className='col-12'>
                    <FormTabs tabs={[
                        {
                            title: <>Tên môn tiếng Việt  <span style={{ color: 'red' }}>*</span></>,
                            component: <FormTextBox ref={e => this.tenVi = e} placeholder='Tên ngành (tiếng Việt)' required />
                        },
                        {
                            title: <>Tên môn tiếng Anh</>,
                            component: <FormTextBox ref={e => this.tenEn = e} placeholder='Tên ngành (tiếng Anh)' />
                        }
                    ]} />
                </div>
                <FormTextBox type='number' className='col-6' ref={e => this.tinChiLt = e} label='Tín chỉ lý thuyết' readOnly={readOnly} required />
                <FormTextBox type='number' className='col-6' ref={e => this.tinChiTh = e} label='Tín chỉ thực hành' readOnly={readOnly} required />
                <FormSelect className='col-12' ref={e => this.khoa = e} data={SelectAdapter_DmDonViFaculty_V2} label='Khoa/Bộ môn' readOnly={!isDaoTao} required onChange={value => this.setState({ khoa: value.id })} />
                <FormSelect className='col-12' ref={e => this.tienQuyet = e} data={SelectAdapter_DmMonHocFacultyFilter(this.state.khoa, this.listMa)} onChange={value => value ? this.listMa.push(value.id) : []} multiple allowClear label='Danh sách môn tiên quyết' />
                <FormCheckbox className='col-md-12' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormRichTextBox style={{ display: isDaoTao ? (!this.state.ma ? 'block' : 'none') : (this.state.phanHoi) ? 'block' : 'none' }} className='col-md-12' ref={e => this.phanHoi = e} label='Phản hồi' readOnly={!isDaoTao} />
            </div>
        });
    }
}

class DmMonHocPage extends AdminPage {
    donViMapper = {};
    state = { donViFilter: '' }

    componentDidMount() {
        this.props.getDmDonViAll(items => {
            if (items) {
                this.donViMapper = {};
                items.forEach(item => this.donViMapper[item.ma] = item.ten);
            }
        });
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => {
                this.props.getDmMonHocPage(undefined, undefined, {
                    searchTerm: searchText
                });
                this.props.getDmMonHocPending(undefined, undefined, {
                    searchTerm: searchText
                });
            };
            this.setState({ donViFilter: this.props.system.user.staff?.maDonVi });
            T.showSearchBox();
            this.props.getDmMonHocPage(undefined, undefined, {
                searchTerm: ''
            });
            this.props.getDmMonHocPending(undefined, undefined, {
                searchTerm: ''
            });
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa môn học', 'Bạn có chắc bạn muốn xóa môn học này?', true, isConfirm =>
            isConfirm && this.props.deleteDmMonHoc(item.id));
    }

    render() {
        const permissionDaoTao = this.getUserPermission('dmMonHoc', ['read', 'write', 'delete', 'manage']);
        let permission = {
            write: permissionDaoTao.write || permissionDaoTao.manage,
            delete: permissionDaoTao.delete || permissionDaoTao.manage
        };
        const monHoc = this.props.dmMonHoc && this.props.dmMonHoc.page ?
            this.props.dmMonHoc.page : { pageNumber: 1, pageSize: 25, pageCondition: {}, totalItem: 0, pageTotal: 1, list: null };
        const monHocPending = this.props.dmMonHoc && this.props.dmMonHoc.pagePending ?
            this.props.dmMonHoc.pagePending : { pageNumber: 1, pageSize: 25, pageCondition: {}, totalItem: 0, pageTotal: 1, list: null };
        let remark = (item) => (item.ma || item.ma == '') ? '#FFFFFF' : (item.phanHoi ? '#ffdad9' : '#C8F7C8');
        let tableMonHoc = (props) => renderTable({
            emptyTable: 'Chưa có dữ liệu',
            header: 'thead-light',
            getDataSource: () => props.list, stickyHead: false,
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }}>Mã</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }}>Tên môn học</th>
                        <th colSpan='3' rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tín chỉ</th>
                        <th colSpan='3' rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết
                        </th>
                        <th rowSpan='2' style={{ width: '100%', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Khoa/Bộ môn</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }} nowrap='true'>Kích hoạt</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TH</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TH</th>
                    </tr>
                </>),
            renderRow: (item, index) => (
                <tr key={index} style={{ backgroundColor: remark(item) }}>
                    <TableCell style={{ textAlign: 'right' }} content={(props.pageNumber - 1) * props.pageSize + index + 1} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.ma || '(Chờ cấp mã)'} onClick={() => this.modal.show(item)} />
                    <TableCell contentClassName='multiple-lines-5' content={<>
                        <a href='#' onClick={e => e.preventDefault() || this.modal.show(item)} ><span style={{ color: 'black' }}>{T.parse(item.ten).vi}</span>< br />
                            {T.parse(item.ten).en != '' && <span style={{ color: 'blue' }}>{T.parse(item.ten).en}</span>}
                        </a>
                    </>} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.tongTinChi} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.tinChiLt} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.tinChiTh} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.tongTiet} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.tietLt} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.tietTh} />
                    <TableCell content={this.donViMapper && this.donViMapper[item.khoa] ? this.donViMapper[item.khoa] : ''} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateDmMonHoc(item.id, { kichHoat: value ? 1 : 0, })
                        } />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr >)
        });

        return this.renderPage({
            icon: 'fa fa-leanpub',
            title: 'Danh sách Môn Học',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Danh sách Môn Học'
            ],
            header: permissionDaoTao.read && <FormSelect style={{ width: '300px', marginBottom: '0' }} placeholder='Danh sách khoa/bộ môn' ref={e => this.donVi = e} onChange={value => {
                T.clearSearchBox();
                this.setState({ donViFilter: value ? value.id : '' });
                this.props.getDmMonHocPage(undefined, undefined, {
                    searchTerm: '',
                    donViFilter: value && value.id
                });
                this.props.getDmMonHocPending(undefined, undefined, {
                    searchTerm: '',
                    donViFilter: value && value.id
                });
            }} data={SelectAdapter_DmDonViFaculty_V2} allowClear={true} />,
            content: <>
                {(monHocPending.list && monHocPending.list.length > 0) ? <div className='tile'>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h4 className='tile-title col-8'>Danh sách môn học chờ cấp mã</h4>
                        <div> <Pagination style={{ position: 'initial' }} pageNumber={monHocPending.pageNumber} pageSize={monHocPending.pageSize} pageCondition={monHocPending.pageCondition} pageTotal={monHocPending.pageTotal} totalItem={monHocPending.totalItem}
                            getPage={this.props.getDmMonHocPending} /></div>
                    </div>
                    {tableMonHoc(monHocPending)}
                </div> : null}
                <div className='tile'>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h4 className='tile-title'>Danh sách môn học hiện tại</h4>
                        <div> <Pagination style={{ position: 'initial' }} pageNumber={monHoc.pageNumber} pageSize={monHoc.pageSize} pageCondition={monHoc.pageCondition} pageTotal={monHoc.pageTotal} totalItem={monHoc.totalItem}
                            getPage={this.props.getDmMonHocPage} /></div>
                    </div>
                    {tableMonHoc(monHoc)}
                </div>
                <EditModal ref={e => this.modal = e} permission={permissionDaoTao} readOnly={!permission.write}
                    create={this.props.createDmMonHoc} update={this.props.updateDmMonHoc}
                    khoa={this.state.donViFilter || this.props.system.user.staff?.maDonVi} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmMonHoc: state.daoTao.dmMonHoc });
const mapActionsToProps = { getDmDonViAll, getDmMonHocPage, createDmMonHoc, updateDmMonHoc, deleteDmMonHoc, getDmMonHocPending };
export default connect(mapStateToProps, mapActionsToProps)(DmMonHocPage);