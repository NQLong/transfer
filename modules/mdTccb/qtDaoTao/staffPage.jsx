import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect, FormRichTextBox } from 'view/component/AdminPage';
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

export class EditModal extends AdminModal {
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
            shcc: item.shcc, id, batDau, ketThuc, loaiBangCap,
            item: item.item
        }, () => {
            this.loaiBangCap.value(loaiBangCap ? loaiBangCap : '');
            this.trinhDo?.value(trinhDo ? trinhDo : '');
            this.chuyenNganh?.value(chuyenNganh ? chuyenNganh : '');
            this.tenCoSoDaoTao?.value(tenCoSoDaoTao ? tenCoSoDaoTao : '');
            this.hinhThuc?.value(hinhThuc ? hinhThuc : '');
            this.batDauType?.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType?.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.batDau?.setVal(batDau ? batDau : '');
            this.ketThuc?.setVal(ketThuc ? ketThuc : '');
            this.kinhPhi?.value(kinhPhi ? kinhPhi : '');
        });
    }

    onSubmit = () => {
        const changes = {
            shcc: this.state.shcc,
            email: this.state.email,
            batDau: this.batDau.getVal(),
            ketThuc: this.ketThuc.getVal(),
            batDauType: this.state.batDauType,
            ketThucType: this.state.ketThucType,
            tenTruong: this.tenCoSoDaoTao.value(),
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
        } else this.state.id ? this.props.update(this.state.id, changes, this.hide, true) : this.props.create(changes, this.hide, true);
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
        return this.renderModal({
            title: 'Thông tin quá trình đào tạo',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='form-group col-md-6' ref={e => this.loaiBangCap = e} label='Loại bằng cấp' data={SelectApdater_DmBangDaoTao} onChange={this.handleBang} required />
                {
                    (this.state.loaiBangCap != '5' && this.state.loaiBangCap != '9') ?
                        <FormSelect ref={e => this.trinhDo = e} data={SelectApdaterDmTrinhDoDaoTaoFilter(this.state.loaiBangCap)}
                            className='col-md-6' style={{ display: this.checkBang(this.state.loaiBangCap) ? 'block' : 'none' }} label='Trình độ/Kết quả' />
                        :
                        <FormTextBox ref={e => this.trinhDo = e} className='form-group col-md-6' label='Trình độ/Kết quả' required />
                }
                <FormRichTextBox ref={e => this.chuyenNganh = e} className='form-group col-md-12' label='Nội dung bồi dưỡng, đào tạo' style={{ display: displayElement }} required />
                <FormTextBox ref={e => this.tenCoSoDaoTao = e} className='form-group col-md-12' label='Tên cơ sở bồi dưỡng, đào tạo' style={{ display: displayElement }} />
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
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { list_shcc: shcc } });
            this.getPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ shcc: this.state.filter.list_shcc });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtDaoTaoStaffPage(pageN, pageS, pageC, '', this.state.filter, done);
    }

    delete = (e, item) => {
        T.confirm('Xóa quá trình đào tạo', 'Bạn có chắc bạn muốn xóa quá trình đào tạo này', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtDaoTaoStaffPage(item.stt, error => {
                if (error) T.notify(error.message ? error.message : `Xoá quá trình đào tạo ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá quá trình đào tạo ${item.ten} thành công!`, 'success', false, 800);
            });
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
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtDaoTao && this.props.qtDaoTao.staff_page ? this.props.qtDaoTao.staff_page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
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
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{}} content={item.chuyenNganh} />
                        <TableCell type='text' style={{}} content={item.tenCoSoDaoTao} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hinhThuc ? item.tenHinhThuc : ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                            {item.batDau && <span>Từ: <span style={{ color: 'blue' }}>{T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')}</span><br /></span>}
                            {item.ketThuc && <span>Đến: <span style={{ color: 'blue' }}>{T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')}</span></span>}
                        </>} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.kinhPhi ? item.kinhPhi : ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                            {item.loaiBangCap && <span style={{ color: 'blue' }}>{item.tenLoaiBangCap}<br /></span>}
                            {item.trinhDo && <span>Kết quả, trình độ: <span style={{ color: 'blue' }}>{item.tenTrinhDo ? item.tenTrinhDo : item.trinhDo}<br /></span></span>}
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