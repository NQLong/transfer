import React from 'react';
import { connect } from 'react-redux';
import { updateSystemState } from 'modules/_default/_init/reduxSystem';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { FormImageBox, FormTextBox, FormSelect, FormDatePicker, FormRichTextBox, FormCheckbox, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import { SelectAdapter_DmNhomMauV2 } from 'modules/mdDanhMuc/dmBenhVien/reduxNhomMau';

// class ToChucKhacModal extends AdminModal {
//     onShow = (item) => {
//         let { ma, tenToChuc, ngayThamGia, moTa } = item && item.item ? item.item : { ma: null, tenToChuc: '', ngayThamGia: null, moTa: '' };
//         this.setState({ ma, item, shcc: item.shcc, email: item.email });
//         this.ngayThamGia.value(ngayThamGia);
//         this.tenToChuc.value(tenToChuc);
//         this.moTa.value(moTa);
//     }

//     onSubmit = () => {
//         const changes = {
//                 email: this.state.email,
//                 shcc: this.state.shcc,
//                 tenToChuc: this.tenToChuc.value(),
//                 ngayThamGia: this.ngayThamGia.value(),
//                 moTa: this.moTa.value()
//             };
//         if (this.state.ma) {
//             this.props.update(this.state.ma, changes, this.hide);
//         } else {
//             this.props.create(changes, this.hide);
//         }
//     }

//     render = () => this.renderModal({
//         title: 'Tổ chức Chính trị - Xã hội nghề nghiệp tham gia khác',
//         body: <div className='row'>
//             <FormTextBox className='col-md-12' ref={e => this.tenToChuc = e} lable='Tên tổ chức' required />
//             <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayThamGia = e} label='Ngày tham gia' />
//             <FormRichTextBox className='col-md-12' ref={e => this.moTa = e} label='Mô tả' placeholder='Mô tả nội dung công việc tham gia tổ chức' />
//         </div>,
//     });
// }

class ComponentCaNhan extends React.Component {
    state = { image: '' };
    shcc = ''; email = '';
    componentDidMount() {

    }

    value = function (item) {
        this.setState({ dangVien: item.dangVien });
        this.setState({ doanVien: item.doanVien });
        this.setState({ congDoan: item.congDoan });
        this.shcc = item.shcc;
        this.email = item.email;
        this.imageBox.setData('CanBoImage:' + item.email, item.image ? item.image : '/img/avatar.png');
        this.donVi.value(item.maDonVi);
        this.shcc.value(item.shcc);
        this.ho.value(item.ho ? item.ho : '');
        this.ten.value(item.ten ? item.ten : '');
        this.biDanh.value(item.biDanh ? item.biDanh : '');
        this.phai.value(item.phai);
        this.ngaySinh.value(item.ngaySinh ? item.ngaySinh : '');
        this.noiSinh.value(item.maTinhNoiSinh, item.maHuyenNoiSinh, item.maXaNoiSinh);
        this.nguyenQuan.value(item.maTinhNguyenQuan, item.maHuyenNguyenQuan, item.maXaNguyenQuan);
        this.thuongTru.value(item.thuongTruMaTinh, item.thuongTruMaHuyen, item.thuongTruMaXa, item.thuongTruSoNha);
        this.hienTai.value(item.hienTaiMaTinh, item.hienTaiMaHuyen, item.hienTaiMaXa, item.hienTaiSoNha);
        this.cmnd.value(item.cmnd ? item.cmnd : '');
        this.cmndNgayCap.value(item.cmndNgayCap ? item.cmndNgayCap : '');
        this.cmndNoiCap.value(item.cmndNoiCap ? item.cmndNoiCap : '');
        this.soDienThoaiBaoTin.value(item.dienThoaiBaoTin ? item.dienThoaiBaoTin : '');
        this.soDienThoaiCaNhan.value(item.dienThoaiCaNhan ? item.dienThoaiCaNhan : '');
        this.emailCaNhan.value(item.emailCaNhan ? item.emailCaNhan : '');
        this.emailTruong.value(item.email ? item.email : '');
        this.quocTich.value(item.quocGia);
        this.danToc.value(item.danToc);
        this.tonGiao.value(item.tonGiao);
        this.tinhTrangSucKhoe.value(item.sucKhoe ? item.sucKhoe : '');
        this.chieuCao.value(item.chieuCao ? item.chieuCao : '');
        this.canNang.value(item.canNang ? item.canNang : '');
        this.nhomMau.value(item.nhomMau ? item.nhomMau : '');

        this.soTruong.value(item.soTruong ? item.soTruong : '');
        this.tuNhanXet.value(item.tuNhanXet ? item.tuNhanXet : '');

        this.doanVien.value(item.doanVien);
        this.state.doanVien && this.ngayVaoDoan.value(item.ngayVaoDoan ? item.ngayVaoDoan : '');
        this.state.doanVien && this.noiVaoDoan.value(item.noiVaoDoan ? item.noiVaoDoan : '');

        this.dangVien.value(item.dangVien);
        this.state.dangVien && this.ngayVaoDang.value(item.ngayVaoDang ? item.ngayVaoDang : '');
        this.state.dangVien && this.ngayVaoDangCT.value(item.ngayVaoDangChinhThuc ? item.ngayVaoDangChinhThuc : '');
        this.state.dangVien && this.noiVaoDang.value(item.noiDangDb ? item.noiDangDb : '');
        this.state.dangVien && this.noiVaoDangCT.value(item.noiDangCt ? item.noiDangCt : '');

        this.congDoan.value(item.congDoan);
        this.state.congDoan && this.ngayVaoCongDoan.value(item.ngayVaoCongDoan ? item.ngayVaoCongDoan : '');
        this.state.congDoan && this.noiVaoCongDoan.value(item.noiVaoCongDoan ? item.noiVaoCongDoan : '');

        this.namNhapNgu.value(item.ngayNhapNgu ? item.ngayNhapNgu : '');
        this.namXuatNgu.value(item.namXuatNgu ? item.namXuatNgu : '');
        this.capBacCaoNhat.value(item.quanHamCaoNhat ? item.quanHamCaoNhat : '');
        this.hangThuongBinh.value(item.hangThuongBinh ? item.hangThuongBinh : '');
        this.giaDinhChinhSach.value(item.giaDinhChinhSach ? item.giaDinhChinhSach : '');
        this.danhHieuPhongTangCaoNhat.value(item.danhHieu ? item.danhHieu : '');

    }

    imageChanged = (data) => {
        if (data && data.image) {
            const user = Object.assign({}, this.props.system.user, { image: data.image });
            this.props.updateSystemState({ user });
        }
    };

    copyAddress = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        this.hienTai.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    }

    getValue = (selector) => {
        console.log(selector.props.label);
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    getAndValidate = () => {
        try {
            const { maTinhThanhPho: maTinhNguyenQuan, maQuanHuyen: maHuyenNguyenQuan, maPhuongXa: maXaNguyenQuan } = this.nguyenQuan.value();
            const { maTinhThanhPho: maTinhNoiSinh, maQuanHuyen: maHuyenNoiSinh, maPhuongXa: maXaNoiSinh } = this.noiSinh.value();
            const { maTinhThanhPho: thuongTruMaTinh, maQuanHuyen: thuongTruMaHuyen, maPhuongXa: thuongTruMaXa, soNhaDuong: thuongTruSoNha } = this.thuongTru.value();
            const { maTinhThanhPho: hienTaiMaTinh, maQuanHuyen: hienTaiMaHuyen, maPhuongXa: hienTaiMaXa, soNhaDuong: hienTaiSoNha } = this.hienTai.value();
            const emailTruong = this.getValue(this.emailTruong);
            if (emailTruong && !T.validateEmail(emailTruong)) {
                this.emailTruong.focus();
                T.notify('Email không hợp lệ', 'danger');
                return false;
            }
            else {
                const data = {
                    shcc: this.getValue(this.shcc),
                    ho: this.getValue(this.ho),
                    ten: this.getValue(this.ten),
                    biDanh: this.getValue(this.biDanh),
                    phai: this.getValue(this.phai),
                    ngaySinh: this.getValue(this.ngaySinh) ? this.getValue(this.ngaySinh).getTime() : '',
                    maTinhNguyenQuan, maHuyenNguyenQuan, maXaNguyenQuan,
                    maTinhNoiSinh, maHuyenNoiSinh, maXaNoiSinh,
                    thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha,
                    hienTaiMaTinh, hienTaiMaHuyen, hienTaiMaXa, hienTaiSoNha,
                    cmnd: this.getValue(this.cmnd),
                    cmndNgayCap: this.getValue(this.cmndNgayCap) ? this.getValue(this.cmndNgayCap).getTime() : '',
                    cmndNoiCap: this.getValue(this.cmndNoiCap),
                    dienThoaiCaNhan: this.getValue(this.soDienThoaiCaNhan),
                    dienThoaiBaoTin: this.getValue(this.soDienThoaiBaoTin),
                    email: this.getValue(this.emailTruong),
                    emailCaNhan: this.getValue(this.emailCaNhan),
                    quocGia: this.getValue(this.quocTich),
                    danToc: this.getValue(this.danToc),
                    tonGiao: this.getValue(this.tonGiao),
                    sucKhoe: this.getValue(this.tinhTrangSucKhoe),
                    chieuCao: this.getValue(this.chieuCao),
                    canNang: this.getValue(this.canNang),
                    nhomMau: this.getValue(this.nhomMau),
                    soTruong: this.getValue(this.soTruong),
                    tuNhanXet: this.getValue(this.tuNhanXet),
                    doanVien: Number(this.getValue(this.doanVien)),
                    ngayVaoDoan: this.state.doanVien && this.getValue(this.ngayVaoDoan) ? this.getValue(this.ngayVaoDoan).getTime() : '',
                    noiVaoDoan: this.state.doanVien ? this.getValue(this.noiVaoDoan) : '',
                    dangVien: Number(this.dangVien.value()),
                    ngayVaoDangChinhThuc: this.state.dangVien && this.getValue(this.ngayVaoDangCT) ? this.getValue(this.ngayVaoDangCT).getTime() : '',
                    ngayVaoDang: this.state.dangVien && this.getValue(this.ngayVaoDang) ? this.getValue(this.ngayVaoDang).getTime() : '',
                    noiDangCt: this.state.dangVien ? this.getValue(this.noiVaoDangCT) : '',
                    noiDangDb: this.state.dangVien ? this.getValue(this.noiVaoDang) : '',
                    congDoan: Number(this.congDoan.value()),
                    ngayVaoCongDoan: this.state.congDoan && this.getValue(this.ngayVaoCongDoan) ? this.getValue(this.ngayVaoCongDoan).getTime() : '',
                    noiVaoCongDoan: this.state.congDoan ? this.getValue(this.noiVaoCongDoan) : '',
                    ngayNhapNgu: this.getValue(this.namNhapNgu) ? this.getValue(this.namNhapNgu).getTime() : '',
                    ngayXuatNgu: this.getValue(this.namXuatNgu) ? this.getValue(this.namXuatNgu).getTime() : '',
                    quanHamCaoNhat: this.getValue(this.capBacCaoNhat),
                    hangThuongBinh: this.getValue(this.hangThuongBinh),
                    giaDinhChinhSach: this.getValue(this.giaDinhChinhSach),
                    danhHieu: this.getValue(this.danhHieuPhongTangCaoNhat)
                };

                return data;
            }

        } catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    showModal = (e, item) => {
        e.preventDefault();
        this.modal.show({ item: item, shcc: this.shcc, email: this.email });
    }

    render = () => {
        let cacToChucCTXHNN = [];
        const tableToChucKhac = renderTable({
            getDataSource: () => cacToChucCTXHNN, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: '50%' }}>Tên tổ chức</th>
                    <th style={{ width: '10%' }}>Ngày tham gia</th>
                    <th style={{ width: '40%' }}>Mô tả nội dung công việc tham gia tổ chức</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' content={item.tenToChuc} onClick={e => this.editTrinhDoNN(e, item)} />
                    <TableCell type='date' content={item.ngayThamGia} dateFormat='dd/mm/yyyy' />
                    <TableCell type='text' content={item.moTa} />
                    <TableCell type='buttons' content={item} onEdit={this.editTrinhDoNN} onDelete={this.deleteTrinhDoNN}></TableCell>
                </tr>)
        });

        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin cá nhân</h3>
                <div className='tile-body row'>
                    <div className='form-group col-md-3'>
                        <FormImageBox ref={e => this.imageBox = e} style={{ display: 'block' }} label='Hình đại diện'
                            postUrl='/user/upload' uploadType='CanBoImage' success={this.imageChanged} />
                    </div>


                    <div className='col-md-9'>
                        <div className='row'>
                            <FormTextBox ref={e => this.shcc = e} label='Mã số cán bộ' className='col-md-4' readOnly={this.props.userEdit} required maxLength={10} />
                            <FormSelect ref={e => this.donVi = e} label='Đơn vị công tác' className='col-md-8' readOnly={this.props.userEdit} required data={SelectAdapter_DmDonVi} />

                        </div>
                    </div>
                    <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' className='col-md-4' readOnly={this.props.userEdit} required maxLength={100} />
                    <FormTextBox ref={e => this.ten = e} label='Tên' className='col-md-4' readOnly={this.props.userEdit} required maxLength={30} />
                    <FormTextBox ref={e => this.biDanh = e} label='Tên khác (Bí danh)' className='col-md-4' maxLength={30} />
                    <FormSelect ref={e => this.phai = e} label='Giới tính' className='col-md-4' readOnly={this.props.userEdit} required data={SelectAdapter_DmGioiTinhV2} />
                    <FormDatePicker ref={e => this.ngaySinh = e} type='date-mask' className='col-md-4' label='Ngày sinh' required readOnly={this.props.userEdit} />
                    <div className='form-group col-md-12'></div>
                    <ComponentDiaDiem ref={e => this.noiSinh = e} label='Nơi sinh' className='col-md-12' />
                    <ComponentDiaDiem ref={e => this.nguyenQuan = e} label='Nguyên quán' className='col-md-12' />
                    <ComponentDiaDiem ref={e => this.thuongTru = e} label='Thường trú' className='col-md-12' requiredSoNhaDuong={true} />
                    <p className='col-md-12'>
                        Nếu <b>Địa chỉ thường trú</b> là <b>Địa chỉ hiện tại</b> thì&nbsp;<a href='#' onClick={this.copyAddress}>nhấp vào đây</a>.
                    </p>
                    <ComponentDiaDiem ref={e => this.hienTai = e} label='Nơi ở hiện tại' className='col-md-12' requiredSoNhaDuong={true} />

                    <div className='form-group col-md-12'></div>

                    <FormTextBox ref={e => this.cmnd = e} label='CMND/CCCD' className='col-md-4' readOnly={this.props.userEdit} required />
                    <FormDatePicker ref={e => this.cmndNgayCap = e} type='date-mask' label='Ngày cấp CMND/CCCD' className='col-md-4' readOnly={this.props.userEdit} />
                    <FormTextBox ref={e => this.cmndNoiCap = e} label='Nơi cấp CMND/CCCD' className='col-md-4' readOnly={this.props.userEdit} />

                    <FormTextBox ref={e => this.soDienThoaiCaNhan = e} label='Số điện thoại cá nhân' className='col-md-6' maxLength={10} />
                    <FormTextBox ref={e => this.soDienThoaiBaoTin = e} label='Số điện thoại báo tin' className='col-md-6' maxLength={10} />

                    <FormTextBox ref={e => this.emailCaNhan = e} label='Email cá nhân' className='col-md-6' readOnly={this.props.userEdit} />
                    <FormTextBox ref={e => this.emailTruong = e} label='Email trường' className='col-md-6' readOnly={this.props.userEdit} />

                    <div className='form-group col-md-12'></div>

                    <FormSelect ref={e => this.quocTich = e} label='Quốc tịch' className='col-md-4' data={SelectAdapter_DmQuocGia} readOnly={this.props.userEdit} />
                    <FormSelect ref={e => this.danToc = e} label='Dân tộc' className='col-md-4' data={SelectAdapter_DmDanTocV2} readOnly={this.props.userEdit} />
                    <FormSelect ref={e => this.tonGiao = e} label='Tôn giáo' className='col-md-4' data={SelectAdapter_DmTonGiaoV2} readOnly={this.props.userEdit} />

                    <FormTextBox ref={e => this.tinhTrangSucKhoe = e} label='Tình trạng sức khỏe' className='col-md-3' readOnly={this.props.userEdit} />
                    <FormTextBox type='number' step={1} ref={e => this.chieuCao = e} label='Chiều cao (cm)' className='col-md-3' readOnly={this.props.userEdit} />
                    <FormTextBox type='number' step={0.1} ref={e => this.canNang = e} label='Cân nặng (kg)' className='col-md-3' readOnly={this.props.userEdit} />
                    <FormSelect ref={e => this.nhomMau = e} label='Nhóm máu' className='col-md-3' data={SelectAdapter_DmNhomMauV2} readOnly={this.props.userEdit} />

                    <FormRichTextBox ref={e => this.soTruong = e} label='Sở trường/Năng khiếu/Ưu điểm' className='col-md-6' />
                    <FormRichTextBox ref={e => this.tuNhanXet = e} label='Tự nhận xét' className='col-md-6' />

                    <div className='form-group col-md-12'></div>

                    <FormCheckbox ref={e => this.doanVien = e} label='Đoàn viên' onChange={value => this.setState({ doanVien: value })} className='col-md-12' />
                    {this.state.doanVien ? <FormDatePicker ref={e => this.ngayVaoDoan = e} type='date-mask' label='Ngày vào Đoàn' className='col-md-3' readOnly={this.props.userEdit} /> : null}
                    {this.state.doanVien ? <FormTextBox ref={e => this.noiVaoDoan = e} label='Nơi vào Đoàn' className='col-md-3' readOnly={this.props.userEdit} /> : null}

                    <FormCheckbox ref={e => this.dangVien = e} label='Đảng viên' onChange={value => this.setState({ dangVien: value })} className='col-md-12' />
                    {this.state.dangVien ? <FormDatePicker ref={e => this.ngayVaoDang = e} type='date-mask' label='Ngày vào Đảng (dự bị)' className='col-md-3' readOnly={this.props.userEdit} /> : null}
                    {this.state.dangVien ? <FormTextBox ref={e => this.noiVaoDang = e} label='Nơi vào Đảng (dự bị)' className='col-md-3' readOnly={this.props.userEdit} /> : null}
                    {this.state.dangVien ? <FormDatePicker ref={e => this.ngayVaoDangCT = e} type='date-mask' label='Ngày vào Đảng (chính thức)' className='col-md-3' readOnly={this.props.userEdit} /> : null}
                    {this.state.dangVien ? <FormTextBox ref={e => this.noiVaoDangCT = e} label='Nơi vào Đảng (chính thức)' className='col-md-3' readOnly={this.props.userEdit} /> : null}

                    <FormCheckbox ref={e => this.congDoan = e} label='Công đoàn viên' onChange={value => this.setState({ congDoan: value })} className='col-md-12' />
                    {this.state.congDoan ? <FormDatePicker ref={e => this.ngayVaoCongDoan = e} type='date-mask' label='Ngày vào Công đoàn' className='col-md-3' readOnly={this.props.userEdit} /> : null}
                    {this.state.congDoan ? <FormTextBox ref={e => this.noiVaoCongDoan = e} label='Nơi vào Công đoàn' className='col-md-3' readOnly={this.props.userEdit} /> : null}

                    <div className='form-group col-md-12'>
                        <p>Tổ chức Chính trị - Xã hội nghề nghiệp khác</p>
                        <div className='tile-body'>{tableToChucKhac}</div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalToChucKhac)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm tổ chức tham gia
                            </button>
                        </div>
                    </div>

                    <div className='form-group col-md-12' />

                    <FormDatePicker className='col-md-3' type='date-mask' ref={e => this.namNhapNgu = e} label='Năm nhập ngũ' />
                    <FormDatePicker className='col-md-3' type='date-mask' ref={e => this.namXuatNgu = e} label='Năm xuất ngũ' />
                    <FormTextBox className='col-md-3' ref={e => this.capBacCaoNhat = e} label='Quân hàm/Cấp bậc cao nhất' />
                    <FormTextBox className='col-md-3' ref={e => this.hangThuongBinh = e} label='Hạng thương binh' />

                    <FormTextBox className='col-md-6' ref={e => this.giaDinhChinhSach = e} label='Gia đình chính sách' />
                    <FormTextBox className='col-md-6' ref={e => this.danhHieuPhongTangCaoNhat = e} label='Danh hiệu được phong tặng cao nhất' />



                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = { updateSystemState };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentCaNhan);