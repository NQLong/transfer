
import { rgbToHex, Tooltip } from '@mui/material';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import { SelectAdapter_DtDanhSachChuyenNganh } from '../dtDanhSachChuyenNganh/redux';
import { getDtThoiKhoaBieuByConfig, updateDtThoiKhoaBieuConfig, updateDtThoiKhoaBieuCondition, resetDtThoiKhoaBieuConfig } from './redux';
import { getDmCaHocAll, getDmCaHocAllCondition } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { getDtNganhDaoTaoAll } from '../dtNganhDaoTao/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
// import { SelectAdapter_DmPhongFilter } from 'modules/mdDanhMuc/dmPhong/redux';
const dataKhoaSinhVien = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

const dataThu = [2, 3, 4, 5, 6, 7];
const fullDataTietThu = [];
class GenSchedPage extends AdminPage {
    state = {
        step: 3
    }

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
                if (result.dataCanGen) {
                    this.setState({ config, step: 2 });
                    getDtNganhDaoTaoAll(items => {
                        let dataNganh = items.filter(item => config.loaiHinhDaoTao == 'CLC' ? item.maNganh.includes('_CLC') : !item.maNganh.includes('_CLC')).map(item => ({ id: item.maNganh, text: `${item.maNganh}: ${item.tenNganh}`, name: item.tenNganh }));
                        this.setState({ dataNganh });
                    });
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
                thu: this.thu.value() || '',
                tietBatDau: this.tietBatDau.value() || '',
                soTietBuoi: this.soTietBuoi.value() || '',
                soLuongDuKien: this.soLuongDuKien.value() || '',
                maNganh: this.maNganh.value(),
                chuyenNganh: this.chuyenNganh.value()
            };
            this.props.updateDtThoiKhoaBieuConfig({ currentId, currentData, config: this.state.config });
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

    handleUpdate = (e) => {
        e.preventDefault();
        let currentId = this.state.editId;
        let currentData = {
            thu: this.thu.value(),
            tietBatDau: this.tietBatDau.value(),
            soTietBuoi: this.soTietBuoi.value(),
            soLuongDuKien: this.soLuongDuKien.value(),
            maNganh: this.maNganh.value(),
            chuyenNganh: this.chuyenNganh.value()
        };
        this.props.updateDtThoiKhoaBieuConfig({ currentId, currentData, config: this.state.config }, () => {
            this.setState({ editId: null });
        });
    }

    handleResetConfig = (e) => {
        e.preventDefault();
        this.setState({ step: 1 }, () => {
            this.props.resetDtThoiKhoaBieuConfig();
        });
    }

    handleSubmitAdjustedData = (e) => {
        e.preventDefault();
        this.setState({ step: 3 }, () => {
            this.coSo.focus();
            this.props.resetDtThoiKhoaBieuConfig();
        });
    }

    handleChooseBuilding = (value) => {
        this.setState({ maCoSo: value.id, amount: 1 }, () => {
            this.handleRenderTiet();
            // this.phongKhongSuDung.value('');
        });
    }

    handleRenderTiet = () => {
        getDmCaHocAllCondition(this.state.maCoSo, data => {
            data = data.map(item => parseInt(item.ten)).sort((a, b) => (a - b));
            data.forEach(tiet => {
                dataThu.forEach(thu => {
                    fullDataTietThu.push({ [thu]: tiet });
                });
            });
            this.setState({ fullDataTietThu, dataTiet: data });
        });
    }

    handleSaveTimeConfig = () => {
        let thuTietMo = [], thuTietKhongMo = [];
        $('td').each(function () {
            if (rgbToHex($(this).css('backgroundColor')) == '#0275d8') {
                thuTietMo.push($(this).attr('id'));
            } else {
                thuTietKhongMo.push($(this).attr('id'));
            }
        });
        const listDonVi = this.listDonVi.value(),
            listTenDonVi = this.listDonVi.data().map(item => item.text);
        console.log(thuTietMo, listDonVi, listTenDonVi);
        this.setState({ timeConfig: [...(this.state.timeConfig || []), { listTenDonVi, listDonVi, thuTietKhongMo, thuTietMo }] });
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
                        <button className='btn btn-success' onClick={this.handleUpdate}>
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
        let { onSaveConfig, step, timeConfig } = this.state;
        return this.renderPage({
            title: 'Quản lý sinh thời khoá biểu tự động',
            icon: 'fa fa-cogs',
            content: <div className='row'>
                <section className='col-md-12' style={{ display: step == 1 ? '' : 'none' }} id='config'>
                    <span style={{ fontSize: '0.8rem' }}>
                        <b className='text-danger'>Cấu hình</b>&nbsp;
                        <i className='fa fa-sm fa-angle-double-right' />&nbsp;
                        <span>Điều chỉnh</span>&nbsp;
                        <i className='fa fa-sm fa-angle-double-right' />&nbsp;
                        <span>Sinh thời gian</span>
                    </span>
                    <div className='tile'>
                        <div className='tile-title'>
                            <h4>Cấu hình</h4>
                        </div>
                        <div className='tile-body'>
                            <div className='row'>
                                <FormSelect ref={e => this.bacDaoTao = e} className='col-md-2' label='Bậc' data={SelectAdapter_DmSvBacDaoTao} style={{ marginBottom: '0' }} required readOnly />
                                <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-3' label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} required />
                                <FormSelect data={SelectAdapter_DtCauTrucKhungDaoTao} ref={e => this.nam = e} className='col-md-3' label='Năm học' onChange={this.handleNam} required />
                                <FormSelect ref={e => this.hocKy = e} data={[1, 2, 3]} label='Học kỳ' className='col-md-2' required />
                                <FormSelect ref={e => this.khoaSinhVien = e} data={dataKhoaSinhVien} label='Khoá sinh viên' className='col-md-2' required />
                                <FormSelect ref={e => this.khoaDangKy = e} data={SelectAdapter_DmDonViFaculty_V2} label='Đơn vị mở môn' className='col-md-12' required />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-outline-primary' type='button' onClick={this.handleSubmitConfig} disabled={onSaveConfig}>
                                    {onSaveConfig ? 'Loading' : 'Tiếp theo'} <i className={onSaveConfig ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-arrow-right'} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className='col-md-12' style={{ display: step == 2 ? '' : 'none' }} id='adjustData'>
                    <span style={{ fontSize: '0.8rem' }}>
                        <span>Cấu hình</span>&nbsp;
                        <i className='fa fa-sm fa-angle-double-right' />&nbsp;
                        <b className='text-danger'>Điều chỉnh</b>&nbsp;
                        <i className='fa fa-sm fa-angle-double-right' />&nbsp;
                        <span>Sinh thời gian</span>
                    </span>
                    <div className='tile'>
                        <div className='tile-title'>
                            <h4>Điều chỉnh</h4>
                            <button className='btn btn-outline-secondary' type='button' onClick={this.handleResetConfig} style={{ position: 'absolute', top: '20px', right: '170px' }}>
                                Cấu hình lại <i className='fa fa-lg fa-repeat' />
                            </button>

                            <button className='btn btn-outline-primary' type='button' style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={this.handleSubmitAdjustedData}>
                                Sinh thời gian <i className='fa fa-lg fa-arrow-right' />
                            </button>
                        </div>
                        <div className='tile-body'>
                            {this.genData(dtThoiKhoaBieuConfig?.dataCanGen)}
                        </div>
                    </div>
                </section>

                <section className='col-md-12' style={{ display: step == 3 ? '' : 'none' }} id='configTime'>
                    <span style={{ fontSize: '0.8rem' }}>
                        <span>Cấu hình</span>&nbsp;
                        <i className='fa fa-sm fa-angle-double-right' />&nbsp;
                        <span>Điều chỉnh</span>&nbsp;
                        <i className='fa fa-sm fa-angle-double-right' />&nbsp;
                        <b className='text-danger'>Sinh thời gian</b>
                    </span>
                    <div className='tile'>
                        <h4 className='tile-title'>Thời gian</h4>
                        <div className='tile-body'>
                            <div className='row'>
                                <FormSelect ref={e => this.coSo = e} data={SelectAdapter_DmCoSo} label='Chọn cơ sở học' className='col-md-6' onChange={this.handleChooseBuilding} />
                                <div className='col-md-6' />
                                {/* <FormSelect ref={e => this.phongKhongSuDung = e} data={SelectAdapter_DmPhongFilter(this.state.maCoSo)} className='col-md-8' label='Chọn các phòng không sử dụng' /> */}
                                {this.state.fullDataTietThu &&
                                    <div className='form-group col-md-6'>
                                        <label>Chọn các tiết <b>không xếp thời khoá biểu</b> </label>
                                        {renderTable({
                                            getDataSource: () => this.state.fullDataTietThu,
                                            header: '',
                                            renderHead: () => <tr>{
                                                dataThu.map(thu => <th key={thu} style={{ width: '100px', textAlign: 'center' }}>Thứ {thu}</th>)
                                            }</tr>,
                                            renderRow: this.state.dataTiet.map(tiet => <tr key={tiet}>
                                                {dataThu.map(thu => <td key={thu} id={`${thu}_${tiet}`} style={{ textAlign: 'center', backgroundColor: '#0275d8', color: '#fff' }} onClick={e => e.preventDefault() || $(`#${thu}_${tiet}`).css('backgroundColor', (_, cur) => rgbToHex(cur) == '#0275d8' ? '#f0ad4e' : '#0275d8')
                                                }>Tiết {tiet}</td>)}
                                            </tr>)
                                        })}
                                    </div>}
                                {this.state.fullDataTietThu && <div className='form-group col-md-6'>
                                    {(timeConfig || []).map((item, index) => {
                                        let dataKhongMo = item.thuTietKhongMo.map(item => ({ thu: item.split('_')[0], tiet: item.split('_')[1] })).groupBy('thu');
                                        return (<div key={index} style={{ marginBottom: '20px' }}>
                                            <span>K/BM: {item.listTenDonVi.length ? item.listTenDonVi.join(', ') : 'Tất cả'}:<br /></span>
                                            <span>{item.thuTietKhongMo.length ? Object.keys(dataKhongMo).map(key => <b key={key}>
                                                - Trừ Thứ {key}, Tiết {dataKhongMo[key].map(item => item.tiet).join(', ')}.
                                            </b>) : <b>Sinh tự động trên toàn bộ thứ, tiết</b>}</span>
                                            <button className='btn btn-danger'><i className='fa fa-lg fa-trash' /></button>
                                        </div>);
                                    })}
                                    <FormSelect ref={e => this.listDonVi = e} label='Chọn các khoa/bộ môn' placeholder='Chọn các khoa/bộ môn (Nếu không chọn thì mặc định là tất cả)' data={SelectAdapter_DmDonViFaculty_V2} multiple />
                                    <div style={{ textAlign: 'right' }}>
                                        <button className='btn btn-outline-success' type='button' onClick={this.handleSaveTimeConfig}>
                                            <i className='fa fa-lg fa-save' /> Lưu
                                        </button>
                                    </div>
                                </div>}
                            </div>
                        </div>
                    </div>
                </section>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = {
    getDtThoiKhoaBieuByConfig, getDmCaHocAll, updateDtThoiKhoaBieuConfig, updateDtThoiKhoaBieuCondition, resetDtThoiKhoaBieuConfig
};
export default connect(mapStateToProps, mapActionsToProps)(GenSchedPage);