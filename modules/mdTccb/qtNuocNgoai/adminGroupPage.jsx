import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';
import { getQtNuocNgoaiPage, deleteQtNuocNgoaiGroupPageMa, getQtNuocNgoaiGroupPageMa,
    updateQtNuocNgoaiGroupPageMa }
from './redux';
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
        let list_ma = this.maCanBo.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
            T.notify('Cán bộ đi nước ngoài trống', 'danger');
            this.maCanBo.focus();
        } else if (!this.noiDung.value()) {
            T.notify('Nội dung đi nước ngoài trống', 'danger');
            this.noiDung.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu đi nước ngoài trống', 'danger');
            this.batDau.focus();
        } else {
            list_ma.forEach((ma) => {
                const changes = {
                    shcc: ma,
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
                this.props.update(this.state.id, changes, this.hide);
            });
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
    ma = ''; loaiDoiTuong = '-1';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/nuoc-ngoai/group_nn/:loaiDoiTuong/:ma'),
                params = route.parse(window.location.pathname);
            this.loaiDoiTuong = params.loaiDoiTuong;
            this.ma = params.ma;
            T.onSearch = (searchText) => this.props.getQtNuocNgoaiPage(undefined, undefined, this.loaiDoiTuong, searchText || '');
            T.showSearchBox();
            this.props.getQtNuocNgoaiGroupPageMa(undefined, undefined, this.loaiDoiTuong, this.ma);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa khen thưởng', 'Bạn có chắc bạn muốn xóa khen thưởng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNuocNgoaiGroupPageMa(item.id, item.shcc, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá khen thưởng bị lỗi!', 'danger');
                else T.alert('Xoá khen thưởng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtNuocNgoai', ['read', 'write', 'delete']);
        let loaiDoiTuong = this.curState;
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtNuocNgoai && this.props.qtNuocNgoai.page ? this.props.qtNuocNgoai.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = <Loading />;
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
            title: ' Quá trình đi nước ngoài',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình nước ngoài'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition, loaiDoiTuong }}
                    getPage={this.props.getQtNuocNgoaiPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    update={this.props.updateQtNuocNgoaiGroupPageMa}
                    permissions={currentPermissions}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/nuoc-ngoai',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNuocNgoai: state.qtNuocNgoai });
const mapActionsToProps = {
    getQtNuocNgoaiPage, deleteQtNuocNgoaiGroupPageMa,
    updateQtNuocNgoaiGroupPageMa, getQtNuocNgoaiGroupPageMa,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNuocNgoaiGroupPage);