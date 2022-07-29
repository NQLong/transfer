import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormDatePicker, FormSelect, FormTabs, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DmQuanHeGiaDinh } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import { createQuanHeCanBo, updateQuanHeCanBo, deleteQuanHeCanBo } from './reduxQuanHe';
class EditModal extends AdminModal {
    componentDidMount() {
        T.ready(() => this.onShown(() => this.hoTen.focus()));
    }

    onShow = (item) => {
        let { id, hoTen, moiQuanHe, namSinh, ngheNghiep, noiCongTac, diaChi, queQuan } = item && item.item ? item.item : { id: null, hoTen: '', moiQuanHe: '', namSinh: '', ngheNghiep: '', noiCongTac: '', diaChi: '', queQuan: '' };
        this.setState({ item, id, loai: item.loai, shcc: item.shcc }, () => {
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
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.state.shcc, this.hide) : this.props.create(changes, this.state.shcc, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Thông tin quan hệ gia đình',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-6' ref={e => this.hoTen = e} label='Họ tên' required readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.moiQuanHe = e} data={SelectAdapter_DmQuanHeGiaDinh} label='Mối quan hệ' required readOnly={readOnly} />
                <FormTextBox className='col-md-8' ref={e => this.ngheNghiep = e} label='Nghề nghiệp' readOnly={readOnly} />
                <FormDatePicker ref={e => this.namSinh = e} type='year-mask' className='form-group col-md-4' label='Năm sinh' required readOnly={readOnly} />
                <FormTextBox className='col-md-12' ref={e => this.noiCongTac = e} label='Nơi công tác' readOnly={readOnly} />
                <FormTextBox className='col-md-12' ref={e => this.queQuan = e} label='Nguyên quán' readOnly={readOnly} />
                <FormTextBox className='col-md-12' ref={e => this.diaChi = e} label='Địa chỉ hiện tại' readOnly={readOnly} />
            </div>,
        });
    }
}
class ComponentQuanHe extends AdminPage {
    state = {
        phai: '',
        shcc: '', voChongText: ''
    };

    createRelation = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.props.shcc });
    }

    editQuanHe = (e, item) => {
        e.preventDefault();
        this.modal.show({ item, shcc: this.props.shcc });
    }

    deleteQuanHe = (e, item) => {
        T.confirm('Xóa thông tin người thân', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && (this.props.deleteQuanHeCanBo(item.id, this.props.shcc)));
        e.preventDefault();
    }

    value = (item) => {
        this.setState({ phai: item.phai, shcc: item.shcc }, () => {
            this.setState({ voChongText: this.state.phai == '01' ? 'vợ' : 'chồng' });
        });
    }

    renderQuanHeTable = (items, type, permission) => (
        renderTable({
            getDataSource: () => items, stickyHead: false,
            header: 'thead-light',
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
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={e => this.editQuanHe(e, item)}
                        onDelete={e => this.deleteQuanHe(e, item)}></TableCell>
                </tr>),
        })
    );

    render() {
        const dataQuanHe = this.props.staff?.dataStaff?.quanHeCanBo || [];
        let permission = { ...this.props.permission };
        if (permission.login) {
            permission.write = true;
            permission.delete = true;
        }
        let voChongText = this.props.phai == '01' ? 'vợ' : 'chồng';
        let familyTabs = [
            {
                title: 'Về bản thân',
                component: <div style={{ marginTop: 8 }}>
                    <p>Gồm người thân ruột, huyết thống của mình, {voChongText} và các con</p>
                    {this.renderQuanHeTable(dataQuanHe ? dataQuanHe.filter(i => !i.loai) : [], 0, permission)}
                </div>
            },
            {
                title: 'Về bên ' + voChongText,
                component: <div style={{ marginTop: 8 }}>
                    <p>Gồm người thân ruột, huyết thống của {voChongText}</p>
                    {this.renderQuanHeTable(dataQuanHe ? dataQuanHe.filter(i => i.loai) : [], 1, permission)}
                </div>
            },
        ];

        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin quan hệ gia đình</h3>
                <FormTabs ref={e => this.tab = e} tabClassName='col-md-12' tabs={familyTabs} />
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    {permission.write ? <button className='btn btn-info' type='button' onClick={e => this.createRelation(e)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin người thân
                    </button> : null}
                </div>
                <EditModal ref={e => this.modal = e}
                    create={this.props.createQuanHeCanBo}
                    update={this.props.updateQuanHeCanBo} readOnly={!permission.write} />
            </div>
        );
    }
}
const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {
    createQuanHeCanBo, updateQuanHeCanBo, deleteQuanHeCanBo
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentQuanHe);
