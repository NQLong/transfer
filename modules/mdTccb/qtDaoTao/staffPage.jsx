import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect, FormRichTextBox, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    getQtDaoTaoStaffPage, updateQtDaoTaoStaffPage,
    deleteQtDaoTaoStaffPage, createQtDaoTaoStaffPage
} from './redux';
import { SelectApdater_DmBangDaoTao } from 'modules/mdDanhMuc/dmBangDaoTao/redux';
import { SelectAdapter_DmHinhThucDaoTaoV2 } from 'modules/mdDanhMuc/dmHinhThucDaoTao/redux';
import { SelectApdaterDmTrinhDoDaoTaoFilter } from 'modules/mdDanhMuc/dmTrinhDoDaoTao/redux';

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

const chuyenNganhSupportText = {
    5: 'Ngoại ngữ',
    6: 'Tin học',
    7: 'Lý luận chính trị',
    8: 'Quản lý nhà nước'
};
class EditModal extends AdminModal {
    state = {
        id: null,
        item: null,
        shcc: '',
        email: '',
        batDau: null,
        ketThuc: null,
        loaiBangCap: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    }

    onShow = (item) => {
        let { id, batDauType, ketThucType, batDau, ketThuc, trinhDo, chuyenNganh, tenCoSoDaoTao, kinhPhi, hinhThuc, loaiBangCap }
            = item && item.item ? item.item :
                {
                    id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, chuyenNganh: '',
                    tenCoSoDaoTao: '', kinhPhi: '', hinhThuc: '', loaiBangCap: '', trinhDo: ''
                };
        this.setState({
            email: item.email,
            batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThuc ? ketThucType : 'dd/mm/yyyy',
            shcc: item.shcc, id, batDau, ketThuc, loaiBangCap: loaiBangCap ? loaiBangCap : (item.loaiBangCap ? item.loaiBangCap : ''),
            item: item.item, denNay: item.ketThuc == -1 ? true : false
        }, () => {
            this.loaiBangCap.value(loaiBangCap ? loaiBangCap : (item.loaiBangCap ? item.loaiBangCap : ''));
            this.trinhDo?.value(trinhDo ? trinhDo : (item.trinhDo ? item.trinhDo : ''));
            this.chuyenNganh?.value(chuyenNganh ? chuyenNganh : (this.state.loaiBangCap ? chuyenNganhSupportText[this.state.loaiBangCap] : ''));
            this.tenCoSoDaoTao?.value(tenCoSoDaoTao ? tenCoSoDaoTao : '');
            this.hinhThuc?.value(hinhThuc ? hinhThuc : '');
            if (this.state.ketThuc == -1) {
                this.setState({ denNay: true });
                this.denNayCheck.value(true);
                $('#ketThucDate').hide();
                $('#denNayCheckBox').show();
            }
            this.batDauType?.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType?.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.batDau?.setVal(batDau ? batDau : '');
            this.ketThuc?.setVal(ketThuc ? ketThuc : '');
            this.kinhPhi?.value(kinhPhi ? kinhPhi : '');
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
            email: this.state.email,
            batDau: this.batDau.getVal(),
            batDauType: this.state.batDauType,
            ketThucType: !this.state.denNay ? this.state.ketThucType : '',
            ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1,
            tenCoSoDaoTao: this.tenCoSoDaoTao.value(),
            chuyenNganh: this.chuyenNganh.value(),
            hinhThuc: this.hinhThuc.value(),
            loaiBangCap: this.loaiBangCap.value(),
            trinhDo: this.trinhDo.value()
        };
        if (!changes.loaiBangCap) {
            T.notify('Loại bằng cấp bị trống!', 'danger');
            this.loaiBangCap.focus();
        } else if (!changes.chuyenNganh) {
            T.notify('Nội dung bị trống!', 'danger');
            this.chuyenNganh.focus();
        } else if (!this.state.denNay && this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày bắt đầu lớn hơn ngày kết thúc', 'danger');
            this.batDau.focus();
        } else this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
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
        const displayElement = this.state.loaiBangCap == '' ? 'none' : 'block';
        return this.renderModal({
            title: 'Thông tin quá trình đào tạo',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='form-group col-md-4' ref={e => this.loaiBangCap = e} label='Loại bằng cấp' data={SelectApdater_DmBangDaoTao} onChange={this.handleBang} required />
                {
                    (this.state.loaiBangCap != '5' && this.state.loaiBangCap != '9') ?
                        <FormSelect ref={e => this.trinhDo = e} data={SelectApdaterDmTrinhDoDaoTaoFilter(this.state.loaiBangCap)}
                            className='col-md-4' style={{ display: this.checkBang(this.state.loaiBangCap) ? 'block' : 'none' }} label='Trình độ' />
                        :
                        <FormTextBox ref={e => this.trinhDo = e} className='form-group col-md-4' label='Trình độ/Kết quả' required />
                }
                <FormSelect ref={e => this.hinhThuc = e} className='form-group col-md-4' label='Hình thức' data={SelectAdapter_DmHinhThucDaoTaoV2} style={{ display: displayElement }} />
                <FormTextBox ref={e => this.chuyenNganh = e} className='form-group col-md-12' label='Nội dung bồi dưỡng, đào tạo' style={{ display: displayElement }} required readOnly={this.state.loaiBangCap == ''} />
                <FormRichTextBox ref={e => this.tenCoSoDaoTao = e} className='form-group col-md-12' label='Tên cơ sở bồi dưỡng, đào tạo' style={{ display: displayElement }} />
                <div className='form-group col-md-4' style={{ display: displayElement }}><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (&nbsp;<Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
                <div className='form-group col-md-4' id='ketThucDate' style={{ display: displayElement }}><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (&nbsp;<Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} />)</div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
                <div id='denNayCheckBox' style={{ display: displayElement }} className='form-group col-md-4' >
                    <FormCheckbox ref={e => this.denNayCheck = e} label='Đang diễn ra' onChange={this.handleKetThuc} />
                </div>
            </div>
        });
    }
}

class QtDaoTao extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { listShcc: shcc } });
            this.getPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ shcc: this.state.filter.listShcc });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtDaoTaoStaffPage(pageN, pageS, pageC, '', this.state.filter, done);
    }

    delete = (e, item) => {
        T.confirm('Xóa quá trình đào tạo', 'Bạn có chắc bạn muốn xóa quá trình đào tạo này', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtDaoTaoStaffPage(item.id);
        });
        e.preventDefault();
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
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtDaoTao && this.props.qtDaoTao.staffPage ? this.props.qtDaoTao.staffPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung đào tạo, bồi dưỡng</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên cơ sở</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hình thức</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết quả</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{}} content={item.chuyenNganh} />
                        <TableCell type='text' style={{}} content={item.tenCoSoDaoTao} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHinhThuc || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                            {item.batDau && <span>Bắt đầu: <span style={{ color: 'blue' }}>{T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')}</span><br /></span>}
                            {item.ketThuc && item.ketThuc == -1 ? <span style={{ color: 'red' }}>Đang diễn ra</span> : null}
                            {item.ketThuc && item.ketThuc != -1 ? <span>Kết thúc: <span style={{ color: 'blue' }}>{T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')}</span></span> : null}
                        </>} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.kinhPhi || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                            {item.loaiBangCap && <span style={{ color: 'blue' }}>{item.tenLoaiBangCap}<br /></span>}
                            {item.trinhDo && <span>Kết quả, trình độ: <span style={{ color: 'red' }}>{item.tenTrinhDo ? item.tenTrinhDo : item.trinhDo}<br /></span></span>}
                        </>} />
                        {
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show({ item })} onDelete={e => this.delete(e, item)} > </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-podcast',
            title: 'Thông tin đào tạo, bồi dưỡng',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Thông tin đào tạo, bồi dưỡng'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtDaoTaoStaffPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtDaoTaoStaffPage} update={this.props.updateQtDaoTaoStaffPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtDaoTao: state.tccb.qtDaoTao });
const mapActionsToProps = {
    getQtDaoTaoStaffPage, deleteQtDaoTaoStaffPage, createQtDaoTaoStaffPage,
    updateQtDaoTaoStaffPage
};
export default connect(mapStateToProps, mapActionsToProps)(QtDaoTao);