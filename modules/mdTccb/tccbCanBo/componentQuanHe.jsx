import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DmQuanHeGiaDinh } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import { DateInput, Select } from 'view/component/Input';
import { getDmQuanHeGiaDinhAll } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import {
    getStaffEdit, createStaff, updateStaff,
    createQuanHeCanBo, updateQuanHeCanBo, deleteQuanHeCanBo
} from './redux';
class EditModal extends AdminModal {
    state = {
        id: null,
        email: '',
        type: null,
        shcc: ''
    }

    onShow = (item, type, email, shcc) => {
        let { id, hoTen, moiQuanHe, namSinh, ngheNghiep, noiCongTac, diaChi, queQuan } = item ? item : { id: null, hoTen: '', moiQuanHe: '', namSinh: '', ngheNghiep: '', noiCongTac: '', diaChi: '', queQuan: '' };
        this.setState({ email: email, id, type: type, shcc: shcc });
        setTimeout(() => {
            this.hoTen.value(hoTen ? hoTen : '');
            this.moiQuanHe.setVal(moiQuanHe ? moiQuanHe : null);
            this.namSinh.setVal(namSinh ? namSinh : null);
            this.ngheNghiep.value(ngheNghiep ? ngheNghiep : '');
            this.noiCongTac.value(noiCongTac ? noiCongTac : '');
            this.diaChi.value(diaChi ? diaChi : '');
            this.queQuan.value(queQuan ? queQuan : '');
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            type = this.state.type,
            shcc = this.state.shcc,
            changes = {
                shcc: this.state.shcc,
                hoTen: this.hoTen.value(),
                moiQuanHe: this.moiQuanHe.getVal(),
                namSinh: this.namSinh.getVal(),
                ngheNghiep: this.ngheNghiep.value(),
                noiCongTac: this.noiCongTac.value(),
                diaChi: this.diaChi.value(),
                queQuan: this.queQuan.value()
            };
        if (id) {
            this.props.update(id, changes, error => {
                if (error == undefined || error == null) {
                    this.props.getData(shcc);
                    this.hide();
                }
            });
        } else {
            changes.shcc = shcc;
            changes.type = type;
            this.props.create(changes, () => {
                this.props.getData(shcc);
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin quan hệ gia đình',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-md-6' ref={e => this.hoTen = e} label='Họ tên' />
            <div className='col-md-6'><Select ref={e => this.moiQuanHe = e} adapter={SelectAdapter_DmQuanHeGiaDinh} label='Mối quan hệ' /></div>
            <FormTextBox className='col-md-8' ref={e => this.ngheNghiep = e} label='Nghề nghiệp' />
            <div className='col-md-4'><DateInput ref={e => this.namSinh = e} label='Năm sinh (yyyy)' type='year' /></div>
            <FormTextBox className='col-md-12' ref={e => this.noiCongTac = e} label='Nơi công tác' />
            <FormTextBox className='col-md-12' ref={e => this.queQuan = e} label='Nguyên quán' />
            <FormTextBox className='col-md-12' ref={e => this.diaChi = e} label='Địa chỉ hiện tại' />
        </div>,
    });
}
class ComponentQuanHe extends AdminPage {
    state = {};
    data = [];
    phai = '';
    email = '';
    shcc = '';
    mapperQuanHe = {};

    componentDidMount() {
        this.props.getDmQuanHeGiaDinhAll(null, items => items.forEach(item => this.mapperQuanHe[item.ma] = item.ten));
    }

    createRelation = (e, type) => {
        e.preventDefault();
        this.modal.show(null, type, this.email, this.shcc);
    }

    editQuanHe = (e, item, type) => {
        this.modal.show(item, type, this.email, this.shcc);
        e.preventDefault();
    }

    deleteQuanHe = (e, item) => {
        T.confirm('Xóa thông tin người thân', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && this.props.delete(item.id, this.shcc));
        e.preventDefault();
    }
    value(item, email, phai, shcc) {
        this.data = item ? item : [];
        this.phai = phai;
        this.email = email;
        this.shcc = shcc;
    }

    render() {
        let voChongText = this.phai == '01' ? 'vợ' : 'chồng';
        let permission = this.getUserPermission('staff', ['read', 'write', 'delete']);
        const renderQuanHeTable = (items, type) => (
            renderTable({
                getDataSource: () => items.filter(i => i.type == type), stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '30%' }}>Họ và tên</th>
                        <th style={{ width: '20%' }}>Năm sinh</th>
                        <th style={{ width: '10%' }}>Quan hệ</th>
                        <th style={{ width: '20%' }}>Nghề nghiệp</th>
                        <th style={{ width: '20%' }}>Địa chỉ</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='link' content={item.hoTen} onClick={e => this.editQuanHe(e, item, type)} />
                        <TableCell type='text' content={T.dateToText(item.namSinh, 'yyyy')} />
                        <TableCell type='text' content={this.mapperQuanHe[item.moiQuanHe]} />
                        <TableCell type='text' content={item.ngheNghiep} />
                        <TableCell type='text' content={item.diaChi} />
                        <TableCell type='buttons' content={item} permission={permission} permissionDelete={true}
                        onEdit={e => this.editQuanHe(e, item, type)} 
                        onDelete={e => this.deleteQuanHe(e, item)}></TableCell>
                    </tr>),
            })
        );
        
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin người thân</h3>
                <ul className='nav nav-tabs' id='myTab' role='tablist'>
                    <li className='nav-item'>
                        <a className='nav-link active' id='infoQuanHe0' data-toggle='tab' href='#infoQuanHe0Content' role='tab' aria-controls='infoQuanHe0Content' aria-selected='true'>Về gia đình</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link' id='infoQuanHe1' data-toggle='tab' href='#infoQuanHe1Content' role='tab' aria-controls='infoQuanHe1Content' aria-selected='false'>Về bản thân</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link' id='infoQuanHe2' data-toggle='tab' href='#infoQuanHe2Content' role='tab' aria-controls='infoQuanHe2Content' aria-selected='false'>Về bên {voChongText}</a>
                    </li>
                </ul>
                <div className='tab-content' style={{ paddingTop: '10px' }}>
                    <div className='tab-pane fade show active' id='infoQuanHe0Content' role='tabpanel' aria-labelledby='infoQuanHe0'>
                        <p>Gồm {voChongText} và các con</p>
                        <div className='tile-body'>{
                            renderQuanHeTable(this.data ? this.data.filter(i => i.type == 2) : [], 2)
                        }</div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.createRelation(e, 2)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin người thân
                            </button>
                        </div>
                    </div>
                    <div className='tab-pane fade' id='infoQuanHe1Content' role='tabpanel' aria-labelledby='infoQuanHe1'>
                        <p>Gồm người thân ruột</p>
                        <div className='tile-body'>{
                            renderQuanHeTable(this.data ? this.data.filter(i => i.type == 0) : [], 0)
                        }</div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.createRelation(e, 0)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin người thân
                            </button>
                        </div>
                    </div>
                    <div className='tab-pane fade' id='infoQuanHe2Content' role='tabpanel' aria-labelledby='infoQuanHe2'>
                        <p>Gồm người thân ruột của {voChongText}</p>
                        <div className='tile-body'>{
                            renderQuanHeTable(this.data ? this.data.filter(i => i.type == 1) : [], 1)
                        }</div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.createRelation(e, 1)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin người thân
                            </button>
                        </div>
                    </div>
                </div>
                <EditModal ref={e => this.modal = e}
                    getData={this.props.getStaffEdit}
                    mapperQuanHe={this.mapperQuanHe}
                    create={this.props.createQuanHeCanBo}
                    update={this.props.updateQuanHeCanBo} />
            </div>
        );
    }
}
const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, updateStaff, createStaff, getDmQuanHeGiaDinhAll,    
    createQuanHeCanBo, updateQuanHeCanBo, deleteQuanHeCanBo
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentQuanHe);
