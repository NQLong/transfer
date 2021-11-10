import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getStaffAll, SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { getdmLoaiHopDongAll, SelectAdapter_DmLoaiHopDong } from 'modules/mdDanhMuc/dmLoaiHopDong/redux';
import { getTchcCanBoHopDongDvtlTnAll, SelectAdapter_HiredStaff } from 'modules/mdTccb/tchcCanBoHopDongDvtlTn/redux';
import { getDmDonViAll, SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmNgachCdnnAll } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import {
    getTchcHopDongDvtlTnPage, getTchcHopDongDvtlTnAll, updateTchcHopDongDvtlTn,
    deleteTchcHopDongDvtlTn, createTchcHopDongDvtlTn, getTchcHopDongDvtlTnEdit, downloadWord
} from './redux';
import TextInput, { DateInput, Select } from 'view/component/Input';
import { QTForm } from 'view/component/Form';


class TchcHopDongDvtlTnEditPage extends QTForm {
    constructor (props) {
        super(props);
        this.state = { item: null };
        this.main = React.createRef();
        this.soHopDong = React.createRef();
        this.loaiHopDong = React.createRef();
        this.kieuHopDong = React.createRef();
        this.nguoiDuocThue = React.createRef();
        this.nguoiKy = React.createRef();
        this.batDauLamViec = React.createRef();
        this.ketThucHopDong = React.createRef();
        this.ngayKyHopDongTiepTheo = React.createRef();
        this.diaDiemLamViec = React.createRef();
        this.chucDanhChuyenMon = React.createRef();
        this.congViecDuocGiao = React.createRef();
        this.chiuSuPhanCong = React.createRef();
        this.donViChiTra = React.createRef();
        this.ngach = React.createRef();
        this.bac = React.createRef();
        this.heSo = React.createRef();
        this.hieuLucHopDong = React.createRef();
        this.ngayKyHopDong = React.createRef();
        this.phanTramHuong = React.createRef();
        this.tienLuong = React.createRef();
    }
    componentDidMount() {
        T.ready('/user/hopDongDvtlTn');
        this.getData();
    }

    getData = () => {
        const route = T.routeMatcher('/user/hopDongDvtlTn/:ma'),
            ma = route.parse(window.location.pathname).ma;
        this.urlMa = ma && ma != 'new' ? ma : null;
        if (this.urlMa) {
            this.setState({ create: false });
            this.props.getTchcHopDongDvtlTnEdit(ma, data => {
                if (data.error) {
                    T.notify('Lấy thông tin hợp đồng bị lỗi!', 'danger');
                } else {
                    this.setState(
                        {
                            item: data.item,
                            nguoiDuocThue: data.item.nguoiDuocThue,
                            nguoiKy: data.item.nguoiKy,
                        }, () => {
                            this.setVal(data.item);
                        });
                }
            });
        }
        else {
            this.setState({ create: true });
            this.setVal();
        }

    }

    setVal = (data = {}) => {
        const {
            soHopDong = '', loaiHopDong = '', kieuHopDong = '', nguoiDuocThue = '', nguoiKy
            = '', batDauLamViec = '', ketThucHopDong = '', ngayKyHopDongTiepTheo = '', diaDiemLamViec = '', chucDanhChuyenMon = '',
            congViecDuocGiao = '', chiuSuPhanCong = '', donViChiTra = '', ngach = '', bac = '', heSo = '', hieuLucHopDong = '', ngayKyHopDong = '',
            phanTramHuong = '', tienLuong = ''
        } = data.constructor === ({}).constructor ? data : {};
        this.soHopDong.current.setVal(soHopDong ? soHopDong : '');
        this.loaiHopDong.current.setVal(loaiHopDong ? loaiHopDong : '');
        this.kieuHopDong.current.setVal(kieuHopDong ? kieuHopDong : '');
        this.nguoiDuocThue.current.setVal(nguoiDuocThue ? nguoiDuocThue : '');
        this.nguoiKy.current.setVal(nguoiKy ? nguoiKy : '');
        this.batDauLamViec.current.setVal(batDauLamViec ? batDauLamViec : '');
        this.ketThucHopDong.current.setVal(ketThucHopDong ? ketThucHopDong : '');
        this.ngayKyHopDongTiepTheo.current.setVal(ngayKyHopDongTiepTheo ? ngayKyHopDongTiepTheo : '');
        this.diaDiemLamViec.current.setVal(diaDiemLamViec ? diaDiemLamViec : '');
        this.chucDanhChuyenMon.current.setVal(chucDanhChuyenMon ? chucDanhChuyenMon : '');
        this.congViecDuocGiao.current.setVal(congViecDuocGiao ? congViecDuocGiao : '');
        this.chiuSuPhanCong.current.setVal(chiuSuPhanCong ? chiuSuPhanCong : '');
        this.donViChiTra.current.setVal(donViChiTra ? donViChiTra : '');
        this.ngach.current.setVal(ngach ? ngach : '');
        this.bac.current.setVal(bac ? bac : '');
        this.heSo.current.setVal(heSo ? heSo : '');
        this.hieuLucHopDong.current.setVal(hieuLucHopDong ? hieuLucHopDong : '');
        this.ngayKyHopDong.current.setVal(ngayKyHopDong ? ngayKyHopDong : '');
        this.phanTramHuong.current.setVal(phanTramHuong ? phanTramHuong : '');
        this.tienLuong.current.setVal(tienLuong ? tienLuong : '');
    }

    getVal = () => ({
        soHopDong: this.soHopDong.current.getFormVal(),
        loaiHopDong: this.loaiHopDong.current.getFormVal(),
        kieuHopDong: this.kieuHopDong.current.getFormVal(),
        nguoiDuocThue: this.nguoiDuocThue.current.getFormVal(),
        nguoiKy: this.nguoiKy.current.getFormVal(),
        batDauLamViec: Number(this.batDauLamViec.current.getFormVal()),
        ketThucHopDong: Number(this.ketThucHopDong.current.getFormVal()),
        ngayKyHopDongTiepTheo: Number(this.ngayKyHopDongTiepTheo.current.getFormVal()),
        diaDiemLamViec: this.diaDiemLamViec.current.getFormVal(),
        chucDanhChuyenMon: this.chucDanhChuyenMon.current.getFormVal(),
        congViecDuocGiao: this.congViecDuocGiao.current.getFormVal(),
        chiuSuPhanCong: this.chiuSuPhanCong.current.getFormVal(),
        donViChiTra: this.donViChiTra.current.getFormVal(),
        ngach: Number(this.ngach.current.getFormVal()),
        bac: Number(this.bac.current.getFormVal()),
        heSo: Number(this.heSo.current.getFormVal()),
        hieuLucHopDong: Number(this.hieuLucHopDong.current.getFormVal()),
        ngayKyHopDong: Number(this.ngayKyHopDong.current.getFormVal()),
        phanTramHuong: this.phanTramHuong.current.getFormVal(),
        tienLuong: Number(this.tienLuong.current.getFormVal()),
    })

    save = () => {
        const data = this.getFormVal();
        this.main.current.classList.add('validated');
        if (data.data) {
            if (this.urlMa) {
                this.props.updateTchcHopDongDvtlTn(this.urlMa, data.data, () => {
                    this.main.current.classList.remove('validated');
                    this.props.history.push(`/user/hopDongDvtlTn/${data.data.shcc}`);
                });
            } else {
                this.props.createTchcHopDongDvtlTn(data.data, data => {
                    this.props.history.push(`/user/hopDongDvtlTn/${data.item.shcc}`);
                });
            }
        }
    }

    downloadWord = e => {
        e.preventDefault();
        this.props.downloadWord(this.urlMa, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), this.urlMa + '_2c.docx');
        });
    }

    render() {
        // const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        //     permission = this.getUserPermission('hopDongDvtlTn');
        // let currentContract = this.props.tchcHopDongDvtlTn && this.props.tchcHopDongDvtlTn.selectedItem ? this.props.tchcHopDongDvtlTn.selectedItem : [];
        // let readOnly = !currentPermission.includes('hopDongDvtlTn:write');
        return (
            <main ref={this.main} className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list' /> Hợp đồng{this.state.item ? `: ${this.state.item.soHopDong}` : ''}</h1>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin hợp đồng</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-xl-6 col-md-6'><TextInput ref={this.soHopDong} label='Số hợp đồng' required /> </div>
                        <div className='form-group col-xl-6 col-md-6'><Select adapter={SelectAdapter_HiredStaff} ref={this.nguoiDuocThue} label='Người được thuê' required /></div>
                        <div className='form-group col-xl-6 col-md-6'><Select adapter={SelectAdapter_DmLoaiHopDong} ref={this.loaiHopDong} label='Loại hợp đồng' required /></div>
                        <div className='form-group col-xl-6 col-md-6'><TextInput ref={this.kieuHopDong} label='Kiểu hợp đồng' required /></div>
                        <div className='form-group col-xl-6 col-md-6'><Select adapter={SelectAdapter_FwCanBo} ref={this.nguoiKy} label='Người ký' required /></div>
                        <div className='form-group col-xl-6 col-md-6'><DateInput ref={this.hieuLucHopDong} label='Hiệu lực hợp đồng' required /></div>
                        <div className='form-group col-xl-6 col-md-6'><DateInput ref={this.ngayKyHopDong} label='Ngày ký hợp đồng' required /></div>
                        <div className='form-group col-xl-6 col-md-6'><DateInput ref={this.batDauLamViec} label='Ngày bắt đầu làm việc' required /></div>
                        <div className='form-group col-xl-6 col-md-6'><DateInput ref={this.ketThucHopDong} label='Ngày kết thúc hợp đồng' required /></div>
                        <div className='form-group col-xl-6 col-md-6'><DateInput ref={this.ngayKyHopDongTiepTheo} label='Ngày ký hợp đồng tiếp theo' /></div>
                        <div className='form-group col-xl-6 col-md-6'><Select adapter={SelectAdapter_DmDonVi} ref={this.diaDiemLamViec} label='Địa điểm làm việc' /></div>
                        <div className='form-group col-xl-6 col-md-6'><TextInput ref={this.chucDanhChuyenMon} label='Chức danh chuyên môn' /></div>
                        <div className='form-group col-xl-6 col-md-6'><TextInput ref={this.congViecDuocGiao} label='Công việc được giao' /></div>
                        <div className='form-group col-xl-6 col-md-6'><TextInput ref={this.chiuSuPhanCong} label='Chịu sự phân công' /></div>
                        <div className='form-group col-xl-6 col-md-6'><Select adapter={SelectAdapter_DmDonVi} ref={this.donViChiTra} label='Đơn vị chi trả' /></div>
                        <div className='form-group col-xl-6 col-md-6'><TextInput ref={this.ngach} label='Ngạch' /></div>
                        <div className='form-group col-xl-6 col-md-6'><TextInput ref={this.bac} label='Bậc' /></div>
                        <div className='form-group col-xl-6 col-md-6'><TextInput ref={this.heSo} label='Hệ số' /></div>
                        <div className='form-group col-xl-6 col-md-6'><TextInput ref={this.phanTramHuong} label='Phần trăm hưởng' /></div>
                        <div className='form-group col-xl-6 col-md-6'><TextInput ref={this.tienLuong} label='Tiền lương' /></div>
                    </div>
                </div>
                <Link to='/user/hopDongDvtlTn' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                <button type='button' title='Save' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
                {this.urlMa ? <button type='button' title='Save and export LL2C Word' className='btn btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px', color: 'white', backgroundColor: 'rgb(76, 110, 245)' }} onClick={this.downloadWord}>
                    <i className='fa fa-lg fa-file-word-o' />
                </button> : null}
            </main>
        );

    }
}

const mapStateToProps = state => ({ system: state.system, tchcHopDongDvtlTn: state.tchcHopDongDvtlTn });
const mapActionsToProps = {
    getTchcHopDongDvtlTnPage, getTchcHopDongDvtlTnAll, updateTchcHopDongDvtlTn, getdmLoaiHopDongAll,
    deleteTchcHopDongDvtlTn, createTchcHopDongDvtlTn, getStaffAll, getTchcCanBoHopDongDvtlTnAll,
    getDmDonViAll, getDmNgachCdnnAll, getTchcHopDongDvtlTnEdit, downloadWord
};
export default connect(mapStateToProps, mapActionsToProps)(TchcHopDongDvtlTnEditPage);