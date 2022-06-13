import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormCheckbox, FormTextBox, FormRichTextBox, renderTable, TableCell, FormSelect, FormFileBox } from 'view/component/AdminPage';
import { getDeTaiNckh, createQtNckhStaffUser, updateQtNckhStaffUser, deleteQtNckhStaffUser, deleteFile } from './redux';
import { DateInput } from 'view/component/Input';
import Dropdown from 'view/component/Dropdown';

const EnumDateType = Object.freeze({
    0: { text: '' },
    1: { text: 'dd/mm/yyyy' },
    2: { text: 'mm/yyyy' },
    3: { text: 'yyyy' }
}), typeMapper = {
    'yyyy': 'year',
    'mm/yyyy': 'month',
    'dd/mm/yyyy': 'date'
};

class StaffEditNCKH extends AdminPage {
    state = {
        hasItem: false, ownerShcc: '',
        nghiemThu: null, batDau: null,
        ketThuc: null,
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        ngayNghiemThuType: 'dd/mm/yyyy',
        listFile: []
    }

    componentDidMount() {
        T.ready('/user', () => {
            this.getData();
        });
    }

    getData = () => {
        const params = T.routeMatcher('/user/nghien-cuu-khoa-hoc/:id/:ownerShcc').parse(window.location.pathname),
            ownerShcc = params.ownerShcc, identifier = params.id;
        const hasItem = identifier && identifier != 'new' && ownerShcc && ownerShcc != 'new';
        if (hasItem) {
            this.props.getDeTaiNckh({ id: identifier, shcc: ownerShcc }, data => {
                if (data && data.error) {
                    T.notify('Lấy thông tin đề tài bị lỗi!', 'danger');
                    this.props.history.push('/user/nghien-cuu-khoa-hoc');
                } else {
                    this.setData(data);
                }
            });
        } else this.setData({ item: null, shcc: ownerShcc });
    }

    setData = (data) => {
        let {
            id, shcc, batDauType, ketThucType, batDau, ketThuc, fileMinhChung, inLLKH,
            tenDeTai, maSoCapQuanLy, kinhPhi, vaiTro, ngayNghiemThu, ketQua, ngayNghiemThuType
        } = data && data.item ? data.item : {
            id: null, shcc: shcc ? shcc : data.shcc, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, tenDeTai: '', inLLKH: 0,
            maSoCapQuanLy: '', kinhPhi: '', vaiTro: '', ngayNghiemThu: null, ketQua: '', ngayNghiemThuType: 'dd/mm/yyyy', fileMinhChung: '[]'
        };
        let listFile = [];
        try {
            listFile = JSON.parse(fileMinhChung);
        } catch (exception) {
            console.error(exception);
        }
        this.setState({
            ownerShcc: shcc,
            batDauType: batDauType ? batDauType : 'dd/mm/yyyy', listFile: listFile,
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            ngayNghiemThuType: ngayNghiemThuType ? ngayNghiemThuType : 'dd/mm/yyyy',
            id, batDau, ketThuc, ngayNghiemThu,
            denNay: ketThuc == -1 ? 1 : 0,
            nghiemThu: (ngayNghiemThu == -1 || ketThuc == -1) ? 1 : 0
        }, () => {
            this.tenDeTai.value(tenDeTai);
            this.maSoCapQuanLy.value(maSoCapQuanLy);
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            if (ngayNghiemThu != -1) {
                this.nghiemThuCheck.value(0);
                $('#done').show();
                this.ngayNghiemThu?.setVal(ngayNghiemThu ? ngayNghiemThu : '');
                this.ngayNghiemThuType?.setText({ text: ngayNghiemThuType ? ngayNghiemThuType : 'dd/mm/yyyy' });
            } else {
                this.nghiemThuCheck.value(1);
                $('#done').hide();

            }
            if (ketThuc != -1) {
                this.denNayCheck.value(0);

                $('#end').show();

                this.ketThucType?.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
                this.ketThuc?.setVal(ketThuc ? ketThuc : '');
            } else {
                this.denNayCheck.value(1);
                $('#end').hide();
                this.nghiemThuCheck.value(1);
                $('#done').hide();
            }
            this.batDau.setVal(batDau ? batDau : '');
            this.kinhPhi.value(kinhPhi ? kinhPhi : '');
            this.vaiTro.value(vaiTro ? vaiTro : '');
            !this.state.nghiemThu && this.ketQua.value(ketQua ? ketQua : '');
            this.inLLKH.value(inLLKH);
            this.fileBox.setData('DeTaiNCKHStaffFile:' + (id ? id : 'new'));
            this.tenDeTai.focus();
        });
    }

    onSuccess = (response) => {
        if (response.data) {
            let listFile = this.state.listFile.length ? [...this.state.listFile] : [];
            listFile.push(response.data);
            let fileMinhChung = '[]';
            try {
                fileMinhChung = JSON.stringify(listFile);
            } catch (exception) {
                T.notify(exception, 'danger');
                return;
            }
            this.state.id && this.props.updateQtNckhStaffUser(this.state.id, { fileMinhChung });
            this.setState({ listFile });
        } else if (response.error) T.notify(response.error, 'danger');
    }

    deleteFile = (e, index, item) => {
        e.preventDefault();
        T.confirm('Tập tin đính kèm', 'Bạn có chắc muốn xóa tập tin đính kèm này', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteFile(this.state.ownerShcc, this.state.id, index, item, () => {
                let listFile = [...this.state.listFile];
                listFile.splice(index, 1);
                this.setState({ listFile });
            }));
    }

    handleKetThuc = (value) => {
        if (value) {
            $('#end').hide();
            this.handleNghiemThu(1);
            this.ketThucType?.setText({ text: '' });
        } else {
            $('#end').show();
            this.ketThucType?.setText({ text: this.state.ketThucType ? this.state.ketThucType : 'dd/mm/yyyy' });
            this.ketThuc.setVal(null);
        }
        this.setState({ denNay: value });
    }

    handleNghiemThu = (value) => {
        if (value) {
            this.ngayNghiemThuType?.setText({ text: '' });
            $('#done').hide();
            this.nghiemThuCheck.value(1);
        } else {
            $('#done').show();
            this.ngayNghiemThuType?.setText({ text: this.state.ngayNghiemThuType ? this.state.ngayNghiemThuType : 'dd/mm/yyyy' });
            this.ngayNghiemThu.setVal(null);
        }
        this.setState({ nghiemThu: value });
    }

    tableListFile = (data, id, permission) => renderTable({
        getDataSource: () => data,
        stickyHead: false,
        emptyTable: 'Chưa có file minh chứng nào!',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '100%' }}>Tên tập tin</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày upload</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                <TableCell type='text' style={{ wordBreak: 'break-all' }} content={<>
                    <a href={this.state.id ? '/api/khcn/download' + item : '/api/khcn/download/new' + item.substring(5)} download>{item.split('/')[2].substring(23)}</a>
                </>
                } />
                <TableCell style={{ textAlign: 'center' }} content={T.dateToText(parseInt(item.split('/')[2].substring(9, 22)), 'dd/mm/yyyy HH:MM')}></TableCell>
                <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onDelete={e => this.deleteFile(e, index, item)}>
                    <a className='btn btn-info' href={`/api/khcn/download/${id}/${item}`} download>
                        <i className='fa fa-lg fa-download' />
                    </a>
                </TableCell>
            </tr>
        )
    });

    getVal = (selector, dateinput = null) => {
        const data = dateinput ? selector.getVal() : selector.value(),
            isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired || dateinput) throw (selector);
        return;
    }

    getValidated = () => {
        try {
            const changes = {
                shcc: this.state.ownerShcc,
                tenDeTai: this.getVal(this.tenDeTai),
                maSoCapQuanLy: this.getVal(this.maSoCapQuanLy),
                kinhPhi: this.getVal(this.kinhPhi),
                batDau: this.getVal(this.batDau, true),
                batDauType: this.state.batDauType,

                ketThuc: this.state.denNay ? -1 : this.getVal(this.ketThuc, true),
                ketThucType: this.state.denNay ? '' : this.state.ketThucType,

                ngayNghiemThu: this.state.nghiemThu ? -1 : this.getVal(this.ngayNghiemThu, true),
                ngayNghiemThuType: this.state.nghiemThu ? '' : this.state.ngayNghiemThuType,

                vaiTro: this.getVal(this.vaiTro),
                ketQua: !this.state.nghiemThu ? this.getVal(this.ketQua) : '',
                inLlkh: this.inLLKH.value() ? 1 : 0
            };
            return changes;

        } catch (selector) {
            let label = typeof selector.props.label === 'object' ? selector.props.label.props.children[0] : selector.props.label;
            selector.focus();
            T.notify('<b>' + (label.trim() || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    checkDieuKienIn = () => {
        /* Tạm thời pending */

        // if (value) { }
        // if (value && this.state.listFile.length == 0) {
        //     T.notify('Đề tài chưa có minh chứng', 'danger');
        //     this.inLLKH.value(0);
        // } else {
        //     let text = value ? 'In' : 'Không in';
        //     T.notify(text + ' đề tài này trong lý lịch khoa học', 'info');
        // }
        // let text = value ? 'In' : 'Không in';
        // T.notify(text + ' đề tài này trong lý lịch khoa học', 'info');
    }

    save = () => {
        const data = this.getValidated();
        if (data) {
            if (this.state.id) this.props.updateQtNckhStaffUser(this.state.id, data, null, data.inLlkh);
            else {
                if (this.state.listFile) {
                    try {
                        data.fileMinhChung = JSON.stringify(this.state.listFile);
                    } catch (exception) {
                        T.notify(exception, 'danger');
                        return;
                    }
                }
                this.props.createQtNckhStaffUser(data, this.props.history.push('/user/nghien-cuu-khoa-hoc'));
            }
        }
    }

    render() {
        const permission = {
            write: true,
            delete: true
        };
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        const readOnly = this.props.readOnly;

        return this.renderPage({
            icon: 'fa fa-wpexplorer',
            title: 'Đề tài nghiên cứu khoa học',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                <Link key={1} to='/user/nghien-cuu-khoa-hoc'>Nghiên cứu khoa học</Link>,
                'Đề tài'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>{!this.state.id ? 'Tạo mới đề tài' : 'Cập nhật đề tài'}</h3>
                    <div className='tile-body row'>
                        <FormRichTextBox className='col-12' ref={e => this.tenDeTai = e} label='Tên đề tài' readOnly={readOnly} required />
                        <FormTextBox className='col-md-6' ref={e => this.maSoCapQuanLy = e} label='Mã số và cấp quản lý' readOnly={readOnly} required />
                        <FormTextBox className='col-md-6' ref={e => this.kinhPhi = e} label={'Kinh phí'} type='text' placeholder='Nhập kinh phí (triệu đồng' />

                        <div className='form-group col-md-4'>Các mốc thời gian:</div>
                        <FormCheckbox ref={e => this.denNayCheck = e} label='Chưa kết thúc' onChange={this.handleKetThuc} className='form-group col-md-4' />
                        <FormCheckbox ref={e => this.nghiemThuCheck = e} label='Chưa nghiệm thu' onChange={this.handleNghiemThu} className='form-group col-md-4' />
                        <div className='form-group col-md-4'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu' label={
                            <div style={{ display: 'flex' }}>Thời gian bắt đầu &nbsp; <Dropdown ref={e => this.batDauType = e} items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]} onSelected={item => {
                                this.setState({ batDauType: item });
                                this.batDau.clear();
                                this.batDau.focus();
                            }} />&nbsp;<span style={{ color: 'red' }}> *</span></div>
                        } type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
                        <div className='form-group col-md-4' id='end'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc' label={
                            <div style={{ display: 'flex' }}>Thời gian kết thúc &nbsp; <Dropdown ref={e => this.ketThucType = e} items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]} onSelected={item => {
                                this.setState({ ketThucType: item });
                                this.ketThuc.clear();
                                this.ketThuc.focus();
                            }} />&nbsp;<span style={{ color: 'red' }}> *</span></div>
                        } type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
                        <div className='form-group col-md-4' style={{ display: this.state.denNay ? 'block' : 'none' }} />
                        <div className='form-group col-md-4' id='done'><DateInput ref={e => this.ngayNghiemThu = e} placeholder='Thời gian nghiệm thu' label={
                            <div style={{ display: 'flex' }}>Thời gian nghiệm thu &nbsp; <Dropdown ref={e => this.ngayNghiemThuType = e} items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]} onSelected={item => {
                                this.setState({ ngayNghiemThuType: item });
                                this.ngayNghiemThu.clear();
                                this.ngayNghiemThu.focus();
                            }} />&nbsp;<span style={{ color: 'red' }}> *</span></div>
                        } type={this.state.ngayNghiemThuType ? typeMapper[this.state.ngayNghiemThuType] : null} /></div>
                        <div className='form-group col-md-4' style={{ display: this.state.nghiemThu ? 'block' : 'none' }} />

                        <FormSelect className='col-md-4' ref={e => this.vaiTro = e} label={'Vai trò'} data={[
                            { id: 'CN', text: 'Chủ nhiệm' }, { id: 'TG', text: 'Tham gia' }
                        ]} type='text' required />
                        {!this.state.nghiemThu && <FormTextBox className='col-md-4' ref={e => this.ketQua = e} label={'Kết quả'} type='text' />}
                        <FormCheckbox className='col-md-4' ref={e => this.inLLKH = e} label={'In trong lý lịch khoa học'} isSwitch onChange={this.checkDieuKienIn} />
                    </div>
                </div>
                <div className='tile'>
                    <div className='form-group'>
                        <h3 className='tile-title'>Danh sách tập tin minh chứng</h3>
                        <div className='tile-body row'>
                            <div className='form-group col-md-8'>
                                {this.tableListFile(this.state.listFile, this.state.id, permission)}
                            </div>
                            <FormFileBox className='col-md-4' ref={e => this.fileBox = e} label='Tải lên tập tin minh chứng' postUrl='/user/upload' uploadType='deTaiNCKHStaffFile' userData='deTaiNCKHStaffFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.onSuccess} />
                        </div>
                    </div>

                </div>

            </>,
            backRoute: '/user/nghien-cuu-khoa-hoc',
            onSave: permission && permission.write ? this.save : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghienCuuKhoaHoc: state.khcn.qtNghienCuuKhoaHoc });
const mapActionsToProps = { getDeTaiNckh, createQtNckhStaffUser, updateQtNckhStaffUser, deleteQtNckhStaffUser, deleteFile };
export default connect(mapStateToProps, mapActionsToProps)(StaffEditNCKH);