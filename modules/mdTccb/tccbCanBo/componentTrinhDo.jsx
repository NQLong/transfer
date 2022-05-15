import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import ComponentNN from '../trinhDoNgoaiNgu/componentNgoaiNgu';
import { getStaffEdit, userGetStaff } from './redux';
import DaoTaoDetail from '../qtDaoTao/daoTaoDetail';
import { createQtDaoTaoStaff, updateQtDaoTaoStaff, deleteQtDaoTaoStaff } from '../qtDaoTao/redux.jsx';
class ComponentTrinhDo extends AdminPage {
    state = { shcc: '', email: '' };

    delete = (e, item) => {
        T.confirm('Xóa thông tin quá trình đào tạo', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && this.props.deleteQtDaoTaoStaff(item.id, this.props.userEdit ? this.state.email : this.state.shcc, this.props.userEdit, () =>
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
                    <TableCell type='text' style={{}} content={item.tenTruong} />
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
            tienSi: (item.tienSi || item.daoTaoBoiDuong.some(i => i.tenTrinhDo == 'Tiến sĩ')) ? 1 : 0,
            thacSi: (item.thacSi || item.daoTaoBoiDuong.some(i => i.tenTrinhDo == 'Thạc sĩ')) ? 1 : 0,
            cuNhan: (item.cuNhan || item.daoTaoBoiDuong.some(i => i.tenTrinhDo == 'Cử nhân')) ? 1 : 0,
            shcc: item.shcc, email: item.email,
            tinHoc: item.tinHoc, llct: item.llct, qlnn: item.qlnn, dataDaoTaoCurrent: item.daoTaoCurrent ? item.daoTaoCurrent : []
        }, () => {
            this.thacSi.value(this.state.thacSi);
            this.tienSi.value(this.state.tienSi);
            this.cuNhan.value(this.state.cuNhan);

            this.trinhDoPhoThong.value(item.trinhDoPhoThong ? item.trinhDoPhoThong : '');

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
            let hocVi = this.state.tienSi ? '02' : (this.state.thacSi ? '03' : (this.state.cuNhan ? '04' : ''));
            const data = {
                trinhDoPhoThong: this.getValue(this.trinhDoPhoThong),
                cuNhan: this.getValue(this.cuNhan) ? 1 : 0,
                tienSi: this.getValue(this.tienSi) ? 1 : 0,
                thacSi: this.getValue(this.thacSi) ? 1 : 0,
                chucDanh: this.getValue(this.chucDanh),
                hocVi,
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
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin về trình độ</h3>
                <div className='tile-body row'>
                    <FormTextBox ref={e => this.trinhDoPhoThong = e} label='Trình độ giáo dục phổ thông' placeholder='Nhập trình độ phổ thông (Ví dụ: 12/12)' className='form-group col-md-4' />
                    <ComponentNN label='Trình độ ngoại ngữ' shcc={this.props.shcc} />

                    <FormCheckbox ref={e => this.cuNhan = e} label='Là Cử nhân' onChange={value => this.setState({ cuNhan: Number(value) })} className='form-group col-md-12' />
                    <DaoTaoDetail hocVi='Cử nhân' shcc={this.props.shcc} style={{ display: this.state.cuNhan ? 'block' : 'none' }} />

                    <FormCheckbox ref={e => this.thacSi = e} label='Là Thạc sĩ' onChange={value => this.setState({ thacSi: value })} className='form-group col-md-12' />
                    <DaoTaoDetail hocVi='Thạc sĩ' shcc={this.props.shcc} style={{ display: this.state.thacSi ? 'block' : 'none' }} />

                    <FormCheckbox ref={e => this.tienSi = e} label='Là Tiến sĩ' onChange={value => this.setState({ tienSi: value })} className='form-group col-md-12' />
                    <DaoTaoDetail hocVi='Tiến sĩ' shcc={this.props.shcc} style={{ display: this.state.tienSi ? 'block' : 'none' }} />

                    <FormSelect ref={e => this.chucDanh = e} label='Chức danh' data={[{ id: '02', text: 'Phó giáo sư' }, { id: '01', text: 'Giáo sư' }]} className='form-group col-md-3' allowClear />
                    <FormTextBox ref={e => this.chuyenNganh = e} label='Chuyên ngành chức danh' className='form-group col-md-3' />
                    <FormTextBox type='year' ref={e => this.namChucDanh = e} label='Năm công nhận chức danh' className='form-group col-md-3' />
                    <FormTextBox ref={e => this.coSoChucDanh = e} label='Cơ sở giáo dục công nhận' className='form-group col-md-3' />
                    <div className='form-group col-md-12' />
                    <label className='form-group col-md-12'>Tin học:</label>
                    <DaoTaoDetail chungChi='Tin học' shcc={this.props.shcc} />

                    <label className='form-group col-md-12'>Lý luận chính trị:</label>
                    <DaoTaoDetail chungChi='Lý luận chính trị' shcc={this.props.shcc} />

                    <label className='form-group col-md-12'>Quản lý nhà nước:</label>
                    <DaoTaoDetail chungChi='Quản lý nhà nước' shcc={this.props.shcc} />

                    <label className='form-group col-md-12'>Tình hình đào tạo, bồi dưỡng hiện tại:</label>
                    <DaoTaoDetail chungChi='Hiện tại' shcc={this.props.shcc} />

                    {/* <div className='col-md-12 form-group'>
                        <div>Tình hình đào tạo, bồi dưỡng hiện tại</div>
                        <div className='tile-body'>{this.renderDaoTaoCurrent(dataDaoTao ? dataDaoTao : [])}</div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => { e.preventDefault(); this.modal.show({ email: this.state.email, item: null, shcc: this.state.shcc }); }}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm quá trình đào tạo hiện tại
                            </button>
                        </div>
                    </div> */}
                    {/* <EditModal ref={e => this.modal = e} create={this.props.createQtDaoTaoStaff}
                        update={this.props.updateQtDaoTaoStaff} isEdit={this.props.userEdit} value={this.value} /> */}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, userGetStaff, createQtDaoTaoStaff, updateQtDaoTaoStaff, deleteQtDaoTaoStaff
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentTrinhDo);