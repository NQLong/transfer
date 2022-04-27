import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormTextBox, renderTable, TableCell, FormCheckbox, FormSelect, FormFileBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    getQtDiNuocNgoaiUserPage, deleteQtDiNuocNgoaiUserPage, createQtDiNuocNgoaiUserPage,
    updateQtDiNuocNgoaiUserPage, getThongKeMucDich
} from './redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmMucDichNuocNgoaiV2 } from 'modules/mdDanhMuc/dmMucDichNuocNgoai/redux';
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
        baoCaoTinhTrang: 0,
        listFile: [],
        noNeedTiepNhan: false
    };
    // Table name: QT_DI_NUOC_NGOAI { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, loaiChiPhi, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc, baoCaoTen, baoCaoNgayNop, baoCaoTinhTrang, baoCaoLyDoTraVe }

    onShow = (item) => {
        let { id, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc, baoCaoTen, baoCaoTinhTrang, baoCaoLyDoTraVe } = item && item.item ? item.item : {
            id: '', quocGia: '', ngayDi: null, ngayDiType: '', ngayVe: null, ngayVeType: '', mucDich: '', noiDung: '', chiPhi: null, ghiChu: '', soQuyetDinh: '', ngayQuyetDinh: null, soQdTiepNhan: '', ngayQdTiepNhan: null, noiDungTiepNhan: '', ngayVeNuoc: null, baoCaoTen: '[]', baoCaoTinhTrang: 0, baoCaoLyDoTraVe: '',
        };
        let listFile = T.parse(baoCaoTen, []);
        this.setState({
            id, ngayDiType: ngayDiType ? ngayDiType : 'dd/mm/yyyy',
            ngayVeType: ngayVeType ? ngayVeType : 'dd/mm/yyyy',
            ngayDi, ngayVe,
            tiepNhan: soQdTiepNhan ? true : false,
            shcc: item.shcc,
            baoCaoTinhTrang,
            listFile,
            noNeedTiepNhan: ngayDi && ngayVe ? (T.dayDiff(new Date(ngayDi), new Date(ngayVe)) < 30 ? true : false) : false
        }, () => {
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
            if (this.state.tiepNhan) {
                this.tiepNhanCheck.value(true);
                $('#tiepNhan').show();
            } else {
                $('#tiepNhan').hide();
            }
            this.soQdTiepNhan.value(soQdTiepNhan || '');
            this.ngayQdTiepNhan.value(ngayQdTiepNhan || '');
            this.noiDungTiepNhan.value(noiDungTiepNhan || '');
            this.ngayVeNuoc.value(ngayVeNuoc || '');
            this.baoCaoLyDoTraVe.value(baoCaoLyDoTraVe || '');
            this.fileBox.setData('baoCaoDiNuocNgoaiStaffFile:' + item.shcc);
        });
    };

    deleteFile = (e, index) => {
        e.preventDefault();
        T.confirm('Xóa dữ liệu', 'Bạn có muốn xóa tập tin này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                let listFile = this.state.listFile;
                listFile.splice(index, 1);
                this.setState({ listFile },
                () => T.notify('Xóa dữ liệu thành công', 'success'));
            }
        });
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
                let { date, name } = this.split(item);
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{ wordBreak: 'break-all' }} content={<>
                            <a href={'/api/di-nuoc-ngoai/download' + item} download>{name}</a>
                        </>
                        } />
                        <TableCell style={{ textAlign: 'center' }} content={T.dateToText(parseInt(date), 'dd/mm/yyyy HH:MM')}></TableCell>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onDelete={e => this.deleteFile(e, index)}>
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
        const { listFile, baoCaoTinhTrang } = this.state;
        if (listFile.length > 0) {
            if (baoCaoTinhTrang == 3) return 3;
            return 1;
        }
        return 0;
    }
    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
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
        if (!this.noiDung.value()) {
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
        // } else if (this.baoCaoCheck.value() && !this.baoCaoLyDoTraVe.value()) {
        //     T.notify('Lý do báo cáo bị trả về bị trống', 'danger');
        //     this.baoCaoLyDoTraVe.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    onSuccess = (response) => {
        if (response.data) {
            let listFile = this.state.listFile.length ? [...this.state.listFile] : [];
            listFile.push(response.data);
            this.setState({ listFile });
        } else if (response.error) T.notify(response.error, 'danger');
    }

    render = () => {
        const permission = {
            write: true,
            delete: true
        };
        const readOnly = this.props.canEdit;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình đi nước ngoài' : 'Tạo mới quá trình đi nước ngoài',
            size: 'elarge',
            body: <div className='row'>
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
                {(this.state.tiepNhan || this.state.noNeedTiepNhan) && <FormCheckbox label={this.state.noNeedTiepNhan ? 'Mặc định tiếp nhận do đi dưới 30 ngày' : 'Đã tiếp nhận'} className='form-group col-md-6' ref={e => this.tiepNhanCheck = e} readOnly={true} />}
                <div className='row form-group col-12' id='tiepNhan'>
                    <FormTextBox className='col-md-4' ref={e => this.soQdTiepNhan = e} type='text' label='Số quyết định tiếp nhận' readOnly={readOnly} required />
                    <FormDatePicker className='col-md-4' ref={e => this.ngayQdTiepNhan = e} type='date-mask' label='Ngày quyết định tiếp nhận' readOnly={readOnly} required />
                    <FormDatePicker className='col-md-4' ref={e => this.ngayVeNuoc = e} type='date-mask' label='Ngày về nước' readOnly={readOnly} />
                    <FormRichTextBox className='col-md-12' ref={e => this.noiDungTiepNhan = e} rows={3} readOnly={readOnly} label='Nội dung tiếp nhận' placeholder='Nhập nội dung tiếp nhận về nước (tối đa 1000 ký tự)' />
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
                <FormTextBox className='col-md-12' ref={e => this.baoCaoLyDoTraVe = e} type='text' label='Lý do báo cáo bị trả về' readOnly={readOnly} required />
            </div>
        });
    }
}

class QtDiNuocNgoaiUserPage extends AdminPage {
    state = { filter: {}, listMucDich: [] };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.thongKeMucDich('', { listShcc: shcc, listDv: '', fromYear: null, toYear: null, timeType: null, tinhTrang: null, loaiHocVi: null, mucDich: null }, (items) => {
                this.setState({ filter: { listShcc: shcc, listDv: '', fromYear: null, toYear: null, timeType: null, tinhTrang: null, loaiHocVi: null, mucDich: null }, listMucDich: this.setUp(items, 'tenMucDich') }, () => {
                    this.getPage();
                });
            });
        });
    }

    setUp = (data = [], keyGroup) => {
        let dataGroupBy = data.groupBy(keyGroup);
        let filterData = [];
        Object.keys(dataGroupBy).filter(item => dataGroupBy[item].length > 0).map(item => {
            filterData.push({ id: item, len: dataGroupBy[item].length });
        });
        filterData.sort(function(a, b) { //sắp xếp theo số lượng giảm dần
            return -(a.len - b.len);
        });
        let result = [];
        filterData.forEach(item => {
            result.push(<div key={item.id}><b><span>{' - ' + item.id + ': ' + item.len}</span></b></div>);
        });
        return result;
    }
    
    thongKeMucDich = (pageC, filter, done) => {
        this.props.getThongKeMucDich(pageC, filter, done);
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtDiNuocNgoaiUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.listShcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin đi nước ngoài', 'Bạn có chắc bạn muốn xóa thông tin đi nước ngoài này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtDiNuocNgoaiUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin đi nước ngoài bị lỗi!', 'danger');
                else T.alert('Xoá thông tin đi nước ngoài thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        let permission = this.getUserPermission('staff', ['login']);
        if (permission.login == true) {
            permission = {
                write: false,
                delete: false
            };
        }
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.userPage ? this.props.qtDiNuocNgoai.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
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
                                <span>{(item.ngayDi <= item.toDay && item.ngayVe >= item.today) ? <span style={{ whiteSpace: 'nowrap' }}><i>Đang ở<br/>nước ngoài</i></span> : item.ngayDi > item.toDay ? <span style={{ whiteSpace: 'nowrap' }}><i>Chưa diễn ra</i></span> : (item.soQdTiepNhan || T.dayDiff(new Date(item.ngayDi), new Date(item.ngayVe)) < 30) ? <span style={{ color: 'blue', whiteSpace: 'nowrap' }}> Đã tiếp nhận<br/>về nước</span>: <span style={{ color: 'red', whiteSpace: 'nowrap' }}> Hết hạn và<br/>chưa tiếp nhận </span>} </span>
                            </>
                        )}></TableCell>
                        <TableCell type='text' style={{ color: item.baoCaoTinhTrang == 0 ? 'red' : 'blue'}} content={mapperBaoCaoTinhTrang[item.baoCaoTinhTrang]}></TableCell>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ item, shcc })} onDelete={this.delete} >
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-fighter-jet',
            title: 'Quá trình đi nước ngoài',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Công tác ngoài nước'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>
                        Thống kê
                    </h3>
                    <div>{this.state.listMucDich}</div>
                    <big><b>{'Tổng cộng: ' + totalItem.toString()}</b></big>
                </div>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} shcc={this.shcc} canEdit={!permission.write}
                    create={this.props.createQtDiNuocNgoaiUserPage} update={this.props.updateQtDiNuocNgoaiUserPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtDiNuocNgoai: state.tccb.qtDiNuocNgoai });
const mapActionsToProps = {
    getQtDiNuocNgoaiUserPage, deleteQtDiNuocNgoaiUserPage,
    updateQtDiNuocNgoaiUserPage, createQtDiNuocNgoaiUserPage, getThongKeMucDich
};
export default connect(mapStateToProps, mapActionsToProps)(QtDiNuocNgoaiUserPage);