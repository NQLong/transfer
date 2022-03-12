import { SelectApdaterDmTrinhDoDaoTaoFilter } from 'modules/mdDanhMuc/dmTrinhDoDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormCheckbox, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import ComponentNN from '../trinhDoNgoaiNgu/componentNgoaiNgu';
import { getStaffEdit, userGetStaff } from './redux';
import HocViDetail from '../qtDaoTao/hocViDetail';
import { createQtDaoTaoStaffUser, updateQtDaoTaoStaffUser, deleteQtDaoTaoStaffUser } from '../qtDaoTao/redux.jsx';
import { DateInput } from 'view/component/Input';
import Dropdown from 'view/component/Dropdown';
import { SelectApdater_DmBangDaoTao } from 'modules/mdDanhMuc/dmBangDaoTao/redux';
import { SelectAdapter_DmHinhThucDaoTaoV2 } from 'modules/mdDanhMuc/dmHinhThucDaoTao/redux';

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

const chuyenNganhSupportText = {
    5: 'Ngoại ngữ',
    6: 'Tin học',
    7: 'Lý luận chính trị',
    8: 'Quản lý nhà nước'
};
class EditModal extends AdminModal {
    state = {
        id: null,
        item: null,
        shcc: '',
        email: '',
        batDau: null,
        ketThuc: null,
        loaiBangCap: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    }

    onShow = (item) => {
        let { id, batDauType, ketThucType, batDau, ketThuc, trinhDo, chuyenNganh, tenCoSoDaoTao, kinhPhi, hinhThuc, loaiBangCap }
            = item && item.item ? item.item :
                {
                    id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, chuyenNganh: '',
                    tenCoSoDaoTao: '', kinhPhi: '', hinhThuc: '', loaiBangCap: '', trinhDo: ''
                };
        this.setState({
            email: item.email,
            batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            shcc: item.shcc, id, batDau, ketThuc, loaiBangCap: loaiBangCap ? loaiBangCap : (item.loaiBangCap ? item.loaiBangCap : ''),
            item: item.item, denNay: ketThuc && ketThuc == -1 ? true : false
        }, () => {
            this.loaiBangCap.value(loaiBangCap ? loaiBangCap : (item.loaiBangCap ? item.loaiBangCap : ''));
            this.trinhDo?.value(trinhDo ? trinhDo : (item.trinhDo ? item.trinhDo : ''));
            this.chuyenNganh?.value(chuyenNganh ? chuyenNganh : (this.state.loaiBangCap ? chuyenNganhSupportText[this.state.loaiBangCap] : ''));
            this.tenCoSoDaoTao?.value(tenCoSoDaoTao ? tenCoSoDaoTao : '');
            this.hinhThuc?.value(hinhThuc ? hinhThuc : '');
            if (this.state.ketThuc == -1) {
                this.denNayCheck?.value(true);
                $('#ketThucDate').hide();
                $('#denNayCheckBox').show();
            }
            this.batDauType?.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.batDau?.setVal(batDau ? batDau : null);
            !this.state.denNay && this.ketThucType?.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            !this.state.denNay && this.ketThuc?.setVal(ketThuc ? ketThuc : null);
            this.state.denNay && this.denNayCheck?.value(this.state.denNay);
            this.kinhPhi?.value(kinhPhi ? kinhPhi : '');
        });
    }

    onSubmit = () => {
        const changes = {
            shcc: this.state.shcc,
            email: this.state.email,
            batDau: this.batDau.getVal(),
            batDauType: this.state.batDauType,
            ketThucType: !this.state.denNay ? this.state.ketThucType : '',
            ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1,
            tenTruong: this.tenCoSoDaoTao.value(),
            chuyenNganh: this.chuyenNganh.value(),
            hinhThuc: this.hinhThuc.value(),
            loaiBangCap: this.loaiBangCap.value(),
            trinhDo: this.trinhDo.value()
        };

        if (!changes.loaiBangCap) {
            T.notify('Loại bằng cấp bị trống!', 'danger');
            this.loaiBangCap.focus();
        } else if (!changes.chuyenNganh) {
            T.notify('Nội dung bị trống!', 'danger');
            this.chuyenNganh.focus();
        } else if (!this.state.denNay && this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày bắt đầu lớn hơn ngày kết thúc', 'danger');
            this.batDau.focus();
        } else this.state.id ? this.props.update(this.state.id, changes, this.props.isEdit, (data) => {
            this.setState({
                tmp_data: changes.loaiBangCap == '6' ? { tinHoc: data, shcc: this.state.shcc, email: this.state.email } : (
                    changes.loaiBangCap == '7' ? { llct: data, shcc: this.state.shcc, email: this.state.email } : (
                        changes.loaiBangCap == '8' ? { qlnn: data, shcc: this.state.shcc, email: this.state.email } : null
                    )
                )
            }, () => {
                this.props.value(this.state.tmp_data);
                this.hide();
            });
        }) : this.props.create(changes, this.props.isEdit, (data) => {
            this.setState({
                tmp_data: changes.loaiBangCap == '6' ? { tinHoc: data, shcc: this.state.shcc, email: this.state.email } : (
                    changes.loaiBangCap == '7' ? { llct: data, shcc: this.state.shcc, email: this.state.email } : (
                        changes.loaiBangCap == '8' ? { qlnn: data, shcc: this.state.shcc, email: this.state.email } : null
                    )
                )
            }, () => {
                this.props.value(this.state.tmp_data);
                this.hide();
            });
        });
    }

