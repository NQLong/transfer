import React from 'react';
import { connect } from 'react-redux';
import { getTccbDinhMucCongViecGvVaNcvAllByYear, createTccbDinhMucCongViecGvVaNcv, updateTccbDinhMucCongViecGvVaNcv, deleteTccbDinhMucCongViecGvVaNcv, SelectAdapter_NgachCdnnVaChucDanhKhoaHoc } from './redux';
import { SelectAdapter_NhomDanhGiaNhiemVu, createTccbNhomDanhGiaNhiemVu, updateTccbNhomDanhGiaNhiemVu, updateTccbNhomDanhGiaNhiemVuThuTu, deleteTccbNhomDanhGiaNhiemVu } from '../tccbDanhGiaNhomDanhGiaNhiemVu/redux';
import { AdminModal, AdminPage, FormTextBox, renderTable, TableCell, getValue, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import T from 'view/js/common';

class EditModalNhom extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.ten.focus()));
    }

    onHide = () => {
        this.ten.value('');
        this.ghiChu.value('');
    }

    onShow = (item) => {
        this.onHide();
        let { ten, ghiChu, kichHoat } = item ? item : { ten: '', ghiChu: '', kichHoat: 1 };
        this.ten.value(ten || '');
        this.ghiChu.value(ghiChu || '');
        this.kichHoat.value(kichHoat ? Number(kichHoat) : 1);
        this.setState({ item });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: getValue(this.ten),
            ghiChu: getValue(this.ghiChu),
            nam: Number(this.props.nam),
            kichHoat: getValue(this.kichHoat)
        };
        if (!this.state.item) {
            this.props.createTccbNhomDanhGiaNhiemVu(changes, this.hide);
        } else {
            this.props.updateTccbNhomDanhGiaNhiemVu(this.state.item.id, changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(Number(value));

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: !this.state.item ? 'Tạo mới nhóm đánh giá' : 'Cập nhật nhóm đánh giá',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormTextBox className='col-12' ref={e => this.ghiChu = e} label='Ghi Chú' readOnly={readOnly} placeholder='Ghi chú' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
                    onChange={value => this.changeKichHoat(value)} required />
            </div>
        });
    }
}

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown());
    }

    onShow = (item) => {
        let idNhom = item.add ? item.idNhom : item.item.idNhom;
        let { maChucDanh, soGioGiangDay, soDiemGiangDay, soGioNghienCuuKhoaHoc, soDiemNghienCuuKhoaHoc, soGioKhac, soDiemKhac } = item.add ? { maChucDanh: '', soGioGiangDay: 0, soDiemGiangDay: 0, soGioNghienCuuKhoaHoc: 0, soDiemNghienCuuKhoaHoc: 0, soGioKhac: 0, soDiemKhac: 0 } : item.item;
        this.setState({ item });
        this.idNhom.value(idNhom);
        this.maChucDanh.value(maChucDanh ? maChucDanh.split(',') : '');
        this.soGioGiangDay.value(Number(soGioGiangDay));
        this.soDiemGiangDay.value(Number(soDiemGiangDay).toFixed(2));
        this.soGioNghienCuuKhoaHoc.value(Number(soGioNghienCuuKhoaHoc));
        this.soDiemNghienCuuKhoaHoc.value(Number(soDiemNghienCuuKhoaHoc).toFixed(2));
        this.soGioKhac.value(Number(soGioKhac));
        this.soDiemKhac.value(Number(soDiemKhac).toFixed(2));
    };

    onSubmit = (e) => {
        e.preventDefault();
        const maChucDanh = getValue(this.maChucDanh).join(',');
        const changes = {
            idNhom: getValue(this.idNhom),
            maChucDanh,
            soGioGiangDay: Number(getValue(this.soGioGiangDay)),
            soDiemGiangDay: Number(getValue(this.soDiemGiangDay)).toFixed(2),
            soGioNghienCuuKhoaHoc: Number(getValue(this.soGioNghienCuuKhoaHoc)),
            soDiemNghienCuuKhoaHoc: Number(getValue(this.soDiemNghienCuuKhoaHoc)).toFixed(2),
            soGioKhac: Number(getValue(this.soGioKhac)),
            soDiemKhac: Number(getValue(this.soDiemKhac)).toFixed(2),
        };
        if (this.state.item.add) {
            this.props.create(changes, this.hide);
        } else {
            this.props.update(this.state.item.item.id, changes, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        const nam = this.props.nam || 0;
        const add = this.state?.item?.add;
        return this.renderModal({
            title: add ? 'Tạo mới' : 'Cập nhật',
            size: 'large',
            body: <div className='row'>
                <FormSelect ref={e => this.idNhom = e} className='col-md-12' data={SelectAdapter_NhomDanhGiaNhiemVu(nam)}
                    label='Nhóm chức danh'
                    placeholder='Nhóm chức danh' readOnly={true} required />
                <FormSelect ref={e => this.maChucDanh = e} multiple={true} className='col-md-12' data={SelectAdapter_NgachCdnnVaChucDanhKhoaHoc}
                    label='Mã chức danh' placeholder='Mã chức danh' readOnly={readOnly} required />
                <FormTextBox type='number' min={0} className='col-md-4' ref={e => this.soGioGiangDay = e} label='Số giờ giảng dạy'
                    readOnly={readOnly} required />
                <FormTextBox type='number' min={0} className='col-md-4' ref={e => this.soGioNghienCuuKhoaHoc = e} label='Số giờ nghiên cứu khoa học'
                    readOnly={readOnly} required />
                <FormTextBox type='number' min={0} className='col-md-4' ref={e => this.soGioKhac = e} label='Số giờ khác'
                    readOnly={readOnly} required />
                <FormTextBox type='number' min={0} step={true} className='col-md-4' ref={e => this.soDiemGiangDay = e} label='Số điểm giảng dạy'
                    readOnly={readOnly} required />
                <FormTextBox type='number' min={0} step={true} className='col-md-4' ref={e => this.soDiemNghienCuuKhoaHoc = e} label='Số điểm nghiên cứu khoa học'
                    readOnly={readOnly} required />
                <FormTextBox type='number' min={0} step={true} className='col-md-4' ref={e => this.soDiemKhac = e} label='Số điểm khác'
                    readOnly={readOnly} required />
            </div>
        });
    }
}

class ComponentDMCV extends AdminPage {
    state = { isLoading: true, length: 0 }

    componentDidMount() {
        this.load();
    }

    fixWidthHelper = (e, ui) => {
        $('table.dmcv tbody').each(function () {
            $(this).width($(this).width());
            $(this).children().each(function () {
                $(this).width($(this).width());
                $(this).children().each(function () {
                    $(this).width($(this).width());
                });
            });
        });
        return ui;
    }

    load = (done) => this.props.nam && this.props.getTccbDinhMucCongViecGvVaNcvAllByYear(parseInt(this.props.nam), items => {
        this.setState({ items });
        $('table.dmcv').sortable({
            items: '> tbody',
            helper: this.fixWidthHelper,
            start: (e, ui) => {
                $(this).attr('data-prevIndex', ui.item.index());
            },
            update: (e, ui) => {
                e.preventDefault();
                const newPriority = this.state.items[ui.item.index() - 1].thuTu;
                const currentItem = this.state.items[$(this).attr('data-prevIndex') - 1];
                this.props.updateTccbNhomDanhGiaNhiemVuThuTu(currentItem.id, newPriority, this.props.nam, this.load);
            }
        }).disableSelection();
        done && done();
    });

    createNhom = (item, done) => this.props.createTccbNhomDanhGiaNhiemVu(item, () => this.load(done));

    updateNhom = (id, changes, done) => this.props.updateTccbNhomDanhGiaNhiemVu(id, changes, () => this.load(done));

    deleteNhom = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa nhóm chức danh', 'Bạn có chắc bạn muốn xóa nhóm chức danh này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbNhomDanhGiaNhiemVu(item.id, this.load));
    }

    create = (item, done) => this.props.createTccbDinhMucCongViecGvVaNcv(item, () => this.load(done));

    update = (id, changes, done) => this.props.updateTccbDinhMucCongViecGvVaNcv(id, changes, () => this.load(done));

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa định mức', 'Bạn có chắc bạn muốn xóa định mức này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbDinhMucCongViecGvVaNcv(item.id, this.load));
    }

    render() {
        const permission = this.getUserPermission('tccbDanhGiaNam');
        const list = this.state.items || [];
        let table = renderTable({
            className: 'dmcv',
            emptyTable: 'Không có dữ liệu định mức',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>STT</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: '' }}>Chức danh</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Số giờ làm việc/Số điểm</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nhiệm vụ giảng dạy</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nhiệm vụ nghiên cứu khoa học</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nhiệm vụ khác</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            multipleTbody: true,
            renderRow: (item, index) => (
                <tbody key={index} style={{ backgroundColor: 'white' }}>
                    <tr key={`${index}-1`}>
                        <TableCell style={{ textAlign: 'center' }} className='text-primary' content={<b>{(index + 1).intToRoman()}</b>} />
                        <TableCell style={{ textAlign: 'left' }} className='text-primary' colSpan={4} content={<b>{item.ten}</b>} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateTccbNhomDanhGiaNhiemVu(item.id, { kichHoat: value ? 1 : 0, }, this.load)} />
                        <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission}
                            onEdit={() => this.nhomModal.show(item)}
                            onDelete={this.deleteNhom}
                        >
                            <Tooltip title='Thêm' arrow>
                                <button className='btn btn-success' onClick={() => this.modal.show({ idNhom: item.id, add: true })}>
                                    <i className='fa fa-lg fa-plus' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr>
                    {
                        item.submenus.length > 0 &&
                        item.submenus.map((menu, stt) =>
                            [
                                <tr key={`${index}-${stt}-1`}>
                                    <TableCell style={{ textAlign: 'center' }} rowSpan={2} content={stt + 1} />
                                    <TableCell style={{ textAlign: 'left' }} rowSpan={2} content={menu.chucDanhs} />
                                    <TableCell style={{ textAlign: 'left' }} content={'Số giờ làm việc'} />
                                    <TableCell style={{ textAlign: 'right' }} content={menu.soGioGiangDay} />
                                    <TableCell style={{ textAlign: 'right' }} content={menu.soGioNghienCuuKhoaHoc} />
                                    <TableCell style={{ textAlign: 'right' }} content={menu.soGioKhac} />
                                    <TableCell style={{ textAlign: 'right' }} rowSpan={2} type='buttons' content={menu} permission={permission}
                                        onEdit={() => this.modal.show({ item: menu, add: false })}
                                        onDelete={this.delete}
                                    />
                                </tr>,
                                <tr key={`${index}-${stt}-2`}>
                                    <TableCell style={{ textAlign: 'left' }} content={'Số điểm'} />
                                    <TableCell style={{ textAlign: 'right' }} content={Number(menu.soDiemGiangDay).toFixed(2)} />
                                    <TableCell style={{ textAlign: 'right' }} content={Number(menu.soDiemNghienCuuKhoaHoc).toFixed(2)} />
                                    <TableCell style={{ textAlign: 'right' }} content={Number(menu.soDiemKhac).toFixed(2)} />
                                </tr>
                            ]
                        )
                    }
                </tbody>
            )
        });
        return (<>
            <div>{table}</div>
            {
                permission.write && (<div style={{ textAlign: 'right' }}>
                    <button className='btn btn-info' type='button' onClick={() => this.nhomModal.show(null)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm nhóm chức danh
                    </button>
                </div>)
            }
            <EditModal ref={e => this.modal = e}
                create={this.create} update={this.update} readOnly={!permission.write}
                nam={this.props.nam}
            />
            <EditModalNhom ref={e => this.nhomModal = e}
                createTccbNhomDanhGiaNhiemVu={this.createNhom}
                updateTccbNhomDanhGiaNhiemVu={this.updateNhom}
                nam={this.props.nam}
            />
        </>);
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbDinhMucCongViecGvVaNcvAllByYear, createTccbDinhMucCongViecGvVaNcv, updateTccbDinhMucCongViecGvVaNcv, deleteTccbDinhMucCongViecGvVaNcv, createTccbNhomDanhGiaNhiemVu, updateTccbNhomDanhGiaNhiemVu, updateTccbNhomDanhGiaNhiemVuThuTu, deleteTccbNhomDanhGiaNhiemVu };
export default connect(mapStateToProps, mapActionsToProps)(ComponentDMCV);