import React from 'react';
import { connect } from 'react-redux';
import { getTccbTyLeDiemAll, createTccbTyLeDiem, updateTccbTyLeDiem, deleteTccbTyLeDiem } from './redux';
import { getDmChucVuAll, SelectAdapter_DmChucVuV2 } from 'modules/mdDanhMuc/dmChucVu/redux';
import { AdminModal, AdminPage, FormTextBox, renderTable, TableCell, FormSelect, getValue } from 'view/component/AdminPage';
import T from 'view/js/common';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() =>
            this.nhom.focus()
        ));
    }

    onShow = (item) => {
        let { nhom, maChucVu, kcm, kld, donViDanhGia } = item ? item : { nhom: '', maChucVu: '', kcm: 0, kld: 0, donViDanhGia: '' };
        this.setState({ item });
        this.nhom.value(nhom);
        this.maChucVu.value(maChucVu ? maChucVu.split(',') : '');
        this.kcm.value(Number(kcm).toFixed(2));
        this.kld.value(Number(kld).toFixed(2));
        this.donViDanhGia.value(donViDanhGia);
    };

    onSubmit = (e) => {
        let maChucVu = this.maChucVu.value().join(',');
        const changes = {
            nhom: getValue(this.nhom),
            maChucVu,
            kcm: Number(getValue(this.kcm)).toFixed(2),
            kld: Number(getValue(this.kld)).toFixed(2),
            donViDanhGia: getValue(this.donViDanhGia),
        };
        if (!this.state.item) {
            this.props.create({ ...changes, nam: this.props.nam }, () => this.hide());
        } else {
            this.props.update(this.state.item.id, changes, () => this.hide());
        }
        e.preventDefault();
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.item ? 'Cập nhật' : 'Tạo mới',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.nhom = e} label='Nhóm'
                    readOnly={readOnly} required />
                <FormSelect ref={e => this.maChucVu = e} label='Cán bộ lãnh đạo' multiple={true} className='col-md-12' data={SelectAdapter_DmChucVuV2} readOnly={readOnly} />
                <FormTextBox type='number' min={0} step={true} className='col-md-12' ref={e => this.kcm = e} label='Kcm'
                    readOnly={readOnly} required />
                <FormTextBox type='number' min={0} step={true} className='col-md-12' ref={e => this.kld = e} label='Klđ'
                    readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.donViDanhGia = e} label='Đơn vị đánh giá'
                    readOnly={readOnly} required />
            </div>
        });
    }
}

class ComponentDGCB extends AdminPage {
    state = { isLoading: true, length: 0 }
    chucVuOption = [];

    componentDidMount() {
        this.load();
    }

    load = (done) => this.props.nam && this.props.getTccbTyLeDiemAll({ nam: Number(this.props.nam) }, items => {
        this.setState({ items });
        done && done();
    });

    create = (item, done) => this.props.createTccbTyLeDiem(item, () => this.load(done));

    update = (id, changes, done) => this.props.updateTccbTyLeDiem(id, changes, () => this.load(done));

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa tỷ lệ điểm', 'Bạn có chắc bạn muốn xóa tỷ lệ điểm này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbTyLeDiem(item.id, this.load));
    }

    render() {
        const permission = this.getUserPermission('tccbDanhGiaNam');
        const list = this.state.items || [];
        let table = renderTable({
            emptyTable: 'Không có dữ liệu tỷ lệ điểm',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>Nhóm</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Cán bộ lãnh đạo</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Kcm</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Klđ</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Đơn vị đánh giá</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={item.nhom} />
                    <TableCell style={{ textAlign: 'left' }} content={item.tenChucVu} />
                    <TableCell style={{ textAlign: 'center' }} content={Number(item.kcm).toFixed(2)} />
                    <TableCell style={{ textAlign: 'center' }} content={Number(item.kld).toFixed(2)} />
                    <TableCell style={{ textAlign: 'left' }} content={item.donViDanhGia} />
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
                    <button className='btn btn-info' type='button' onClick={() => this.modal.show(null)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm tỷ lệ điểm
                    </button>
                </div>)
            }
            <EditModal ref={e => this.modal = e}
                create={this.create} update={this.update} readOnly={!permission.write}
                nam={this.props.nam}
            />
        </div>);
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbTyLeDiemAll, createTccbTyLeDiem, updateTccbTyLeDiem, deleteTccbTyLeDiem, getDmChucVuAll };
export default connect(mapStateToProps, mapActionsToProps)(ComponentDGCB);