    handleBang = (value) => {
        this.setState({ loaiBangCap: value ? value.id : '' }, () => {
            this.trinhDo?.value(this.state.item?.trinhDo ? this.state.item?.trinhDo : '');
            value && this.chuyenNganh?.value(this.state.item?.chuyenNganh ? this.state.item?.chuyenNganh : chuyenNganhSupportText[value.id]);
        });

    }

    checkBang = (loaiBangCap) => {
        return (loaiBangCap != '' && loaiBangCap != '1' && loaiBangCap != '2' && loaiBangCap != '9');
    };

    handleKetThuc = (value) => {
        value ? $('#ketThucDate').hide() : $('#ketThucDate').show();
        this.setState({ denNay: value });
        if (!value) {
            this.ketThucType?.setText({ text: this.state.ketThucType ? this.state.ketThucType : 'dd/mm/yyyy' });
        } else {
            this.ketThucType?.setText({ text: '' });
        }
    }

    render = () => {
        const displayElement = this.state.loaiBangCap == '' ? 'none' : 'block';
        return this.renderModal({
            title: 'Thông tin quá trình đào tạo',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='form-group col-md-4' ref={e => this.loaiBangCap = e} label='Loại bằng cấp' data={SelectApdater_DmBangDaoTao} onChange={this.handleBang} required />
                {
                    (this.state.loaiBangCap != '5' && this.state.loaiBangCap != '9') ?
                        <FormSelect ref={e => this.trinhDo = e} data={SelectApdaterDmTrinhDoDaoTaoFilter(this.state.loaiBangCap)}
                            className='col-md-4' style={{ display: this.checkBang(this.state.loaiBangCap) ? 'block' : 'none' }} label='Trình độ' />
                        :
                        <FormTextBox ref={e => this.trinhDo = e} className='form-group col-md-4' label='Trình độ/Kết quả' required />
                }
                <FormSelect ref={e => this.hinhThuc = e} className='form-group col-md-4' label='Hình thức' data={SelectAdapter_DmHinhThucDaoTaoV2} style={{ display: displayElement }} />
                <FormTextBox ref={e => this.chuyenNganh = e} className='form-group col-md-12' label='Nội dung bồi dưỡng, đào tạo' style={{ display: displayElement }} required readOnly={this.state.loaiBangCap == ''} />
                <FormRichTextBox ref={e => this.tenCoSoDaoTao = e} className='form-group col-md-12' label='Tên cơ sở bồi dưỡng, đào tạo' style={{ display: displayElement }} />
                <div className='form-group col-md-4' style={{ display: displayElement }}><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (&nbsp;<Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
                <div className='form-group col-md-4' id='ketThucDate' style={{ display: displayElement }}><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (&nbsp;<Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} />)</div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
                <div id='denNayCheckBox' style={{ display: displayElement }} className='form-group col-md-4'>
                    <FormCheckbox ref={e => this.denNayCheck = e} label='Đang diễn ra' onChange={this.handleKetThuc} />
                </div>
            </div>
        });
    }
}

class ComponentTrinhDo extends AdminPage {
    state = { shcc: '', email: '' };

    delete = (e, item) => {
        T.confirm('Xóa thông tin quá trình đào tạo', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtDaoTaoStaffUser(item.id, this.props.userEdit ? this.state.email : this.state.shcc, this.props.userEdit, () =>
                this.value(!this.props.userEdit ? this.props.staff?.selectedItem : this.props.staff?.userItem)
            )
        );
        e.preventDefault();
    }

    renderDaoTaoCurrent = (items) => (
        renderTable({
            emptyTable: 'Không có quá trình đào tạo hiện tại',
            getDataSource: () => items,
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Chuyên ngành đào tạo hiện tại</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên cơ sở đào tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Kết quả, trình độ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{}} content={item.chuyenNganh} />
                    <TableCell type='text' style={{}} content={item.tenCoSoDaoTao} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                        <>
                            {item.batDau && <span>Bắt đầu: <span style={{ color: 'blue' }}>{T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')}</span><br /></span>}
                            {item.ketThuc && item.ketThuc == -1 ? <span style={{ color: 'red' }}>Đang diễn ra</span> : null}
                            {item.ketThuc && item.ketThuc != -1 ? <span>Kết thúc: <span style={{ color: 'blue' }}>{T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')}</span></span> : null}
                        </>} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                        {item.loaiBangCap && <span style={{ color: 'red' }}>{item.tenLoaiBangCap}<br /></span>}
                        {item.trinhDo && <span>Kết quả, trình độ: <span style={{ color: 'red' }}>{item.tenTrinhDo ? item.tenTrinhDo : item.trinhDo}<br /></span></span>}
                    </>} />
                    <TableCell type='buttons' content={item} permission={{ write: true, delete: true }}
                        onEdit={() => this.modal.show({ email: this.state.email, item: item, shcc: this.state.shcc })}
                        onDelete={this.delete}></TableCell>
                </tr>
            )
        })
    );

