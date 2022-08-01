import { Tooltip } from '@mui/material';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormDatePicker, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import { getPageDtThoiGianMoMon, createDtThoiGianMoMon, deleteDtThoiGianMoMon, updateDtThoiGianMoMon } from './redux';

export class TaoThoiGianMoMon extends AdminModal {

    onShow = () => {
        this.bacDaoTao.value('DH');
    }
    batDau = [];
    ketThuc = [];
    state = { edit: {} }
    renderData = (list, pageSize, pageNumber, permission) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Chưa có thời gian mở môn nào',
        header: 'thead-light',

        renderHead: () => (<tr>
            <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm học</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Học kỳ</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Loại hình ĐT</th>
            <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mở ngày</th>
            <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Đóng ngày</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kích hoạt</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
        </tr>),

        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.namDaoTao} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.hocKy} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTao} />
                <TableCell style={{ textAlign: 'center' }} content={
                    <FormDatePicker style={{ marginBottom: '0' }} ref={e => this.batDau[index] = e} type='date-mask' readOnly={!item.edit} />
                } />
                <TableCell style={{ textAlign: 'center' }} content={
                    <FormDatePicker style={{ marginBottom: '0' }} ref={e => this.ketThuc[index] = e} type='date-mask' readOnly={!item.edit} />
                } />
                <TableCell type='checkbox' content={item.kichHoat} permission={permission} onChanged={() => {
                    T.confirm('Xác nhận kích hoạt', 'Bạn có chắc bạn muốn kích hoạt thời gian mở môn này?', true, isConfirm =>
                        isConfirm && this.props.updateDtThoiGianMoMon(item.id, { kichHoat: Number(!item.kichHoat), loaiHinhDaoTao: item.loaiHinhDaoTao, bacDaoTao: item.bacDaoTao }, data => {
                            this.setState({
                                list: this.state.list.map(item => {
                                    if (data.loaiHinhDaoTao == item.loaiHinhDaoTao) {
                                        if (data.kichHoat) {
                                            if (item.id == data.id) {
                                                item.kichHoat = 1;
                                            } else item.kichHoat = 0;
                                        } else {
                                            if (item.id == data.id) {
                                                item.kichHoat = 0;
                                            }
                                        }
                                    }
                                    return item;
                                })
                            });
                        }));
                }} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='buttons'>
                    {(permission.write || permission.delete) && <>
                        {!item.edit && <Tooltip title='Chỉnh sửa' arrow><button className='btn btn-primary' onClick={e => {
                            e.preventDefault();
                            const list = this.state.list;
                            list[index].edit = !list[index].edit;
                            this.setState({ list });
                        }}><i className='fa fa-lg fa-edit' /></button></Tooltip>}
                        {item.edit && <Tooltip title='Lưu' arrow><button className='btn btn-success' onClick={e => {
                            e.preventDefault();
                            try {
                                const list = this.state.list;
                                list[index].edit = !list[index].edit;
                                let changes = {
                                    batDau: this.validate(this.batDau[index]).getTime(),
                                    ketThuc: this.validate(this.ketThuc[index], 'sethours').getTime(),
                                };
                                this.props.updateDtThoiGianMoMon(item.id, changes, () => {
                                    list[index].batDau = changes.batDau;
                                    list[index].ketThuc = changes.ketThuc;
                                    this.setState({ list }, () => {
                                        this.batDau[index].value(changes.batDau);
                                        this.ketThuc[index].value(changes.ketThuc);
                                    });
                                });
                                return;
                            } catch (selector) {
                                selector.focus();
                                T.notify(`${selector.props.label} bị trống!`, 'danger');
                                return;
                            }
                        }}><i className='fa fa-lg fa-check' /></button></Tooltip>}
                        {item.edit && <Tooltip title='Xóa' arrow><button className='btn btn-danger' onClick={e => {
                            e.preventDefault();
                            T.confirm('Xác nhận xóa', 'Bạn có chắc bạn muốn xóa thời gian mở môn này?', true, isConfirm =>
                                isConfirm && this.props.deleteDtThoiGianMoMon(item, id => {
                                    this.setState({ list: this.state.list.filter(item => item.id != id) }, () => {
                                        this.state.list.forEach((item, index) => {
                                            this.batDau[index].value(item.batDau);
                                            this.ketThuc[index].value(item.ketThuc);
                                        });
                                    });
                                }));
                        }}><i className='fa fa-lg fa-trash' /></button></Tooltip>}
                    </>}
                </TableCell>
            </tr>
        )
    });

    componentDidMount() {
        this.props.getPageDtThoiGianMoMon(undefined, undefined, page => {
            const list = (page.list || []).map(item => ({ ...item, edit: false }));
            this.setState({ list, pageNumber: page.pageNumber, pageSize: page.pageSize, pageTotal: page.pageTotal, totalItem: page.totalItem }, () => {
                list.forEach((item, index) => {
                    this.batDau[index] && this.batDau[index].value(item.batDau);
                    this.ketThuc[index] && this.ketThuc[index].value(item.ketThuc);
                });
                this.batDauMoMon.value(new Date().getTime());
            });

        });
    }

    validate = (selector, custom) => {
        let data = selector.value();
        if (!data) throw (selector);
        if (custom == 'sethours') {
            data.setHours(23, 59, 59, 999);
            return data;
        }
        else return data;
    }
    getVal = () => {
        try {
            let data = {
                nam: this.validate(this.year),
                hocKy: this.validate(this.semester),
                batDau: this.validate(this.batDauMoMon).getTime(),
                ketThuc: this.validate(this.ketThucMoMon, 'sethours').getTime(),
                loaiHinhDaoTao: this.validate(this.loaiHinhDaoTao),
                bacDaoTao: this.validate(this.bacDaoTao)
            };
            return data;
        } catch (selector) {
            selector.focus();
            T.notify(`${selector.props.label} bị trống!`, 'danger');
            return;
        }
    }
    create = () => {
        let data = this.getVal();
        data && T.confirm('Xác nhận tạo mới', 'Bạn có chắc bạn muốn tạo mới thời gian mở môn này?', true, isConfirm => {
            if (isConfirm) {
                this.props.createDtThoiGianMoMon(data, item => {
                    this.state.list.unshift(item);
                    this.setState({ list: this.state.list }, () => {
                        this.state.list.forEach((item, index) => {
                            this.batDau[index].value(item.batDau);
                            this.ketThuc[index].value(item.ketThuc);
                        });
                    });
                });
            }
        });
    }
    render = () => {
        let { list = [], pageNumber = 1, pageSize = 25 } = this.state;

        let permission = this.props.permission || { write: false, delete: false }, readOnly = !permission.write;
        return this.renderModal({
            title: 'Mở thời gian đăng ký môn mới',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect data={SelectAdapter_DtCauTrucKhungDaoTao} ref={e => this.year = e} label='Năm học' className='col-md-3' readOnly={readOnly} />
                <FormSelect ref={e => this.semester = e} label='Học kỳ' className='col-md-3' data={[1, 2, 3]} readOnly={readOnly} />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' className='col-md-3' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} readOnly={readOnly} onChange={value => this.setState({ loaiHinhDaoTao: value.id })} />
                <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' className='col-md-3' data={SelectAdapter_DmSvBacDaoTao} readOnly onChange={value => this.setState({ bacDaoTao: value.id })} />
                <FormDatePicker type='date-mask' ref={e => this.batDauMoMon = e} label='Ngày mở' className='col-md-6' readOnly={readOnly} />
                <FormDatePicker type='date-mask' ref={e => this.ketThucMoMon = e} label='Ngày đóng' className='col-md-5' readOnly={readOnly} />
                {permission.write && <div className='form-group col-md-1 d-flex align-items-end justify-content-end' style={{ paddingLeft: 0 }}>
                    <Tooltip title='Tạo thời gian đăng ký mới' arrow ><button className='btn btn-success' type='button' onClick={e => e.preventDefault() || this.create()}>
                        <i className='fa fa-lg fa-plus' />
                    </button>
                    </Tooltip>
                </div>}
                <div className='form-group col-md-12' style={{ marginTop: '20px' }}>
                    {this.renderData(list, pageSize, pageNumber, permission)}
                </div>
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getPageDtThoiGianMoMon, createDtThoiGianMoMon, deleteDtThoiGianMoMon, updateDtThoiGianMoMon };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(TaoThoiGianMoMon);

