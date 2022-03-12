import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormDatePicker, FormSelect, FormTabs, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DmQuanHeGiaDinhV2 } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import { getDmQuanHeGiaDinhAll } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import {
    getStaffEdit, createStaff, updateStaff,
    createQuanHeCanBo, updateQuanHeCanBo, deleteQuanHeCanBo, createQuanHeStaffUser, updateQuanHeStaffUser, deleteQuanHeStaffUser
} from './redux';
class EditModal extends AdminModal {
    state = { loai: -1 }
    componentDidMount() {
        T.ready(() => this.onShown(() => this.hoTen.focus()));
    }

    onShow = (item) => {
        let { id, hoTen, moiQuanHe, namSinh, ngheNghiep, noiCongTac, diaChi, queQuan, loai } = item && item.item ? item.item : { id: null, hoTen: '', moiQuanHe: '', namSinh: '', ngheNghiep: '', noiCongTac: '', diaChi: '', queQuan: '', loai: -1 };
        this.setState({ item, email: item.email, id, loai, shcc: item.shcc }, () => {
            this.hoTen.value(hoTen ? hoTen : '');
            this.moiQuanHe.value(moiQuanHe ? moiQuanHe : null);
            this.namSinh.value(namSinh ? namSinh : '');
            this.ngheNghiep.value(ngheNghiep ? ngheNghiep : '');
            this.noiCongTac.value(noiCongTac ? noiCongTac : '');
            this.diaChi.value(diaChi ? diaChi : '');
            this.queQuan.value(queQuan ? queQuan : '');
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            email: this.state.email,
            shcc: this.state.shcc,
            hoTen: this.hoTen.value(),
            moiQuanHe: this.moiQuanHe.value(),
            namSinh: this.namSinh.value().getTime(),
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
        } else if (!changes.namSinh) {
            T.notify('Năm sinh bị trống!', 'danger');
            this.namSinh.focus();
        }
        if (this.state.id) {
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
            <FormSelect className='col-md-6' ref={e => this.moiQuanHe = e} data={SelectAdapter_DmQuanHeGiaDinhV2(this.state.loai)} label='Mối quan hệ' required />
            <FormTextBox className='col-md-8' ref={e => this.ngheNghiep = e} label='Nghề nghiệp' />
            <FormDatePicker ref={e => this.namSinh = e} type='year-mask' className='form-group col-md-4' label='Năm sinh' required />
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

    createRelation = (e, loai = -1) => {
        e.preventDefault();
        this.modal.show({ item: null, loai, email: this.state.email, shcc: this.state.shcc });
    }

    editQuanHe = (e, item, loai) => {
        this.modal.show({ item, loai, email: this.state.email, shcc: this.state.shcc });
        e.preventDefault();
    }

    deleteQuanHe = (e, item) => {
        T.confirm('Xóa thông tin người thân', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && (this.props.userEdit ? this.props.deleteQuanHeStaffUser(item.id, this.state.email) : this.props.deleteQuanHeCanBo(item.id, this.state.shcc)));
        e.preventDefault();
    }
    value = (email, phai, shcc) => {
        this.setState({ email, phai, shcc }, () => {
            this.setState({ voChongText: this.state.phai == '01' ? 'vợ' : 'chồng' });
        });
    }
    renderQuanHeTable = (items, type, permission) => (
        renderTable({
            getDataSource: () => items, stickyHead: false,
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

    render() {
        const dataQuanHe = this.props.userEdit ? this.props.staff?.userItem?.items : this.props.staff?.selectedItem?.items;
        const permission = {
            write: true,
            read: true,
            delete: true
        };

        let familyTabs = [
            {
                title: 'Về gia đình',
                component: <div style={{ marginTop: 8 }}>
                    <p>Gồm {this.state.voChongText} và các con</p>
                    {this.renderQuanHeTable(dataQuanHe ? dataQuanHe.filter(i => i.loai == 0) : [], 0, permission)}
                </div>
            },
            {
                title: 'Về bản thân',
                component: <div style={{ marginTop: 8 }}>
                    <p>Gồm người thân ruột, huyết thống</p>
                    {this.renderQuanHeTable(dataQuanHe ? dataQuanHe.filter(i => i.loai == 1) : [], 1, permission)}
                </div>
            },
            {
                title: 'Về bên ' + this.state.voChongText,
                component: <div style={{ marginTop: 8 }}>
                    <p>Gồm người thân ruột, huyết thống của {this.state.voChongText}</p>
                    {this.renderQuanHeTable(dataQuanHe ? dataQuanHe.filter(i => i.type == 2) : [], 2, permission)}
                </div>
            },
        ];

        return (
            <div className='tile'>
                <FormTabs ref={e => this.tab = e} tabClassName='col-md-12' tabs={familyTabs} />
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-info' type='button' onClick={e => this.createRelation(e)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin người thân
                    </button>
                </div>
                <EditModal ref={e => this.modal = e}
                    create={this.props.userEdit ? this.props.createQuanHeStaffUser : this.props.createQuanHeCanBo}
                    update={this.props.userEdit ? this.props.updateQuanHeStaffUser : this.props.updateQuanHeCanBo} />
            </div>
        );
    }
}
const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, updateStaff, createStaff, getDmQuanHeGiaDinhAll,
    createQuanHeCanBo, updateQuanHeCanBo, deleteQuanHeCanBo, createQuanHeStaffUser, updateQuanHeStaffUser, deleteQuanHeStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentQuanHe);
