
import { rgbToHex, Tooltip } from '@mui/material';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormDatePicker, FormSelect, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import { SelectAdapter_DtDanhSachChuyenNganh } from '../dtDanhSachChuyenNganh/redux';
import { getDtThoiKhoaBieuByConfig, updateDtThoiKhoaBieuConfig, updateDtThoiKhoaBieuCondition, resetDtThoiKhoaBieuConfig, dtThoiKhoaBieuGenTime, dtThoiKhoaBieuGenRoom, updateDtThoiKhoaBieuGenData } from './redux';
import { getDmCaHocAll, getDmCaHocAllCondition } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { getDtNganhDaoTaoAll } from '../dtNganhDaoTao/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { GetAllDmPhongInCoSo } from 'modules/mdDanhMuc/dmPhong/redux';
import T from 'view/js/common';
// import { SelectAdapter_DmPhongFilter } from 'modules/mdDanhMuc/dmPhong/redux';
const dataThu = [2, 3, 4, 5, 6, 7];
const fullDataTietThu = [];
class GenSchedPage extends AdminPage {
    state = {
        step: 1, fullDataTietThu: null
    }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.setState({ dataKhoaSinhVien: Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i) });
            const cookie = T.updatePage('pageDtThoiKhoaBieu');
            const { filter } = cookie;
            this.bacDaoTao.value('DH');
            if (filter) {
                let { namFilter, loaiHinhDaoTaoFilter, hocKyFilter, khoaSinhVienFilter } = filter;
                this.loaiHinhDaoTao.value(loaiHinhDaoTaoFilter);
                this.nam.value(namFilter);
                this.hocKy.value(hocKyFilter);
                this.khoaSinhVien.value(khoaSinhVienFilter);
            }

        });
    }

    // Step 1: Config các trường dữ liệu nền
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
                ngayBatDau: getValue(this.ngayBatDau).getTime(),
                coSo: getValue(this.coSo)
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
            this.setState({ onSaveConfig: false });
            T.notify(`${input.props.label} không được trống!`, 'danger');
            input.focus();
        }
    }
    // End step 1.

    //Step 2: Edit trước thứ, tiêt bắt đầu
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
        this.setState({ step: 1, editId: null }, () => {
            this.props.resetDtThoiKhoaBieuConfig();
        });
    }

    handleSubmitAdjustedData = (e) => {
        e.preventDefault();
        this.setState({ step: 3, editId: null }, () => {
            // this.coSo.focus();
            this.handleRenderTiet();
        });
    }
    // End step 2.

    // Step 3: Config time
    handleChooseBuilding = (value) => {
        getDmCaHocAllCondition(value.id, data => {
            data = data.map(item => parseInt(item.ten)).sort((a, b) => (a - b));
            this.setState({ dataTiet: data });
        });
    }

    handleRenderTiet = () => {
        this.state.dataTiet.forEach(tiet => {
            dataThu.forEach(thu => {
                fullDataTietThu.push({ [thu]: tiet });
            });
        });
        this.setState({ fullDataTietThu });
        // getDmCaHocAllCondition(this.coSo.value(), data => {
        //     data = data.map(item => parseInt(item.ten)).sort((a, b) => (a - b));
        //     data.forEach(tiet => {
        //         dataThu.forEach(thu => {
        //             fullDataTietThu.push({ [thu]: tiet });
        //         });
        //     });
        //     this.setState({ fullDataTietThu, dataTiet: data });
        // });
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
        this.setState({ timeConfig: [...(this.state.timeConfig || []), { listTenDonVi, listDonVi, thuTietKhongMo, thuTietMo }] }, () => this.listDonVi.value(''));
    }

    handleRemoveTimeConfig = (index) => {
        let updateTimeConfig = [...this.state.timeConfig].filter((_, i) => i != index);
        this.setState({ timeConfig: updateTimeConfig });
    }

    handleEditTimeConfig = (index) => {
        let timeConfig = this.state.timeConfig[index];
        this.setState({ timeConfigEditId: index }, () => {
            this.editListDonVi.value(timeConfig.listDonVi);
        });
    }

    handleSaveEditTimeConfig = () => {
        let index = this.state.timeConfigEditId;
        let listDonVi = this.editListDonVi.value();
        if (!listDonVi || !listDonVi.length) {
            T.notify('Vui lòng chọn khoa/bộ môn!', 'danger');
        } else {
            let listTenDonVi = this.listDonVi.data().map(item => item.text);
            let currentTimeConfig = Object.assign({}, this.state.timeConfig[index]);
            currentTimeConfig.listTenDonVi = listTenDonVi;
            currentTimeConfig.listDonVi = listDonVi;
            this.setState({ timeConfig: [...(this.state.timeConfig || []).splice(index, 1, currentTimeConfig)], timeConfigEditId: null });
        }
    }

    handleChooseFaculty = (value) => {
        if (value) this.listDonVi.focus();
    }

    editChooseFacultyElement = () => {
        return (<div>
            <FormSelect ref={e => this.editListDonVi = e} label='Chỉnh sửa khoa/bộ môn' data={SelectAdapter_DmDonViFaculty_V2} multiple />
            <div style={{ textAlign: 'right' }}>
                <button className='btn btn-success' type='button' onClick={this.handleSaveEditTimeConfig}>
                    <i className='fa fa-lg fa-save' /> Lưu
                </button>
            </div>
        </div>);
    }

    handleGenTime = (e) => {
        e.preventDefault();
        this.setState({ isWait: true });
        this.props.dtThoiKhoaBieuGenTime({
            listData: this.props.dtThoiKhoaBieu.dataCanGen,
            config: this.state.config,
            timeConfig: this.state.timeConfig
        }, () => this.setState({ isWait: false }), () => this.setState({ step: 4, isWait: false }));
    }
    // End step 4

    handleRoomConfig = (e) => {
        e.preventDefault();
        this.setState({ step: 5 }, () => {
            this.props.GetAllDmPhongInCoSo(this.coSo.value(), danhSachPhong => this.setState({ danhSachPhong: danhSachPhong.map(item => ({ ...item, isGen: true })) }));
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
                        {item.tenChuyenNganh?.split('&&').map((nganh, i) => <span key={i}><Tooltip title={`${nganh.split('%')[0]}_${nganh.split('%')[1]?.getFirstLetters()}`} arrow><span>{nganh.split('%')[1]}</span></Tooltip>{(i + 1) % 3 == 0 ? <br /> : (i < item.tenChuyenNganh?.split('&&').length - 1 ? ', ' : '.')}</span>)}
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
                    </>}
                </TableCell>
            </tr>);
        }
    })

    genResultTime = (data) => renderTable({
        getDataSource: () => data,
        stickyHead: true,
        header: 'thead-light',
        renderHead: () => <tr>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Mã</th>
            <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Tên</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Thứ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tiết bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tiết/Buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Dự kiến</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành/Chuyên ngành</th>
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
                        {item.tenChuyenNganh?.split('&&').map((nganh, i) => <span key={i}><Tooltip title={`${nganh.split('%')[0]}_${nganh.split('%')[1]?.getFirstLetters()}`} arrow><span>{nganh.split('%')[1]}</span></Tooltip>{(i + 1) % 3 == 0 ? <br /> : (i < item.tenChuyenNganh?.split('&&').length - 1 ? ', ' : '.')}</span>)}
                    </>} />
                </>}
            </tr>);
        }
    })

    handleToggleRoom = (ten, value) => {
        let currentStateRoom = [...this.state.danhSachPhong];
        currentStateRoom.forEach(item => {
            if (item.ten == ten) item.isGen = value;
        });
        this.setState({ danhSachPhong: currentStateRoom });
    }

    genListRoomOfBuilding = () => renderTable({
        getDataSource: () => this.state.danhSachPhong || [],
        stickyHead: true,
        header: 'thead-light',
        renderHead: () => <tr>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Cơ sở</th>
            <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Phòng</th>
            <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'right' }}>Sức chứa</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chọn</th>
        </tr>,
        renderRow: (item, index) => <tr key={index}>
            <TableCell content={item.tenCoSo} nowrap />
            <TableCell content={item.ten} nowrap />
            <TableCell type='number' content={parseInt(item.sucChua)} nowrap />
            <TableCell type='checkbox' content={item.isGen} permission={{ write: true }} onChanged={value => this.handleToggleRoom(item.ten, value)} />
        </tr>
    })

    handleGenRoom = () => {
        this.setState({ isWaitingGenRoom: true });
        let listRoom = this.state.danhSachPhong.filter(item => item.isGen == 1).map(item => ({ ten: item.ten, sucChua: item.sucChua }));
        this.props.dtThoiKhoaBieuGenRoom({
            listData: this.props.dtThoiKhoaBieu.dataCanGen,
            config: this.state.config,
            listRoom
        }, () => {
            this.setState({ step: 6, isWaitingGenRoom: false }, () => {
                let data = this.props.dtThoiKhoaBieu.dataCanGen.filter(item => !item.phong);
                if (data.length) {
                    T.confirm('Đề xuất', `Có ${data.length} học phần không tìm kiếm được phòng có sức chứa dự kiến phù hợp. Bạn có muốn hệ thống tự động giảm dần số lượng dự kiến của học phần để tìm phòng phù hợp hơn không?`, true, isConfirm => {
                        isConfirm && console.log(isConfirm);
                    });
                }
            });
        });
    }

    updateGenData = () => {
        this.setState({ isWaitingUpdate: true });
        let data = this.props.dtThoiKhoaBieu.dataCanGen.map(item => ({
            thu: parseInt(item.thu),
            tietBatDau: parseInt(item.tietBatDau),
            phong: item.phong,
            sucChua: parseInt(item.sucChua),
            id: parseInt(item.id),
            ngayBatDau: parseInt(item.ngayBatDau),
            ngayKetThuc: parseInt(item.ngayKetThuc),
        }));
        this.props.updateDtThoiKhoaBieuGenData(data, () => {
            this.setState({ isWaitingUpdate: true, genSuccess: true });
        });
    }

    genResultRoom = (data) => renderTable({
        getDataSource: () => data,
        stickyHead: true,
        header: 'thead-light',
        renderHead: () => <tr>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Mã</th>
            <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Tên</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Số tiết</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Thứ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tiết bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tiết/Buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết thúc</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phòng</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Sức chứa</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Dự kiến</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành/Chuyên ngành</th>
        </tr>,
        renderRow: (item, index) => {
            return (<tr key={index} style={{ backgroundColor: item.phong ? '#ffffff' : '#ffcccb' }}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.maMonHoc}_${item.nhom}`} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' }).vi} />
                <TableCell type='number' content={parseInt(item.soTietLyThuyet) + parseInt(item.soTietThucHanh)} />
                <TableCell type='number' content={item.thu} />
                <TableCell type='number' content={item.tietBatDau} />
                <TableCell type='number' content={item.soTietBuoi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={parseInt(item.ngayBatDau)} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={parseInt(item.ngayKetThuc)} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                <TableCell type='number' content={item.sucChua ? parseInt(item.sucChua) : ''} />
                <TableCell type='number' content={item.soLuongDuKien} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{
                    item.tenNganh?.split('&&').map((nganh, i) => <span key={i}><Tooltip title={nganh.split('%')[0]} arrow><span>{nganh.split('%')[1]}</span></Tooltip>{(i + 1) % 3 == 0 ? <br /> : (i < item.tenNganh?.split('&&').length - 1 ? ', ' : '.')}</span>)}
                    {item.tenChuyenNganh && <br />}
                    {(item.tenChuyenNganh && item.tenChuyenNganh != '') ? (item.tenChuyenNganh && item.tenChuyenNganh != '')?.split('&&').map((nganh, i) => <span key={i}><Tooltip title={`${nganh.split('%')[0]}_${nganh.split('%')[1]?.getFirstLetters()}`} arrow><span>{nganh.split('%')[1]}</span></Tooltip>{(i + 1) % 3 == 0 ? <br /> : (i < item.tenChuyenNganh?.split('&&').length - 1 ? ', ' : '.')}</span>) : ''}
                </>} />
            </tr>);
        }
    })

    render() {
        let dtThoiKhoaBieuConfig = this.props.dtThoiKhoaBieu;
        let { onSaveConfig, step, timeConfig, isWaitingGenRoom, isWaitingUpdate, genSuccess, dataKhoaSinhVien, isWait } = this.state;
        return this.renderPage({
            title: 'Quản lý sinh thời khoá biểu tự động',
            icon: 'fa fa-cogs',
            content: <div className='row'>
                <section className='col-md-12' style={{ display: step == 1 ? '' : 'none' }} id='config'>
                    <div className='tile'>
                        <div className='tile-title'>
                            <h4>Bước 1: Cấu hình chung.</h4>
                        </div>
                        <div className='tile-body'>
                            <div className='row'>
                                <FormSelect ref={e => this.bacDaoTao = e} className='col-md-2' label='Bậc' data={SelectAdapter_DmSvBacDaoTao} style={{ marginBottom: '0' }} required readOnly />
                                <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-3' label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} required />
                                <FormSelect data={SelectAdapter_DtCauTrucKhungDaoTao} ref={e => this.nam = e} className='col-md-3' label='Năm học' onChange={this.handleNam} required />
                                <FormSelect ref={e => this.hocKy = e} data={[1, 2, 3]} label='Học kỳ' className='col-md-2' required />
                                <FormSelect ref={e => this.khoaSinhVien = e} data={dataKhoaSinhVien} label='Khoá sinh viên' className='col-md-2' required />
                                <FormSelect ref={e => this.khoaDangKy = e} data={SelectAdapter_DmDonViFaculty_V2} label='Đơn vị mở môn' className='col-md-12' required />
                                <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayBatDau = e} label='Ngày bắt đầu' required />
                                <FormSelect ref={e => this.coSo = e} data={SelectAdapter_DmCoSo} label='Chọn cơ sở học' className='col-md-6' onChange={this.handleChooseBuilding} />
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
                    <div className='tile'>
                        <div className='tile-title'>
                            <h4>Bước 2: Tuỳ chỉnh.</h4>
                            <div style={{ fontSize: '0.8rem' }}>
                                <i>- Thao tác: tuỳ chỉnh thứ, tiết bắt đầu, số lượng dự kiến và ngành/chuyên ngành dành cho học phần đó.</i><br />
                                <i>- Ghi chú: những học phần chưa có thứ, tiết bắt đầu sẽ được hệ thống sinh tự động.</i>
                            </div>

                            <button className='btn btn-outline-secondary' type='button' onClick={this.handleResetConfig} style={{ position: 'absolute', top: '63px', right: '20px' }}>
                                Cấu hình chung lại <i className='fa fa-lg fa-repeat' />
                            </button>

                            <button className='btn btn-outline-primary' type='button' style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={this.handleSubmitAdjustedData}>
                                Cấu hình thời gian, địa điểm <i className='fa fa-lg fa-arrow-right' />
                            </button>
                        </div>
                        <div className='tile-body'>
                            {!this.state.fullDataTietThu && this.genData(dtThoiKhoaBieuConfig?.dataCanGen)}
                        </div>
                    </div>
                </section>

                <section className='col-md-12' style={{ display: step == 3 ? '' : 'none' }} id='configTime'>
                    <div className='tile'>
                        <div className='tile-title'>
                            <h4>Bước 3: Cấu hình thời gian, địa điểm học.</h4>
                            <div style={{ fontSize: '0.8rem' }}>
                                <i>- Ghi chú: Vui lòng chọn các tiết không xếp thời khoá biểu của khoa/bộ môn. Sau đó bấm <b>Lưu</b> để sang bước tiếp theo.</i><br />
                                <i>Nếu không chọn tiết nào hoặc khoa/bộ môn nào, hệ thống sẽ mặc định là tất cả.</i>
                            </div>
                        </div>
                        <div className='tile-body'>
                            <div className='row'>
                                {timeConfig && timeConfig.length ? <button className='btn btn-outline-primary' type='button' style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={this.handleGenTime} disabled={isWait}>
                                    Xếp thứ, tiết <i className={isWait ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-arrow-right'} />
                                </button> : ''}
                                {/* <FormSelect ref={e => this.coSo = e} data={SelectAdapter_DmCoSo} label='Chọn cơ sở học' className='col-md-6' onChange={this.handleChooseBuilding} />
                                <div className='col-md-6' /> */}
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
                                        if (this.state.timeConfigEditId == index) return this.editChooseFacultyElement(index);
                                        else return (<div key={index} style={{ marginBottom: '20px' }} className='row'>
                                            <div className='col-md-10'>
                                                <span>K/BM: {item.listTenDonVi.length ? item.listTenDonVi.join(', ') : 'Tất cả đơn vị'}:<br /></span>
                                                <span>{item.thuTietKhongMo.length ? Object.keys(dataKhongMo).map(key => <b key={key}>
                                                    - Trừ Thứ {key}, Tiết {dataKhongMo[key].map(item => item.tiet).join(', ')}.<br />
                                                </b>) : <b>Sinh tự động trên toàn bộ thứ, tiết</b>}<br /></span>
                                            </div>
                                            {item.listTenDonVi.length ? <Tooltip title='Chỉnh sửa' arrow>
                                                <a className='col-md-1' href='#' onClick={e => e.preventDefault() || this.handleEditTimeConfig(index)}><i className='fa fa-2x fa-pencil' /></a>
                                            </Tooltip> : <div className='col-md-1' />}
                                            <Tooltip title='Xoá' arrow>
                                                <a className='col-md-1' href='#' onClick={e => e.preventDefault() || this.handleRemoveTimeConfig(index)} title='Xoá'><i className='fa fa-2x fa-trash' style={{ color: 'red' }} /></a>
                                            </Tooltip>
                                        </div>);
                                    })}
                                    <FormSelect ref={e => this.listDonVi = e} onChange={this.handleChooseFaculty} label='Chọn khoa/bộ môn' placeholder='Chọn khoa/bộ môn' data={SelectAdapter_DmDonViFaculty_V2} multiple />
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

                <section className='col-md-12' style={{ display: step == 4 ? '' : 'none' }} id='resultTime'>
                    <div className='tile'>
                        <div className='tile-title'>
                            <h4>Kết quả tự động xếp thời gian học.</h4>
                            <button className='btn btn-outline-secondary' type='button' onClick={this.handleGenTime} style={{ position: 'absolute', top: '20px', right: '190px' }}>
                                Xếp lại <i className='fa fa-lg fa-repeat' />
                            </button>

                            <button className='btn btn-outline-primary' type='button' style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={this.handleRoomConfig}>
                                Cấu hình phòng <i className='fa fa-lg fa-arrow-right' />
                            </button>
                        </div>
                        <div className='tile-body'>
                            {this.state.step == 4 && this.genResultTime(dtThoiKhoaBieuConfig?.dataCanGen)}
                        </div>
                    </div>
                </section>

                <section className='col-md-12' style={{ display: step == 5 ? '' : 'none' }} id='configRoom'>
                    <div className='tile'>
                        <div className='tile-title'>
                            <h4>Bước 4: Cấu hình phòng học.</h4>
                            <div style={{ fontSize: '0.8rem' }}>
                                <i>- Hệ thống mặc định xếp vào các phòng của cơ sở đã chọn. Nếu</i><br />
                                <i>Nếu không chọn tiết nào hoặc khoa/bộ môn nào, hệ thống sẽ mặc định là tất cả.</i>
                            </div>
                            <button className='btn btn-outline-primary' type='button' style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={this.handleGenRoom} disabled={isWaitingGenRoom} >
                                {isWaitingGenRoom ? 'Loading' : 'Xếp phòng'} <i className={isWaitingGenRoom ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-arrow-right'} />
                            </button>
                        </div>
                        <div className='tile-body'>
                            {this.state.step == 5 && this.genListRoomOfBuilding()}
                        </div>
                    </div>
                </section>

                <section className='col-md-12' style={{ display: step == 6 ? '' : 'none' }} id='resultRoom'>
                    <div className='tile'>
                        <div className='tile-title'>
                            <h4>Kết quả tự động xếp phòng học, lịch học</h4>
                            {/* <div style={{ fontSize: '0.8rem' }}>
                                <i>Số học phần xếp thành công: <b>{dtThoiKhoaBieuConfig?.dataCanGen.filter(item => item.phong).length || 0}</b></i><br />
                                <i>Số học phần xếp thất bại: <b>{dtThoiKhoaBieuConfig?.dataCanGen.filter(item => !item.phong).length || 0}</b></i>
                            </div> */}
                            {genSuccess ?
                                <button className='btn btn-success' type='button' style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={e => e.preventDefault() || this.props.history.push('/user/dao-tao/thoi-khoa-bieu')}>
                                    Hoàn tất <i className='fa fa-lg fa-check' />
                                </button> : <button className='btn btn-primary' type='button' style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={this.updateGenData} disabled={isWaitingUpdate}>
                                    {isWaitingUpdate ? 'Loading' : 'Lưu thay đổi'}&nbsp;<i className={isWaitingUpdate ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-save'} />
                                </button>}
                        </div>
                        <div className='tile-body'>
                            {this.state.step == 6 && this.genResultRoom(dtThoiKhoaBieuConfig?.dataCanGen)}
                        </div>
                    </div>
                </section>
            </div >,
            backRoute: '/user/dao-tao/thoi-khoa-bieu'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = {
    getDtThoiKhoaBieuByConfig, getDmCaHocAll, updateDtThoiKhoaBieuConfig, updateDtThoiKhoaBieuCondition, resetDtThoiKhoaBieuConfig, dtThoiKhoaBieuGenTime, GetAllDmPhongInCoSo, dtThoiKhoaBieuGenRoom, updateDtThoiKhoaBieuGenData
};
export default connect(mapStateToProps, mapActionsToProps)(GenSchedPage);