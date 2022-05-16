import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell, FormCheckbox, FormFileBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';
import {
    getQtDiNuocNgoaiGroupPageMa, deleteQtDiNuocNgoaiGroupPageMa, createQtDiNuocNgoaiGroupPageMa,
    updateQtDiNuocNgoaiGroupPageMa, getThongKeMucDich, deleteFile
} from './redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmMucDichNuocNgoaiV2 } from 'modules/mdDanhMuc/dmMucDichNuocNgoai/redux';
import { SelectAdapter_DmTiepNhanVeNuocV2 } from 'modules/mdDanhMuc/dmTiepNhanVeNuoc/redux';

const EnumDateType = Object.freeze({
    0: { text: '' },
    1: { text: 'dd/mm/yyyy' },
    2: { text: 'mm/yyyy' },
    3: { text: 'yyyy' },
}), typeMapper = {
    'yyyy': 'year',
    'mm/yyyy': 'month',
    'dd/mm/yyyy': 'date'
};
const timeList = [
    { id: 1, text: 'Theo ngày đi' },
    { id: 2, text: 'Theo ngày về' },
    { id: 3, text: 'Theo ngày quyết định đi nước ngoài' },
    { id: 4, text: 'Theo ngày quyết định tiếp nhận' },
];

const listBaoCaoTinhTrang = [
    { id: 0, text: 'Chưa nộp' },
    { id: 1, text: 'Đang chờ duyệt' },
    { id: 2, text: 'Báo cáo bị trả lại' },
    { id: 3, text: 'Đã nộp' },
];
const mapperBaoCaoTinhTrang = listBaoCaoTinhTrang.map(item => item.text);
class EditModal extends AdminModal {
    state = {
        id: null,
        ngayDi: '',
        ngayVe: null,
        ngayDiType: 'dd/mm/yyyy',
        ngayVeType: 'dd/mm/yyyy',
        tiepNhan: false,
        daTiepNhan: false,
        baoCaoTinhTrang: 0,
        listFile: [],
        noNeedTiepNhan: false, 
    };
    // Table name: QT_DI_NUOC_NGOAI { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, loaiChiPhi, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc, baoCaoTen, baoCaoNgayNop, baoCaoTinhTrang, baoCaoLyDoTraVe }

    onShow = (item) => {
        let { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc, baoCaoTen, baoCaoTinhTrang, baoCaoLyDoTraVe } = item ? item : {
            id: '', shcc: '', quocGia: '', ngayDi: null, ngayDiType: '', ngayVe: null, ngayVeType: '', mucDich: '', noiDung: '', chiPhi: null, ghiChu: '', soQuyetDinh: '', ngayQuyetDinh: null, soQdTiepNhan: '', ngayQdTiepNhan: null, noiDungTiepNhan: '', ngayVeNuoc: null, baoCaoTen: '[]', baoCaoTinhTrang: 0, baoCaoLyDoTraVe: '',
        };
        if (!shcc) shcc = this.props.shcc;
        let listFile = T.parse(baoCaoTen, []);

        this.setState({
            id, ngayDiType: ngayDiType ? ngayDiType : 'dd/mm/yyyy',
            ngayVeType: ngayVeType ? ngayVeType : 'dd/mm/yyyy',
            ngayDi, ngayVe,
            tiepNhan: soQdTiepNhan ? true : false,
            daTiepNhan: soQdTiepNhan ? true : false,
            baoCaoTinhTrang,
            listFile,
            noNeedTiepNhan: ngayDi && ngayVe ? (T.dayDiff(new Date(ngayDi), new Date(ngayVe)) < 30 ? true : false) : false
        }, () => {
            this.shcc.value(shcc);
            if (quocGia) {
                quocGia = quocGia.split(',');
                this.quocGia.value(quocGia);
            } else this.quocGia.value('');
            this.mucDich.value(mucDich);
            this.noiDung.value(noiDung || '');
            this.chiPhi.value(chiPhi || '');
            this.ghiChu.value(ghiChu || '');
            this.soQuyetDinh.value(soQuyetDinh || '');
            this.ngayQuyetDinh.value(ngayQuyetDinh || '');

            this.ngayDiType.setText({ text: ngayDiType ? ngayDiType : 'dd/mm/yyyy' });
            this.ngayDi.setVal(ngayDi || '');
            this.ngayVeType.setText({ text: ngayVeType ? ngayVeType : 'dd/mm/yyyy' });
            this.ngayVe.setVal(ngayVe || '');
            if (this.state.tiepNhan || this.state.noNeedTiepNhan) {
                this.tiepNhanCheck.value(true);
                if (this.state.noNeedTiepNhan) $('#tiepNhan').hide();
                else $('#tiepNhan').show();
            } else {
                $('#tiepNhan').hide();
                this.tiepNhanCheck.value(false);
            }
            if (baoCaoTinhTrang == 2) {
                this.baoCaoCheck.value(true);
                $('#baoCaoText').show();
            } else {
                this.baoCaoCheck.value(false);
                $('#baoCaoText').hide();
            }
            this.soQdTiepNhan.value(soQdTiepNhan || '');
            this.ngayQdTiepNhan.value(ngayQdTiepNhan || '');
            this.noiDungTiepNhan.value(noiDungTiepNhan || '');
            this.ngayVeNuoc.value(ngayVeNuoc || '');
            this.baoCaoLyDoTraVe.value(baoCaoLyDoTraVe || '');
            this.fileBox.setData('baoCaoDiNuocNgoaiStaffFile:' + shcc);
        });
    };

