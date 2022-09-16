import React from 'react';
import { connect } from 'react-redux';
import { createTccbKhungDanhGiaCanBo, updateTccbKhungDanhGiaCanBo, getTccbKhungDanhGiaCanBoAll, updateTccbKhungDanhGiaCanBoThuTu, deleteTccbKhungDanhGiaCanBo } from './reduxKhungDanhGiaCanBo';
import { AdminModal, AdminPage, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import T from 'view/js/common';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() =>
            this.tu.focus()
        ));
    }

    onShow = (item) => {
        let { tu, den, mucDanhGia, mucXepLoai } = item ? item : { tu: 0, den: 0, mucDanhGia: '', mucXepLoai: '' };
        this.setState({ item });
        this.tu.value(Number(tu));
        this.den.value(Number(den));
        this.mucDanhGia.value(mucDanhGia);
        this.mucXepLoai.value(mucXepLoai);
    };

    onSubmit = (e) => {
        const changes = {
            tu: this.tu.value(),
            den: this.den.value(),
            mucDanhGia: this.mucDanhGia.value(),
            mucXepLoai: this.mucXepLoai.value(),
        };
        if (changes.tu === undefined) {
            T.notify('Thiếu mức dưới', 'danger');
            this.tu.focus();
        } else if (changes.den === undefined) {
            T.notify('Thiếu mức trên', 'danger');
            this.den.focus();
        } else if (changes.tu > changes.den) {
            T.notify('Khoảng đánh giá không phù hợp', 'danger');
            this.tu.focus();
        } else if (changes.mucDanhGia == '') {
            T.notify('Mức đánh giá bị trống', 'danger');
            this.mucDanhGia.focus();
        } else if (changes.mucXepLoai == '') {
            T.notify('Mức xếp loại bị trống', 'danger');
            this.mucXepLoai.focus();
        } else {
            if (!this.state.item) {
                this.props.create({ ...changes, nam: this.props.nam, thuTu: this.props.thuTu + 1 }, () => this.hide());
            } else {
                this.props.update(this.state.item.id, changes, () => this.hide());
            }
        }
        e.preventDefault();
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.item ? 'Cập nhật' : 'Tạo mới',
            body: <div className='row'>
                <FormTextBox type='number' min={0} className='col-md-12' ref={e => this.tu = e} label='Từ'
                    readOnly={readOnly} required />
                <FormTextBox type='number' min={0} className='col-md-12' ref={e => this.den = e} label='Đến'
                    readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.mucDanhGia = e} label='Mức đánh giá'
                    readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.mucXepLoai = e} label='Mức xếp loại'
                    readOnly={readOnly} required />
            </div>
        });
    }
}

class ComponentDGCB extends AdminPage {
    state = { isLoading: true, length: 0 }

    componentDidMount() {
        this.load();
    }

    componentDidUpdate() {
        function fixWidthHelper(e, ui) {
            ui.children().each(function () {
                $(this).width($(this).width());
            });
            return ui;
        }
        $('table.dgcb tbody')
            .sortable({
                helper: fixWidthHelper,
                start: (e, ui) => {
                    $(this).attr('data-prevIndex', ui.item.index());
                },
                update: (e, ui) => {
                    e.preventDefault();
                    const newIndex = this.state.items[ui.item.index()];
                    const oldIndex = this.state.items[$(this).attr('data-prevIndex')];
                    this.props.updateTccbKhungDanhGiaCanBoThuTu(oldIndex.id, newIndex.thuTu, this.props.nam, this.load);
                }
            })
            .disableSelection();
    }

    load = (done) => this.props.nam && this.props.getTccbKhungDanhGiaCanBoAll({ nam: Number(this.props.nam) }, items => {
        this.setState({ items });
        done && done();
    });

    create = (item, done) => this.props.createTccbKhungDanhGiaCanBo(item, () => this.load(done));

    update = (id, changes, done) => this.props.updateTccbKhungDanhGiaCanBo(id, changes, () => this.load(done));

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa mức đánh giá', 'Bạn có chắc bạn muốn xóa mức đánh giá này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbKhungDanhGiaCanBo(item.id, this.load));
    }

    render() {
        const permission = this.getUserPermission('tccbDanhGiaNam');
        const list = this.state.items || [];
        const thuTu = list.length != 0 ? Math.max(...list.map(item => item.thuTu)) : 0;
        let table = renderTable({
            className: 'dgcb',
            emptyTable: 'Không có dữ liệu khung đánh giá cán bộ',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Từ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Đến</th>
                    <th style={{ width: '70%', textAlign: 'left', whiteSpace: 'nowrap' }}>Mức đánh giá</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mức xếp loại</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index} style={{ backgroundColor: 'white' }}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tu} />
                    <TableCell style={{ textAlign: 'center' }} content={item.den} />
                    <TableCell style={{ textAlign: 'left' }} content={item.mucDanhGia} />
                    <TableCell style={{ textAlign: 'center' }} content={item.mucXepLoai} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)}
                        onDelete={this.delete}
                    >
                    </TableCell>
                </tr>
            )
        });
        return (<div>
            <div>{table}</div>
            {
                permission.write && (<div style={{ textAlign: 'right' }}>
                    <button className='btn btn-info' type='button' onClick={e => this.showModal(e)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm mức
                    </button>
                </div>)
            }
            <EditModal ref={e => this.modal = e}
                create={this.create} update={this.update} readOnly={!permission.write}
                nam={this.props.nam}
                thuTu={thuTu}
            />
        </div>);
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbKhungDanhGiaCanBoAll, createTccbKhungDanhGiaCanBo, updateTccbKhungDanhGiaCanBo, updateTccbKhungDanhGiaCanBoThuTu, deleteTccbKhungDanhGiaCanBo };
export default connect(mapStateToProps, mapActionsToProps)(ComponentDGCB);