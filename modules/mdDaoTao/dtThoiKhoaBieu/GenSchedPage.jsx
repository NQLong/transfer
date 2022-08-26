
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import { SelectAdapter_DtDanhSachChuyenNganh } from '../dtDanhSachChuyenNganh/redux';
import { getDtThoiKhoaBieuByConfig, updateDtThoiKhoaBieuConfig } from './redux';
import { getDmCaHocAll } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { getDtNganhDaoTaoAll } from '../dtNganhDaoTao/redux';
const dataKhoaSinhVien = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

class GenSchedPage extends AdminPage {
    state = {}
    componentDidMount() {
        this.props.getDmCaHocAll(items => {
            items = [...new Set(items.map(item => parseInt(item.ten)))];
            this.setState({ dataTiet: items });
        });
        T.ready('/user/daoTao', () => {
            this.bacDaoTao.value('DH');
            this.loaiHinhDaoTao.value('CQ');
            this.nam.value(61);
            this.hocKy.value(1);
            this.khoaSinhVien.value(2021);
            this.khoaDangKy.value(33);
        });
    }

    handleSubmitConfig = (e) => {
        e.preventDefault();
        try {
            this.setState({ onSaveConfig: true });
            let config = {
                bacDaoTao: getValue(this.bacDaoTao),
                loaiHinhDaoTao: getValue(this.loaiHinhDaoTao),
                nam: getValue(this.nam),
                hocKy: getValue(this.hocKy),
                khoaSinhVien: getValue(this.khoaSinhVien),
                khoaDangKy: getValue(this.khoaDangKy),
            };
            this.props.getDtThoiKhoaBieuByConfig(config, result => {
                this.setState({ onSaveConfig: false });
                if (result.error) {
                    this.setState({ readOnlyConfig: false });
                }
                else if (result.dataCanGen) {
                    getDtNganhDaoTaoAll(items => {
                        let dataNganh = items.filter(item => config.loaiHinhDaoTao == 'CLC' ? item.maNganh.includes('_CLC') : !item.maNganh.includes('_CLC')).map(item => ({ id: item.maNganh, text: `${item.maNganh}: ${item.tenNganh}` }));
                        this.setState({ dataNganh });
                    });
                    this.setState({ readOnlyConfig: true });
                }
            });
            this.setState({ config });
        } catch (input) {
            T.notify(`${input.props.label} không được trống!`, 'danger');
            input.focus();
        }
    }

    handleEdit = (item) => {
        let currentId = this.state.editId;
        if (currentId) {
            let currentData = {
                thu: this.thu.value(),
                tietBatDau: this.tietBatDau.value(),
                soTietBuoi: this.soTietBuoi.value(),
                soLuongDuKien: this.soLuongDuKien.value(),
                maNganh: this.maNganh.value(),
                chuyenNganh: this.chuyenNganh.value()
            };
            this.props.updateDtThoiKhoaBieuConfig({ currentId, currentData });
        }
        this.setState({ editId: item.id }, () => {
            this.thu.value(item.thu);
            this.tietBatDau.value(item.tietBatDau);
            this.soTietBuoi.value(item.soTietBuoi);
            this.soLuongDuKien.value(item.soLuongDuKien);
            this.maNganh.value(item.maNganh ? item.maNganh.split(',') : '');
            this.chuyenNganh.value(item.maChuyenNganh ? item.maChuyenNganh.split(',') : '');
        });

    }

    editElement = () => {
        return (<>
            <TableCell content={
                <FormTextBox type='number' ref={e => this.thu = e} style={{ marginBottom: '0', width: '50px' }} min={2} max={7} />
            } />
            <TableCell content={
                <FormSelect ref={e => this.tietBatDau = e} style={{ marginBottom: '0', width: '50px' }} data={this.state.dataTiet} />
            } />
            <TableCell content={
                <FormTextBox type='number' ref={e => this.soTietBuoi = e} style={{ width: '50px', marginBottom: '0' }} min={1} max={5} />
            } />
            <TableCell content={
                <FormTextBox type='number' ref={e => this.soLuongDuKien = e} style={{ width: '70px', marginBottom: '0' }} />
            } />
            <TableCell content={
                <>
                    <FormSelect ref={e => this.maNganh = e} style={{ marginBottom: '0', width: '250px' }} data={this.state.dataNganh} multiple placeholder='Ngành' />
                    <FormSelect ref={e => this.chuyenNganh = e} style={{ marginBottom: '0', width: '250px' }} data={SelectAdapter_DtDanhSachChuyenNganh()} multiple placeholder='Chuyên ngành' />
                </>
            } />
        </>);
    }

    genData = (data) => renderTable({
        getDataSource: () => data,
        stickyHead: true,
        header: 'thead-light',
        className: 'table-fix-col',
        renderHead: () => <tr>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Mã</th>
            <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Tên</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Thứ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tiết bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tiết/Buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Dự kiến</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành/Chuyên ngành</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
        </tr>,
        renderRow: (item, index) => {
            return (<tr key={index}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.maMonHoc}_${item.nhom}`} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' }).vi} />
                {this.state.editId == item.id ? this.editElement() : <>
                    <TableCell type='number' content={item.thu} />
                    <TableCell type='number' content={item.tietBatDau} />
                    <TableCell type='number' content={item.soTietBuoi} />
                    <TableCell type='number' content={item.soLuongDuKien} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{
                        item.tenNganh?.split('&&').map((nganh, i) => <span key={i}><Tooltip title={nganh.split('%')[0]} arrow><span>{nganh.split('%')[1]}</span></Tooltip>{(i + 1) % 3 == 0 ? <br /> : (i < item.tenNganh?.split('&&').length - 1 ? ', ' : '.')}</span>)}
                        {item.tenChuyenNganh && <br />}
                        {item.tenChuyenNganh?.split('&&').map((nganh, i) => <span key={i}><Tooltip title={`${nganh.split('%')[0]}_${nganh.split('%')[1].getFirstLetters()}`} arrow><span>{nganh.split('%')[1]}</span></Tooltip>{(i + 1) % 3 == 0 ? <br /> : (i < item.tenChuyenNganh?.split('&&').length - 1 ? ', ' : '.')}</span>)}
                    </>} />
                </>}
                <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} >
                    {this.state.editId == item.id ? <Tooltip title='Lưu' arrow>
                        <button className='btn btn-success' onClick={e => {
                            e.preventDefault();
                            this.handleUpdate(item);
                        }}>
                            <i className='fa fa-lg fa-check' />
                        </button>
                    </Tooltip> : <>
                        <Tooltip title='Điều chỉnh' arrow>
                            <button className='btn btn-primary' onClick={e => e.preventDefault() || this.handleEdit(item)}>
                                <i className='fa fa-lg fa-edit' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Xóa' arrow>
                            <button className='btn btn-danger' onClick={e => e.preventDefault() || this.delete(item)}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </Tooltip>
                    </>}
                </TableCell>
            </tr>);
        }
    })

    render() {
        let dtThoiKhoaBieuConfig = this.props.dtThoiKhoaBieu;
        let { onSaveConfig, readOnlyConfig } = this.state;
        return this.renderPage({
            title: 'Quản lý sinh thời khoá biểu tự động',
            icon: 'fa fa-cons',
            content: <div className='row'>
                <div className='col-md-12' style={{ display: !readOnlyConfig ? '' : 'none' }}>
                    <div className='tile'>
                        <div className='tile-title'>
                            <h5>Cấu hình</h5>
                        </div>
                        <div className='tile-body'>
                            <div className='row'>
                                <FormSelect ref={e => this.bacDaoTao = e} className='col-md-2' label='Bậc' data={SelectAdapter_DmSvBacDaoTao} style={{ marginBottom: '0' }} required readOnly />
                                <FormSelect readOnly={readOnlyConfig} ref={e => this.loaiHinhDaoTao = e} className='col-md-3' label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} required />
                                <FormSelect readOnly={readOnlyConfig} data={SelectAdapter_DtCauTrucKhungDaoTao} ref={e => this.nam = e} className='col-md-3' label='Năm học' onChange={this.handleNam} required />
                                <FormSelect readOnly={readOnlyConfig} ref={e => this.hocKy = e} data={[1, 2, 3]} label='Học kỳ' className='col-md-2' required />
                                <FormSelect readOnly={readOnlyConfig} ref={e => this.khoaSinhVien = e} data={dataKhoaSinhVien} label='Khoá sinh viên' className='col-md-2' required />
                                <FormSelect readOnly={readOnlyConfig} ref={e => this.khoaDangKy = e} data={SelectAdapter_DmDonViFaculty_V2} label='Đơn vị mở môn' className='col-md-12' required />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-outline-primary' type='button' onClick={this.handleSubmitConfig} disabled={onSaveConfig}>
                                    {onSaveConfig ? 'Loading' : 'Tiếp theo'} <i className={onSaveConfig ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-arrow-right'} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
                <div className='col-md-12' style={{ display: readOnlyConfig && dtThoiKhoaBieuConfig && dtThoiKhoaBieuConfig.items ? '' : 'none' }}>
                    <div className='tile'>
                        <div className='tile-title'>
                            <h5>Danh sách môn cần xếp lịch</h5>
                            <button className='btn btn-outline-secondary' type='button' onClick={e => e.preventDefault() || this.setState({ readOnlyConfig: false }, () => {
                                dtThoiKhoaBieuConfig = null;
                            })} style={{ position: 'absolute', top: '20px', right: '20px' }}>
                                Cấu hình lại <i className='fa fa-lg fa-repeat' />
                            </button></div>
                        <div className='tile-body'>
                            {this.genData(dtThoiKhoaBieuConfig?.items?.dataCanGen)}
                        </div>
                    </div>
                </div>
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = {
    getDtThoiKhoaBieuByConfig, getDmCaHocAll, updateDtThoiKhoaBieuConfig
};
export default connect(mapStateToProps, mapActionsToProps)(GenSchedPage);