    value = (item) => {
        item && this.setState({
            tienSi: item.tienSi ? 1 : 0, thacSi: item.thacSi ? 1 : 0, cuNhan: item.cuNhan ? 1 : 0,
            shcc: item.shcc, email: item.email,
            tinHoc: item.tinHoc, llct: item.llct, qlnn: item.qlnn, dataDaoTaoCurrent: item.daoTaoCurrent ? item.daoTaoCurrent : []
        }, () => {
            this.thacSi.value(item.thacSi ? item.thacSi : 0);
            this.tienSi.value(item.tienSi ? item.tienSi : 0);
            this.cuNhan.value(item.cuNhan ? item.cuNhan : 0);

            this.state.tienSi && this.hocViTienSi.value(item.shcc, item.email, '4', '4');
            this.state.cuNhan && this.hocViCuNhan.value(item.shcc, item.email, '3', '1');
            this.state.thacSi && this.hocViThacSi.value(item.shcc, item.email, '4', '3');

            this.trinhDoPhoThong.value(item.trinhDoPhoThong ? item.trinhDoPhoThong : '');
            this.ngoaiNgu.value(item.shcc, item.email);

            this.trinhDoTinHoc.value(this.state.tinHoc ? this.state.tinHoc.trinhDo :
                <button className='btn btn-info' type='button' onClick={e => {
                    e.preventDefault();
                    this.modal.show({ email: this.state.email, shcc: this.state.shcc, loaiBangCap: '6' });
                }}>
                    <i className='fa fa-fw fa-lg fa-plus' />Thêm chứng chỉ tin học
                </button>);

            this.trinhDoLLCT.value(this.state.llct ? this.state.llct.trinhDo :
                <button className='btn btn-info' type='button' onClick={e => {
                    e.preventDefault();
                    this.modal.show({ email: this.state.email, shcc: this.state.shcc, loaiBangCap: '7' });
                }}><i className='fa fa-fw fa-lg fa-plus' />Thêm chứng chỉ/chứng nhận LLCT
                </button>);

            this.quanLyNhaNuoc.value(this.state.qlnn ? this.state.qlnn.trinhDo :
                <button className='btn btn-info' type='button' onClick={e => {
                    e.preventDefault();
                    this.modal.show({ email: this.state.email, shcc: this.state.shcc, loaiBangCap: '8' });
                }}><i className='fa fa-fw fa-lg fa-plus' />Thêm chứng chỉ/chứng nhận QLNN
                </button>);

            if (item.llct) {
                this.namCapCcLyLuan.value((item.llct.batDau ? T.dateToText(item.llct.batDau, item.llct.batDauType) : '') + (item.llct.ketThuc ? (item.llct.ketThuc == -1 ? 'Đến nay' : ' - ' + T.dateToText(item.llct.ketThuc, item.llct.ketThucType)) : ''));
                this.noiCapCcLyLuan.value(item.llct.tenCoSoDaoTao ? item.llct.tenCoSoDaoTao : '');
            }

            if (item.qlnn) {
                this.namCapQlnn.value((item.qlnn.batDau ? 'Từ ' + T.dateToText(item.qlnn.batDau, item.qlnn.batDauType) : '') + (item.qlnn.ketThuc ? ' - ' + 'Đến ' + T.dateToText(item.qlnn.ketThuc, item.qlnn.ketThucType ? item.qlnn.ketThucType : 'dd/mm/yyyy') : ''));
                this.noiCapQlnn.value(item.qlnn.tenCoSoDaoTao ? item.qlnn.tenCoSoDaoTao : '');
            }

            this.chucDanh.value(item.chucDanh ? item.chucDanh : '');
            this.namChucDanh.value(item.namChucDanh ? item.namChucDanh : '');
            this.coSoChucDanh.value(item.coSoChucDanh ? item.coSoChucDanh : '');
            this.chuyenNganh.value(item.chuyenNganhChucDanh ? item.chuyenNganhChucDanh : '');
        });


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
            let hocViCB = this.state.tienSi ? '02' : (this.state.thacSi ? '03' : (this.state.cuNhan ? '04' : ''));
            const data = {
                trinhDoPhoThong: this.getValue(this.trinhDoPhoThong),
                cuNhan: this.getValue(this.cuNhan) ? 1 : 0,
                tienSi: this.getValue(this.tienSi) ? 1 : 0,
                thacSi: this.getValue(this.thacSi) ? 1 : 0,
                chucDanh: this.getValue(this.chucDanh),
                hocVi: hocViCB,
                namChucDanh: this.getValue(this.namChucDanh),
                coSoChucDanh: this.getValue(this.coSoChucDanh),
                chuyenNganhChucDanh: this.getValue(this.chuyenNganh),
            };
            return data;
        }
        catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }
    render() {
        let dataDaoTao = !this.props.userEdit ? this.props.staff?.selectedItem?.daoTaoCurrent : this.props.staff?.userItem?.daoTaoCurrent;
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin về trình độ</h3>
                <div className='tile-body row'>
                    <FormTextBox ref={e => this.trinhDoPhoThong = e} label='Trình độ giáo dục phổ thông' placeholder='Nhập trình độ phổ thông (Ví dụ: 12/12)' className='form-group col-md-4' />
                    <ComponentNN ref={e => this.ngoaiNgu = e} label='Trình độ ngoại ngữ' userEdit={this.props.userEdit} />

                    <FormCheckbox ref={e => this.cuNhan = e} label='Cử nhân' onChange={value =>
                        this.setState({ cuNhan: value }, () => this.hocViCuNhan.value(this.state.shcc, this.state.email, '3', '1'))
                    } className='form-group col-md-12' />
                    <HocViDetail ref={e => this.hocViCuNhan = e} tenHocVi='Cử nhân' shcc={this.state.shcc} email={this.state.email}
                        tccb={this.props.tccb} style={{ display: this.state.cuNhan ? 'block' : 'none' }} />

                    <FormCheckbox ref={e => this.thacSi = e} label='Thạc sĩ' onChange={value =>
                        this.setState({ thacSi: value }, () => this.hocViCuNhan.value(this.state.shcc, this.state.email, '4', '3'))
                    } className='form-group col-md-12' />
                    <HocViDetail ref={e => this.hocViThacSi = e} tenHocVi='Thạc sĩ' shcc={this.state.shcc} email={this.state.email}
                        tccb={this.props.tccb} style={{ display: this.state.thacSi ? 'block' : 'none' }} />

                    <FormCheckbox ref={e => this.tienSi = e} label='Tiến sĩ' onChange={value => this.setState({ tienSi: value }, () => this.hocViTienSi.value(this.state.shcc, this.state.email, '4', '4'))} className='form-group col-md-12' />
                    <HocViDetail ref={e => this.hocViTienSi = e} tenHocVi='Tiến sĩ' shcc={this.state.shcc} email={this.state.email}
                        tccb={this.props.tccb} style={{ display: this.state.tienSi ? 'block' : 'none' }} />

                    <FormSelect ref={e => this.chucDanh = e} label='Chức danh' data={[{ id: 'PGS', text: 'Phó giáo sư' }, { id: 'GS', text: 'Giáo sư' }]} className='form-group col-md-3' allowClear />
                    <FormTextBox ref={e => this.chuyenNganh = e} label='Chuyên ngành chức danh' className='form-group col-md-3' />
                    <FormTextBox type='year' ref={e => this.namChucDanh = e} label='Năm công nhận chức danh' className='form-group col-md-3' />
                    <FormTextBox ref={e => this.coSoChucDanh = e} label='Cơ sở giáo dục công nhận' className='form-group col-md-3' />
                    <div className='form-group col-md-12' />

                    {this.state.tinHoc ? <FormSelect ref={e => this.trinhDoTinHoc = e} label='Trình độ tin học' data={SelectApdaterDmTrinhDoDaoTaoFilter('6')} className='form-group col-md-6' readOnly /> :
                        <FormTextBox ref={e => this.trinhDoTinHoc = e} label='Trình độ tin học' className='form-group col-md-12' readOnly />}
                    {this.state.tinHoc ? <div className='form-group col-md-3' style={{ textAlign: 'right' }}>
                        <button className='btn btn-warning' type='button' onClick={e => { e.preventDefault(); this.modal.show({ email: this.state.email, shcc: this.state.shcc, item: this.state.tinHoc }); }}>
                            <i className='fa fa-fw fa-lg fa-pencil' />Chỉnh sửa
                        </button>
                    </div> : null}
                    {this.state.llct ? <FormSelect ref={e => this.trinhDoLLCT = e} label={'Trình độ LLCT'} data={SelectApdaterDmTrinhDoDaoTaoFilter('7')} className='form-group col-md-3' readOnly /> :
                        <FormTextBox ref={e => this.trinhDoLLCT = e} label='Trình độ LLCT' className='form-group col-md-12' readOnly />}
                    {this.state.llct ? <FormTextBox ref={e => this.namCapCcLyLuan = e} label='Thời gian' className='form-group col-md-3' readOnly /> : null}
                    {this.state.llct ? <FormTextBox ref={e => this.noiCapCcLyLuan = e} label='Nơi cấp' className='form-group col-md-3' readOnly /> : null}
                    {this.state.llct ? <div className='form-group col-md-3' style={{ textAlign: 'right' }}>
                        <button className='btn btn-warning' type='button' onClick={e => { e.preventDefault(); this.modal.show({ email: this.state.email, shcc: this.state.shcc, item: this.state.llct }); }}>
                            <i className='fa fa-fw fa-lg fa-pencil' />Chỉnh sửa
                        </button>
                    </div> : null}

                    {this.state.qlnn ? <FormSelect ref={e => this.quanLyNhaNuoc = e} label='Trình độ QLNN' data={SelectApdaterDmTrinhDoDaoTaoFilter('8')} className='form-group col-md-2' readOnly /> :
                        <FormTextBox ref={e => this.quanLyNhaNuoc = e} label='Trình độ QLNN' className='form-group col-md-12' readOnly />}
                    {this.state.qlnn ? <FormTextBox ref={e => this.namCapQlnn = e} label='Thời gian' className='form-group col-md-4' readOnly /> : null}
                    {this.state.qlnn ? <FormTextBox ref={e => this.noiCapQlnn = e} label='Nơi cấp' className='form-group col-md-4' readOnly /> : null}
                    {this.state.qlnn ? <div className='form-group col-md-2' style={{ textAlign: 'right' }}>
                        <button className='btn btn-warning' type='button' onClick={e => { e.preventDefault(); this.modal.show({ email: this.state.email, shcc: this.state.shcc, item: this.state.qlnn }); }}>
                            <i className='fa fa-fw fa-lg fa-pencil' />Chỉnh sửa
                        </button>
                    </div> : null}

                    <div className='col-md-12 form-group'>
                        <div>Tình hình đào tạo, bồi dưỡng hiện tại</div>
                        <div className='tile-body'>{this.renderDaoTaoCurrent(dataDaoTao ? dataDaoTao : [])}</div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => { e.preventDefault(); this.modal.show({ email: this.state.email, item: null, shcc: this.state.shcc }); }}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình đào tạo hiện tại
                            </button>
                        </div>
                    </div>
                    <EditModal ref={e => this.modal = e} create={this.props.createQtDaoTaoStaffUser}
                        update={this.props.updateQtDaoTaoStaffUser} isEdit={this.props.userEdit} value={this.value} />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, userGetStaff, createQtDaoTaoStaffUser, updateQtDaoTaoStaffUser, deleteQtDaoTaoStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentTrinhDo);