import React from 'react';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { FormImageBox, FormTextBox, FormSelect, FormDatePicker, FormRichTextBox, FormCheckbox, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import {  SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import {  SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import { SelectAdapter_DmNhomMauV2 } from 'modules/mdDanhMuc/dmBenhVien/reduxNhomMau';

// class ToChucKhacModal extends AdminModal {
//     state = {
//         id: null,
//         email: '',
//         ngayThamGia: '',
//         ngayThamGiaType: 'dd/mm/yyyy',
//     }

//     onShow = (item, email) => {
//         this.ngayThamGia.clear();
//         let { id, tenToChuc, ngayThamGiaType, ngayThamGia, moTa } = item ? item : { id: null, tenToChuc: '', ngayThamGiaType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', ngayThamGia: null, ketThuc: null, moTa: '' };
//         this.setState({ ngayThamGiaType: ngayThamGiaType ? ngayThamGiaType : 'dd/mm/yyyy', email, id, ngayThamGia });
//         setTimeout(() => {
//             this.ngayThamGiaType.value(ngayThamGiaType ? ngayThamGiaType : 'dd/mm/yyyy');
//             if (ketThuc && ketThuc != -1) this.ketThucType.value(ketThucType); else this.ketThucType.value('dd/mm/yyyy');
//             this.ngayThamGia.setVal(ngayThamGia);
//             this.tenToChuc.value(tenToChuc);
//             this.moTa.value(moTa);
//         }, 500);
//     }

//     onSubmit = () => {
//         const id = this.state.id,
//             email = this.state.email,
//             changes = {
//                 tenToChuc: this.tenToChuc.value(),
//                 ngayThamGia: this.ngayThamGia.getVal(),
//                 ngayThamGiaType: this.state.ngayThamGiaType,
//                 moTa: this.moTa.value()
//             };
//         if (id) {
//             this.props.update(id, changes, error => {
//                 if (error == undefined || error == null) {
//                     this.props.getData(email);
//                     this.hide();
//                 }
//             });
//         } else {
//             changes.email = email;
//             this.props.create(changes, () => {
//                 this.props.getData(email);
//                 this.hide();
//             });
//         }
//     }

//     changeType = (isBatDau, type) => {
//         if (isBatDau) {
//             this.setState({ ngayThamGiaType: type });
//             this.ngayThamGia.setVal(this.state.ngayThamGia);
//         } else {
//             this.setState({ ketThucType: type });
//             if (this.state.ketThuc && this.state.ketThuc != -1) this.ketThuc.setVal(this.state.ketThuc);
//         }
//     }

//     changeToDay = (value) => {
//         this.setState({ toDay: value });
//         if (value) {
//             this.ketThuc.clear();
//         }
//     }

//     render = () => this.renderModal({
//         title: 'Tổ chức Chính trị - Xã hội nghề nghiệp tham gia khác',
//         size: 'large',
//         body: <div className='row'>
//             <FormTextBox className='col-md-12' ref={e => this.tenToChuc = e} lable='Tên tổ chức' required />
//             <div className='form-group col-md-6'><DateInput ref={e => this.ngayThamGia = e} label='Bắt đầu' type={this.state.ngayThamGiaType ? typeMapper[this.state.ngayThamGiaType] : null} /></div>
//             <FormSelect className='col-md-6' ref={e => this.ngayThamGiaType = e} label='Loại thời gian bắt đầu' data={dateType} onChange={data => this.changeType(true, data.id)} />
//             <FormRichTextBox className='col-12' ref={e => this.moTa = e} label='Mô tả nội dung công việc tham gia tổ chức' />
//         </div>,
//     });
// }

export class ComponentCaNhan extends React.Component {
    state = { image: '' };
    componentDidMount() {
    }
    value = function (item) {
        this.imageBox.setData('CanBoImage:' + item.email, item.image);
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
        this.nhomMau.value(item.nhomMau);

        this.soTruong.value(item.soTruong ? item.soTruong : '');
        this.tuNhanXet.value(item.tuNhanXet ? item.tuNhanXet : '');

        this.doanVien.value(item.doanVien ? item.doanVien : '');
        this.state.doanVien && this.ngayVaoDoan.value(item.ngayVaoDoan);
        this.state.doanVien && this.noiVaoDoan.value(item.noiVaoDoan);

        this.dangVien.value(item.dangVien ? item.dangVien : '');
        this.state.dangVien && this.ngayVaoDang.value(item.ngayVaoDang);
        this.state.dangVien && this.ngayVaoDangCT.value(item.ngayVaoDangChinhThuc);
        this.state.dangVien && this.noiVaoDang.value(item.noiDangDb);
        this.state.dangVien && this.noiVaoDangCT.value(item.noiDangCt);

    }

    imageChanged = (data) => {
        if (data && data.image) {
            const user = Object.assign({}, this.props.system.user, { image: data.image });
            console.log(user);
            this.props.updateSystemState({ user });
        }
    };

    copyAddress = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        this.hienTai.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    }

    getValue = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    getAndValidate = () => {
        try {
            const data = {
                shcc: this.getValue(this.shcc),
                ho: this.getValue(this.ho),
                ten: this.getValue(this.ten),

            };
            return data;
        } catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    render = () => {
        const imageDisplay = !this.props.userEdit ? 'block' : 'none';

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
                        <FormImageBox ref={e => this.imageBox = e} style={{ display: imageDisplay }} readOnly={this.props.userEdit} label='Hình đại diện'
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
                    <FormTextBox ref={e => this.biDanh = e} label='Tên khác (Bí danh)' className='col-md-4' readOnly={this.props.userEdit} maxLength={30} />
                    <FormSelect ref={e => this.phai = e} minimumResultsForSearch={-1} label='Giới tính' className='col-md-4' readOnly={this.props.userEdit} required data={SelectAdapter_DmGioiTinhV2} />
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

                    <FormTextBox ref={e => this.cmnd = e} label='CMND/CCCD' className='col-md-4' readOnly={this.props.userEdit} />
                    <FormDatePicker ref={e => this.cmndNgayCap = e} type='date-mask' label='Ngày cấp CMND/CCCD' className='col-md-4' readOnly={this.props.userEdit} />
                    <FormTextBox ref={e => this.cmndNoiCap = e} label='Nơi cấp CMND/CCCD' className='col-md-4' readOnly={this.props.userEdit} />

                    <FormTextBox ref={e => this.soDienThoaiCaNhan = e} label='Số điện thoại cá nhân' className='col-md-6' maxLength={10} readOnly={this.props.userEdit} />
                    <FormTextBox ref={e => this.soDienThoaiBaoTin = e} label='Số điện thoại báo tin' className='col-md-6' maxLength={10} readOnly={this.props.userEdit} />

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
                    {this.state.doanVien && <FormDatePicker ref={e => this.ngayVaoDoan = e} type='date-mask' label='Ngày vào Đoàn' className='col-md-3' readOnly={this.props.userEdit} />}
                    {this.state.doanVien && <FormTextBox ref={e => this.noiVaoDoan = e} label='Nơi vào Đoàn' className='col-md-3' readOnly={this.props.userEdit} />}

                    <FormCheckbox ref={e => this.dangVien = e} label='Đảng viên' onChange={value => this.setState({ dangVien: value })} className='col-md-12' />
                    {this.state.dangVien && <FormDatePicker ref={e => this.ngayVaoDang = e} type='date-mask' label='Ngày vào Đảng (dự bị)' className='col-md-3' required={this.state.dangVien} readOnly={this.props.userEdit} />}
                    {this.state.dangVien && <FormTextBox ref={e => this.noiVaoDang = e} label='Nơi vào Đảng (dự bị)' className='col-md-3' required={this.state.dangVien} readOnly={this.props.userEdit} />}
                    {this.state.dangVien && <FormDatePicker ref={e => this.ngayVaoDangCT = e} type='date-mask' label='Ngày vào Đảng (chính thức)' className='col-md-3' readOnly={this.props.userEdit} />}
                    {this.state.dangVien && <FormTextBox ref={e => this.noiVaoDangCT = e} label='Nơi vào Đảng (chính thức)' className='col-md-3' readOnly={this.props.userEdit} />}

                    <FormCheckbox ref={e => this.congDoan = e} label='Công đoàn viên' onChange={value => this.setState({ congDoan: value })} className='col-md-12' />
                    {this.state.congDoan && <FormDatePicker ref={e => this.ngayVaoCongDoan = e} type='date-mask' label='Ngày vào Công đoàn' className='col-md-3' readOnly={this.props.userEdit} />}
                    {this.state.congDoan && <FormTextBox ref={e => this.noiVaoCongDoan = e} label='Nơi vào Công đoàn' className='col-md-3' readOnly={this.props.userEdit} />}

                    <div className='form-group col-md-12'>
                        <p>Tổ chức Chính trị - Xã hội nghề nghiệp khác</p>
                        <div className='tile-body'>{tableToChucKhac}</div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.create(e, this.modalToChucKhac)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm tổ chức tham gia
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

// const mapStateToProps = state => ({ system: state.system });
// const mapActionsToProps = { updateSystemState };
// export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentCaNhan);