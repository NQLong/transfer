import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormTextBox, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    getQtNuocNgoaiUserPage, deleteQtNuocNgoaiUserPage, createQtNuocNgoaiUserPage,
    updateQtNuocNgoaiUserPage
}
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
class EditModal extends AdminModal {
    state = {
        id: null,
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    };

    onShow = (item) => {
        let { id, quocGia, noiDung, batDau, batDauType, ketThuc, ketThucType, tenCoSo, kinhPhi, troLaiCongTac } = item && item.item ? item.item : {
            id: '', quocGia: '', noiDung: '', tenCoSo: '', batDau: null, batDauType: '', ketThuc: null, ketThucType: '', kinhPhi: null, troLaiCongTac: ''
        };
        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc,
            shcc: item.shcc
        }, () => {
            this.kinhPhi.value(kinhPhi);
            this.tenCoSo.value(tenCoSo ? tenCoSo : '');
            this.troLaiCongTac.value(troLaiCongTac);
            this.quocGia.value(quocGia);
            this.noiDung.value(noiDung);

            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.state.ketThuc != -1 && this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            if (this.state.ketThuc == -1) {
                this.setState({ denNay: true });
                this.denNayCheck.value(true);
                $('#ketThucDate').hide();
            } else {
                this.setState({ denNay: false });
                this.denNayCheck.value(false);
                $('#ketThucDate').show();
            }
            this.batDau.setVal(batDau ? batDau : '');
            this.state.ketThuc != -1 && this.ketThuc.setVal(ketThuc ? ketThuc : '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
            tenCoSo: this.tenCoSo.value(),
            kinhPhi: this.kinhPhi.value(),
            troLaiCongTac: Number(this.troLaiCongTac.value()),
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: !this.state.denNay ? this.state.ketThucType : '',
            ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1,
            quocGia: this.quocGia.value(),
            noiDung: this.noiDung.value()
        };
        if (!changes.noiDung) {
            T.notify('Nội dung công tác ngoài nước trống', 'danger');
            this.noiDung.focus();
        } else if (!changes.batDau) {
            T.notify('Ngày bắt đầu công tác ngoài nước trống', 'danger');
            this.batDau.focus();
        } else if (!this.state.denNay && !this.ketThuc.getVal()) {
            T.notify('Ngày kết thúc công tác ngoài nước trống', 'danger');
            this.ketThuc.focus();
        } else if (!this.state.denNay && this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày bắt đầu lớn hơn ngày kết thúc', 'danger');
            this.batDau.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình công tác ngoài nước' : 'Tạo mới quá trình công tác ngoài nước',
            size: 'large',
            body: <div className='row'>
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} readOnly={readOnly} label='Nội dung' placeholder='Nhập nội dung công tác ngoài nước (tối đa 200 ký tự)' required maxLength={200} />
                <FormTextBox className='col-md-12' ref={e => this.quocGia = e} label='Quốc gia' />
                <FormTextBox className='col-md-12' ref={e => this.tenCoSo = e} label='Tên cơ sở đào tạo/làm việc' />

                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <FormCheckbox ref={e => this.denNayCheck = e} label='Đến nay' onChange={this.handleKetThuc} className='form-group col-md-3' />
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>

                <FormTextBox className='col-md-6' ref={e => this.kinhPhi = e} type='number' label='Kinh phí' readOnly={readOnly} />
                <FormDatePicker className='col-md-6' ref={e => this.troLaiCongTac = e} type='date-mask' label='Ngày tiếp nhận trở lại công tác' readOnly={readOnly} />
            </div>
        });
    }
}

class QtNuocNgoaiUserPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { list_shcc: shcc, list_dv: '', fromYear: null, toYear: null, timeType: 0, tinhTrang: null } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtNuocNgoaiUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.list_shcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin công tác ngoài nước', 'Bạn có chắc bạn muốn xóa thông tin công tác ngoài nước này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNuocNgoaiUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin công tác ngoài nước bị lỗi!', 'danger');
                else T.alert('Xoá thông tin công tác ngoài nước thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    handleKetThuc = (value) => {
        value ? $('#ketThucDate').hide() : $('#ketThucDate').show();
        this.setState({ denNay: value });
        if (!value) {
            this.ketThucType?.setText({ text: this.state.ketThucType ? this.state.ketThucType : 'dd/mm/yyyy' });
        } else {
            this.ketThucType?.setText({ text: '' });
        }
    }

    render() {
        let permission = this.getUserPermission('staff', ['login']);
        if (permission.login == true) {
            permission = {
                write: true,
                delete: true
            };
        }
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtNuocNgoai && this.props.qtNuocNgoai.user_page ? this.props.qtNuocNgoai.user_page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi làm việc</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span></span> <br />
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
                        <TableCell type='text' content={(
                            <>
                                <span>{(item.ketThuc == -1 || item.ketThuc >= item.today) ? <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đang diễn ra</span> : <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết thúc</span>}</span>
                            </>
                        )}></TableCell>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ item, shcc })} onDelete={this.delete} >
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-fighter-jet',
            title: 'Quá trình công tác ngoài nước',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Công tác ngoài nước'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} shcc={this.shcc} readOnly={!permission.write}
                    create={this.props.createQtNuocNgoaiUserPage} update={this.props.updateQtNuocNgoaiUserPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNuocNgoai: state.tccb.qtNuocNgoai });
const mapActionsToProps = {
    getQtNuocNgoaiUserPage, deleteQtNuocNgoaiUserPage,
    updateQtNuocNgoaiUserPage, createQtNuocNgoaiUserPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNuocNgoaiUserPage);