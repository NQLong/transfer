import { rgbToHex } from '@mui/material';
import { SelectAdapter_DmPhongAll } from 'modules/mdDanhMuc/dmPhong/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormDatePicker, FormSelect, getValue, renderTable } from 'view/component/AdminPage';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import { SelectAdapter_DtNganhDaoTaoMa } from '../dtNganhDaoTao/redux';
import { initSchedule, autoGenSched } from './redux';

// const MA_PDT = '33';

const dataKhoaSinhVien = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i),
    dataThu = [2, 3, 4, 5, 6, 7],
    dataTiet = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// dataTietChieu = [6, 7, 8, 9],
// dataTietSang = [1, 2, 3, 4, 5];
const fullDataTietThu = [];
dataTiet.forEach(tiet => {
    dataThu.forEach(thu => {
        fullDataTietThu.push({ [thu]: tiet });
    });
});
class AutoGenModal extends AdminModal {
    state = { clicked: false }
    onShow = () => {
        this.bacDaoTao.value('DH');

        //For test
        this.loaiHinhDaoTao.value('CQ');
        this.nam.value(41);
        this.hocKy.value(1);
        this.khoaSinhVien.value(2021);
        this.maNganh.value(['7140101', '7220208', '7229010', '7320303', '7220201', '7310614', '7220206', '7320101', '7220203']);
    }

    onSubmit = () => {
        let thuTietMo = [];
        $('td').each(function () {
            if (rgbToHex($(this).css('backgroundColor')) == '#0275d8') thuTietMo.push($(this).attr('id'));
        });
        let now = Date.now();
        let config = {
            bacDaoTao: getValue(this.bacDaoTao),
            loaiHinhDaoTao: getValue(this.loaiHinhDaoTao),
            nam: getValue(this.nam),
            hocKy: getValue(this.hocKy),
            khoaSinhVien: getValue(this.khoaSinhVien),
            listIdNganh: getValue(this.maNganh).toString(),
            // ngayBatDau: getValue(this.ngayBatDau).getTime()
        },
            listConfig = {
                listPhongKhongSuDung: getValue(this.listPhongKhongSuDung),
                thuTietMo,
            };
        if (config.ngayBatDau < now) T.notify('Ngày bắt đầu phải lớn hơn hôm nay!', 'danger');
        else this.setState({ isLoading: true }, () => {
            this.props.autoGenSched(config, listConfig, (result) => {
                result && this.setState({ isLoading: false });
                // if (result.error) {
                //     T.notify(result.error.message, 'danger');
                //     console.error(result.error);
                // }
                // else T.notify(result.success, 'success');
                // this.hide();
            });
        });
    }
    render = () => {
        return this.renderModal({
            title: 'Cấu hình sinh thời khoá biểu',
            isLoading: this.state.isLoading,
            size: 'elarge',
            body: <div className='row' style={{ height: '70vh', overflow: 'scroll', margin: '0 20 0 20' }}>
                <FormSelect ref={e => this.bacDaoTao = e} className='col-md-12' label='Bậc' data={SelectAdapter_DmSvBacDaoTao} required readOnly />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-3' label='Hệ' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} required />
                <FormSelect data={SelectAdapter_DtCauTrucKhungDaoTao} ref={e => this.nam = e} className='col-md-3' label='Năm học' onChange={this.handleNam} required />
                <FormSelect ref={e => this.hocKy = e} data={[1, 2, 3]} label='Học kỳ' className='col-md-3' required />
                <FormSelect ref={e => this.khoaSinhVien = e} data={dataKhoaSinhVien} label='Khoá sinh viên' className='col-md-3' required />
                <FormSelect ref={e => this.maNganh = e} data={SelectAdapter_DtNganhDaoTaoMa} label='Ngành' className='col-md-6' required multiple />
                <FormDatePicker ref={e => this.ngayBatDau = e} label='Ngày bắt đầu' className='col-md-6' required />
                <FormSelect ref={e => this.listPhongKhongSuDung = e} data={SelectAdapter_DmPhongAll} label={<>Chọn các phòng <b>không sử dụng</b></>} className='col-md-12' multiple={true} />
                <div className='form-group col-md-12'>Chọn các tiết <b>không xếp thời khoá biểu</b> </div>
                <div className='form-group col-md-12' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {
                        renderTable({
                            getDataSource: () => fullDataTietThu,
                            header: '',
                            renderHead: () => <tr>{
                                dataThu.map(thu => <th key={thu} style={{ width: '150px', textAlign: 'center' }}>Thứ {thu}</th>)
                            }</tr>,
                            renderRow: dataTiet.map(tiet => <tr key={tiet}>
                                {dataThu.map(thu => <td key={thu} id={`${thu}_${tiet}`} style={{ textAlign: 'center', backgroundColor: '#0275d8', color: '#fff' }} onClick={e => e.preventDefault() || $(`#${thu}_${tiet}`).css('backgroundColor', (_, cur) => rgbToHex(cur) == '#0275d8' ? '#f0ad4e' : '#0275d8')
                                }>Tiết {tiet}</td>)}
                            </tr>)

                        })
                    }
                </div>
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    initSchedule, autoGenSched
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AutoGenModal);