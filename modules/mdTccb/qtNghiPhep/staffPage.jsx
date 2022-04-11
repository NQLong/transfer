import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormRichTextBox, FormTextBox, renderTable, TableCell, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    getQtNghiPhepUserPage, deleteQtNghiPhepUserPage, createQtNghiPhepUserPage,
    updateQtNghiPhepUserPage, getQtNghiPhepAllUser
} from './redux';
import { SelectAdapter_DmNghiPhepV2 } from 'modules/mdDanhMuc/dmNghiPhep/redux';
import { getDmNghiPhep } from 'modules/mdDanhMuc/dmNghiPhep/redux';

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
        soNgayNghiPhepConLai: 0,
        soNgayXinNghi: 0,
        soNgayPhep: 0,
        ngayPhepLyDo: 0,
        lyDoKhac: false,
    };
    calcSoNgayPhepConLai = (shcc, ngayBatDauCongTac, current, done) => {
        new Promise(resolve => {
            let result = 12 + current;
            if (ngayBatDauCongTac) { //+ thâm niên
                let thamnien = parseInt(T.monthDiff(new Date(ngayBatDauCongTac), new Date()) / 12 / 5);
                result += thamnien;
            }
            let currentYear = new Date().getFullYear();
            this.props.getAll(shcc, items => {
                const solve = (idx = 0) => {
                    if (idx == items.length)  {
                        resolve(result);
                        return;
                    }
                    let year = new Date(items[idx].batDau).getFullYear();
                    if (year == currentYear) {
                        this.props.getNghiPhep(items[idx].lyDo, itemNghiPhep => {
                            let value = Math.max(T.numberNgayNghi(new Date(items[idx].batDau), new Date(items[idx].ketThuc)) - itemNghiPhep.soNgayPhep, 0);
                            result -= value;
                            solve(idx + 1);
                        });
                    }
                };
                solve();
            });
        }).then(data => {
            done && done(data);
        });
    };
    onShow = (item) => {
        let { id, shcc, lyDo, batDau, batDauType, ketThuc, ketThucType, noiDen, ghiChu, lyDoKhac, ngayNghiPhep, ngayBatDauCongTac } = item && item.item ? item.item : {
            id: '', shcc: '', lyDo: '', batDau: null, batDauType: '', ketThuc: null, ketThucType: '', noiDen: '', ghiChu: '', lyDoKhac: '', ngayNghiPhep: 0, ngayBatDauCongTac: null
        };
        if (!shcc) {
            shcc = item.shcc;
        }
        this.calcSoNgayPhepConLai(shcc, ngayBatDauCongTac, batDau && ketThuc ? Math.max(T.numberNgayNghi(new Date(batDau), new Date(ketThuc)) - ngayNghiPhep, 0) : 0, soNgayNghiPhepConLai => {
            this.setState({ soNgayNghiPhepConLai });
        });
        this.setState({
            soNgayXinNghi: batDau && ketThuc ? T.numberNgayNghi(new Date(batDau), new Date(ketThuc)) : 0,
            soNgayPhep: batDau && ketThuc ? Math.max(T.numberNgayNghi(new Date(batDau), new Date(ketThuc)) - ngayNghiPhep, 0) : 0,
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc, lyDoKhac: lyDo == '99' ? true : false,
            ngayPhepLyDo: ngayNghiPhep, shcc: shcc
        }, () => {
            this.lyDo.value(lyDo || '');
            this.noiDen.value(noiDen || '');
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.batDau.setVal(batDau || '');
            this.ketThuc.setVal(ketThuc || '');
            this.lyDoKhac.value(lyDoKhac || '');
            this.ghiChu.value(ghiChu || '');
            this.state.lyDoKhac ? $('#lyDoKhac').show() : $('#lyDoKhac').hide();
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: this.state.ketThucType,
            ketThuc: this.ketThuc.getVal(),
            noiDen: this.noiDen.value(),
            lyDo: this.lyDo.value(),
            ghiChu: this.ghiChu.value(),
            lyDoKhac: this.lyDoKhac.value(),
        };
        if (!this.lyDo.value()) {
            T.notify('Lý do nghỉ phép trống', 'danger');
            this.lyDo.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu nghỉ phép trống', 'danger');
            this.batDau.focus();
        } else if (!this.ketThuc.getVal()) {
            T.notify('Ngày kết thúc nghỉ phép trống', 'danger');
            this.ketThuc.focus();
        } else if (this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày bắt đầu lớn hơn ngày kết thúc', 'danger');
            this.batDau.focus();
        } else if (this.state.soNgayXinNghi == -1) {
            T.notify('Chênh lệch giữa ngày bắt đầu và kết thúc là rất lớn', 'danger');
            this.batDau.focus();
        } else if (this.state.soNgayNghiPhepConLai + this.state.ngayPhepLyDo < this.state.soNgayPhep) {
            T.notify(`Số ngày phép có thể sử dụng ${this.state.soNgayNghiPhepConLai + this.state.ngayPhepLyDo} nhỏ hơn số ngày phép đăng ký ${this.state.soNgayPhep}`, 'danger');
            this.batDau.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    handleBatDau = (value) => {
        this.setState({ batDau: value }, () => {
            let { batDau, ketThuc, ngayPhepLyDo } = this.state;
            if (batDau && ketThuc) {
                this.setState({
                    soNgayXinNghi: T.numberNgayNghi(new Date(batDau), new Date(ketThuc)),
                    soNgayPhep: Math.max(T.numberNgayNghi(new Date(batDau), new Date(ketThuc)) - ngayPhepLyDo, 0),
                });
            }
        });
    }
    handleKetThuc = (value) => {
        this.setState({ ketThuc: value }, () => {
            let { batDau, ketThuc, ngayPhepLyDo } = this.state;
            if (batDau && ketThuc) {
                this.setState({
                    soNgayXinNghi: T.numberNgayNghi(new Date(batDau), new Date(ketThuc)),
                    soNgayPhep: Math.max(T.numberNgayNghi(new Date(batDau), new Date(ketThuc)) - ngayPhepLyDo, 0),
                });
            }
        });
    }
    handleLyDo = (value) => {
        if (value.id == '99') {
            this.setState({ lyDoKhac: true, ngayPhepLyDo: value.soNgayPhep }, () => {
                $('#lyDoKhac').show();
                let { batDau, ketThuc, ngayPhepLyDo } = this.state;
                if (batDau && ketThuc) {
                    this.setState({
                        soNgayPhep: Math.max(T.numberNgayNghi(new Date(batDau), new Date(ketThuc)) - ngayPhepLyDo, 0),
                    });
                }
                
            });
        } else {
            this.setState({ lyDoKhac: false, ngayPhepLyDo: value.soNgayPhep}, () => {
                $('#lyDoKhac').hide();
                let { batDau, ketThuc, ngayPhepLyDo } = this.state;
                if (batDau && ketThuc) {
                    this.setState({
                        soNgayPhep: Math.max(T.numberNgayNghi(new Date(batDau), new Date(ketThuc)) - ngayPhepLyDo, 0),
                    });
                }
            });
        }
    }
    render = () => {
        const readOnly = this.props.readOnly;
        const currentYear = (new Date()).getFullYear();
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình nghỉ phép' : 'Tạo mới quá trình nghỉ phép',
            size: 'large',
            body: <div className='row'>
                <span className='form-group col-md-12' style={{ color: 'blue'}}>Năm {currentYear}, cán bộ còn <b>{this.state.soNgayNghiPhepConLai}</b> ngày nghỉ phép<br/></span>
                <FormSelect className='col-md-6' ref={e => this.lyDo = e} readOnly={readOnly} data={SelectAdapter_DmNghiPhepV2} label='Lý do nghỉ' onChange={this.handleLyDo} required />
                <div className='col-md-12' id='lyDoKhac'><FormRichTextBox type='text' ref={e => this.lyDoKhac = e} rows={2} label='Nhập lý do khác' placeholder='Nhập lý do xin nghỉ phép (tối đa 200 ký tự)' readOnly={readOnly} /> </div>
                <FormTextBox className='col-md-12' ref={e => this.noiDen = e} label='Nơi đến' />
            
                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} onChange={this.handleBatDau} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} onChange={this.handleKetThuc} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
                <span className='form-group col-md-6' style={{ color: 'blue'}}>Tổng số ngày xin nghỉ là <b>{this.state.soNgayXinNghi}</b> ngày</span>
                <span className='form-group col-md-6' style={{ color: 'blue'}}>Tổng số ngày phép là <b>{this.state.soNgayPhep}</b> ngày<br/></span>
                <FormRichTextBox className='col-md-12' ref={e => this.ghiChu = e} rows={2} readOnly={readOnly} label='Ghi chú' placeholder='Ghi chú (tối đa 200 ký tự)' />
            </div>
        });
    }
}

class QtNghiPhepUserPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { listShcc: shcc, listDv: '', fromYear: null, toYear: null, tinhTrang: null, lyDo: '' } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtNghiPhepUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.listShcc });
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
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtNghiPhep && this.props.qtNghiPhep.userPage ? this.props.qtNghiPhep.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Lý do nghỉ</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi đến</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số ngày<br/>xin nghỉ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số ngày<br/>tính phép</th>
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
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' content={item.lyDo == '99' ? item.lyDoKhac : <b>{item.tenNghiPhep}</b>} />
                        <TableCell type='text' content={item.noiDen} />
                        <TableCell type='number' content={T.numberNgayNghi(new Date(item.batDau), new Date(item.ketThuc))} />
                        <TableCell type='number' content={Math.max(T.numberNgayNghi(new Date(item.batDau), new Date(item.ketThuc)) - item.ngayNghiPhep, 0)} />
                        <TableCell type='text' content={parseInt(T.monthDiff(new Date(item.ngayBatDauCongTac), new Date()) / 12 / 5) + 'tn'} />
                        <TableCell type='text' content={(
                            <>
                                <span>{(item.ketThuc == -1 || item.ketThuc >= item.today) ? <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đang nghỉ</span> : <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết<br/>thúc nghỉ</span>}</span>
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
                    <h3 className='tile-title'>
                        Thống kê
                    </h3>
                    <b>{'Số lượng: ' + totalItem.toString()}</b>
                </div>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} shcc={this.shcc} readOnly={!permission.write}
                    create={this.props.createQtNghiPhepUserPage} update={this.props.updateQtNghiPhepUserPage} getAll={this.props.getQtNghiPhepAllUser} getNghiPhep={this.props.getDmNghiPhep}
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
    updateQtNghiPhepUserPage, createQtNghiPhepUserPage, getQtNghiPhepAllUser, getDmNghiPhep
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiPhepUserPage);