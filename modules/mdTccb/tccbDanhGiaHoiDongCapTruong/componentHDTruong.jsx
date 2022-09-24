import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaHoiDongTruongAllByYear, createTccbDanhGiaHoiDongTruong, updateTccbDanhGiaHoiDongTruong, deleteTccbDanhGiaHoiDongTruong } from './redux';
import { FormSelect, AdminPage, AdminModal, getValue, TableCell, renderTable } from 'view/component/AdminPage';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import T from 'view/js/common';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() =>
            this.shcc.focus()
        ));
    }

    onShow = (item) => {
        let { shcc } = item ? item : { shcc: '' };
        this.setState({ item });
        this.shcc.value(shcc);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: getValue(this.shcc),
        };
        if (!this.state.item) {
            this.props.create({ ...changes, nam: this.props.nam }, this.hide);
        } else {
            this.props.update(this.state.item.id, { ...changes, nam: this.props.nam }, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.item ? 'Cập nhật' : 'Tạo mới',
            body: <div className='row'>
                <FormSelect type='text' className='col-md-12' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ'
                    readOnly={readOnly} required />
            </div>
        });
    }
}

class ComponentHDTruong extends AdminPage {
    state = { isLoading: true, length: 0 }

    componentDidMount() {
        this.load();
    }

    load = (done) => this.props.nam && this.props.getTccbDanhGiaHoiDongTruongAllByYear(parseInt(this.props.nam), items => {
        this.setState({ items: items.rows || [] });
        done && done();
    });

    create = (item, done) => this.props.createTccbDanhGiaHoiDongTruong(item, () => this.load(done));

    update = (id, changes, done) => this.props.updateTccbDanhGiaHoiDongTruong(id, changes, () => this.load(done));

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa thành viên', 'Bạn có chắc bạn muốn xóa thành viên này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbDanhGiaHoiDongTruong(item.id, this.load));
    }

    render() {
        const permission = this.getUserPermission('tccbDanhGiaNam');
        const list = this.state.items || [];
        let table = renderTable({
            emptyTable: 'Không có dữ liệu hội đồng trường',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Đơn vị</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell type='text' content={<>
                        <span>{`${item.ho} ${item.ten}`}<br /></span>
                        {item.shcc}
                    </>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tenDonVi} />
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
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm thành viên
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
const mapActionsToProps = { getTccbDanhGiaHoiDongTruongAllByYear, createTccbDanhGiaHoiDongTruong, updateTccbDanhGiaHoiDongTruong, deleteTccbDanhGiaHoiDongTruong };
export default connect(mapStateToProps, mapActionsToProps)(ComponentHDTruong);