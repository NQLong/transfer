import React from 'react';
import { connect } from 'react-redux';
import { dtThoiKhoaBieuTraCuu, } from './redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormSelect, renderTable, TableCell, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { getDmCaHocAllCondition } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DtCauTrucKhungDaoTao } from 'modules/mdDaoTao/dtCauTrucKhungDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import T from 'view/js/common';

const dataThu = [2, 3, 4, 5, 6, 7];

class EditModal extends AdminModal {
    componentDidMount() {
        this.onShown();
    }
    onShow = (item) => {
        let { maMonHoc, nhom, hocKy, phong, ngayBatDau, ngayKetThuc, loaiHinhDaoTao, bacDaoTao, khoaSinhVien } = item ? item : { maMonHoc: null, nhom: null, hocKy: null, phong: '', ngayBatDau: null, ngayKetThuc: null, loaiHinhDaoTao: '', bacDaoTao: '', khoaSinhVien: null };
        this.maMonHoc.value(maMonHoc);
        this.nhom.value(nhom);
        this.hocKy.value(hocKy);
        this.phong.value(phong);
        //this.giangVien.value(giangVien);
        this.loaiHinh.value(loaiHinhDaoTao);
        this.bacDaoTao.value(bacDaoTao);
        this.khoaSinhVien.value(khoaSinhVien);
        this.batDau.value(ngayBatDau);
        this.ketThuc.value(ngayKetThuc);
    }
    render = () => {
        const readOnly = this.props.readOnly;
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật lịch học' : 'Thêm lịch học',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-6' ref={e => this.maMonHoc = e} readOnly={readOnly} label='Môn học' />
                {/* <FormTextBox type='text' className='col-md-6' ref={e => this.giangVien = e} readOnly={readOnly} label='Giảng viên' /> */}
                <FormTextBox type='text' className='col-md-6' ref={e => this.nhom = e} readOnly={readOnly} label='Nhóm' />
                <FormTextBox type='text' className='col-md-6' ref={e => this.hocKy = e} readOnly={readOnly} label='Học kỳ' />
                <FormTextBox type='text' className='col-md-6' ref={e => this.phong = e} readOnly={readOnly} label='Phòng' />
                <FormTextBox type='text' className='col-md-4' ref={e => this.khoaSinhVien = e} readOnly={readOnly} label='Khóa' />
                <FormTextBox type='text' className='col-md-4' ref={e => this.loaiHinh = e} readOnly={readOnly} label='Loại hình' />
                <FormTextBox type='text' className='col-md-4' ref={e => this.bacDaoTao = e} readOnly={readOnly} label='Bậc đào tạo' />
                <FormDatePicker className='col-md-6' ref={e => this.batDau = e} readOnly={readOnly} label='Ngày bắt đầu' />
                <FormDatePicker className='col-md-6' ref={e => this.ketThuc = e} readOnly={readOnly} label='Ngày kết thúc' />

            </div>
        }));
    }
}

class SearchRoom extends AdminPage {
    state = ({ dataRoom: {}, listTietHoc: [], loaiHinh: '' })

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(true);
        });
    }
    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };
    getListRoom = (thu, maCoSo, nam, hocKy, bac) => {
        this.props.dtThoiKhoaBieuTraCuu(thu, maCoSo, nam, hocKy, bac, items => {
            this.setState({ dataRoom: items });
        });
    }

    getlistTietHoc = (maCoSo) => {
        getDmCaHocAllCondition(maCoSo, items => {
            let caHoc = items.map(item => parseInt(item.ten));
            caHoc.sort(function (a, b) { return a - b; });
            this.setState({ listTietHoc: caHoc });
        });
    }

    render() {
        let table = renderTable({
            emptyTable: 'Không có dữ liệu phòng trống',
            getDataSource: () => this.state.dataRoom, stickyHead: true,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>Phòng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tòa nhà</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Sức chứa</th>
                    {this.state.listTietHoc.map((item, index) => (<th key={index} style={{ width: '10%', textAlign: 'right' }}>Tiết {item}</th>))}
                </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={item.ten}>
                        <TableCell style={{ textAlign: 'right', }} content={index + 1} />
                        <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={item.ten} />
                        <TableCell style={{ textAlign: 'right', }} content={item.tenToaNha} />
                        <TableCell style={{ textAlign: 'right' }} content={item.sucChua} />
                        {this.state.listTietHoc.map((tiet, tietIndex) => {
                            if (item[tiet]) {
                                if (this.state.loaiHinh) {
                                    if (item[tiet].loaiHinhDaoTao == this.state.loaiHinh) {
                                        return <TableCell key={tietIndex} style={{ textAlign: 'center', backgroundColor: 'lightcyan', cursor: 'pointer' }} colSpan={item[tiet].soTietBuoi} content={item[tiet].maMonHoc + ' - ' + item[tiet].nhom} onClick={() => { this.modal.show(item[tiet]); }} />;
                                    } else if (item[tiet].loaiHinhDaoTao != this.state.loaiHinh) {
                                        return <TableCell key={tietIndex} style={{ textAlign: 'center', backgroundColor: 'lightgray', cursor: 'pointer' }} colSpan={item[tiet].soTietBuoi} content={''} />;
                                    }
                                } else {
                                    return <TableCell key={tietIndex} style={{ textAlign: 'center', backgroundColor: 'lightcyan', cursor: 'pointer' }} colSpan={item[tiet].soTietBuoi} content={item[tiet].maMonHoc + ' - ' + item[tiet].nhom} onClick={() => { this.modal.show(item[tiet]); }} />;
                                }
                            } else if (item.available.indexOf(tiet) != -1) {
                                return <TableCell key={tietIndex} style={{ textAlign: 'center' }} colSpan={1} content={''} />;
                            } else {
                                return null;
                            }
                        })};
                    </tr>
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Tra cứu dữ liệu',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao/thoi-khoa-bieu'>Thời khóa biểu</Link>,
                'Tra cứu dữ liệu'
            ],
            content: <>
                <div className='tile'>
                    <h4 className='tile-title'>Tra cứu phòng trống</h4>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormSelect className='col-md-6' ref={e => this.thu = e} label='Thứ' data={dataThu} required />
                            <FormSelect className='col-md-6' ref={e => this.maCoSo = e} label='Cơ sở' data={SelectAdapter_DmCoSo} required />
                            <FormSelect className='col-md-4' ref={e => this.nam = e} label='Năm' data={SelectAdapter_DtCauTrucKhungDaoTao} />
                            <FormSelect className='col-md-4' ref={e => this.hocKy = e} label='Học kì' data={[1, 2, 3]} />
                            <FormSelect className='col-md-4' ref={e => this.loaiHinh = e} label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} allowClear />
                        </div>
                    </div>

                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' type='button' onClick={() => {
                            if (!this.thu.value()) {
                                T.notify('Vui lòng chọn thứ', 'danger');
                            }
                            else if (!this.maCoSo.value()) {
                                T.notify('Vui lòng chọn cở sở', 'danger');
                            }
                            else {
                                this.loaiHinh ? this.setState({ loaiHinh: this.loaiHinh.value() }) : null;
                                this.getListRoom(Number(this.thu.value()), Number(this.maCoSo.value()), this.nam.value(), this.hocKy.value(), this.loaiHinh.value());
                                this.getlistTietHoc(Number(this.maCoSo.value()));
                            }
                        }}>
                            <i className='fa fa-fw fa-lg fa-search' />Tìm kiếm
                        </button>
                    </div>
                </div>
                <div className='tile'>{table}</div>,
                <EditModal ref={e => this.modal = e} readOnly={true} />
            </>,
            backRoute: '/user/dao-tao/thoi-khoa-bieu',
        });
    }
}


const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { dtThoiKhoaBieuTraCuu, };
export default connect(mapStateToProps, mapActionsToProps)(SearchRoom);