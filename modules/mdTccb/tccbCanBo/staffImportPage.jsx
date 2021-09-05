// import { type } from 'jquery';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';
import { createMultiCanBo } from './redux';
import { OverlayLoading } from 'view/component/Pagination';

class StaffImportPage extends React.Component {
    state = { staff: [], message: '', isDisplay: true, saving: false };
    modal = React.createRef();
    fileBox = React.createRef();

    componentDidMount() {
        T.ready('/user/staff');
        this.fileBox.current.init();
    }

    onSuccess = (response) => {
        this.setState({
            staff: response.element,
            message: <p className='text-center' style={{ color: 'green' }}>{response.element.length} hàng được tải lên thành công</p>,
            isDisplay: false
        });
    };

    showEdit = (e, index, item) => {
        e.preventDefault();
        this.modal.current.show(index, item);
    };

    update = (index, changes, done) => {
        const staff = this.state.staff, currentValue = staff[index];
        const updateValue = Object.assign({}, currentValue, changes);
        staff.splice(index, 1, updateValue);
        this.setState({ staff });
        done && done();
    };

    delete = (e, index) => {
        e.preventDefault();
        const staff = this.state.staff;
        staff.splice(index, 1);
        this.setState({ staff });
    };

    save = (e) => {
        e.preventDefault();
        this.setState({ saving: true });
        if (this.state.staff.length) {
            this.props.createMultiCanBo(this.state.staff, () => {
                T.notify('Cập nhật thành công!', 'success');
                this.props.history.push('/user/staff');
            });
        }

    };

    render() {
        const { staff } = this.state;
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-graduation-cap' /> Tải lên file danh sách cán bộ</h1>
                </div>

                <div className='row' style={{ display: this.state.isDisplay ? 'block' : 'none' }}>
                    <div className='col-12 col-md-6 offset-md-3 tile'>
                        <div className='tile-body'>
                            <FileBox ref={this.fileBox} postUrl='/user/upload' uploadType='staffFile' ajax={true} userData='staffImportData' style={{ width: '100%', backgroundColor: '#fdfdfd' }} success={this.onSuccess} />
                            {this.state.message}
                            <a href='/download/MauDanhSachCanBo.xlsx' target='__blank' className='text-success mt-3 text-center' style={{ display: 'block', width: '100%' }}>Tải file mẫu</a>
                        </div>
                    </div>
                </div>
                {!this.state.saving ? staff && staff.length > 0 ? (
                    <div className='tile'>
                        <table className='table table-hover table-bordered table-responsive' style={{ overflow: 'scroll' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                                    <th style={{ width: 'auto' }}>Mã số thẻ</th>
                                    <th style={{ width: 'auto' }}>Họ tên</th>
                                    <th style={{ width: 'auto' }}>Bí danh</th>
                                    <th style={{ width: 'auto' }}>Giới tính</th>
                                    <th style={{ width: 'auto' }}>Ngày sinh</th>
                                    <th style={{ width: 'auto' }}>Nơi sinh</th>
                                    <th style={{ width: 'auto' }}>Số CMND</th>
                                    <th style={{ width: 'auto' }}>Ngày cấp</th>
                                    <th style={{ width: 'auto' }}>Nơi cấp</th>
                                    <th style={{ width: 'auto' }}>Quê quán</th>
                                    <th style={{ width: 'auto' }}>Hộ khẩu thường trú</th>
                                    <th style={{ width: 'auto' }}>Nơi ở hiện nay</th>
                                    <th style={{ width: 'auto' }}>Điện thoại cá nhân</th>
                                    <th style={{ width: 'auto' }}>Điện thoại khi cần báo tin</th>
                                    <th style={{ width: 'auto' }}>Emai cá nhân</th>
                                    <th style={{ width: 'auto' }}>Emai trường</th>
                                    <th style={{ width: 'auto' }}>Quốc tịch</th>
                                    <th style={{ width: 'auto' }}>Dân tộc</th>
                                    <th style={{ width: 'auto' }}>Tôn giáo</th>
                                    <th style={{ width: 'auto' }}>Nghề nghiệp trước khi tuyển dụng</th>
                                    <th style={{ width: 'auto' }}>Ngày bắt đầu làm tại trường</th>
                                    <th style={{ width: 'auto' }}>Ngày được bổ nhiệm vào biên chế</th>
                                    <th style={{ width: 'auto' }}>Trình độ tin học </th>
                                    <th style={{ width: 'auto' }}>Đơn vị công tác</th>
                                    <th style={{ width: 'auto' }}>Chức danh </th>
                                    <th style={{ width: 'auto' }}>Trình độ phổ thông</th>
                                    <th style={{ width: 'auto' }}>Năm được công nhận chức danh</th>
                                    <th style={{ width: 'auto' }}>Họ vị cao nhất</th>
                                    <th style={{ width: 'auto' }}>Chuyên ngành</th>
                                    <th style={{ width: 'auto' }}>Năm được công nhận học vị</th>
                                    <th style={{ width: 'auto' }}>Trình độ lý luận chính trị</th>
                                    <th style={{ width: 'auto' }}>Trình độ quản lý nhà nước</th>
                                    <th style={{ width: 'auto' }}>Sở trường</th>
                                    <th style={{ width: 'auto' }}>Sức khỏe</th>
                                    <th style={{ width: 'auto' }}>Cân nặng</th>
                                    <th style={{ width: 'auto' }}>Chiều cao(cm)</th>
                                    <th style={{ width: 'auto' }}>Nhóm máu</th>
                                    <th style={{ width: 'auto' }}>Ngày vào đoàn</th>
                                    <th style={{ width: 'auto' }}>Nơi vào đoàn</th>
                                    <th style={{ width: 'auto' }}>Ngày vào đảng(dự bị)</th>
                                    <th style={{ width: 'auto' }}>Ngày vào đảng(chính thức)</th>
                                    <th style={{ width: 'auto' }}>Nơi vào đảng</th>
                                    <th style={{ width: 'auto' }}>Ngày nhập ngũ</th>
                                    <th style={{ width: 'auto' }}>Ngày xuất ngũ</th>
                                    <th style={{ width: 'auto' }}>Quân hàm cao nhất</th>
                                    <th style={{ width: 'auto' }}>Thương binh hạng</th>
                                    <th style={{ width: 'auto' }}>Con gia đình chính sách</th>
                                    <th style={{ width: 'auto' }}>Danh hiệu được phong tặng</th>
                                    {/* <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                        <td>
                                            {/* <a href='#' onClick={(e) => this.showEdit(e, index, item)}>{item.shcc}</a> */}
                                            {item.shcc}
                                        </td>
                                        <td>{item.hoTen ? item.hoTen : ''}</td>
                                        <td>{item.biDanh ? item.biDanh : ''}</td>
                                        <td>{item.phai ? item.phai : ''}</td>
                                        <td>{item.ngaySinh ? T.dateToText(item.ngaySinh, 'dd/mm/yyyy') : ''}</td>
                                        <td>{item.noiSinh ? item.noiSinh : ''}</td>
                                        <td>{item.cmnd ? item.cmnd : ''}</td>
                                        <td>{item.cmndNgayCap ? T.dateToText(item.cmndNgayCap, 'dd/mm/yyyy') : ''}</td>
                                        <td>{item.cmndNoiCap ? item.cmndNoiCap : ''}</td>
                                        <td>{item.nguyenQuan ? item.nguyenQuan : ''}</td>
                                        <td>{item.hoKhau ? item.hoKhau : ''}</td>
                                        <td>{item.diaChiHienTai ? item.diaChiHienTai : ''}</td>
                                        <td>{item.dienThoaiCaNhan ? item.dienThoaiCaNhan : ''}</td>
                                        <td>{item.dienThoaiBaoTin ? item.dienThoaiBaoTin : ''}</td>
                                        <td>{item.emailCaNhan ? typeof (item.emailCaNhan) == 'string' ? item.emailCaNhan : item.emailCaNhan.text : ''}</td>
                                        <td>{item.email}</td>
                                        <td>{item.quocGia ? item.quocGia : ''}</td>
                                        <td>{item.danToc ? item.danToc : ''}</td>
                                        <td>{item.tonGiao ? item.tonGiao : ''}</td>
                                        <td>{item.ngheNghiepCu ? item.ngheNghiepCu : ''}</td>
                                        <td>{item.ngayBatDauCongTac ? T.dateToText(item.ngayBatDauCongTac, 'dd/mm/yyyy') : ''}</td>
                                        <td>{item.ngayBienChe ? T.dateToText(item.ngayBienChe, 'dd/mm/yyyy') : ''}</td>
                                        {/* <td>{Trình độ ngoại ngữ}</td> */}
                                        <td>{item.trinhDoTinHoc ? item.trinhDoTinHoc : ''}</td>
                                        <td>{item.donVi ? item.donVi : ''}</td>
                                        {/* {/* <td>{item.chucVu}</td> */}
                                        <td>{item.chucDanh ? item.chucDanh : ''}</td>
                                        <td>{item.trinhDoPhoThong ? item.trinhDoPhoThong : ''}</td>
                                        <td>{item.namChucDanh ? T.dateToText(item.namChucDanh, 'yyyy') : ''}</td>
                                        <td>{item.hocVi ? item.hocVi : ''}</td>
                                        <td>{item.chuyenNganh ? item.chuyenNganh : ''}</td>
                                        <td>{item.namHocVi ? T.dateToText(item.namHocVi, 'yyyy') : ''}</td>
                                        <td>{item.trinhDoLlct ? item.trinhDoLlct : ''}</td>
                                        <td>{item.trinhDoQlnn ? item.trinhDoQlnn : ''}</td>
                                        <td>{item.soTruong ? item.soTruong : ''}</td>
                                        <td>{item.sucKhoe ? item.sucKhoe : ''}</td>
                                        <td>{item.canNang ? item.canNang : ''}</td>
                                        <td>{item.chieuCao ? item.chieuCao : ''}</td>
                                        <td>{item.nhomMau ? item.nhomMau : ''}</td>
                                        <td>{item.ngayVaoDoan ? T.dateToText(item.ngayVaoDoan, 'dd/mm/yyyy') : ''}</td>
                                        <td>{item.noiVaoDang ? item.noiVaoDang : ''}</td>
                                        <td>{item.ngayVaoDang ? T.dateToText(item.ngayVaoDang, 'dd/mm/yyyy') : ''}</td>
                                        <td>{item.ngayVaoDangChinhThuc ? T.dateToText(item.ngayVaoDangChinhThuc, 'dd/mm/yyyy') : ''}</td>
                                        <td>{item.noiVaoDang ? item.noiVaoDang : ''}</td>
                                        <td>{item.ngayNhapNgu ? T.dateToText(item.ngayNhapNgu, 'dd/mm/yyyy') : ''}</td>
                                        <td>{item.ngayXuatNgu ? T.dateToText(item.ngayXuatNgu, 'dd/mm/yyyy') : ''}</td>
                                        <td>{item.quanHam ? item.quanHam : ''}</td>
                                        <td>{item.hangThuongBinh ? item.hangThuongBinh : ''}</td>
                                        <td>{item.giaDinhChinhSach ? item.giaDinhChinhSach : ''}</td>
                                        <td>{item.danhHieu ? item.danhHieu : ''}</td>
                                        {/* <td style={{ textAlign: 'center'  ? item.email : ''}}>
                                            <div className='btn-group'>
                                                <a className='btn btn-primary' href='#' onClick={e => this.showEdit(e, index, item)}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </a>
                                                <a className='btn btn-danger' href='#' onClick={e => this.delete(e, index)}>
                                                    <i className='fa fa-trash-o fa-lg' />
                                                </a>
                                            </div>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>) : null
                    : <div className='tile'><OverlayLoading text='Đang cập nhật thông tin..' /></div>}

                <Link to='/user/staff' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>
                {staff && staff.length ? (
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={e => this.save(e)}>
                        <i className='fa fa-lg fa-save' />
                    </button>) : null}
                {/* <EditModal ref={this.modal} update={this.update} /> */}
            </main>
        );
    }
}

const mapStateToProps = () => ({});
const mapActionsToProps = { createMultiCanBo };
export default connect(mapStateToProps, mapActionsToProps)(StaffImportPage);