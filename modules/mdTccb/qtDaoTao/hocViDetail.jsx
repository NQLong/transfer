import { SelectApdater_DmBangDaoTao } from 'modules/mdDanhMuc/dmBangDaoTao/redux';
import { SelectAdapter_DmHinhThucDaoTaoV2 } from 'modules/mdDanhMuc/dmHinhThucDaoTao/redux';
import { SelectApdaterDmTrinhDoDaoTaoFilter } from 'modules/mdDanhMuc/dmTrinhDoDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { getStaffEdit, userGetStaff } from '../tccbCanBo/redux';
import { createQtDaoTao, createQtDaoTaoStaffUser } from './redux';

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
            shcc: item.shcc, id, batDau, ketThuc, loaiBangCap: loaiBangCap ? loaiBangCap : (item.loaiBangCap ? item.loaiBangCap : ''),
            item: item.item
        }, () => {
            this.loaiBangCap.value(loaiBangCap ? loaiBangCap : (item.loaiBangCap ? item.loaiBangCap : ''));
            this.trinhDo?.value(trinhDo ? trinhDo : (item.trinhDo ? item.trinhDo : ''));
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
                <FormSelect className='form-group col-md-4' ref={e => this.loaiBangCap = e} label='Loại bằng cấp' data={SelectApdater_DmBangDaoTao} onChange={this.handleBang} required />
                {
                    (this.state.loaiBangCap != '5' && this.state.loaiBangCap != '9') ?
                        <FormSelect ref={e => this.trinhDo = e} data={SelectApdaterDmTrinhDoDaoTaoFilter(this.state.loaiBangCap)}
                            className='col-md-4' style={{ display: this.checkBang(this.state.loaiBangCap) ? 'block' : 'none' }} label='Trình độ' />
                        :
                        <FormTextBox ref={e => this.trinhDo = e} className='form-group col-md-4' label='Trình độ/Kết quả' required />
                }
                <FormSelect ref={e => this.hinhThuc = e} className='form-group col-md-4' label='Hình thức' data={SelectAdapter_DmHinhThucDaoTaoV2} style={{ display: displayElement }} />
                <FormRichTextBox ref={e => this.chuyenNganh = e} className='form-group col-md-12' label='Chuyên ngành đào tạo' style={{ display: displayElement }} required />
                <FormRichTextBox ref={e => this.tenCoSoDaoTao = e} className='form-group col-md-12' label='Tên cơ sở bồi dưỡng, đào tạo' style={{ display: displayElement }} />
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

class HocViDetail extends AdminPage {
    state = { shcc: '', email: '', loaiBangCap: '', trinhDo: '' };

    value = (shcc, email, loaiBangCap, trinhDo) => {
        this.setState({ shcc, email, loaiBangCap, trinhDo });
    }
    render = () => {
        let dataDaoTao = this.props.tccb ? this.props.staff?.selectedItem?.hocViCB?.filter(i => i.tenTrinhDo === this.props.tenHocVi) :
            this.props.staff?.userItem?.hocViCB?.filter(i => i.tenTrinhDo === this.props.tenHocVi);
        const permission = {
            write: true,
            read: true,
            delete: true
        };
        const renderHocVi = (items) => (
            renderTable({
                emptyTable: 'Chưa có dữ liệu về quá trình đào tạo ' + this.props.tenHocVi,
                getDataSource: () => items,
                stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Chuyên ngành đào tạo {this.props.tenHocVi}</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên cơ sở đào tạo</th>
                        {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hình thức</th> */}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th> */}
                        {/* <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Kết quả</th> */}
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{}} content={item.chuyenNganh} />
                        <TableCell type='text' style={{}} content={item.tenCoSoDaoTao} />
                        {/* <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hinhThuc ? item.tenHinhThuc : ''} /> */}
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                            {item.batDau && <span>Từ: <span style={{ color: 'blue' }}>{T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')}</span><br /></span>}
                            {item.ketThuc && <span>Đến: <span style={{ color: 'blue' }}>{T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')}</span></span>}
                        </>} />
                        {/* <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.kinhPhi ? item.kinhPhi : ''} /> */}
                        {/* <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                            {item.loaiBangCap && <span style={{ color: 'blue' }}>{item.tenLoaiBangCap}<br /></span>}
                            {item.trinhDo && <span>Kết quả: <span style={{ color: 'blue' }}>{item.tenTrinhDo ? item.tenTrinhDo : item.trinhDo}<br /></span></span>}
                        </>} /> */}
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show({ email: this.state.email, item: item, shcc: this.state.shcc })}
                            onDelete={this.delete}></TableCell>
                    </tr>
                )
            })
        );
        return (
            <div className='col-md-12 form-group' style={this.props.style}>
                <div className='tile-body'>{dataDaoTao && renderHocVi(dataDaoTao)}</div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-info' type='button' onClick={e => { e.preventDefault(); this.modal.show({ email: this.state.email, item: null, shcc: this.state.shcc, loaiBangCap: this.state.loaiBangCap, trinhDo: this.state.trinhDo }); }}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình đào tạo {this.props.tenHocVi}
                    </button>
                </div>
                <EditModal ref={e => this.modal = e} hocVi={this.props.tenHocVi} value={this.value}
                    create={this.props.tccb ? this.props.createQtDaoTao : this.props.createQtDaoTaoStaffUser} />
            </div>
            // (dataDaoTao && dataDaoTao.length > 0) ? renderHocVi(dataDaoTao) : (
            //     <div className='form-group col-md-10'>
            //         <a href='#' onClick={e => {
            //             e.preventDefault();
            //             this.modal.show({ item: null, shcc: this.props.shcc, email: this.props.email });
            //         }}>Thêm quá trình đào tạo {this.props.tenHocVi}</a>
            //         <EditModal ref={e => this.modal = e} hocVi={this.props.tenHocVi} value={this.value}
            //             create={this.props.tccb ? this.props.createQtDaoTao : this.props.createQtDaoTaoStaffUser} />
            //     </div>
            // )
        );
    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, userGetStaff, createQtDaoTao, createQtDaoTaoStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(HocViDetail);