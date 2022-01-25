import { SelectApdaterDmTrinhDoDaoTaoFilter } from 'modules/mdDanhMuc/dmTrinhDoDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormCheckbox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import ComponentNN from '../trinhDoNgoaiNgu/componentNgoaiNgu';
import { getStaffEdit, userGetStaff } from './redux';
import HocViDetail from '../qtDaoTao/hocViDetail';


class ChungChiModal extends AdminModal {
    state = { data: [] };
    onShow = (item) => {
        this.setState({ data: item });
    }
    render = () => {
        const renderTableDT = (items) => (
            renderTable({
                getDataSource: () => items,
                stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên cơ sở</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hình thức</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Kết quả</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chọn</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{}} content={item.tenCoSoDaoTao} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hinhThuc ? item.tenHinhThuc : ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                            {item.batDau && <span>Từ: <span style={{ color: 'blue' }}>{T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')}</span><br /></span>}
                            {item.ketThuc && <span>Đến: <span style={{ color: 'blue' }}>{T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')}</span></span>}
                        </>} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                            {item.loaiBangCap && <span style={{ color: 'blue' }}>{item.tenLoaiBangCap}<br /></span>}
                            {item.trinhDo && <span>Trình độ: <span style={{ color: 'blue' }}>{item.tenTrinhDo ? item.tenTrinhDo : item.trinhDo}<br /></span></span>}
                        </>} />
                        <TableCell type='checkbox' style={{ whiteSpace: 'nowrap' }} />
                    </tr>
                )
            })
        );

        return this.renderModal({
            title: 'Danh sách',
            size: 'large',
            body: <div>
                {renderTableDT(this.state.data)}
            </div>
        });
    }
}


class ComponentTrinhDo extends AdminPage {
    // shcc = ''; email = '';
    state = { thacSi: false, batDauThacSiType: 'mm/yyyy', ketThucThacSiType: 'mm/yyyy', shcc: '', email: '' };

