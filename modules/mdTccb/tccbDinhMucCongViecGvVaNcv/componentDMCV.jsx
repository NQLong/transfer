import React from 'react';
import { connect } from 'react-redux';
import { getTccbDinhMucCongViecGvVaNcvAllByYear, createTccbDinhMucCongViecGvVaNcv, updateTccbDinhMucCongViecGvVaNcv, deleteTccbDinhMucCongViecGvVaNcv, SelectAdapter_NgachCdnnVaChucDanhKhoaHoc } from './redux';
import { SelectAdapter_NhomDanhGiaNhiemVu } from '../tccbNhomDanhGiaNhiemVu/redux';
import { AdminModal, AdminPage, FormTextBox, renderTable, TableCell, getValue, FormSelect } from 'view/component/AdminPage';
import T from 'view/js/common';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() =>
            this.idNhom.focus()
        ));
    }

    onShow = (item) => {
        let { idNhom, maChucDanh, soGioGiangDay, soDiemGiangDay, soGioNghienCuuKhoaHoc, soDiemNghienCuuKhoaHoc, soGioKhac, soDiemKhac } = item ? item : { idNhom: '', maChucDanh: '', soGioGiangDay: 0, soDiemGiangDay: 0, soGioNghienCuuKhoaHoc: 0, soDiemNghienCuuKhoaHoc: 0, soGioKhac: 0, soDiemKhac: 0 };
        this.setState({ item });
        this.idNhom.value(idNhom);
        this.maChucDanh.value(maChucDanh.split(','));
        this.soGioGiangDay.value(soGioGiangDay);
        this.soDiemGiangDay.value(soDiemGiangDay);
        this.soGioNghienCuuKhoaHoc.value(soGioNghienCuuKhoaHoc);
        this.soDiemNghienCuuKhoaHoc.value(soDiemNghienCuuKhoaHoc);
        this.soGioKhac.value(soGioKhac);
        this.soDiemKhac.value(soDiemKhac);
    };

    onSubmit = (e) => {
        const maChucDanh = getValue(this.maChucDanh).join(',');
        const changes = {
            idNhom: getValue(this.idNhom),
            maChucDanh,
            soGioGiangDay: Number(getValue(this.soGioGiangDay)).toFixed(2),
            soDiemGiangDay: Number(getValue(this.soDiemGiangDay)).toFixed(2),
            soGioNghienCuuKhoaHoc: Number(getValue(this.soGioNghienCuuKhoaHoc)).toFixed(2),
            soDiemNghienCuuKhoaHoc: Number(getValue(this.soDiemNghienCuuKhoaHoc)).toFixed(2),
            soGioKhac: Number(getValue(this.soGioKhac)).toFixed(2),
            soDiemKhac: Number(getValue(this.soDiemKhac)).toFixed(2),
        };
        if (!this.state.item) {
            this.props.create(changes, this.hide);
        } else {
            this.props.update(this.state.item.id, changes, this.hide);
        }
        e.preventDefault();
    };

    render = () => {
        const readOnly = this.props.readOnly;
        const nam = this.props.nam || 0;
        return this.renderModal({
            title: this.state.item ? 'Cập nhật' : 'Tạo mới',
            size: 'large',
            body: <div className='row'>
                <FormSelect ref={e => this.idNhom = e} className='col-md-6' data={SelectAdapter_NhomDanhGiaNhiemVu(nam)} label='Nhóm' placeholder='Nhóm' readOnly={readOnly} required />
                <FormSelect ref={e => this.maChucDanh = e} multiple={true} className='col-md-6' data={SelectAdapter_NgachCdnnVaChucDanhKhoaHoc} label='Mã chức danh' placeholder='Mã chức danh' readOnly={readOnly} required />
                <FormTextBox type='number' min={0} step={true} className='col-md-6' ref={e => this.soGioGiangDay = e} label='Số giờ giảng dạy'
                    readOnly={readOnly} required />
                <FormTextBox type='number' min={0} step={true} className='col-md-6' ref={e => this.soDiemGiangDay = e} label='Số điểm giảng dạy'
                    readOnly={readOnly} required />
                <FormTextBox type='number' min={0} step={true} className='col-md-6' ref={e => this.soGioNghienCuuKhoaHoc = e} label='Số giờ nghiên cứu khoa học'
                    readOnly={readOnly} required />
                <FormTextBox type='number' min={0} step={true} className='col-md-6' ref={e => this.soDiemNghienCuuKhoaHoc = e} label='Số điểm nghiên cứu khoa học'
                    readOnly={readOnly} required />
                <FormTextBox type='number' min={0} step={true} className='col-md-6' ref={e => this.soGioKhac = e} label='Số giờ khác'
                    readOnly={readOnly} required />
                <FormTextBox type='number' min={0} step={true} className='col-md-6' ref={e => this.soDiemKhac = e} label='Số điểm khác'
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

    load = (done) => this.props.nam && this.props.getTccbDinhMucCongViecGvVaNcvAllByYear(Number(this.props.nam), items => {
        console.log(items);
        this.setState({ items });
        done && done();
    });

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
            emptyTable: 'Không có dữ liệu định mức',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nhóm</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: '' }}>Chức danh</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Số giờ làm việc/Số điểm</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nhiệm vụ giảng dạy</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nhiệm vụ nghiên cứu khoa học</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nhiệm vụ khác</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <>
                    <tr>
                        <TableCell style={{ textAlign: 'center' }} rowSpan={2} content={index + 1} />
                        <TableCell style={{ textAlign: 'left' }} rowSpan={2} content={item.tenNhom} />
                        <TableCell style={{ textAlign: 'left' }} rowSpan={2} content={item.chucDanhs} />
                        <TableCell style={{ textAlign: 'left' }} content={'Số giờ làm việc'} />
                        <TableCell style={{ textAlign: 'center' }} content={item.soGioGiangDay} />
                        <TableCell style={{ textAlign: 'center' }} content={item.soGioNghienCuuKhoaHoc} />
                        <TableCell style={{ textAlign: 'center' }} content={item.soGioKhac} />
                        <TableCell style={{ textAlign: 'center' }} rowSpan={2} type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)}
                            onDelete={this.delete}
                        >
                        </TableCell>
                    </tr>
                    <tr>
                        <TableCell style={{ textAlign: 'left' }} content={'Số điểm'} />
                        <TableCell style={{ textAlign: 'center' }} content={item.soDiemGiangDay} />
                        <TableCell style={{ textAlign: 'center' }} content={item.soDiemNghienCuuKhoaHoc} />
                        <TableCell style={{ textAlign: 'center' }} content={item.soDiemKhac} />
                    </tr>
                </>

            )
        });
        return (<div>
            <div>{table}</div>
            {
                permission.write && (<div style={{ textAlign: 'right' }}>
                    <button className='btn btn-info' type='button' onClick={() => this.modal.show(null)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm định mức
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
const mapActionsToProps = { getTccbDinhMucCongViecGvVaNcvAllByYear, createTccbDinhMucCongViecGvVaNcv, updateTccbDinhMucCongViecGvVaNcv, deleteTccbDinhMucCongViecGvVaNcv };
export default connect(mapStateToProps, mapActionsToProps)(ComponentDMCV);