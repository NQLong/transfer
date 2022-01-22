import { SelectApdater_DmBangDaoTao } from 'modules/mdDanhMuc/dmBangDaoTao/redux';
import { SelectAdapter_DmHinhThucDaoTaoV2 } from 'modules/mdDanhMuc/dmHinhThucDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { createQtDaoTao, updateQtDaoTao, deleteQtDaoTao, createQtDaoTaoStaffUser, updateQtDaoTaoStaffUser, deleteQtDaoTaoStaffUser } from './redux';
import { SelectApdaterDmTrinhDoDaoTaoFilter } from 'modules/mdDanhMuc/dmTrinhDoDaoTao/redux';
import { AdminModal, FormSelect, AdminPage, renderTable, TableCell, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import { DateInput } from 'view/component/Input';
import Dropdown from 'view/component/Dropdown';

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
                        className='col-md-6' style={{ display: this.checkBang(this.state.loaiBangCap) ? 'block' : 'none' }} label='Trình độ/Kết quả'/>
                    : 
                    <FormTextBox ref={e => this.trinhDo = e} className='form-group col-md-6' label='Trình độ/Kết quả' required/>
            }
            <FormRichTextBox ref={e => this.chuyenNganh = e} className='form-group col-md-12' label='Nội dung bồi dưỡng, đào tạo' style={{ display: displayElement }} required/>
            <FormTextBox ref={e => this.tenCoSoDaoTao = e} className='form-group col-md-12' label='Tên cơ sở bồi dưỡng, đào tạo' style={{ display: displayElement }}/>
            <FormSelect ref={e => this.hinhThuc = e} className='form-group col-md-6' label='Hình thức' data={SelectAdapter_DmHinhThucDaoTaoV2} style={{ display: displayElement }}/>
            <FormTextBox ref={e => this.kinhPhi = e} className='form-group col-md-6' label='Kinh phí' style={{ display: displayElement }}/>
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
    });}
}


class ComponentDaoTao extends AdminPage {

    state = { shcc: '', email: '' };
    value = (shcc, email) => {
        this.setState({ shcc: shcc, email: email });
    }

    showModal = (e, item, shcc, email) => {
        e.preventDefault();
        this.modal.show({ item: item, shcc: shcc, email: email });
    }

    showModalUpload = (e) => {
        e.preventDefault();
        this.modalUpload.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin quá trình đào tạo', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && (this.props.userEdit ? this.props.deleteQtDaoTaoStaffUser(item.id, this.state.email) : this.props.deleteQtDaoTao(item.id, this.state.shcc, true)));
        e.preventDefault();
    }

    render = () => {
        let dataDT = !this.props.userEdit ? this.props.staff?.selectedItem?.daoTao : this.props.staff?.userItem?.daoTao;
        const permission = {
            write: true,
            read: true,
            delete: true
        };

        const renderTableDT = (items) => (
            renderTable({
                getDataSource: () => items,
                stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung bồi dưỡng</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Tên cơ sở</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hình thức</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Kết quả</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
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
                            {item.trinhDo && <span>Kết quả: <span style={{ color: 'blue' }}>{item.tenTrinhDo ? item.tenTrinhDo : item.trinhDo}<br /></span></span>}
                        </>} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show({ email: this.state.email, item: item, shcc: this.state.shcc })}
                            onDelete={this.delete}></TableCell>
                    </tr>
                )
            })
        );

        return (
            <div className='tile'>
                <h3 className='tile-title'>Quá trình học tập, bồi dưỡng, nâng cao chuyên môn, nghiệp vụ, lý luận chính trị</h3>
                <div className='tile-body'>
                    {
                        dataDT && renderTableDT(dataDT)
                    }
                    {<div className='tile-footer' style={{ textAlign: 'right' }}>
                        {/* <button className='btn btn-success' type='button' onClick={e => this.showModalUpload(e)}>
                            <i className='fa fa-fw fa-lg fa-upload' />Upload dữ liệu
                        </button> */}
                        <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null, this.state.shcc, this.state.email)}>
                            <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin đào tạo
                        </button>
                    </div>
                    }
                    <EditModal ref={e => this.modal = e} userEdit={this.props.userEdit}
                        create={this.props.userEdit ? this.props.createQtDaoTaoStaffUser : this.props.createQtDaoTao}
                        update={this.props.userEdit ? this.props.updateQtDaoTaoStaffUser : this.props.updateQtDaoTao}
                    />
                    {/* <UploadData ref={e => this.modalUpload = e}
                        shcc={this.state.shcc} email={this.state.email} userEdit={this.props.userEdit}
                        create={this.props.userEdit ? this.props.createQtNckhStaffUser : this.props.createQtNckhStaff}
                        renderTable={renderTableNCKH} /> */}
                </div>
            </div>
        );

    }
}

const mapStateToProps = state => ({ system: state.system, staff: state.tccb.staff });
const mapActionsToProps = {
    createQtDaoTao, updateQtDaoTao, deleteQtDaoTao, createQtDaoTaoStaffUser, updateQtDaoTaoStaffUser, deleteQtDaoTaoStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentDaoTao);