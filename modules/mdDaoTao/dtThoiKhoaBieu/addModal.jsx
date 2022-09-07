import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
// import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormCheckbox, FormSelect, FormTextBox, getValue } from 'view/component/AdminPage';
import T from 'view/js/common';
import { createDtThoiKhoaBieuMultiple } from './redux';
import { SelectAdapter_DmMonHocAll } from '../dmMonHoc/redux';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import { getDtDanhSachChuyenNganhFilter, SelectAdapter_DtDanhSachChuyenNganhFilter } from '../dtDanhSachChuyenNganh/redux';
import { getDtNganhDaoTaoAll } from '../dtNganhDaoTao/redux';
import { getScheduleSettings } from '../dtSettings/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { getDmCaHocAllCondition } from 'modules/mdDanhMuc/dmCaHoc/redux';
const MA_PDT = '33', MA_CTSV = '32';

const dataKhoaSinhVien = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);
class RenderListMon extends React.Component {
    ref = {}
    dataNganh = []
    state = { listSelected: [], listNganh: [] }
    componentDidMount() {
        this.init();
    }

    componentDidUpdate(prev) {
        if (T.stringify(prev.data) != T.stringify(this.props.data)) this.init();
    }

    init = () => {
        let data = this.props.data,
            { soLop, loaiHinhDaoTao } = data;
        getDtNganhDaoTaoAll(items => {
            let dataNganh = items.filter(item => loaiHinhDaoTao == 'CLC' ? item.tenNganh.toUpperCase().includes('CLC') : !item.tenNganh.toUpperCase().includes('CLC')).map(item => ({ id: item.maNganh, text: `${item.maNganh}: ${item.tenNganh}` }));
            this.setState({ dataNganh, soLop }, () => {
                getDmCaHocAllCondition(this.props.data.coSo, items => {
                    let dataTiet = items.map(item => parseInt(item.ten)).sort((a, b) => (a - b));
                    this.setState({ dataTiet, fullDataTiet: items.map(item => ({ ...item, ten: parseInt(item.ten) })) }, () => console.log(this.state.fullDataTiet));
                    let data = this.props.data,
                        { khoaDangKy, maNganh, nam, soLop } = data;
                    if (khoaDangKy == MA_PDT) {
                        Array.from({ length: soLop }, (_, i) => i + 1).forEach(nhom => {
                            ['soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(key => this.ref[key][nhom].value(data[key]));
                            this.ref.tietBatDau[nhom].value('');
                        });
                    } else {
                        getDtDanhSachChuyenNganhFilter(maNganh, nam, (items) => {
                            if (!items.length) {
                                this.setState({ hideChuyenNganh: true }, () => {
                                    Array.from({ length: data.soLop }, (_, i) => i + 1).forEach(nhom => {
                                        ['soTietBuoi', 'soBuoiTuan', 'soLuongDuKien', 'maNganh'].forEach(key => this.ref[key][nhom].value(data[key]));
                                        this.ref.tietBatDau[nhom].value('');
                                        this.ref.maNganh[nhom].value([maNganh]);
                                    });
                                });
                            }
                            else {
                                this.setState({ hideChuyenNganh: false }, () => {
                                    Array.from({ length: data.soLop }, (_, i) => i + 1).forEach(nhom => {
                                        ['soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(key => this.ref[key][nhom].value(data[key]));
                                        this.ref.chuyenNganh[nhom].value(items.map(item => item.id));
                                        this.ref.tietBatDau[nhom].value('');
                                        this.ref.maNganh[nhom].value([maNganh]);
                                    });
                                });
                            }
                        });
                    }
                });
            });
        });

    }

    getData = () => {
        let data = [];
        try {
            Array.from({ length: this.state.soLop }, (_, i) => i + 1).forEach(nhom => {
                let eachData = {};
                ['soTietBuoi', 'soBuoiTuan', 'soLuongDuKien', 'tietBatDau', 'chuyenNganh', 'maNganh'].forEach(key => {
                    eachData[key] = this.ref[key][nhom] ? getValue(this.ref[key][nhom]) : '';
                });

                if (eachData.tietBatDau) {
                    let { soTietBuoi, tietBatDau } = eachData;
                    tietBatDau = parseInt(tietBatDau);
                    soTietBuoi = parseInt(soTietBuoi);
                    let buoiHocBatDau = this.state.fullDataTiet.find(item => item.ten == tietBatDau).buoi;
                    let dataKetThuc = this.state.fullDataTiet.find(item => item.ten == (tietBatDau + soTietBuoi - 1));
                    if (!dataKetThuc) {
                        T.notify('Không có tiết kết thúc phù hợp', 'danger');
                        throw ('');
                    } else if (buoiHocBatDau != dataKetThuc.buoi) {
                        T.notify('Bắt đầu và kết thúc ở 2 buổi khác nhau!', 'danger');
                        throw ('');
                    }
                }
                data.push(eachData);
            });
            return data;
        } catch (input) {
            console.log(input);
            if (input) {
                T.notify('Vui lòng điền đầy đủ dữ liệu', 'danger');
                input.focus();
            }

        }
    }


    handleSelectNganh = (value) => {
        if (value && value.selected) {
            if (this.state.listSelected.includes(value.id)) {
                T.notify(`Cảnh báo: Ngành <b>${value.id}</b> đã được chọn lớp`, 'warning');
            }
            this.setState({ listSelected: [...this.state.listSelected, value.id] });
        }
        else this.setState({ listSelected: this.state.listSelected.removeByValue(value.id) });
    }

    render() {
        let { soLop, maNganh, nam, tenMonHoc, maMonHoc, tenNganh } = this.props.data;
        const { tkbSoBuoiTuanMax, tkbSoBuoiTuanMin, tkbSoLuongDuKienMax, tkbSoLuongDuKienMin, tkbSoTietBuoiMax, tkbSoTietBuoiMin } = this.props.scheduleConfig;
        tenMonHoc = tenMonHoc.split(':')[1];
        let { hideChuyenNganh, dataTiet } = this.state;
        return Array.from({ length: soLop }, (_, i) => i + 1).map(nhom => {
            this.ref = {
                soTietBuoi: {},
                soBuoiTuan: {},
                soLuongDuKien: {},
                tietBatDau: {},
                maNganh: {},
                chuyenNganh: {},
                // giangVien: {}
            };
            return (<React.Fragment key={nhom}>
                <div className='form-group col-md-12' style={{ marginBottom: '0.rem', color: 'blue' }}><b>Lớp {maMonHoc}_{nhom}</b>: {tenMonHoc}</div>
                <FormTextBox type='number' ref={e => this.ref.soTietBuoi[nhom] = e} className='col-md-2' label='Số tiết /buổi' required min={tkbSoTietBuoiMin} max={tkbSoTietBuoiMax} smallText={`Nhập từ ${tkbSoTietBuoiMin} đến ${tkbSoTietBuoiMax}`} />
                <FormTextBox type='number' ref={e => this.ref.soBuoiTuan[nhom] = e} className='col-md-2' label='Số buổi /tuần' required min={tkbSoBuoiTuanMin} max={tkbSoBuoiTuanMax} smallText={`Nhập từ ${tkbSoBuoiTuanMin} đến ${tkbSoBuoiTuanMax}`} />
                <FormSelect ref={e => this.ref.tietBatDau[nhom] = e} className='col-md-2' label='Tiết bắt đầu' data={dataTiet} />
                <FormTextBox type='number' ref={e => this.ref.soLuongDuKien[nhom] = e} className='col-md-2' label='SLDK' required min={tkbSoLuongDuKienMin} max={tkbSoLuongDuKienMax} smallText={`Nhập từ ${tkbSoLuongDuKienMin} đến ${tkbSoLuongDuKienMax}`} />
                <FormSelect ref={e => this.ref.maNganh[nhom] = e} data={maNganh ? [{ id: maNganh, text: `${maNganh}: ${tenNganh}` }] : this.state.dataNganh} label='Ngành' multiple className={'col-md-4'} onChange={value => this.handleSelectNganh(value, maMonHoc, nhom)} required={maNganh ? false : true} />
                <FormSelect ref={e => this.ref.chuyenNganh[nhom] = e} data={SelectAdapter_DtDanhSachChuyenNganhFilter(maNganh, nam)} label='Chuyên ngành' multiple className='col-md-12' style={{ display: hideChuyenNganh ? 'none' : '' }} />

                {/* <FormSelect ref={e => this.ref.giangVien[nhom] = e} data={SelectAdapter_FwCanBoGiangVien} placeholder='Giảng viên' className='col-md-3' /> */}
                {nhom != soLop && <hr className='col-md-12' />}
            </React.Fragment>);
        });
    }
}
connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(RenderListMon);
class AddingModal extends AdminModal {
    state = { khoaDangKy: MA_PDT, savedThongTinChung: false, dataNganh: [] }

    componentDidMount() {
        $('#1').show();
        $('#2').hide();
        this.disabledClickOutside();
        this.props.getScheduleSettings(items => {
            this.setState({ scheduleConfig: items });
        });

    }
    onShow = () => {
        this.bacDaoTao.value('DH');
        this.khoaDangKy.value(MA_PDT);
        let filter = this.props.filter;
        if (filter && filter != {}) {
            let { idNamDaoTao, hocKy, bacDaoTaoFilter, loaiHinhDaoTaoFilter } = filter;
            this.nam.value(idNamDaoTao);
            this.hocKy.value(hocKy);
            this.bacDaoTao.value(bacDaoTaoFilter);
            this.loaiHinhDaoTao.value(loaiHinhDaoTaoFilter);
        }
    }

    saveThongTinChung = () => {
        try {
            const data = {
                bacDaoTao: getValue(this.bacDaoTao),
                loaiHinhDaoTao: getValue(this.loaiHinhDaoTao),
                nam: getValue(this.nam),
                hocKy: getValue(this.hocKy),
                maMonHoc: getValue(this.maMonHoc),
                tenMonHoc: this.maMonHoc.data().text,
                khoaDangKy: getValue(this.khoaDangKy),
                soTietLyThuyet: this.state.soTietLyThuyet,
                soTietThucHanh: this.state.soTietThucHanh,
                coSo: getValue(this.coSo),
                maNganh: this.maNganh.value(),
                tenNganh: this.maNganh.data().text.split(': ')[1],
                khoaSinhVien: getValue(this.khoaSinhVien),
                soLop: getValue(this.soLop),
                soTietBuoi: getValue(this.soTiet),
                soBuoiTuan: getValue(this.soBuoi),
                soLuongDuKien: getValue(this.soLuongDuKien)
            };
            this.setState({ data, savedThongTinChung: true }, () => {
                this.showChiTiet();
            });

        } catch (input) {
            if (input) {
                T.notify(`${input.props.label} bị trống`, 'danger');
                input.focus();
            }
            this.setState({ data: null, settings: null }, this.showThongTinChung);
        }
    }

    onSubmit = (e) => {
        e?.preventDefault();
        let data = this.cpnMon.getData();
        if (data) {
            this.setState({ isCreating: true }, () => {
                this.props.createDtThoiKhoaBieuMultiple(data, this.state.data, () => {
                    this.setState({ isCreating: false });
                });
            });
        }
    }

    handleDonVi = (value) => {
        this.setState({ khoaDangKy: value.id }, () => this.maNganh.value(''));
    }

    handleNam = (value) => {
        this.setState({ nam: value.id });
    }

    handleMonHoc = value => {
        let { tietLt: soTietLyThuyet, tietTh: soTietThucHanh, khoa } = value?.item || {};
        if (khoa) {
            this.khoaDangKy.value(khoa);
            this.setState({ khoaDangKy: khoa }, () => this.maNganh.value(''));
        }
        this.setState({ soTietLyThuyet, soTietThucHanh });
    }

    showThongTinChung = (e) => {
        e?.preventDefault();
        this.setState({ savedThongTinChung: false });
        $('#1').show();
        $('#2').hide();
    }

    showChiTiet = (e) => {
        e?.preventDefault();
        if (!this.state.savedThongTinChung) this.saveThongTinChung();
        else this.setState({ savedThongTinChung: true });
        $('#2').show();
        $('#1').hide();
    }
    handleLoaiHinh = value => {
        getDtNganhDaoTaoAll(items => {
            let dataNganh = items.filter(item => value.id == 'CLC' ? item.tenNganh.toUpperCase().includes('CLC') : !item.tenNganh.toUpperCase().includes('CLC')).map(item => ({ id: item.maNganh, text: `${item.maNganh}: ${item.tenNganh}`, khoa: item.khoa }));
            this.setState({ dataNganh }, () => this.maNganh.value(''));
        });
    }

    render = () => {
        let hideNganhSelect = this.state.khoaDangKy && [MA_CTSV, MA_PDT].includes(this.state.khoaDangKy.toString()),
            savedThongTinChung = this.state.savedThongTinChung;
        const { tkbSoBuoiTuanMax, tkbSoBuoiTuanMin, tkbSoLopMax, tkbSoLopMin, tkbSoLuongDuKienMax, tkbSoLuongDuKienMin, tkbSoTietBuoiMax, tkbSoTietBuoiMin } = this.state.scheduleConfig || {};
        return this.renderModal({
            title: <>
                <div>Tạo học phần</div>
                <ul className='app-breadcrumb breadcrumb'>
                    <a href='' onClick={this.showThongTinChung}>Thông tin chung</a>
                    &nbsp;/&nbsp;
                    {this.state.data ?
                        <a href='' onClick={this.showChiTiet}>Chi tiết</a>
                        : 'Chi tiết'}
                </ul>
            </>,
            isShowSubmit: savedThongTinChung,
            showCloseButton: false,
            postButtons: <>
                {!savedThongTinChung ?
                    <button type='button' className='btn btn-danger' onClick={e => e.preventDefault() || this.saveThongTinChung()}>
                        Tiếp theo &nbsp;<i className='fa fa-lg fa-angle-right' />
                    </button> :
                    <button type='button' className='btn btn-danger' onClick={e => e.preventDefault() || this.showThongTinChung()}>
                        <i className='fa fa-lg fa-angle-left' /> &nbsp; Quay lại
                    </button>}
            </>,
            size: 'elarge',
            submitText: 'Mở lớp',
            isLoading: !!this.state.isCreating,
            body:
                <div>
                    <div className='row' id='1'>
                        <FormSelect ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} className='col-md-12' label='Bậc đào tạo' readOnly required style={{ marginBottom: '0' }} />
                        <FormSelect ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} className='col-md-4' label='Hệ đào tạo' required onChange={this.handleLoaiHinh} />
                        <FormSelect data={SelectAdapter_DtCauTrucKhungDaoTao} ref={e => this.nam = e} className='col-md-2' label='Năm học' onChange={this.handleNam} required />
                        <FormSelect ref={e => this.hocKy = e} data={[1, 2, 3]} label='Học kỳ' className='col-md-2' required />
                        <FormSelect ref={e => this.khoaSinhVien = e} data={dataKhoaSinhVien} label='Khoá sinh viên' className='col-md-2' required />
                        <FormSelect ref={e => this.coSo = e} data={SelectAdapter_DmCoSo} label='Cơ sở học' className='col-md-2' required />
                        <FormSelect ref={e => this.maMonHoc = e} data={SelectAdapter_DmMonHocAll()} className='col-md-10' placeholder='Môn học' label='Môn học' required onChange={this.handleMonHoc} />
                        <FormCheckbox ref={e => this.loaiMonHoc = e} label='Tự chọn' style={{ marginBottom: '0' }} className='col-md-2' />
                        <FormSelect ref={e => this.khoaDangKy = e} data={SelectAdapter_DmDonViFaculty_V2} className={hideNganhSelect ? 'col-md-12' : 'col-md-6'} label='Đơn vị phụ trách môn' onChange={this.handleDonVi} required />
                        <FormSelect ref={e => this.maNganh = e} data={this.state.khoaDangKy ? this.state.dataNganh.filter(item => item.khoa == this.state.khoaDangKy) : this.state.dataNganh} style={{ display: hideNganhSelect ? 'none' : 'block' }} className='col-md-6' label='Ngành' required={!hideNganhSelect} />

                        <FormTextBox type='number' ref={e => this.soLop = e} className='col-md-3' label='Số lớp' required min={tkbSoLopMin} max={tkbSoLopMax} smallText={`Nhập từ ${tkbSoLopMin} đến ${tkbSoLopMax}`} />
                        <FormTextBox type='number' ref={e => this.soTiet = e} className='col-md-3' label='Số tiết /buổi' required min={tkbSoTietBuoiMin} max={tkbSoTietBuoiMax} smallText={`Nhập từ ${tkbSoTietBuoiMin} đến ${tkbSoTietBuoiMax}`} />
                        <FormTextBox type='number' ref={e => this.soBuoi = e} className='col-md-3' label='Số buổi /tuần' required min={tkbSoBuoiTuanMin} max={tkbSoBuoiTuanMax} smallText={`Nhập từ ${tkbSoBuoiTuanMin} đến ${tkbSoBuoiTuanMax}`} />
                        <FormTextBox type='number' ref={e => this.soLuongDuKien = e} className='col-md-3' label='SLDK' required min={tkbSoLuongDuKienMin} max={tkbSoLuongDuKienMax} smallText={`Nhập từ ${tkbSoLuongDuKienMin} đến ${tkbSoLuongDuKienMax}`} />
                    </div>
                    <div id='2' style={{ height: '70vh', overflow: 'scroll', margin: '0 20 0 20' }}>
                        {
                            this.state.data?.soLop &&
                            <React.Fragment>
                                {/* <div className='row' style={{ position: 'sticky', top: 0, zIndex: '1051', backgroundColor: '#0275d8', paddingBottom: '10px', paddingTop: '10px', textAlign: 'center', marginBottom: '15px' }}>
                                    <b className='col-md-1 text-white' >S.Tiết</b>
                                    <b className='col-md-1 text-white' >S.Buổi</b>
                                    <b className='col-md-1 text-white' >T.bắt đầu</b>
                                    <b className='col-md-1 text-white' >SLDK</b>
                                    <b className='col-md-5 text-white' >{this.state.data.maNganh ? 'Chuyên ngành' : 'Ngành đào tạo'}</b>
                                    <b className='col-md-3 text-white' >Giảng viên</b>
                                </div> */}
                                <div className='row'>
                                    <RenderListMon data={this.state.data} ref={e => this.cpnMon = e} scheduleConfig={this.state.scheduleConfig} />
                                </div>
                            </React.Fragment>
                        }
                    </div>
                </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    createDtThoiKhoaBieuMultiple, getScheduleSettings
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddingModal);