import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DmQuanHeGiaDinhV2 } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import { getDmQuanHeGiaDinhAll } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import {
    getStaffEdit, createStaff, updateStaff,
    createQuanHeCanBo, updateQuanHeCanBo, deleteQuanHeCanBo, createQuanHeStaffUser, updateQuanHeStaffUser, deleteQuanHeStaffUser
} from './redux';
class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.hoTen.focus()));
    }

    onShow = (item) => {
        let { id, hoTen, moiQuanHe, namSinh, ngheNghiep, noiCongTac, diaChi, queQuan } = item && item.item ? item.item : { id: null, hoTen: '', moiQuanHe: '', namSinh: '', ngheNghiep: '', noiCongTac: '', diaChi: '', queQuan: '' };

        this.hoTen.value(hoTen ? hoTen : '');
        this.moiQuanHe.value(moiQuanHe ? moiQuanHe : null);
        this.namSinh.value(namSinh ? namSinh : '');
        this.ngheNghiep.value(ngheNghiep ? ngheNghiep : '');
        this.noiCongTac.value(noiCongTac ? noiCongTac : '');
        this.diaChi.value(diaChi ? diaChi : '');
        this.queQuan.value(queQuan ? queQuan : '');
        this.setState({ item, email: item.email, id, type: item.type, shcc: item.shcc });

    }

    onSubmit = () => {
        const changes = {
            email: this.state.email,
            shcc: this.state.shcc,
            type: this.state.type,
            hoTen: this.hoTen.value(),
            moiQuanHe: this.moiQuanHe.value(),
            namSinh: this.namSinh.value(),
            ngheNghiep: this.ngheNghiep.value(),
            noiCongTac: this.noiCongTac.value(),
            diaChi: this.diaChi.value(),
            queQuan: this.queQuan.value()
        };
        if (changes.hoTen == '') {
            T.notify('Họ và tên bị trống!', 'danger');
            this.hoTen.focus();
        } else if (!changes.moiQuanHe) {
            T.notify('Mối quan hệ bị trống!', 'danger');
            this.moiQuanHe.focus();
        } else if (changes.namSinh == '') {
            T.notify('Năm sinh bị trống!', 'danger');
            this.namSinh.focus();
        }
        else if (this.state.id) {
            this.props.update(this.state.id, changes, this.hide);
        } else {
            this.props.create(changes, this.hide);
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin quan hệ gia đình',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-md-6' ref={e => this.hoTen = e} label='Họ tên' required />
            <FormSelect className='col-md-6' ref={e => this.moiQuanHe = e} data={SelectAdapter_DmQuanHeGiaDinhV2} label='Mối quan hệ' required />
            <FormTextBox className='col-md-8' ref={e => this.ngheNghiep = e} label='Nghề nghiệp' />
            <FormTextBox ref={e => this.namSinh = e} type='year' className='form-group col-md-4' label='Năm sinh' required />
            <FormTextBox className='col-md-12' ref={e => this.noiCongTac = e} label='Nơi công tác' />
            <FormTextBox className='col-md-12' ref={e => this.queQuan = e} label='Nguyên quán' />
            <FormTextBox className='col-md-12' ref={e => this.diaChi = e} label='Địa chỉ hiện tại' />
        </div>,
    });
}
class ComponentQuanHe extends AdminPage {
    state = {
        phai: '',
        email: '',
        shcc: '', voChongText: ''
    };
    mapperQuanHe = {};

    componentDidMount() {
        this.props.getDmQuanHeGiaDinhAll(null, items => items.forEach(item => this.mapperQuanHe[item.ma] = item.ten));
    }

    createRelation = (e, type) => {
        e.preventDefault();
        this.modal.show({ item: null, type: type, email: this.state.email, shcc: this.state.shcc });
    }

    editQuanHe = (e, item, type) => {
        this.modal.show({ item: item, type: type, email: this.state.email, shcc: this.state.shcc });
        e.preventDefault();
    }

    deleteQuanHe = (e, item) => {
        T.confirm('Xóa thông tin người thân', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && (this.props.userEdit ? this.props.deleteQuanHeStaffUser(item.id, this.state.email) : this.props.deleteQuanHeCanBo(item.id, this.state.shcc)));
        e.preventDefault();
    }
    value = (email, phai, shcc) => {
        this.setState({email, phai, shcc}, () => {
            this.setState({voChongText: this.state.phai == '01' ? 'vợ' : 'chồng'});
        });
    }

    render() {
        const dataQuanHe = this.props.userEdit ? this.props.staff?.userItem?.items : this.props.staff?.selectedItem?.items;
        const permission = {
            write: true,
            read: true,
            delete: true
        };
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
                        <TableCell type='text' content={item.tenMoiQuanHe} />
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
                        <a className='nav-link' id='infoQuanHe2' data-toggle='tab' href='#infoQuanHe2Content' role='tab' aria-controls='infoQuanHe2Content' aria-selected='false'>Về bên {this.state.voChongText}</a>
                    </li>
                </ul>
                <div className='tab-content' style={{ paddingTop: '10px' }}>
                    <div className='tab-pane fade show active' id='infoQuanHe0Content' role='tabpanel' aria-labelledby='infoQuanHe0'>
                        <p>Gồm {this.state.voChongText} và các con</p>
                        <div className='tile-body'>{
                            renderQuanHeTable(dataQuanHe ? dataQuanHe.filter(i => i.type == 2) : [], 2)
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
                            renderQuanHeTable(dataQuanHe ? dataQuanHe.filter(i => i.type == 0) : [], 0)
                        }</div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.createRelation(e, 0)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin người thân
                            </button>
                        </div>
                    </div>
                    <div className='tab-pane fade' id='infoQuanHe2Content' role='tabpanel' aria-labelledby='infoQuanHe2'>
                        <p>Gồm người thân ruột của {this.state.voChongText}</p>
                        <div className='tile-body'>{
                            renderQuanHeTable(dataQuanHe ? dataQuanHe.filter(i => i.type == 1) : [], 1)
                        }</div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.createRelation(e, 1)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin người thân
                            </button>
                        </div>
                    </div>
                </div>
                <EditModal ref={e => this.modal = e}
                    mapperQuanHe={this.mapperQuanHe}
                    create={this.props.userEdit ? this.props.createQuanHeStaffUser : this.props.createQuanHeCanBo}
                    update={this.props.userEdit ? this.props.updateQuanHeStaffUser : this.props.updateQuanHeCanBo} />
            </div>
        );
    }
}
const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, updateStaff, createStaff, getDmQuanHeGiaDinhAll,
    createQuanHeCanBo, updateQuanHeCanBo, deleteQuanHeCanBo, createQuanHeStaffUser, updateQuanHeStaffUser, deleteQuanHeStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentQuanHe);
