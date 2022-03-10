import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormRichTextBox, FormTextBox, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    getQtNghiPhepUserPage, deleteQtNghiPhepUserPage, createQtNghiPhepUserPage,
    updateQtNghiPhepUserPage
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
        let { id, lyDoNghi, batDau, batDauType, ketThuc, ketThucType, noiDen, tongNgayDuocNghi, soNgayXinNghi, soNgayTinhPhep, ghiChu, thamNien } = item.item ? item.item : {
            id: '', shcc: '', lyDoNghi: '', batDau: null, batDauType: '', ketThuc: null, ketThucType: '', noiDen: '', tongNgayDuocNghi: '',
            soNgayXinNghi: '', soNgayTinhPhep: '', ghiChu: '', thamNien: ''
        };

        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc,
            shcc: item.shcc
        }, () => {
            this.lyDoNghi.value(lyDoNghi ? lyDoNghi : '');
            this.noiDen.value(noiDen ? noiDen : '');
            this.tongNgayDuocNghi.value(tongNgayDuocNghi ? tongNgayDuocNghi : '');
            this.soNgayXinNghi.value(soNgayXinNghi ? soNgayXinNghi : '');
            this.soNgayTinhPhep.value(soNgayTinhPhep ? soNgayTinhPhep : '');
            this.ghiChu.value(ghiChu ? ghiChu : '');
            this.thamNien.value(thamNien ? thamNien : '');

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
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: !this.state.denNay ? this.state.ketThucType : '',
            ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1,
            noiDen: this.noiDen.value(),
            lyDoNghi: this.lyDoNghi.value(),
            tongNgayDuocNghi: this.tongNgayDuocNghi.value(),
            soNgayXinNghi: this.soNgayXinNghi.value(),
            soNgayTinhPhep: this.soNgayTinhPhep.value(),
            thamNien: this.thamNien.value(),
            ghiChu: this.ghiChu.value(),
        };
        if (!changes.lyDoNghi) {
            T.notify('Lý do nghỉ phép trống', 'danger');
            this.lyDoNghi.focus();
        } else if (!changes.batDau) {
            T.notify('Ngày bắt đầu nghỉ phép trống', 'danger');
            this.batDau.focus();
        } else if (!this.state.denNay && !this.ketThuc.getVal()) {
            T.notify('Ngày kết thúc nghỉ phép trống', 'danger');
            this.ketThuc.focus();
        } else if (!this.state.denNay && this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày bắt đầu lớn hơn ngày kết thúc', 'danger');
            this.batDau.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
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
    
    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.shcc ? 'Cập nhật quá trình nghỉ phép' : 'Tạo mới quá trình nghỉ phép',
            size: 'large',
            body: <div className='row'>
                <FormRichTextBox className='col-md-12' ref={e => this.lyDoNghi = e} rows={2} readOnly={readOnly} label='Lý do nghỉ' placeholder='Nhập lý do xin nghỉ phép (tối đa 200 ký tự)' required maxLength={200} />
                <FormTextBox className='col-md-12' ref={e => this.noiDen = e} label='Nơi đến khi nghỉ' />


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
                    <FormTextBox className='col-md-6' ref={e => this.tongNgayDuocNghi = e} label='Tổng số ngày được nghỉ' />
                <FormTextBox className='col-md-6' ref={e => this.soNgayXinNghi = e} label='Số ngày xin nghỉ' />
                <FormTextBox className='col-md-6' ref={e => this.soNgayTinhPhep = e} label='Số ngày tính phép' />
                <FormTextBox className='col-md-6' ref={e => this.thamNien = e} label='Thâm niên' />
                <FormRichTextBox className='col-md-12' ref={e => this.ghiChu = e} rows={2} readOnly={readOnly} label='Ghi chú' placeholder='Ghi chú (tối đa 200 ký tự)' maxLength={200} />
            </div>
        });
    }
}

class QtNghiPhepUserPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { list_shcc: shcc, list_dv: '', fromYear: null, toYear: null, tinhTrang: null } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtNghiPhepUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.list_shcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin nghỉ phép', 'Bạn có chắc bạn muốn xóa thông tin nghỉ phép này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNghiPhepUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin nghỉ phép bị lỗi!', 'danger');
                else T.alert('Xoá thông tin nghỉ phép thành công!', 'success', false, 800);
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
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtNghiPhep && this.props.qtNghiPhep.user_page ? this.props.qtNghiPhep.user_page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Lý do nghỉ</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi đến khi nghỉ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng số ngày được nghỉ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số ngày xin nghỉ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số ngày tính phép</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thâm niên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span></span> <br />
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.lyDoNghi ? item.lyDoNghi : ''}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.noiDen}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.tongNgayDuocNghi}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.soNgayXinNghi}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.soNgayTinhPhep}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.thamNien}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{(item.ketThuc == -1 || item.ketThuc >= item.today) ? <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đang nghỉ</span> : <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết thúc nghỉ</span>}</span>
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
            icon: 'fa fa-pause',
            title: 'Quá trình nghỉ phép',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Danh sách nghỉ phép'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} shcc={this.shcc} readOnly={!permission.write}
                    create={this.props.createQtNghiPhepUserPage} update={this.props.updateQtNghiPhepUserPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghiPhep: state.tccb.qtNghiPhep });
const mapActionsToProps = {
    getQtNghiPhepUserPage, deleteQtNghiPhepUserPage,
    updateQtNghiPhepUserPage, createQtNghiPhepUserPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiPhepUserPage);