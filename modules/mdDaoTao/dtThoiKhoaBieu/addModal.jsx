import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormCheckbox, FormSelect, FormTextBox, getValue } from 'view/component/AdminPage';
import T from 'view/js/common';
import { createDtThoiKhoaBieuMultiple } from './redux';
import { SelectAdapter_DmMonHocAll } from '../dmMonHoc/redux';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import { SelectAdapter_DtDanhSachChuyenNganh, getDtDanhSachChuyenNganhFilter } from '../dtDanhSachChuyenNganh/redux';
import { SelectAdapter_DtNganhDaoTaoFilter, getDtNganhDaoTaoAll } from '../dtNganhDaoTao/redux';

const MA_PDT = '33', MA_CTSV = '32';

const dataKhoaSinhVien = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);
class RenderListMon extends React.Component {
    ref = {}
    state = { listSelected: [], listNganh: [] }

    getData = () => {
        let data = [];
        try {
            Array.from({ length: this.state.soLop }, (_, i) => i + 1).forEach(nhom => {
                let eachData = {};
                ['soTietBuoi', 'soBuoiTuan', 'soLuongDuKien', 'chuyenNganh', 'maNganh', 'giangVien'].forEach(key => {
                    eachData[key] = this.ref[key][nhom] ? getValue(this.ref[key][nhom]) : '';
                });
                data.push(eachData);
            });
            return data;
        } catch (input) {
            T.notify('Vui lòng điền đầy đủ dữ liệu', 'danger');
            input.focus();
        }
    }

    componentDidUpdate(prev) {
        if (T.stringify(prev.data) != T.stringify(this.props.data)) this.init();
    }

    init = () => {
        let data = this.props.data,
            { khoaDangKy, maNganh, nam, soLop } = data;
        if (khoaDangKy == MA_PDT) {
            getDtNganhDaoTaoAll(items => {
                this.setState({ listSelected: items.map(item => item.maNganh), listNganhDaoTao: items.map(item => item.maNganh), soLop }, () => {
                    let spliceLength = parseInt(items.length / data.soLop) + 1;
                    Array.from({ length: data.soLop }, (_, i) => i + 1).forEach(nhom => {
                        ['soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(key => this.ref[key][nhom].value(data[key]));
                    });
                    Array.from({ length: data.soLop + 1 }, (_, i) => i).forEach(nhom => {
                        let value = this.state.listNganhDaoTao.splice(0, spliceLength);
                        this.ref.maNganh[nhom + 1]?.value(value);
                        this.ref.chuyenNganh[nhom]?.value('');
                    });
                });
            });
        } else {
            this.setState({ soLop });
            getDtDanhSachChuyenNganhFilter(maNganh, nam, (items) => {
                Array.from({ length: data.soLop }, (_, i) => i + 1).forEach(nhom => {
                    ['soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(key => this.ref[key][nhom].value(data[key]));
                    this.ref.chuyenNganh[nhom].value(items.map(item => item.id));
                    this.ref.maNganh[nhom].value([maNganh]);
                });
            });

        }
    }

    componentDidMount() {
        this.init();
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
        let { soLop, maNganh, nam, tenMonHoc, maMonHoc, soTietBuoi, khoaDangKy } = this.props.data;
        tenMonHoc = tenMonHoc.split(':')[1];
        return Array.from({ length: soLop }, (_, i) => i + 1).map(nhom => {
            this.ref = {
                soTietBuoi: {},
                soBuoiTuan: {},
                soLuongDuKien: {},
                maNganh: {},
                chuyenNganh: {},
                giangVien: {}
            };
            return (<React.Fragment key={nhom}>
                <div className='form-group col-md-12' style={{ marginBottom: '0.5rem' }}><b>Lớp {maMonHoc}_{nhom}</b>: {tenMonHoc}</div>
                <FormTextBox type='number' ref={e => this.ref.soTietBuoi[nhom] = e} className='col-md-1' placeholder='Số tiết /buổi' required defaulValue={soTietBuoi} />
                <FormTextBox type='number' ref={e => this.ref.soBuoiTuan[nhom] = e} className='col-md-1' placeholder='Số buổi /tuần' required />
                <FormTextBox type='number' ref={e => this.ref.soLuongDuKien[nhom] = e} className='col-md-1' placeholder='SLDK' required multiple />
                <FormSelect ref={e => this.ref.maNganh[nhom] = e} data={SelectAdapter_DtNganhDaoTaoFilter(khoaDangKy)} placeholder='Ngành' multiple className='col-md-6' onChange={value => this.handleSelectNganh(value, maMonHoc, nhom)} style={{ display: maNganh ? 'none' : '' }} required={maNganh ? false : true} />
                <FormSelect ref={e => this.ref.chuyenNganh[nhom] = e} data={SelectAdapter_DtDanhSachChuyenNganh(maNganh, nam)} placeholder='Chuyên ngành' multiple className='col-md-6' style={{ display: maNganh ? '' : 'none' }} required={maNganh ? true : false} />
                <FormSelect ref={e => this.ref.giangVien[nhom] = e} data={SelectAdapter_FwCanBoGiangVien} placeholder='Giảng viên' className='col-md-3' />
                {nhom != soLop && <hr className='col-md-12' />}
            </React.Fragment>);
        });
    }
}
connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(RenderListMon);
class AddingModal extends AdminModal {
    state = { khoaDangKy: MA_PDT, savedThongTinChung: false }

    componentDidMount() {
        $('#1').show();
        $('#2').hide();
        this.disabledClickOutside();
    }
    onShow = () => {
        //Start for test: 
        this.loaiHinhDaoTao.value('CQ');
        this.nam.value(41);
        this.hocKy.value(1);
        this.maMonHoc.value('DAI028');
        this.soLop.value(10);
        this.soTiet.value(4);
        this.soBuoi.value(1);
        this.soLuongDuKien.value(100);
        this.khoaSinhVien.value(2022);
        //End for test;
        this.bacDaoTao.value('DH');
        this.khoaDangKy.value(MA_PDT);
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
                maNganh: this.maNganh.value(),
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
            T.notify(`${input.props.label} bị trống`, 'danger');
            input.focus();
            this.setState({ data: null, settings: null }, this.showThongTinChung);
        }
    }

    onSubmit = (e) => {
        e?.preventDefault();
        let data = this.cpnMon.getData();
        this.setState({ isCreating: true });
        if (data) {
            this.props.createDtThoiKhoaBieuMultiple(data, this.state.data, () => {
                this.setState({ isCreating: false });
            });
        }
    }

    handleDonVi = (value) => {
        this.setState({ khoaDangKy: value.id }, () => this.maNganh.value(''));
    }

    handleNam = (value) => {
        this.setState({ nam: value.id });
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


    render = () => {
        let hideNganhSelect = this.state.khoaDangKy && [MA_CTSV, MA_PDT].includes(this.state.khoaDangKy.toString()),
            savedThongTinChung = this.state.savedThongTinChung;
        return this.renderModal({
            title: <>
                <div>Mở thời khoá biểu</div>
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
                        <FormSelect ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} className='col-md-3' label='Bậc đào tạo' readOnly required />
                        <FormSelect ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} className='col-md-3' label='Hệ đào tạo' required />
                        <FormSelect data={SelectAdapter_DtCauTrucKhungDaoTao} ref={e => this.nam = e} className='col-md-2' label='Năm học' onChange={this.handleNam} required />
                        <FormSelect ref={e => this.hocKy = e} data={[1, 2, 3]} label='Học kỳ' className='col-md-2' required />
                        <FormSelect ref={e => this.khoaSinhVien = e} data={dataKhoaSinhVien} label='Khoá sinh viên' className='col-md-2' required />
                        <FormSelect ref={e => this.khoaDangKy = e} data={SelectAdapter_DmDonViFaculty_V2} className={hideNganhSelect ? 'col-md-12' : 'col-md-6'} label='Đơn vị phụ trách môn' onChange={this.handleDonVi} required />
                        <FormSelect ref={e => this.maNganh = e} data={SelectAdapter_DtNganhDaoTaoFilter(this.state.khoaDangKy || null)} style={{ display: hideNganhSelect ? 'none' : 'block' }} className='col-md-6' label='Ngành' required={!hideNganhSelect} />
                        <FormSelect ref={e => this.maMonHoc = e} data={SelectAdapter_DmMonHocAll()} className='col-md-10' placeholder='Môn học' label='Môn học' required />
                        <FormCheckbox ref={e => this.loaiMonHoc = e} label='Tự chọn' style={{ marginBottom: '0' }} className='col-md-2' />
                        <FormTextBox type='number' ref={e => this.soLop = e} className='col-md-3' label='Số lớp' required />
                        <FormTextBox type='number' ref={e => this.soTiet = e} className='col-md-3' label='Số tiết /buổi' required />
                        <FormTextBox type='number' ref={e => this.soBuoi = e} className='col-md-3' label='Số buổi /tuần' required />
                        <FormTextBox type='number' ref={e => this.soLuongDuKien = e} className='col-md-3' label='SLDK' required />
                    </div>
                    <div id='2' style={{ height: '70vh', overflow: 'scroll', margin: '0 20 0 20' }}>
                        {
                            this.state.data?.soLop &&
                            <React.Fragment>
                                <div className='row' style={{ position: 'sticky', top: 0, zIndex: '1051', backgroundColor: '#0275d8', paddingBottom: '10px', paddingTop: '10px', textAlign: 'center', marginBottom: '15px' }}>
                                    <b className='col-md-1 text-white' >S.Tiết</b>
                                    <b className='col-md-1 text-white' >S.Buổi</b>
                                    <b className='col-md-1 text-white' >SLDK</b>
                                    <b className='col-md-6 text-white' >{this.state.data.maNganh ? 'Chuyên ngành' : 'Ngành đào tạo'}</b>
                                    <b className='col-md-3 text-white' >Giảng viên</b>
                                </div>
                                <div className='row'>
                                    <RenderListMon data={this.state.data} ref={e => this.cpnMon = e} />
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
    createDtThoiKhoaBieuMultiple
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddingModal);