import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';
import { createMultiDmMonHoc } from './redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { FormTextBox, renderTable, AdminModal, TableCell, AdminPage, FormSelect, FormCheckbox, } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    constructor(props) {
        super(props);
        this.state = { index: -1 };
    }
    DonViTable = [];

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ma.focus();
        }));
        this.props.getDataSelect(items => {
            if (items) {
                this.DonViTable = [];
                items.forEach(item => this.DonViTable.push({ 'id': item.ma, 'text': item.ten }));
            }
        });
    }

    onShow = (index, item) => {
        console.log(index, item);
        let { ma, ten, soTinChi, tongSoTiet, soTietLt, soTietTh, soTietTt, soTietTl, soTietDa, soTietLa, tinhChatPhong, tenTiengAnh,
            boMon, loaiHinh, chuyenNganh, ghiChu, maCtdt, tenCtdt, kichHoat } = item ? item : { ma: '', ten: '', soTinChi: 0, tongSoTiet: 0, soTietLt: 0, soTietTh: 0, soTietTt: 0, soTietTl: 0, soTietDa: 0, soTietLa: 0, tinhChatPhong: '', tenTiengAnh: '', boMon: 0, loaiHinh: '', chuyenNganh: '', ghiChu: '', maCtdt: '', tenCtdt: '', kichHoat: 1 };

        this.setState({ index });
        this.ma.value(ma);
        this.ten.value(ten);
        this.soTinChi.value(soTinChi);
        this.tongSoTiet.value(tongSoTiet);
        this.soTietLt.value(soTietLt);
        this.soTietTh.value(soTietTh);
        this.soTietTt.value(soTietTt);
        this.soTietTl.value(soTietTl);
        this.soTietDa.value(soTietDa);
        this.soTietLa.value(soTietLa);
        this.tinhChatPhong.value(tinhChatPhong || '');
        this.tenTiengAnh.value(tenTiengAnh || '');
        this.boMon.value(boMon);
        this.loaiHinh.value(loaiHinh || '');
        this.chuyenNganh.value(chuyenNganh || '');
        this.ghiChu.value(ghiChu || '');
        this.maCtdt.value(maCtdt || '');
        this.tenCtdt.value(tenCtdt || '');
        this.kichHoat.value(kichHoat);
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        const
            changes = {
                ma: this.ma.value(),
                ten: this.ten.value(),
                soTinChi: this.soTinChi.value(),
                tongSoTiet: this.tongSoTiet.value(),
                soTietLt: this.soTietLt.value(),
                soTietTh: this.soTietTh.value(),
                soTietTt: this.soTietTt.value(),
                soTietTl: this.soTietTl.value(),
                soTietDa: this.soTietDa.value(),
                soTietLa: this.soTietLa.value(),
                tinhChatPhong: this.tinhChatPhong.value(),
                tenTiengAnh: this.tenTiengAnh.value(),
                boMon: this.boMon.value(),
                loaiHinh: this.loaiHinh.value(),
                chuyenNganh: this.chuyenNganh.value(),
                ghiChu: this.ghiChu.value(),
                maCtdt: this.maCtdt.value(),
                tenCtdt: this.tenCtdt.value(),
                kichHoat: this.state.active ? '1' : '0',
            };
        if (changes.ma == '') {
            T.notify('Mã môn học bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên môn học bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.soTinChi <= 0) {
            T.notify('Số tín chỉ phải lớn hơn 0!', 'danger');
            this.tongSoTiet.focus();
        } else if (changes.tongSoTiet <= 0) {
            T.notify('Tổng số tiết phải lớn hơn 0!', 'danger');
            this.tongSoTiet.focus();
        } else {
            this.props.update(this.state.index, changes, this.hide);
        }
        e.preventDefault();
    };

    render = () => {
        return this.renderModal({
            title: 'Cập nhật môn học',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã môn học' placeholder='Mã môn học' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên môn học' placeholder='Tên môn học' required />
                <FormTextBox type='number' className='col-6' ref={e => this.soTinChi = e} label='Số tín chỉ' placeholder='Số tín chỉ' required />
                <FormTextBox type='number' className='col-6' ref={e => this.tongSoTiet = e} label='Tổng số tiết' placeholder='Tổng số tiết' required />
                <FormTextBox type='number' className='col-4' ref={e => this.soTietLt = e} label='Số tiết LT' placeholder='Số tiết LT' required />
                <FormTextBox type='number' className='col-4' ref={e => this.soTietTh = e} label='Số tiết TH' placeholder='Số tiết TH' required />
                <FormTextBox type='number' className='col-4' ref={e => this.soTietTt = e} label='Số tiết TT' placeholder='Số tiết TT' required />
                <FormTextBox type='number' className='col-4' ref={e => this.soTietTl = e} label='Số tiết TL' placeholder='Số tiết TL' required />
                <FormTextBox type='number' className='col-4' ref={e => this.soTietDa = e} label='Số tiết DA' placeholder='Số tiết DA' required />
                <FormTextBox type='number' className='col-4' ref={e => this.soTietLa = e} label='Số tiết LA' placeholder='Số tiết LA' required />
                <FormTextBox type='text' className='col-12' ref={e => this.tinhChatPhong = e} label='Tính chất phòng' placeholder='Tính chất phòng' />
                <FormTextBox type='text' className='col-12' ref={e => this.tenTiengAnh = e} label='Tên tiếng Anh' placeholder='Tên tiếng Anh' />
                <FormSelect className='col-12' ref={e => this.boMon = e} data={this.DonViTable} label='Khoa/Bộ Môn' required />
                <FormTextBox type='text' className='col-6' ref={e => this.loaiHinh = e} label='Loại hình' placeholder='Loại hình' />
                <FormTextBox type='text' className='col-6' ref={e => this.chuyenNganh = e} label='Chuyên ngành' placeholder='Chuyên ngành' />
                <FormTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' placeholder='Ghi chú' />
                <FormTextBox type='text' className='col-6' ref={e => this.maCtdt = e} label='Mã CTĐT' placeholder='Mã CTĐT' />
                <FormTextBox type='text' className='col-6' ref={e => this.tenCtdt = e} label='Tên CTĐT' placeholder='Tên CTĐT' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class DmMonHocImportPage extends AdminPage {
    state = { dmMonHoc: [], message: '', isDisplay: true, displayState: 'import', listMonHoc: [] };
    donViMapper = {};
    donViTenMa = {};
    componentDidMount() {
        this.props.getDmDonViAll(items => {
            if (items) {
                this.donViMapper = {};
                items.forEach(item => {
                    this.donViMapper[item.ma] = item.ten;
                    this.donViTenMa[item.ten.replace('Khoa ','')] = item.ma;
                });
            }
        });
        T.ready('/user/category');
    }

    onSuccess = (response) => {
        const items = response.items.map(item => {
            item['boMon'] = this.donViTenMa[item['boMon']] ? this.donViTenMa[item['boMon']] : 0;
            return item;
        });
        this.setState({
            dmMonHoc: items,
            message: <p className='text-center' style={{ color: 'green' }}>{response.items.length} hàng được tải lên thành công</p>,
            isDisplay: false,
            displayState: 'data'
        });
    };

    showEdit = (e, index, item) => {
        e.preventDefault();
        this.modal.show(index, item);
    };

    update = (index, changes, done) => {
        const dmMonHoc = this.state.dmMonHoc, currentValue = dmMonHoc[index];
        const updateValue = Object.assign({}, currentValue, changes);
        dmMonHoc.splice(index, 1, updateValue);
        this.setState({ dmMonHoc });
        done && done();
    };

    delete = (e, index) => {
        e.preventDefault();
        const dmMonHoc = this.state.dmMonHoc;
        dmMonHoc.splice(index, 1);
        this.setState({ dmMonHoc });
    };

    save = (e) => {
        const doSave = (isOverride) => {
            let data = this.state.dmMonHoc;
            this.props.createMultiDmMonHoc(data, isOverride, (error, data) => {
                if (error) T.notify('Cập nhật dữ liệu bị lỗi!', 'danger');
                else {
                    this.setState({ displayState: 'import', dmMonHoc: [] });
                    T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''} bộ môn thành công!`, 'success');
                    this.props.history.push('/user/danh-muc/mon-hoc');
                }
            });
        };
        e.preventDefault();
        T.confirm3('Cập nhật dữ liệu', 'Bạn có muốn <b>ghi đè</b> dữ liệu đang có bằng dữ liệu mới không?<br>Nếu không rõ, hãy chọn <b>Không ghi đè</b>!', 'warning', 'Ghi đè', 'Không ghi đè', isOverride => {
            if (isOverride !== null) {
                if (isOverride)
                    T.confirm('Ghi đè dữ liệu', 'Bạn có chắc chắn muốn ghi đè dữ liệu?', 'warning', true, isConfirm => {
                        if (isConfirm) doSave('TRUE');
                    });
                else doSave('FALSE');
            }
        });
    };

    showUpload = (e) => {
        e.preventDefault();
        this.setState({ isDisplay: true });
    }

    onChangeCheckBox = (e, index) => {
        let { dmMonHoc } = this.state;
        dmMonHoc[index].kichHoat = dmMonHoc[index].kichHoat === 1 ? 0 : 1;
        this.setState({ dmMonHoc });
    }

    render() {
        const { dmMonHoc, displayState } = this.state,
            permission = this.getUserPermission('dmMonHoc', ['read', 'write', 'delete']);
        let table = 'Không có dữ liệu!';
        if (dmMonHoc && dmMonHoc.length > 0) {
            table = renderTable({
                getDataSource: () => dmMonHoc, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                        <th style={{ width: '50%' }}>Môn học</th>
                        <th style={{ width: '10%' }}>Số tín chỉ</th>
                        <th style={{ width: '40%' }}>Khoa/Bộ môn</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='text' content={item.ma} style={{ textAlign: 'right' }} onEdit={(e) => this.showEdit(e, index, item)} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='number' content={item.soTinChi} />
                        <TableCell type='text' content={this.donViMapper[item.boMon] ? this.donViMapper[item.boMon] : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={e => this.onChangeCheckBox(e, index)} />
                        <TableCell type='buttons' content={{ ...item, index: index }} permission={permission}
                            onEdit={(e) => this.showEdit(e, index, item)} onDelete={(e) => this.delete(e, index)}></TableCell>
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Import Môn học ',
            breadcrumb: [<Link key={0} to='/user/danh-muc/mon-hoc'>Danh mục Môn học</Link>, 'Import'],
            content: <>
                <FileBox postUrl='/user/upload' uploadType='DmMonHocFile' userData='DmMonHocFile' className='tile'
                    accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                    style={{ width: '50%', margin: '0 auto', display: displayState == 'import' ? 'block' : 'none' }}
                    ajax={true} success={this.onSuccess} error={this.onError} />
                <div className='tile' style={{ display: displayState == 'import' ? 'none' : 'block' }}>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission} update={this.update} getDataSelect={this.props.getDmDonViAll} />
            </>,
            onSave: displayState == 'data' ? (e) => this.save(e) : null,
            onImport: displayState == 'data' ? () => this.setState({ displayState: 'import', items: null }) : null,
            onExport: displayState == 'import' ? () => T.download('/api/danh-muc/mon-hoc/download-template') : null,
            backRoute: '/user/danh-muc/mon-hoc',
        });
    }
}

const mapStateToProps = () => ({});
const mapActionsToProps = { createMultiDmMonHoc, getDmDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(DmMonHocImportPage);