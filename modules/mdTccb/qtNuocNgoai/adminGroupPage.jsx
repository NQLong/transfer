import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';
import { getQtNuocNgoaiPage, deleteQtNuocNgoaiGroupPageMa, createQtNuocNgoaiGroupPageMa,
    updateQtNuocNgoaiGroupPageMa }
from './redux';

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
const timeList = [
    { id: 0, text: 'Không' },
    { id: 1, text: 'Theo ngày bắt đầu - ngày kết thúc' },
    { id: 2, text: 'Theo ngày trở lại công tác' }
];
class EditModal extends AdminModal {
    state = {
        id: null,
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    };

    onShow = (item) => {
        let { id, shcc, quocGia, noiDung, batDau, batDauType, ketThuc, ketThucType, tenCoSo, kinhPhi, troLaiCongTac } = item ? item : {
            id: '', shcc: '', quocGia: '', noiDung: '', tenCoSo: '', batDau: null, batDauType: '', ketThuc: null, ketThucType: '', kinhPhi: null, troLaiCongTac: ''
        };

        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc
        });

        setTimeout(() => {
            this.maCanBo.value(shcc ? shcc : this.props.shcc);
            this.kinhPhi.value(kinhPhi);
            this.tenCoSo.value(tenCoSo ? tenCoSo : '');
            this.troLaiCongTac.value(troLaiCongTac);
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.batDau.setVal(batDau);
            this.ketThuc.setVal(ketThuc);
            this.quocGia.value(quocGia);
            this.noiDung.value(noiDung);
        }, 500);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.maCanBo.value(),
            tenCoSo: this.tenCoSo.value(),
            kinhPhi: this.kinhPhi.value(),
            troLaiCongTac: Number(this.troLaiCongTac.value()),
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: this.state.ketThucType,
            ketThuc: this.ketThuc.getVal(),
            quocGia: this.quocGia.value(),
            noiDung: this.noiDung.value()
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
            this.maCanBo.focus();
        } else if (!changes.noiDung) {
            T.notify('Nội dung đi nước ngoài trống', 'danger');
            this.noiDung.focus();
        } else if (!changes.batDau) {
            T.notify('Ngày bắt đầu đi nước ngoài trống', 'danger');
            this.batDau.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình đi nước ngoài' : 'Tạo mới quá trình đi nước ngoài',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} required />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} readOnly={readOnly} label='Nội dung' placeholder='Nhập nội dung đi nước ngoài (tối đa 200 ký tự)' required maxLength={200} />
                <FormTextBox className='col-md-12' ref={e => this.quocGia = e} label='Quốc gia' />
                <FormTextBox className='col-md-12' ref={e => this.tenCoSo = e} label='Tên cơ sở đào tạo/làm việc'  />

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

                <FormTextBox className='col-md-6' ref={e => this.kinhPhi = e} type='number' label='Kinh phí' readOnly={readOnly} />
                <FormDatePicker className='col-md-6' ref={e => this.troLaiCongTac = e} type='date-mask' label='Ngày tiếp nhận trở lại công tác' readOnly={readOnly} />
            </div>
        });
    }
}

class QtNuocNgoaiGroupPage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/nuoc-ngoai/group/:shcc'),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.setState({ filter: { timeType: 0, list_shcc: params.shcc, list_dv: '' } });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');

            T.showSearchBox(() => {
                this.timeType?.value(0);
                this.fromYear?.value('');
                this.toYear?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.props.getQtNuocNgoaiPage(undefined, undefined, undefined, this.state.filter, () => {
                T.updatePage('pageQtNuocNgoai', undefined, undefined, undefined, this.state.filter);
            });
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtNuocNgoai && this.props.qtNuocNgoai.page ? this.props.qtNuocNgoai.page : { pageNumber: 1, pageSize: 50 };
        const timeType = this.timeType?.value() || 0;
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const list_dv = this.state.filter.list_dv;
        const list_shcc = this.state.filter.list_shcc;
        const pageFilter = isInitial ? null : { list_dv, fromYear, toYear, list_shcc, timeType };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.timeType )) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtNuocNgoaiPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin đi nước ngoài', 'Bạn có chắc bạn muốn xóa thông tin đi nước ngoài này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNuocNgoaiGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin đi nước ngoài bị lỗi!', 'danger');
                else T.alert('Xoá thông tin đi nước ngoài thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }


    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtNuocNgoai', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtNuocNgoai && this.props.qtNuocNgoai.page ? this.props.qtNuocNgoai.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Nội dung</th>
                        <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Nơi làm việc</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th>
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
                                <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span></span> <br/>
                                <span style={{ whiteSpace: 'nowrap' }}>Trở lại công tác: <span style={{ color: 'blue' }}>{item.troLaiCongTac ? T.dateToText(item.troLaiCongTac, 'dd/mm/yyyy') : ''}</span></span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.noiDung ? item.noiDung : ''}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Tên cơ sở: <span>{item.tenCoSo ? item.tenCoSo : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Quốc gia: <span>{item.quocGia ? item.quocGia : ''}</span></span>
                            </>
                        )}
                        />
                       <TableCell type='text' content={(
                            <>
                                {item.kinhPhi ? item.kinhPhi : ''}
                            </>
                        )}
                        />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-fighter-jet',
            title: 'Quá trình đi nước ngoài - Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={0} to='/user/tccb/qua-trinh/nuoc-ngoai'>Quá trình đi nước ngoài</Link>,
                'Quá trình đi nước ngoài - Cán bộ'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} />
                    {this.timeType && this.timeType.value() && this.timeType.value() != 0 && <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-4' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} /> }
                    {this.timeType && this.timeType.value() && this.timeType.value() != 0 && <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-4' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} /> }
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
                    create={this.props.createQtNuocNgoaiGroupPageMa} update={this.props.updateQtNuocNgoaiGroupPageMa}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/nuoc-ngoai',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNuocNgoai: state.tccb.qtNuocNgoai });
const mapActionsToProps = {
    getQtNuocNgoaiPage, deleteQtNuocNgoaiGroupPageMa,
    updateQtNuocNgoaiGroupPageMa, createQtNuocNgoaiGroupPageMa,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNuocNgoaiGroupPage);