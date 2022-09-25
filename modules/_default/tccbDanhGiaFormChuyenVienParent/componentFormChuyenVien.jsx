import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaFormChuyenVienAllByYear, createTccbDanhGiaFormChuyenVienParent, createTccbDanhGiaFormChuyenVienChild, updateTccbDanhGiaFormChuyenVienParent, updateTccbDanhGiaFormChuyenVienChild, deleteTccbDanhGiaFormChuyenVienChild, deleteTccbDanhGiaFormChuyenVienParent, updateTccbDanhGiaFormChuyenVienThuTu } from './redux';
import { AdminModal, AdminPage, FormTextBox, renderTable, TableCell, getValue, FormCheckbox } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import T from 'view/js/common';

class EditModalNhom extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.tieuDe.focus()));
    }

    onHide = () => {
        this.tieuDe.value('');
        this.diemLonNhat.value('');
    }

    onShow = (item) => {
        this.onHide();
        let { tieuDe, diemLonNhat, loaiCongViec } = item ? item : { tieuDe: '', diemLonNhat: 0, loaiCongViec: 1 };
        this.tieuDe.value(tieuDe || '');
        this.diemLonNhat.value(Number(diemLonNhat).toFixed(2));
        this.loaiCongViec.value(Number(loaiCongViec));
        this.setState({ item });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            tieuDe: getValue(this.tieuDe),
            diemLonNhat: Number(getValue(this.diemLonNhat)).toFixed(2),
            nam: Number(this.props.nam),
            loaiCongViec: getValue(this.loaiCongViec),
        };
        if (!this.state.item) {
            this.props.create({ ...changes, thuTu: this.props.thuTu }, this.hide);
        } else {
            this.props.update(this.state.item.id, changes, this.hide);
        }
    };

    changeKichHoat = value => {
        if (this.state.item.submenus.length > 0) {
            T.notify('Đã có thông tin, không thể đổi loại công việc', 'danger');
        } else {
            this.loaiCongViec.value(Number(value));
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        const isReadOnlyLoaiCongViec = this.state?.item?.submenus.length > 0;
        return this.renderModal({
            title: !this.state.item ? 'Tạo mới nội dung' : 'Cập nhật nội dung',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.tieuDe = e} label='Tiêu đề' readOnly={readOnly} placeholder='Tiêu đề' required />
                <FormTextBox type='number' min={0} step={true} className='col-12' ref={e => this.diemLonNhat = e} label='Điểm tối đa' readOnly={readOnly} placeholder='Điểm tối đa' required />
                <FormCheckbox className='col-md-6' ref={e => this.loaiCongViec = e} label='Loại công việc' isSwitch={true} readOnly={readOnly || isReadOnlyLoaiCongViec} style={{ display: 'inline-flex' }}
                    onChange={value => this.changeKichHoat(value)} required />
            </div>
        });
    }
}

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.tieuDe.focus()));
    }

    onHide = () => {
        this.tieuDe.value('');
        this.diemLonNhat.value('');
    }

    onShow = (item) => {
        this.onHide();
        let editItem = item.item;
        let { tieuDe, diemLonNhat, parentName } = editItem ? editItem : { tieuDe: '', diemLonNhat: 0, parentName };
        this.parentName.value(parentName);
        this.tieuDe.value(tieuDe || '');
        this.diemLonNhat.value(Number(diemLonNhat).toFixed(2));
        this.setState({ item });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            tieuDe: getValue(this.tieuDe),
            diemLonNhat: Number(getValue(this.diemLonNhat)).toFixed(2),
        };
        if (this.state.item.add) {
            this.props.create({ ...changes, parentId: this.state.item.parentId }, this.hide);
        } else {
            this.props.update(this.state.item.item.id, changes, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: !this.state.item ? 'Tạo mới nội dung' : 'Cập nhật nội dung',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.parentName = e} label='Nội dung' readOnly={true} placeholder='Nội dung' />
                <FormTextBox className='col-12' ref={e => this.tieuDe = e} label='Tiêu đề' readOnly={readOnly} placeholder='Tiêu đề' required />
                <FormTextBox type='number' min={0} step={true} className='col-12' ref={e => this.diemLonNhat = e} label='Điểm tối đa' readOnly={readOnly} placeholder='Điểm tối đa' required />
            </div>
        });
    }
}

class ComponentFormChuyenVien extends AdminPage {
    state = { isLoading: true, length: 0 }

    componentDidMount() {
        this.load();
    }

    fixWidthHelper = (e, ui) => {
        $('table.formChuyenVien tbody').each(function () {
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

    load = (done) => this.props.nam && this.props.getTccbDanhGiaFormChuyenVienAllByYear(parseInt(this.props.nam), items => {
        this.setState({ items });
        $('table.formChuyenVien').sortable({
            items: '> tbody',
            helper: this.fixWidthHelper,
            start: (e, ui) => {
                $(this).attr('data-prevIndex', ui.item.index());
            },
            update: (e, ui) => {
                e.preventDefault();
                const newPriority = this.state.items[ui.item.index() - 1].thuTu;
                const currentItem = this.state.items[$(this).attr('data-prevIndex') - 1];
                this.props.updateTccbDanhGiaFormChuyenVienThuTu(currentItem.id, newPriority, this.props.nam, this.load);
            }
        }).disableSelection();
        done && done();
    });

    createNhom = (item, done) => this.props.createTccbDanhGiaFormChuyenVienParent(item, () => this.load(done));

    updateNhom = (id, changes, done) => this.props.updateTccbDanhGiaFormChuyenVienParent(id, changes, () => this.load(done));

    deleteNhom = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa tiêu chí', 'Bạn có chắc bạn muốn xóa tiêu chí này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbDanhGiaFormChuyenVienParent(item.id, this.load));
    }

    create = (item, done) => this.props.createTccbDanhGiaFormChuyenVienChild(item, () => this.load(done));

    update = (id, changes, done) => this.props.updateTccbDanhGiaFormChuyenVienChild(id, changes, () => this.load(done));

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa nội dung', 'Bạn có chắc bạn muốn xóa nội dung này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbDanhGiaFormChuyenVienChild(item.id, this.load));
    }

    indexToAlpha = (num) => {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
        return alphabet[num];
    }

    render() {
        const permission = this.getUserPermission('tccbDanhGiaNam');
        const list = this.state.items || [];
        const thuTu = list.length != 0 ? Math.max(...list.map(item => item.thuTu)) : 0;
        let table = renderTable({
            className: 'formChuyenVien',
            emptyTable: 'Không có dữ liệu form chuyên viên',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>TT</th>
                    <th style={{ width: '70%', textAlign: 'center', whiteSpace: '' }}>Tiêu chí đánh giá</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm tối đa</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Loại công việc</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            multipleTbody: true,
            renderRow: (item, index) => (
                <tbody key={index} style={{ backgroundColor: 'white' }}>
                    <tr key={`${index}-1`}>
                        <TableCell style={{ textAlign: 'center' }} content={<b>{(index + 1)}</b>} />
                        <TableCell style={{ textAlign: 'left' }} content={<b>{`Nội dung ${index + 1}: ${item.tieuDe}`}</b>} />
                        <TableCell style={{ textAlign: 'center' }} content={<b>{`${Number(item.diemLonNhat).toFixed(2)} điểm`}</b>} />
                        <TableCell type='checkbox' content={item.loaiCongViec} permission={permission}
                            onChanged={value => item.submenus.length == 0 ? this.props.updateTccbDanhGiaFormChuyenVienParent(item.id, { loaiCongViec: value ? 1 : 0, }, this.load) : T.notify('Đã có thông tin, không thể đổi loại công việc', 'danger')} />
                        <TableCell style={{ textAlign: 'center', width: '20%' }} type='buttons' content={item} permission={permission}
                            onEdit={() => this.nhomModal.show(item)}
                            onDelete={this.deleteNhom}
                        >
                            {
                                item.loaiCongViec == 0 && <Tooltip title='Thêm' arrow>
                                    <button className='btn btn-success' onClick={() => this.modal.show({ parentId: item.id, parentName: item.tieuDe, add: true })}>
                                        <i className='fa fa-lg fa-plus' />
                                    </button>
                                </Tooltip>
                            }
                        </TableCell>
                    </tr>
                    {
                        item.submenus.length > 0 &&
                        item.submenus.map((menu, stt) =>
                            [
                                <tr key={`${index}-${stt}-1`}>
                                    <TableCell style={{ textAlign: 'center' }} content={this.indexToAlpha(stt)} />
                                    <TableCell style={{ textAlign: 'left' }} content={menu.tieuDe} />
                                    <TableCell style={{ textAlign: 'center' }} content={`${Number(menu.diemLonNhat).toFixed(2)} điểm`} />
                                    <TableCell style={{ textAlign: 'center' }} content='' />
                                    <TableCell style={{ textAlign: 'center' }} colSpan={1} type='buttons' content={menu} permission={permission}
                                        onEdit={() => this.modal.show({ item: menu, add: false, parentId: item.id, parentName: item.tieuDe })}
                                        onDelete={this.delete}
                                    />
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
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm tiêu chí
                    </button>
                </div>)
            }
            <EditModal ref={e => this.modal = e}
                create={this.create} update={this.update} readOnly={!permission.write}
                nam={this.props.nam}
            />
            <EditModalNhom ref={e => this.nhomModal = e}
                create={this.createNhom}
                update={this.updateNhom}
                thuTu={thuTu + 1}
                nam={this.props.nam}
            />
        </>);
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbDanhGiaFormChuyenVienAllByYear, createTccbDanhGiaFormChuyenVienParent, createTccbDanhGiaFormChuyenVienChild, updateTccbDanhGiaFormChuyenVienParent, updateTccbDanhGiaFormChuyenVienChild, deleteTccbDanhGiaFormChuyenVienChild, deleteTccbDanhGiaFormChuyenVienParent, updateTccbDanhGiaFormChuyenVienThuTu };
export default connect(mapStateToProps, mapActionsToProps)(ComponentFormChuyenVien);