    deleteFile = (e, data) => {
        const { index, shcc, file } = data;
        e.preventDefault();
        T.confirm('Xóa dữ liệu', 'Bạn có muốn xóa tập tin này không?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteFile(shcc, file, () => {
                let listFile = this.state.listFile;
                listFile.splice(index, 1);
                this.setState({ listFile });
            });
        });
    };

    onSuccess = (response) => {
        if (response.data) {
            let listFile = this.state.listFile.length ? [...this.state.listFile] : [];
            listFile.push(response.data);
            this.setState({ listFile });
        } else if (response.error) T.notify(response.error, 'danger');
    };

    // format: /shcc/dateCreated_nameFile
    split = (input) => {
        let arr = input.split('/');
        let shcc = arr[1];
        let suffix = arr[2];
        let date = suffix.split('_')[0];
        let name = suffix.substring(date.length + 1);
        return { shcc, date, name };
    };
    tableListFile = (data, permission) => {
        return renderTable({
            getDataSource: () => data,
            stickyHead: false,
            emptyTable: 'Chưa có file báo cáo nào!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '100%' }}>Tên tập tin</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày upload</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                let { shcc, date, name } = this.split(item);
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{ wordBreak: 'break-all' }} content={<>
                            <a href={'/api/di-nuoc-ngoai/download' + item} download>{name}</a>
                        </>
                        } />
                        <TableCell style={{ textAlign: 'center' }} content={T.dateToText(parseInt(date), 'dd/mm/yyyy HH:MM')}></TableCell>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onDelete={e => this.deleteFile(e, { index, shcc, file: item })}>
                            <a className='btn btn-info' href={'/api/di-nuoc-ngoai/download' + item} download>
                                <i className='fa fa-lg fa-download' />
                            </a>
                        </TableCell>
                    </tr>
                );
            }
        });
    }

    getBaoCaoTinhTrang = () => {
        if (this.state.listFile.length == 0) return 0;
        if (this.baoCaoCheck.value()) return 2;
        return 3;
    }
    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            quocGia: this.quocGia.value().toString(),
            mucDich: this.mucDich.value(),
            noiDung: this.noiDung.value(),
            chiPhi: this.chiPhi.value(),
            ghiChu: this.ghiChu.value(),
            soQuyetDinh: this.soQuyetDinh.value(),
            ngayQuyetDinh: this.ngayQuyetDinh.value() ? Number(this.ngayQuyetDinh.value()) : '',

            ngayDiType: this.state.ngayDiType,
            ngayDi: this.ngayDi.getVal(),
            ngayVeType: this.state.ngayVeType,
            ngayVe: this.ngayVe.getVal(),

            soQdTiepNhan: this.state.tiepNhan ? this.soQdTiepNhan.value() : null,
            ngayQdTiepNhan: this.state.tiepNhan ? Number(this.ngayQdTiepNhan.value()) : null,
            noiDungTiepNhan: this.state.tiepNhan ? this.noiDungTiepNhan.value() : null,
            ngayVeNuoc: this.state.tiepNhan ? this.ngayVeNuoc.value() : null,

            baoCaoTinhTrang: this.getBaoCaoTinhTrang(),
            baoCaoTen: T.stringify(this.state.listFile, '[]'),
            baoCaoLyDoTraVe: this.getBaoCaoTinhTrang() == 2 ? this.baoCaoLyDoTraVe.value() : '',
        };
        if (!this.shcc.value()) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.shcc.focus();
        } else if (!this.noiDung.value()) {
            T.notify('Nội dung đi nước ngoài trống', 'danger');
            this.noiDung.focus();
        } else if (!this.quocGia.value().length) {
            T.notify('Danh sách quốc gia trống', 'danger');
            this.quocGia.focus();
        } else if (!this.ngayDi.getVal()) {
            T.notify('Ngày đi nước ngoài trống', 'danger');
            this.ngayDi.focus();
        } else if (!this.ngayVe.getVal()) {
            T.notify('Ngày về nước trống', 'danger');
            this.ngayVe.focus();
        } else if (this.ngayDi.getVal() > this.ngayVe.getVal()) {
            T.notify('Ngày đi lớn hơn ngày về', 'danger');
            this.ngayDi.focus();
        } else if (this.state.tiepNhan && !this.soQdTiepNhan.value()) {
            T.notify('Số quyết định tiếp nhận trống', 'danger');
            this.soQdTiepNhan.focus();
        } else if (this.state.tiepNhan && !this.ngayQdTiepNhan.value()) {
            T.notify('Ngày quyết định tiếp nhận trống', 'danger');
            this.soQdTiepNhan.focus();
        } else if (this.baoCaoCheck.value() && !this.baoCaoLyDoTraVe.value()) {
            T.notify('Lý do báo cáo bị trả về bị trống', 'danger');
            this.baoCaoLyDoTraVe.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
            this.quocGia.reset();
        }
    }

    handleTiepNhan = (value) => {
        this.tiepNhanCheck.value(value);
        if (value) {
            this.setState({ tiepNhan: true }, () => {
                $('#tiepNhan').show();
            });
        } else {
            this.setState({ tiepNhan: false }, () => {
                $('#tiepNhan').hide();
            });
        }
    }

    handleBaoCao = (value) => {
        this.baoCaoCheck.value(value);
        value ? $('#baoCaoText').show() : $('#baoCaoText').hide();
    }

    handleCanBo = (value) => {
        this.fileBox.setData('baoCaoDiNuocNgoaiStaffFile:' + value.id);
    }
    render = () => {
        const permission = {
            write: true,
            delete: true
        };
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình đi nước ngoài' : 'Tạo mới quá trình đi nước ngoài',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} required onChange={this.handleCanBo} />
                <FormTextBox className='col-md-3' ref={e => this.soQuyetDinh = e} type='text' label='Số quyết định' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.ngayQuyetDinh = e} type='date-mask' label='Ngày quyết định' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.mucDich = e} label='Mục đích' data={SelectAdapter_DmMucDichNuocNgoaiV2} readOnly={readOnly} />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} label='Nội dung' placeholder='Nhập nội dung đi nước ngoài (tối đa 1000 ký tự)' required readOnly={readOnly} />
                <FormSelect className='col-md-12' multiple={true} ref={e => this.quocGia = e} label='Quốc gia' data={SelectAdapter_DmQuocGia} required readOnly={readOnly} />
                <FormTextBox className='col-md-8' ref={e => this.chiPhi = e} rows={2} type='text' label='Chi phí' readOnly={readOnly} placeholder='Nhập chi phí (tối đa 500 ký tự)'/>
                <FormTextBox className='col-md-4' ref={e => this.ghiChu = e} type='text' label='Ghi chú' readOnly={readOnly} />

                <div className='form-group col-md-6'><DateInput ref={e => this.ngayDi = e} placeholder='Ngày đi'
                    label={
                        <div style={{ display: 'flex' }}>Ngày đi (&nbsp; <Dropdown ref={e => this.ngayDiType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayDiType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayDiType ? typeMapper[this.state.ngayDiType] : null} readOnly={readOnly} /></div>
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ngayVe = e} placeholder='Ngày về'
                    label={
                        <div style={{ display: 'flex' }}>Ngày về (&nbsp; <Dropdown ref={e => this.ngayVeType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayVeType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayVeType ? typeMapper[this.state.ngayVeType] : null} readOnly={readOnly} /></div>
                <FormCheckbox label={this.state.noNeedTiepNhan ? 'Mặc định tiếp nhận do đi dưới 30 ngày' : (this.state.daTiepNhan ? 'Đã tiếp nhận' : this.state.tiepNhan ? 'Đang nhập dữ liệu tiếp nhận' : 'Bấm vào đây nếu muốn tạo mới tiếp nhận')} onChange={this.handleTiepNhan} className='form-group col-md-6' ref={e => this.tiepNhanCheck = e} readOnly={this.state.noNeedTiepNhan ? true : readOnly} />
                <div className='row form-group col-12' id='tiepNhan'>
                    <FormTextBox className='col-md-4' ref={e => this.soQdTiepNhan = e} type='text' label='Số quyết định tiếp nhận' readOnly={readOnly} required />
                    <FormDatePicker className='col-md-4' ref={e => this.ngayQdTiepNhan = e} type='date-mask' label='Ngày quyết định tiếp nhận' readOnly={readOnly} required />
                    <FormDatePicker className='col-md-4' ref={e => this.ngayVeNuoc = e} type='date-mask' label='Ngày về nước' readOnly={readOnly} />
                    <FormSelect className='col-md-12' ref={e => this.noiDungTiepNhan = e} readOnly={readOnly} label='Nội dung tiếp nhận' data={SelectAdapter_DmTiepNhanVeNuocV2} />
                </div>
                <div className='form-group col-12'>
                    <h3 className='tile-title'>Danh sách tập tin báo cáo</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-md-7'>
                            {this.tableListFile(this.state.listFile, permission)}
                        </div>
                        <FormFileBox className='col-md-5' ref={e => this.fileBox = e} label={'Tải lên tập tin báo cáo (định dạng .xls, .xlsx, .doc, .docx, .pdf, .png, .jpg)'} postUrl='/user/upload' uploadType='baoCaoDiNuocNgoaiStaffFile' userData='baoCaoDiNuocNgoaiStaffFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.onSuccess} />
                    </div>
                </div>
                <FormCheckbox label={'Bấm vào đây nếu báo cáo không hợp lệ'} onChange={this.handleBaoCao} className='form-group col-md-6' ref={e => this.baoCaoCheck = e} readOnly={readOnly} />
                <div className='row form-group col-12' id='baoCaoText'>
                    <FormRichTextBox className='col-md-12' rows={2} ref={e => this.baoCaoLyDoTraVe = e} type='text' label='Lý do báo cáo bị trả về' readOnly={readOnly} required />
                </div>
            </div>
        });
    }
}

class CreateModal extends AdminModal {
    state = {
        id: null,
        ngayDi: '',
        ngayVe: null,
        ngayDiType: 'dd/mm/yyyy',
        ngayVeType: 'dd/mm/yyyy',
    };
    // Table name: QT_DI_NUOC_NGOAI { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, loaiChiPhi, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc, baoCaoTen, baoCaoNgayNop, baoCaoTinhTrang, baoCaoLyDoTraVe }

    onShow = () => {
        this.shcc.value(this.props.shcc);
        this.quocGia.value('');
        this.mucDich.value('');
        this.noiDung.value('');
        this.chiPhi.value('');
        this.ghiChu.value( '');
        this.soQuyetDinh.value('');
        this.ngayQuyetDinh.value('');

        this.ngayDiType.setText({ text: 'dd/mm/yyyy' });
        this.ngayDi.setVal('');
        this.ngayVeType.setText({ text: 'dd/mm/yyyy' });
        this.ngayVe.setVal('');
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            listShcc: this.shcc.value(),
            quocGia: this.quocGia.value().toString(),
            mucDich: this.mucDich.value(),
            noiDung: this.noiDung.value(),
            chiPhi: this.chiPhi.value(),
            ghiChu: this.ghiChu.value(),
            soQuyetDinh: this.soQuyetDinh.value(),
            ngayQuyetDinh: this.ngayQuyetDinh.value() ? Number(this.ngayQuyetDinh.value()) : '',

            ngayDiType: this.state.ngayDiType,
            ngayDi: this.ngayDi.getVal(),
            ngayVeType: this.state.ngayVeType,
            ngayVe: this.ngayVe.getVal(),

            soQdTiepNhan: null,
            ngayQdTiepNhan: null,
            noiDungTiepNhan: null,
            ngayVeNuoc: null,

            baoCaoTinhTrang: 0,
            baoCaoTen: '[]',
            baoCaoLyDoTraVe: '',
        };
        if (!this.shcc.value().length) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.shcc.focus();
        } else if (!this.noiDung.value()) {
            T.notify('Nội dung đi nước ngoài trống', 'danger');
            this.noiDung.focus();
        } else if (!this.quocGia.value().length) {
            T.notify('Danh sách quốc gia trống', 'danger');
            this.quocGia.focus();
        } else if (!this.ngayDi.getVal()) {
            T.notify('Ngày đi nước ngoài trống', 'danger');
            this.ngayDi.focus();
        } else if (!this.ngayVe.getVal()) {
            T.notify('Ngày về nước trống', 'danger');
            this.ngayVe.focus();
        } else if (this.ngayDi.getVal() > this.ngayVe.getVal()) {
            T.notify('Ngày đi lớn hơn ngày về', 'danger');
            this.ngayDi.focus();
        } else {
            this.props.create(changes, this.hide);
            this.quocGia.reset();
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Tạo mới quá trình đi nước ngoài',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} required />
                <FormTextBox className='col-md-3' ref={e => this.soQuyetDinh = e} type='text' label='Số quyết định' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.ngayQuyetDinh = e} type='date-mask' label='Ngày quyết định' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.mucDich = e} label='Mục đích' data={SelectAdapter_DmMucDichNuocNgoaiV2} readOnly={readOnly} />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} label='Nội dung' placeholder='Nhập nội dung đi nước ngoài (tối đa 1000 ký tự)' required readOnly={readOnly} />
                <FormSelect className='col-md-12' multiple={true} ref={e => this.quocGia = e} label='Quốc gia' data={SelectAdapter_DmQuocGia} required readOnly={readOnly} />
                <FormTextBox className='col-md-8' ref={e => this.chiPhi = e} rows={2} type='text' label='Chi phí' readOnly={readOnly} placeholder='Nhập chi phí (tối đa 500 ký tự)'/>
                <FormTextBox className='col-md-4' ref={e => this.ghiChu = e} type='text' label='Ghi chú' readOnly={readOnly} />

                <div className='form-group col-md-6'><DateInput ref={e => this.ngayDi = e} placeholder='Ngày đi'
                    label={
                        <div style={{ display: 'flex' }}>Ngày đi (&nbsp; <Dropdown ref={e => this.ngayDiType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayDiType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayDiType ? typeMapper[this.state.ngayDiType] : null} readOnly={readOnly} /></div>
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ngayVe = e} placeholder='Ngày về'
                    label={
                        <div style={{ display: 'flex' }}>Ngày về (&nbsp; <Dropdown ref={e => this.ngayVeType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayVeType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayVeType ? typeMapper[this.state.ngayVeType] : null} readOnly={readOnly} /></div>
            </div>
        });
    }
}