    value = (item) => {
        console.log(item);
        // this.shcc = item.shcc;
        // this.state.email = item.email;
        this.setState({ tienSi: item.tienSi, thacSi: item.thacSi, cuNhan: item.cuNhan, shcc: item.shcc, email: item.email }, () => {
            this.thacSi.value(item.thacSi ? item.thacSi : 0);
            this.tienSi.value(item.tienSi ? item.tienSi : 0);
            this.cuNhan.value(item.cuNhan ? item.cuNhan : 0);
            this.state.tienSi && this.hocViTienSi.value(item.shcc, item.email);
            this.state.cuNhan && this.hocViCuNhan.value(item.shcc, item.email);
            this.state.thacSi && this.hocViThacSi.value(item.shcc, item.email);

            this.trinhDoPhoThong.value(item.trinhDoPhoThong ? item.trinhDoPhoThong : '');
            this.ngoaiNgu.value(item.shcc, item.email);

            this.trinhDoTinHoc.value(item.tinHoc?.trinhDo);
            // this.chungChiTinHoc.value(item.chungChiTinHoc ? item.chungChiTinHoc : '');
            if (item.llct) {
                this.trinhDoLLCT.value(item.llct.trinhDo ? item.llct.trinhDo : '');
                this.namCapCcLyLuan.value((item.llct.batDau ? 'Từ ' + T.dateToText(item.llct.batDau, item.llct.batDauType) : '') + ' - ' + (item.llct.ketThuc ? 'Đến ' + T.dateToText(item.llct.ketThuc, item.llct.ketThucType) : ''));
                this.noiCapCcLyLuan.value(item.llct.tenCoSoDaoTao ? item.llct.tenCoSoDaoTao : '');
            }

            if (item.qlnn) {
                this.quanLyNhaNuoc.value(item.qlnn.trinhDo ? item.qlnn.trinhDo : '');
                this.namCapQlnn.value((item.qlnn.batDau ? 'Từ ' + T.dateToText(item.qlnn.batDau, item.qlnn.batDauType) : '') + (item.qlnn.ketThuc ? ' - ' + 'Đến ' + T.dateToText(item.qlnn.ketThuc, item.qlnn.ketThucType ? item.qlnn.ketThucType : 'dd/mm/yyyy') : ''));
                this.noiCapQlnn.value(item.qlnn.tenCoSoDaoTao ? item.qlnn.tenCoSoDaoTao : '');
            }


            this.hocTapHienTai.value(item.hocTapHienTai ? item.hocTapHienTai : '');
            this.coSoHocTapHienTai.value(item.coSoHocTapHienTai ? item.coSoHocTapHienTai : '');
            this.thoiGianHocTapHienTai.value(item.thoiGianHocTapHienTai ? item.thoiGianHocTapHienTai : '');
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
            const data = {
                trinhDoPhoThong: this.getValue(this.trinhDoPhoThong),
                cuNhan: this.getValue(this.cuNhan) ? 1 : 0,
                tienSi: this.getValue(this.tienSi) ? 1 : 0,
                thacSi: this.getValue(this.thacSi) ? 1 : 0,
                hocTapHienTai: this.getValue(this.hocTapHienTai),
                coSoHocTapHienTai: this.getValue(this.coSoHocTapHienTai),
                thoiGianHocTapHienTai: this.getValue(this.thoiGianHocTapHienTai) ? this.getValue(this.thoiGianHocTapHienTai) : ''
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
        let dataDaoTao = this.props.tccb ? this.props.staff?.selectedItem?.chungChi :
            this.props.staff?.userItem?.chungChi;
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

                    <FormSelect ref={e => this.chucDanh = e} label='Chức danh' data={[{ id: '01', text: 'Phó giáo sư' }, { id: '02', text: 'Giáo sư' }]} className='form-group col-md-3' />
                    <FormTextBox ref={e => this.chuyenNganh = e} label='Chuyên ngành chức danh' className='form-group col-md-3' />
                    <FormTextBox type='year' ref={e => this.namChucDanh = e} label='Năm công nhận chức danh' className='form-group col-md-3' />
                    <FormTextBox ref={e => this.coSoChucDanh = e} label='Cơ sở giáo dục công nhận' className='form-group col-md-3' />
                    <div className='form-group col-md-12' />

                    <FormSelect ref={e => this.trinhDoTinHoc = e} label='Trình độ tin học' data={SelectApdaterDmTrinhDoDaoTaoFilter('6')} className='form-group col-md-6' readOnly />
                    {/* <FormTextBox ref={e => this.chungChiTinHoc = e} label='Chứng chỉ tin học' className='form-group col-md-3' /> <div className='form-group col-md-6' /> */}
                    <div className='form-group col-md-12' />

                    <FormSelect ref={e => this.trinhDoLLCT = e} label={'Trình độ LLCT'} data={SelectApdaterDmTrinhDoDaoTaoFilter('7')} className='form-group col-md-3' readOnly />
                    <FormTextBox ref={e => this.namCapCcLyLuan = e} label='Thời gian' className='form-group col-md-3' readOnly />
                    <FormTextBox ref={e => this.noiCapCcLyLuan = e} label='Nơi cấp' className='form-group col-md-4' readOnly />
                    <div className='form-group col-md-2' style={{ textAlign: 'right' }}><a href='Chọn trình độ khác' onClick={e => {
                        e.preventDefault();
                        this.modalChungChi.show(dataDaoTao.filter(i => i.loaiBangCap == '7'));
                    }}>Chọn trình độ khác</a></div>
                    <div className='form-group col-md-12' />

                    <FormSelect ref={e => this.quanLyNhaNuoc = e} label='Trình độ QLNN' data={SelectApdaterDmTrinhDoDaoTaoFilter('8')} className='form-group col-md-3' readOnly />
                    <FormTextBox ref={e => this.namCapQlnn = e} label='Thời gian' className='form-group col-md-3' readOnly />
                    <FormTextBox ref={e => this.noiCapQlnn = e} label='Nơi cấp  ' className='form-group col-md-4' readOnly />
                    <div className='form-group col-md-2' style={{ textAlign: 'right' }}><a href='Chọn trình độ khác' onClick={e => {
                        e.preventDefault();
                        this.modalChungChi.show(dataDaoTao.filter(i => i.loaiBangCap == '8'));
                    }}>Chọn trình độ khác</a></div>
                    <div className='form-group col-md-12' />

                    <FormTextBox ref={e => this.hocTapHienTai = e} label='Tình hình học tập, bồi dưỡng hiện tại' className='form-group col-md-4' />
                    <FormTextBox ref={e => this.coSoHocTapHienTai = e} label='Tên cơ sở đào tạo' className='form-group col-md-4' />
                    <FormTextBox ref={e => this.thoiGianHocTapHienTai = e} label='Thời gian đào tạo' className='form-group col-md-4' />
                    <ChungChiModal ref={e => this.modalChungChi = e} />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, userGetStaff
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentTrinhDo);