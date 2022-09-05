import React from 'react';
import { connect } from 'react-redux';
import { getTccbDiemThuongAll, createTccbDiemThuong, updateTccbDiemThuong, deleteTccbDiemThuong } from './redux';
import { AdminModal, AdminPage, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import T from 'view/js/common';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() =>
            this.noiDung.focus()
        ));
    }

    onShow = (item) => {
        let { noiDung, diemQuyDinh } = item ? item : { noiDung: '', diemQuyDinh: 0 };
        this.setState({ item });
        this.noiDung.value(noiDung);
        this.diemQuyDinh.value(Number(diemQuyDinh));
    };

    onSubmit = (e) => {
        const changes = {
            noiDung: getValue(this.noiDung),
            diemQuyDinh: getValue(this.diemQuyDinh),
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
                <FormTextBox type='text' className='col-md-12' ref={e => this.noiDung = e} label='Nội dung'
                    readOnly={readOnly} required />
                <FormTextBox type='number' min='0' className='col-md-12' ref={e => this.diemQuyDinh = e} label='Điểm quy định'
                    readOnly={readOnly} required />
            </div>
        });
    }
}

class ComponentDiemThuong extends AdminPage {
    state = { isLoading: true, length: 0 }

    componentDidMount() {
        this.load();
    }

    load = (done) => this.props.nam && this.props.getTccbDiemThuongAll({ nam: Number(this.props.nam) }, items => {
        this.setState({ items });
        done && done();
    });

    create = (item, done) => this.props.createTccbDiemThuong(item, () => this.load(done));

    update = (id, changes, done) => this.props.updateTccbDiemThuong(id, changes, () => this.load(done));

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa điểm thưởng', 'Bạn có chắc bạn muốn xóa điểm thưởng này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbDiemThuong(item.id, this.load));
    }

    render() {
        const permission = this.getUserPermission('tccbDanhGiaNam');
        const list = this.state.items || [];
        let table = renderTable({
            emptyTable: 'Không có dữ liệu điểm thưởng',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Nội dung</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm quy định</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'left' }} content={item.noiDung} />
                    <TableCell style={{ textAlign: 'center' }} content={item.diemQuyDinh} />
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
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm điểm thưởng
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
const mapActionsToProps = { getTccbDiemThuongAll, createTccbDiemThuong, updateTccbDiemThuong, deleteTccbDiemThuong };
export default connect(mapStateToProps, mapActionsToProps)(ComponentDiemThuong);