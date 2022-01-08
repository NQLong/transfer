import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';
import { getQtNuocNgoaiPage, deleteQtNuocNgoaiStaff, createQtNuocNgoaiStaff,
    updateQtNuocNgoaiStaff, getQtNuocNgoaiGroupPage }
from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import Loading from 'view/component/Loading';

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
            this.maCanBo.value(shcc);
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
        if (!changes.noiDung) {
            T.notify('Nội dung đi nước ngoài trống', 'danger');
            this.noiDung.focus();
        } else if (changes.noiDung.length > 200) {
            T.notify('Nội dung đi nước ngoài dài quá 200 ký tự', 'danger');
            this.noiDung.focus();
        } else if (!changes.quocGia) {
            T.notify('Quốc gia đi nước ngoài trống', 'danger');
            this.quocGia.focus();
        } else if (!changes.batDau) {
            T.notify('Thời gian bắt đầu bị trống!', 'danger');
            this.batDau.focus();
        } else if (!changes.tenCoSo) {
            T.notify('Cơ sở bị trống!', 'danger');
            this.tenCoSo.focus();
        }
        else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide, false) : this.props.create(changes, this.hide, false);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        const canEdit = this.state.id ? false : true;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình đi nước ngoài' : 'Tạo mới quá trình đi nước ngoài',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={!canEdit} />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} readOnly={readOnly} label='Nội dung' placeholder='Nhập nội dung đi nước ngoài (tối đa 200 ký tự)' required maxLength={200} />
                <FormTextBox className='col-md-12' ref={e => this.quocGia = e} label='Quốc gia' required />
                <FormTextBox className='col-md-12' ref={e => this.tenCoSo = e} label='Tên cơ sở đào tạo/làm việc' required />

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

class QtNuocNgoai extends AdminPage {
    checked = false;
    curState = [];
    searchText = '';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => {
                this.searchText = searchText;
                if (this.checked) this.props.getQtNuocNgoaiGroupPage(undefined, undefined, this.curState, this.searchText || '');
                else this.props.getQtNuocNgoaiPage(undefined, undefined, this.curState, this.searchText || '');
            };
            T.showSearchBox(() => {
                this.loaiDoiTuong?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
                setTimeout(() => this.showAdvanceSearch(), 1000);
            });
            this.changeAdvancedSearch();
        });
    }

    changeAdvancedSearch = () => {
        let { pageNumber, pageSize } = this.props && this.props.QtNuocNgoai && this.props.QtNuocNgoai.page ? this.props.QtNuocNgoai.page : { pageNumber: 1, pageSize: 50 };
        const loaiDoiTuong = this.loaiDoiTuong?.value() || [];
        this.curState = loaiDoiTuong;
        if (this.checked) this.props.getQtNuocNgoaiGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtNuocNgoaiPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    groupPage = () => {
        this.checked = !this.checked;
        if (this.checked) this.props.getQtNuocNgoaiGroupPage(undefined, undefined, this.curState, this.searchText || '');
        else this.props.getQtNuocNgoaiPage(undefined, undefined, this.curState, this.searchText || '');
    }
    delete = (e, item) => {
        T.confirm('Xóa quá trình đi nước ngoài', 'Bạn có chắc bạn muốn xóa quá trình đi nước ngoài này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNuocNgoaiStaff(item.id, false, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá quá trình đi nước ngoài bị lỗi!', 'danger');
                else T.alert('Xoá quá trình đi nước ngoài thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtNuocNgoai', ['read', 'write', 'delete']);
        let loaiDoiTuong = this.curState;
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtNuocNgoai && this.props.qtNuocNgoai.page_gr ?
                this.props.qtNuocNgoai.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtNuocNgoai && this.props.qtNuocNgoai.page ? this.props.qtNuocNgoai.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = <Loading />;
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Cán bộ</th>
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
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{item.hoCanBo + ' ' + item.tenCanBo}</span><br />
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
                                <span>Tên cơ sở: <span>{item.tenCoSo ? item.tenCoSo : ''}</span></span><br />
                                <span>Quốc gia: <span>{item.quocGia ? item.quocGia : ''}</span></span>
                            </>
                        )}
                        />
                       <TableCell type='text' content={(
                            <>
                                {item.kinhPhi ? item.kinhPhi : ''}
                            </>
                        )}
                        />
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/nuoc-ngoai/group_nn/-1/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-fighter-jet',
            title: ' Quá trình nước ngoài',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình nước ngoài'
            ],
            advanceSearch: <>
                <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.loaiDoiTuong = e} label='Chọn loại đơn vị (có thể chọn nhiều loại)' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} />
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Gom đối tượng' onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition, loaiDoiTuong }}
                    getPage={this.checked ? this.props.getQtNuocNgoaiGroupPage : this.props.getQtNuocNgoaiPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtNuocNgoaiStaff} update={this.props.updateQtNuocNgoaiStaff}
                    permissions={currentPermissions}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNuocNgoai: state.qtNuocNgoai });
const mapActionsToProps = {
    getQtNuocNgoaiPage, deleteQtNuocNgoaiStaff, createQtNuocNgoaiStaff,
    updateQtNuocNgoaiStaff, getQtNuocNgoaiGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNuocNgoai);