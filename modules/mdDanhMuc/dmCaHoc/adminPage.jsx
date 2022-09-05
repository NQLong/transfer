import React from 'react';
import { connect } from 'react-redux';
import { createDmCaHoc, getDmCaHocAll, updateDmCaHoc, deleteDmCaHoc } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormEditor, FormTextBox, FormCheckbox, FormTabs, FormSelect, } from 'view/component/AdminPage';
import { SelectAdapter_DmCoSo } from '../dmCoSo/redux';
import { SelectAdapter_DtDmBuoiHoc } from '../../mdDaoTao/dtDmBuoiHoc/redux';

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, moTa, kichHoat, thoiGianBatDau, thoiGianKetThuc, maCoSo, buoi } = item ? item : { ma: '', ten: '', moTa: '', thoiGianBatDau: '', thoiGianKetThuc: '', kichHoat: true, maCoSo: '', buoi: '' };

        this.setState({ ma, ten, item });
        let mo_ta = !moTa ? {} : JSON.parse(moTa);
        this.ten.value(ten);
        this.maCoSo.value(maCoSo);
        this.buoi.value(buoi);
        this.moTaVi.value(mo_ta.vi ? mo_ta.vi : '');
        this.moTaEn.value(mo_ta.en ? mo_ta.en : '');
        this.kichHoat.value(kichHoat ? 1 : 0);
        this.gioBatDau.value(thoiGianBatDau.split(':')[0]);
        this.phutBatDau.value(thoiGianBatDau.split(':')[1]);
        this.gioKetThuc.value(thoiGianKetThuc.split(':')[0]);
        this.phutKetThuc.value(thoiGianKetThuc.split(':')[1]);

    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            maCoSo: this.maCoSo.value(),
            buoi: this.buoi.value(),
            moTa: JSON.stringify({ vi: this.moTaVi.value(), en: this.moTaEn.value() }),
            thoiGianBatDau: `${this.gioBatDau.value()}:${this.phutBatDau.value()}`,
            thoiGianKetThuc: `${this.gioKetThuc.value()}:${this.phutKetThuc.value()}`,
            kichHoat: Number(this.kichHoat.value()),
        };

        if (!this.state.ten && !this.ten.value()) {
            T.notify('Tên tiết học bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ten ? this.props.update(this.state.ma, changes, this.hide) :
                this.props.create(changes, this.hide);
        }
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    generateOption = limitList => {
        const array = Array(limitList);
        const result = [];
        for (let i = 0; i < array.length; i++) {
            result.push(i / 10 < 1 ? `0${i}` : i);
        }
        return result;
    }

    render = () => {
        const readOnly = this.props.readOnly;
        const hours = this.generateOption(24),
            minutes = this.generateOption(60);
        let viEnTabs = [
            {
                title: 'Tiếng Việt',
                component: <div style={{ marginTop: 8 }}>
                    <FormEditor className='col-md-12' ref={e => this.moTaVi = e} label='Mô tả' height='150px' />
                </div>
            }, {
                title: 'English',
                component: <div style={{ marginTop: 8 }}>
                    <FormEditor className='col-md-12' ref={e => this.moTaEn = e} label='Description' height='150px' />
                </div>
            },
        ];
        return this.renderModal({
            title: this.state.ten ? 'Cập nhật Giờ học' : 'Tạo mới Giờ học',
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox className='col-md-12' type='number' ref={e => this.ten = e} label='Tiết' readOnly={readOnly} required />
                <div style={{ position: 'absolute', top: '16px', right: '8px' }}>
                    <FormCheckbox style={{ display: 'inline-flex', width: '100%', margin: 0 }} ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                        onChange={value => this.changeKichHoat(value ? 1 : 0)} /></div>
                <FormSelect className='col-md-6' ref={e => this.maCoSo = e} data={SelectAdapter_DmCoSo} readOnly={readOnly} label='Cơ sở' />
                <FormSelect className='col-md-6' ref={e => this.buoi = e} data={SelectAdapter_DtDmBuoiHoc} readOnly={readOnly} label='Buồi' />
                <div className='form-group col-md-12'>
                    <FormTabs tabs={viEnTabs} />
                </div>
                <div className='col-md-6'>
                    <label className='control-label'>Thời gian bắt đầu</label>
                    <div className='row'>
                        <FormSelect className='col-md-3' ref={e => this.gioBatDau = e} data={hours} />
                        <div className='col-md-1'>:</div>
                        <FormSelect className='col-md-3' ref={e => this.phutBatDau = e} data={minutes} />
                    </div>
                </div>
                <div className='col-md-6'>
                    <label className='control-label'>Thời gian kết thúc</label>
                    <div className='row'>
                        <FormSelect className='col-md-3' ref={e => this.gioKetThuc = e} data={hours} />
                        <div className='col-md-1'>:</div>
                        <FormSelect className='col-md-3' ref={e => this.phutKetThuc = e} data={minutes} />
                    </div>
                </div>
            </div>
        });
    }
}

class dmCaHocAdminPage extends AdminPage {

    componentDidMount() {
        let route = T.routeMatcher('/user/:menu/ca-hoc').parse(window.location.pathname);
        this.menu = route.menu;
        T.ready(`/user/${this.menu}`, () => this.props.getDmCaHocAll());
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa giờ học', `Bạn có chắc bạn muốn xóa giờ học ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmCaHoc(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá giờ học ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá giờ học ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('dmCaHoc', ['read', 'write', 'delete']);
        let table = 'Không có dữ liệu ca học!',
            items = this.props.dmCaHoc && this.props.dmCaHoc.items ? this.props.dmCaHoc.items : [];
        if (items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '40%' }}>Tên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Cơ sở</th>
                        <th style={{ width: '60%' }}>Thời gian</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} style={{ textAlign: 'right' }} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} content={item.ten} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.maCoSo} />
                        <TableCell type='text' content={`${item.thoiGianBatDau} - ${item.thoiGianKetThuc}`} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmCaHoc(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete}></TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Giờ học',
            breadcrumb: [
                <Link key={0} to={`/user/${this.menu}`}>{this.menu == 'dao-tao' ? 'Đào tạo' : 'Danh mục'}</Link>,
                'Giờ học'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createDmCaHoc} update={this.props.updateDmCaHoc} />
            </>,
            backRoute: `/user/${this.menu}`,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmCaHoc: state.danhMuc.dmCaHoc });
const mapActionsToProps = { getDmCaHocAll, createDmCaHoc, updateDmCaHoc, deleteDmCaHoc };
export default connect(mapStateToProps, mapActionsToProps)(dmCaHocAdminPage);
