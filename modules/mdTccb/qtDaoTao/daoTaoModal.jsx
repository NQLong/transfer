import { AdminModal, FormCheckbox, FormDatePicker, FormFileBox, FormSelect, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import React from 'react';
import { connect } from 'react-redux';
import { SelectApdater_DmBangDaoTao } from 'modules/mdDanhMuc/dmBangDaoTao/redux';
import { SelectApdaterDmTrinhDoDaoTaoFilter } from 'modules/mdDanhMuc/dmTrinhDoDaoTao/redux';
import { SelectAdapter_DmHinhThucDaoTaoV2 } from 'modules/mdDanhMuc/dmHinhThucDaoTao/redux';
import Dropdown from 'view/component/Dropdown';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';

const EnumDateType = ['dd/mm/yyyy', 'mm/yyyy', 'yyyy'],
    typeMapper = {
        'yyyy': 'year-mask',
        'mm/yyyy': 'month-mask',
        'dd/mm/yyyy': 'date-mask'
    };

const chuyenNganhSupportText = {
    5: 'Tiếng ',
    6: 'Tin học',
    7: 'Lý luận chính trị',
    8: 'Quản lý nhà nước'
};
export class DaoTaoModal extends AdminModal {
    state = {
        id: null,
        item: null,
        shcc: '',
        email: '',
        batDau: '',
        ketThuc: '',
        loaiBangCap: null,
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        listFile: []
    }

    onShow = (data) => {
        //data for adminPage, daoTaoDetail: data: { item: }
        //data for support: data: { data: {}, qtId }
        let item = data?.item || data?.data || null;
        let { id, batDauType, ketThucType, batDau, ketThuc, trinhDo, chuyenNganh, tenTruong, hinhThuc, loaiBangCap, minhChung, shcc } = item || {
            id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, chuyenNganh: '',
            tenTruong: '', kinhPhi: '', hinhThuc: '', loaiBangCap: '', trinhDo: '', minhChung: '[]', shcc: ''
        };
        let listFile = T.parse(minhChung || '[]');
        data?.data && this.setState({ item, qtId: data.qtId });
        this.setState({
            batDauType: batDauType || 'dd/mm/yyyy',
            ketThucType: ketThucType || 'dd/mm/yyyy',
            batDau: Number(batDau), ketThuc: Number(ketThuc), listFile, shcc, id, loaiBangCap: loaiBangCap ? Number(loaiBangCap) : null, denNay: ketThuc == -1
        }, () => {
            this.canBo.value(this.state.shcc || '');
            this.loaiBangCap.value(this.state.loaiBangCap);
            this.trinhDo?.value(trinhDo || '');
            this.chuyenNganh?.value(chuyenNganh || (this.state.loaiBangCap ? chuyenNganhSupportText[this.state.loaiBangCap] : ''));
            this.tenTruong?.value(tenTruong || '');
            this.hinhThuc?.value(hinhThuc || '');
            this.batDauType?.setText({ text: this.state.batDauType });
            this.ketThucType?.setText({ text: this.state.ketThucType });
            this.batDau?.value(this.state.batDau || '');
            !this.state.denNay && this.ketThuc?.value(this.state.ketThuc || '');
            this.fileBox.setData('minhChungHocVi:' + this.state.shcc);
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: getValue(this.canBo),
            batDau: getValue(this.batDau) ? getValue(this.batDau).getTime() : '',
            ketThuc: this.state.denNay ? -1 : (getValue(this.ketThuc) ? getValue(this.ketThuc).getTime() : ''),
            batDauType: this.state.batDauType,
            ketThucType: this.state.ketThucType,
            tenTruong: getValue(this.tenTruong),
            chuyenNganh: getValue(this.chuyenNganh),
            hinhThuc: getValue(this.hinhThuc),
            loaiBangCap: getValue(this.loaiBangCap),
            trinhDo: getValue(this.trinhDo),
            minhChung: T.stringify(this.state.listFile, '[]'),
        };
        const tccbSupport = {
            qtId: this.state.id,
            qt: 'qtDaoTao',
            type: this.state.id ? 'update' : 'create'
        };

        if (!changes.loaiBangCap) {
            T.notify('Loại bằng cấp bị trống!', 'danger');
            this.loaiBangCap.focus();
        } else if (!changes.chuyenNganh) {
            T.notify('Nội dung bị trống!', 'danger');
            this.chuyenNganh.focus();
        }
        else if (!changes.batDau) {
            T.notify('Thời gian bắt đầu trống!', 'danger');
            this.batDau.focus();
        }
        else {
            if (!this.props.readOnly && this.props.isCanBo) {
                this.props.create(changes, tccbSupport, this.hide);
            }
            else {
                this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
            }
        }
    }

    handleBang = (value) => {
        this.setState({ loaiBangCap: Number(value.id) }, () => {
            this.chuyenNganh?.value(chuyenNganhSupportText[Number(value.id)] || '');
            this.trinhDo.focus();
        });
    }

    checkBang = (loaiBangCap) => {
        return (loaiBangCap && loaiBangCap != '' && loaiBangCap != '1' && loaiBangCap != '2' && loaiBangCap != '9');
    };

    handleKetThuc = (value) => {
        this.setState({ denNay: !!value }, () => {
            if (!value) {
                this.ketThucType?.setText({ text: this.state.ketThucType ? this.state.ketThucType : 'dd/mm/yyyy' });
            } else {
                this.ketThuc.value('');
                this.ketThucType?.setText({ text: '' });
            }
        });
    }

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

    onSuccess = (response) => {
        if (response.data) {
            let listFile = [...this.state.listFile];
            listFile.push(response.data);
            this.setState({ listFile });
        } else if (response.error) T.notify(response.error, 'danger');
    }

    split = (input) => {
        let arr = input.split('/');
        let shcc = arr[1];
        let suffix = arr[2];
        let date = suffix.split('_')[0];
        let name = suffix.substring(date.length + 1);
        return { shcc, date, name };
    };

    onChangeViewMode = (value) => {
        if (value) {
            this.props.getItemQtDaoTao(this.state.qtId, data => {
                this.onShow({ item: data });
            });
        } else this.onShow({ data: this.state.item, qtId: this.state.qtId });
    }

    tableListFile = (data, permission) => {
        return renderTable({
            getDataSource: () => data,
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có file minh chứng nào!',
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
                            <a href={'/api/qua-trinh/dao-tao/download' + item} download>{name}</a>
                        </>
                        } />
                        <TableCell style={{ textAlign: 'center' }} content={T.dateToText(parseInt(date), 'dd/mm/yyyy HH:MM')}></TableCell>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={{ delete: permission }} onDelete={e => this.deleteFile(e, index)}>
                            <a className='btn btn-warning' href={'/api/qua-trinh/dao-tao/download' + item} download>
                                <i className='fa fa-lg fa-download' />
                            </a>
                        </TableCell>
                    </tr>
                );
            }
        });
    }

    render = () => {
        let readOnly = this.props.readOnly || this.props.isSupport;
        const displayElement = this.state.loaiBangCap ? 'block' : 'none';
        return this.renderModal({
            title: <>Thông tin quá trình đào tạo {this.props.title || ''}</>,
            size: 'large',
            buttons: this.props.isSupport && <FormCheckbox ref={e => this.origindata = e} label='Xem dữ liệu ban đầu&nbsp;' onChange={value => this.onChangeViewMode(value)} isSwitch={true} />,
            submitText: this.props.isCanBo ? 'Gửi yêu cầu' : 'Lưu',
            body: <div className='row'>

                <FormSelect className='form-group col-md-12' ref={e => this.canBo = e} label='Cán bộ' readOnly={readOnly || this.state.shcc} data={SelectAdapter_FwCanBo} />

                <FormSelect className='form-group col-md-12' ref={e => this.loaiBangCap = e} label='Loại bằng cấp' data={SelectApdater_DmBangDaoTao} onChange={this.handleBang} required readOnly={readOnly} />
                {
                    this.state.loaiBangCap ? ((![5, 99, 9].includes(this.state.loaiBangCap)) ?
                        <FormSelect ref={e => this.trinhDo = e} data={SelectApdaterDmTrinhDoDaoTaoFilter(this.state.loaiBangCap)}
                            className='col-md-6' style={{ display: this.checkBang(this.state.loaiBangCap) ? 'block' : 'none' }} label='Trình độ' readOnly={readOnly} />
                        :
                        <FormTextBox ref={e => this.trinhDo = e} className='form-group col-md-6' label='Trình độ/Kết quả' required readOnly={readOnly} />) : null
                }
                <FormSelect ref={e => this.hinhThuc = e} className='form-group col-md-6' label='Hình thức' data={SelectAdapter_DmHinhThucDaoTaoV2} style={{ display: displayElement }} readOnly={readOnly} />
                <FormTextBox ref={e => this.chuyenNganh = e} className='form-group col-md-12' label='Chuyên ngành/Nội dung' style={{ display: displayElement }} required readOnly={(this.state.loaiBangCap != 5 && !!chuyenNganhSupportText[this.state.loaiBangCap]) || readOnly} />
                <FormTextBox ref={e => this.tenTruong = e} className='form-group col-md-12' label='Tên cơ sở bồi dưỡng, đào tạo' style={{ display: displayElement }} readOnly={readOnly} />
                <small className='form-group col-md-12' style={{ color: 'red', display: displayElement }}><i>Nếu thầy, cô chỉ thi lấy chứng chỉ/chứng nhận mà không có quá trình đào tạo thì <b>CHỈ NHẬP</b> ô <b>Thời gian bắt đầu</b></i></small>

                <FormDatePicker style={{ display: displayElement }} placeholder='Thời gian bắt đầu' ref={e => this.batDau = e} type={typeMapper[this.state.batDauType]} className='col-md-6' label={
                    <div style={{ display: 'flex' }}>Thời gian bắt đầu:&nbsp;&nbsp;<Dropdown ref={e => this.batDauType = e}
                        items={EnumDateType}
                        onSelected={item => this.setState({ batDauType: item }, () => {
                            this.batDau.value('');
                            this.batDau.focus();
                        })} readOnly={readOnly} />&nbsp;<span style={{ color: 'red' }}> *</span></div>
                } readOnly={readOnly} />
                <FormDatePicker style={{ display: displayElement }} placeholder='Thời gian kết thúc' ref={e => this.ketThuc = e} type={typeMapper[this.state.ketThucType]} className='col-md-6' label={
                    <div style={{ display: 'flex' }}>Thời gian kết thúc:&nbsp;&nbsp;<Dropdown ref={e => this.ketThucType = e}
                        items={EnumDateType}
                        onSelected={item => this.setState({ ketThucType: item }, () => {
                            this.ketThuc.value('');
                            this.ketThuc.focus();
                        })} readOnly={readOnly || this.state.denNay} /></div>
                } readOnly={readOnly || this.state.denNay} />
                <FormCheckbox ref={e => this.denNayCheck = e} label='Đang diễn ra (Chưa kết thúc)' onChange={this.handleKetThuc} style={{ display: displayElement }} className='form-group col-md-6' readOnly={readOnly} />

                <div className='form-group col-12' style={{ display: (this.state.id || this.state.qtId) ? 'block' : 'block' }}>
                    <p>Danh sách minh chứng</p>
                    <div className='tile-body row'>
                        <div className='form-group col-md-7'>
                            {this.tableListFile(this.state.listFile || [], !readOnly)}
                        </div>
                        <FormFileBox className='col-md-5' ref={e => this.fileBox = e} postUrl='/user/upload' uploadType='minhChungHocVi' userData='minhChungHocVi' style={{ width: '100%', backgroundColor: '#fdfdfd', display: readOnly ? 'none' : 'block' }} onSuccess={this.onSuccess} description='Nhấp hoặc kéo thả file minh chứng' />
                    </div>
                </div>

            </div>
        });
    }
}

const mapStateToProps = () => ({});
const mapActionsToProps = {

};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(DaoTaoModal);