class ThongKeMucDichModal extends AdminModal {
    state = {
        data: [],
        totalItem: 0,
    }

    tableListMucDich = (data) => {
        return renderTable({
            getDataSource: () => data,
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '100%' }}>Mục đích</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Số lượng</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{ color: 'blue', whiteSpace: 'nowrap' }} content={item.id} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.len} />
                    </tr>
                );
            }
        });
    }

    setUp = (data = [], keyGroup) => {
        let dataGroupBy = data.groupBy(keyGroup);
        let filterData = [];
        let totalItem = 0;
        Object.keys(dataGroupBy).filter(item => dataGroupBy[item].length > 0).map(item => {
            filterData.push({ id: item, len: dataGroupBy[item].length });
            totalItem += dataGroupBy[item].length;
        });
        filterData.sort(function(a, b) { //sắp xếp theo số lượng giảm dần
            return -(a.len - b.len);
        });
        return [filterData, totalItem];
    }

    onShow = () => {
        this.props.thongKeMucDich(this.props.pageC, this.props.filter, data => {
            let dataSetUp = this.setUp(data, 'tenMucDich');
            this.setState({
                data: dataSetUp[0],
                totalItem: dataSetUp[1]
            });
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Thống kê',
            size: 'large',
            body: <div className='row'>
                <div className='form-group col-md-12' style={{ marginTop: '20px' }}>
                    <div>{this.tableListMucDich(this.state.data)}</div>
                    <big><b>{'Tổng cộng: ' + this.state.totalItem.toString()}</b></big>
                </div>
            </div>
        });
    }
}

class QtDiNuocNgoaiGroupPage extends AdminPage {
    state = { filter: {}, visibleTime: false };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            const route = T.routeMatcher('/user/tccb/qua-trinh/di-nuoc-ngoai/group/:shcc'),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.setState({ filter: { listShcc: params.shcc, listDv: '', loaiHocVi: null } }, () => {
                this.changeAdvancedSearch(true);
            });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                let filterCookie = T.getCookiePage('groupPageMaQtDiNuocNgoai', 'F'), {
                    timeType = '', fromYear = '', toYear = '', tinhTrangCongTac = '', mucDich = '', tinhTrangBaoCao = '',
                } = filterCookie;
                this.timeType.value(timeType);
                this.fromYear?.value(fromYear);
                this.toYear?.value(toYear);
                this.tinhTrangCongTac.value(tinhTrangCongTac);
                this.tinhTrangBaoCao.value(tinhTrangBaoCao);
                this.mucDich.value(mucDich);
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.pageMa ? this.props.qtDiNuocNgoai.pageMa : { pageNumber: 1, pageSize: 50, pageCondition: {} };

        if (pageCondition && (typeof pageCondition == 'string')) T.setTextSearchBox(pageCondition);

        const timeType = this.timeType.value() || '';
        let fromYear = null;
        if (this.fromYear?.value()) {
            fromYear = this.fromYear?.value();
            fromYear.setHours(0, 0, 0, 0);
            fromYear = fromYear.getTime();
        }
        let toYear = null;
        if (this.toYear?.value()) {
            toYear = this.toYear?.value();
            toYear.setHours(23, 59, 59, 999);
            toYear = toYear.getTime();
        }
        
        const listDv = this.state.filter.listDv;
        const listShcc = this.state.filter.listShcc;
        const loaiHocVi = this.state.filter.loaiHocVi;
        const tinhTrangCongTac = this.tinhTrangCongTac.value() == '' ? null : this.tinhTrangCongTac.value();
        const tinhTrangBaoCao = this.tinhTrangBaoCao.value() == '' ? null : this.tinhTrangBaoCao.value();
        const mucDich = this.mucDich.value().toString() || '';
        const pageFilter = (isInitial || isReset) ? { listShcc, listDv, loaiHocVi } : { listDv, fromYear, toYear, listShcc, tinhTrangCongTac, timeType, loaiHocVi, mucDich, tinhTrangBaoCao };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const filter = page.filter || { listShcc, listDv, loaiHocVi };
                    const filterCookie = T.getCookiePage('groupPageMaQtDiNuocNgoai', 'F');
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });

                    this.fromYear?.value(filter.fromYear || filterCookie.fromYear || '');
                    this.toYear?.value(filter.toYear || filterCookie.toYear || '');
                    this.timeType.value(filter.timeType || filterCookie.timeType || '');
                    this.tinhTrangCongTac.value(filter.tinhTrangCongTac || filterCookie.tinhTrangCongTac || '');
                    this.mucDich.value(filter.mucDich || filterCookie.mucDich || '');
                    this.tinhTrangBaoCao.value(filter.tinhTrangBaoCao || filterCookie.tinhTrangBaoCao || '');
                    // if (this.fromYear?.value() || this.toYear?.value() || this.timeType.value() || this.tinhTrangCongTac.value() || this.mucDich.value() || this.tinhTrangBaoCao.value()) this.showAdvanceSearch();
                } else if (isReset) {
                    this.fromYear?.value('');
                    this.toYear?.value('');
                    this.timeType.value('');
                    this.tinhTrangCongTac.value('');
                    this.mucDich.value('');
                    this.tinhTrangBaoCao.value('');
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtDiNuocNgoaiGroupPageMa(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    showCreateModal = (e) => {
        e.preventDefault();
        this.createModal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin đi nước ngoài', 'Bạn có chắc bạn muốn xóa thông tin đi nước ngoài này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtDiNuocNgoaiGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin đi nước ngoài bị lỗi!', 'danger');
                else T.alert('Xoá thông tin đi nước ngoài thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    handleTime = (value) => {
        value ? this.setState({ visibleTime: true }) : this.setState({ visibleTime: false });
    }

    render() {
        const permission = this.getUserPermission('qtDiNuocNgoai');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.pageMa ? this.props.qtDiNuocNgoai.pageMa : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br/>Đơn vị công tác</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi đến</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Mục đích</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nội dung</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng công tác</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng báo cáo</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHocVi || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span> {item.tenChucVu || ''}<br /> </span>
                                {(item.tenDonVi || '').normalizedName()}
                            </>
                        )} />
                        <TableCell type='text' style={{color: 'blue'}} content={(item.ngayQuyetDinh ? T.dateToText(item.ngayQuyetDinh, 'dd/mm/yyyy') : '')} />
                        <TableCell type='text' content={(<b> {item.soQuyetDinh || ''} </b>)} />
                        <TableCell type='text' style={{color: 'blue'}} content={(item.danhSachQuocGia || '')} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(<b>{item.tenMucDich || ''}</b>)} />
                        <TableCell type='text' contentClassName='multiple-lines-5' content={(item.noiDung || '')} />
                        <TableCell type='text' content={(
                            <>
                                {item.ngayDi ? <span style={{ whiteSpace: 'nowrap' }}>Ngày đi: <span style={{ color: 'blue' }}>{item.ngayDi ? T.dateToText(item.ngayDi, item.ngayDiType ? item.ngayDiType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ngayVe && item.ngayVe != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Ngày về: <span style={{ color: 'blue' }}>{item.ngayVe && item.ngayVe != -1 ? T.dateToText(item.ngayVe, item.ngayVeType ? item.ngayVeType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{(item.ngayDi <= item.today && item.ngayVe >= item.today) ? <span style={{ whiteSpace: 'nowrap' }}><b><i>Đang ở<br/>nước ngoài</i></b></span> : item.ngayDi > item.today ? <span style={{ whiteSpace: 'nowrap' }}><i>Chưa diễn ra</i></span> : (item.soQdTiepNhan || T.dayDiff(new Date(item.ngayDi), new Date(item.ngayVe)) < 30) ? <span style={{ color: 'blue', whiteSpace: 'nowrap' }}> Đã tiếp nhận<br/>về nước</span>: <span style={{ color: 'red', whiteSpace: 'nowrap' }}> Hết hạn và<br/>chưa tiếp nhận </span>} </span>
                            </>
                        )}></TableCell>
                        <TableCell type='text' style={{ color: item.baoCaoTinhTrang == 0 ? 'red' : 'blue'}} content={mapperBaoCaoTinhTrang[item.baoCaoTinhTrang]}></TableCell>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-fighter-jet',
            title: 'Quá trình đi nước ngoài - Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={0} to='/user/tccb/qua-trinh/di-nuoc-ngoai'>Quá trình đi nước ngoài</Link>,
                'Quá trình đi nước ngoài - Cán bộ'
            ],
            advanceSearch: <>
                <div className='row'>
                <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} allowClear={true} onChange={this.handleTime} />
                    {this.state.visibleTime && 
                        <>
                            <FormDatePicker type='date-mask' ref={e => this.fromYear = e} className='col-12 col-md-2' label='Từ thời gian' />
                            <FormDatePicker type='date-mask' ref={e => this.toYear = e} className='col-12 col-md-2' label='Đến thời gian' />
                        </>}
                    <FormSelect className='col-12 col-md-4' ref={e => this.tinhTrangCongTac = e} label='Tình trạng công tác'
                        data={[
                            { id: 1, text: 'Đã tiếp nhận về nước' },
                            { id: 2, text: 'Hết hạn và chưa tiếp nhận' },
                            { id: 3, text: 'Đang ở nước ngoài' },
                            { id: 4, text: 'Chưa diễn ra'},
                        ]} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-4' ref={e => this.tinhTrangBaoCao = e} label='Tình trạng báo cáo' data={listBaoCaoTinhTrang} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mucDich = e} label='Mục đích' data={SelectAdapter_DmMucDichNuocNgoaiV2} allowClear={true} minimumResultsForSearch={-1} />
                    <div className='form-group col-12' style={{ justifyContent: 'end', display: 'flex' }}>
                        <button className='btn btn-info' type='button' style={{ marginRight: '10px' }} onClick={e => e.preventDefault() || this.thongKeMucDich.show()}>
                            <i className='fa fa-fw fa-lg fa-th-list' />Thống kê mục đích
                        </button>
                        <button className='btn btn-danger' style={{ marginRight: '10px' }} type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch(null, true)}>
                            <i className='fa fa-fw fa-lg fa-times' />Xóa bộ lọc
                        </button>
                        <button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                            <i className='fa fa-fw fa-lg fa-search-plus' />Tìm kiếm
                        </button>
                    </div>
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    shcc={this.shcc} deleteFile={this.props.deleteFile}
                    create={this.props.createQtDiNuocNgoaiGroupPageMa} update={this.props.updateQtDiNuocNgoaiGroupPageMa}
                />
                <CreateModal ref={e => this.createModal = e} readOnly={!permission.write}
                    create={this.props.createQtDiNuocNgoaiGroupPageMa} shcc={this.shcc}
                />
                <ThongKeMucDichModal ref={e => this.thongKeMucDich = e} thongKeMucDich={this.props.getThongKeMucDich} filter={this.state.filter} pageC={pageCondition} />
            </>,
            backRoute: '/user/tccb/qua-trinh/di-nuoc-ngoai',
            onCreate: permission && permission.write ? (e) => this.showCreateModal(e) : null,
            onExport: (e) => {
                e.preventDefault();
                let { pageCondition } = this.props && this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.pageMa ? this.props.qtDiNuocNgoai.pageMa : { pageCondition: {} };
                pageCondition = typeof pageCondition === 'string' ? pageCondition : '';
                if (pageCondition.length == 0) pageCondition = null;
                
                const filter = T.stringify(this.state.filter);

                T.download(T.url(`/api/qua-trinh/di-nuoc-ngoai/download-excel/${filter}/${pageCondition}`), 'dinuocngoai.xlsx');
            }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtDiNuocNgoai: state.tccb.qtDiNuocNgoai });
const mapActionsToProps = {
    getQtDiNuocNgoaiGroupPageMa, deleteQtDiNuocNgoaiGroupPageMa,
    updateQtDiNuocNgoaiGroupPageMa, createQtDiNuocNgoaiGroupPageMa, getThongKeMucDich, deleteFile
};
export default connect(mapStateToProps, mapActionsToProps)(QtDiNuocNgoaiGroupPage);