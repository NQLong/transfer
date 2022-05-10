import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';
import {
    createMultiQtKeoDaiCongTac, getListInYear
} from './redux';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

const
    start = new Date().getFullYear(),
    end = start + 50,
    yearSelector = [...Array(end - start + 1).keys()].map(i => ({
        id: i + start,
        text: i + start
    }));

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
class EditModal extends AdminModal {
    state = {
        id: null,
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    };


    onShow = (item) => {
        let { shcc, batDau, batDauType, ketThuc, ketThucType, phai, ngaySinh, ngayNghiHuu } = item ? item.item : {
            shcc: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', phai: '', ngaySinh: '', ngayNghiHuu: '',
        }, index = item.index;
        this.setState({
            batDauType: 'dd/mm/yyyy',
            ketThucType: 'dd/mm/yyyy',
            batDau, ketThuc, index
        }, () => {
            this.shcc.value(shcc);
            this.phai.value(phai == '01' ? 'Nam' : 'Nữ');
            this.ngaySinh.value(ngaySinh);
            this.ngayNghiHuu.value(ngayNghiHuu);
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.batDau.setVal(batDau ? batDau : '');
            this.state.ketThuc != -1 && this.ketThuc.setVal(ketThuc ? ketThuc : '');
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: this.state.ketThucType,
            ketThuc: this.ketThuc.getVal(),
        };
        if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu kéo dài công tác trống', 'danger');
            this.batDau.focus();
        } else if (!this.ketThuc.getVal()) {
            T.notify('Ngày kết thúc kéo dài công tác trống', 'danger');
            this.ketThuc.focus();
        } else if (this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày bắt đầu lớn hơn ngày kết thúc', 'danger');
            this.batDau.focus();
        } else this.props.update(this.state.index, changes, this.hide);
    }


    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật thông tin kéo dài công tác',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly={true} required />
                <FormTextBox className='col-md-4' ref={e => this.phai = e} type='text' label='Giới tính' readOnly={true} required />
                <FormDatePicker className='col-md-8' ref={e => this.ngaySinh = e} type='date-mask' label='Ngày sinh' readOnly={true} required />
                <FormDatePicker className='col-md-12' ref={e => this.ngayNghiHuu = e} type='date-mask' label='Ngày nghỉ hưu' readOnly={true} required />
                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={true} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={true} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} readOnly={readOnly} /></div>
            </div>,
        });
    }
}

class CreateListYear extends AdminPage {
    state = {
        listData: [],
    }

    delete = (index, done) => {
        T.confirm('Xóa dữ liệu', 'Bạn có chắc bạn muốn xóa dữ liệu này?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const listData = this.state.listData;
                listData.splice(index, 1);
                this.setState({ listData }
                , () => T.notify('Cập nhật dữ liệu thành công', 'success'));
                done && done();
            }
        });
    };

    tableList = (data, permission) => {
        return renderTable({
            getDataSource: () => data,
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày nghỉ hưu</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Chức danh khoa học<br />Trình độ chuyên môn</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={ index + 1 } />
                    <TableCell type='link' onClick={() => this.modal.show({ index, item })} style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                            {item.shcc}
                        </>
                    )} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.phai == '01' ? 'Nam' : 'Nữ'} />
                    <TableCell type='date' style={{ whiteSpace: 'nowrap', color: 'blue' }} dateFormat='dd/mm/yyyy' content={item.ngaySinh} />
                    <TableCell type='date' style={{ whiteSpace: 'nowrap', color: 'blue' }} dateFormat='dd/mm/yyyy' content={item.ngayNghiHuu} />
                    <TableCell type='text' content={<>
                        {item.tenChucDanh && <span> {item.tenChucDanh}<br /></span>}
                        {item.tenHocVi}
                    </>} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                    <TableCell type='text' content={(
                        <>
                            {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            {item.ketThuc ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                        </>
                    )}
                    />
                    {
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ index, item })} onDelete={() => this.delete(index)} >
                        </TableCell>
                    }
                </tr>
            )
        });
    }

    handleTime = (value) => {
        if (value) {
            let year = parseInt(value.id);
            this.props.getListInYear(year, (listData) => {
                this.setState({ listData });
            });
        } else {
            this.setState({ listData: [] });
        }
    }

    update = (index, changes, done) => {
        const listData = this.state.listData, currentValue = listData[index];
        const updateValue = Object.assign({}, currentValue, changes);
        listData.splice(index, 1, updateValue);
        this.setState({ listData }
        , () => T.notify('Cập nhật dữ liệu thành công', 'success'));
        done && done();
    };

    save = (e) => {
        const doSave = () => {
            const data = this.state.listData;
            this.props.createMultiQtKeoDaiCongTac(data, (error, data) => {
                if (error) T.notify('Cập nhật dữ liệu bị lỗi!', 'danger');
                else {
                    this.setState({ listData: [] });
                    T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''} kéo dài công tác thành công!`, 'success');
                    this.props.history.push('/user/tccb/qua-trinh/keo-dai-cong-tac');
                }
            });
        };
        e.preventDefault();
        T.confirm('Cập nhật dữ liệu', 'Bạn có muốn thêm những dữ liệu về kéo dài công tác này không?', 'warning', true, isConfirm => {
            isConfirm && doSave();
        });
    };

    render() {
        const { listData } = this.state,
            permission = this.getUserPermission('qtKeoDaiCongTac', ['read', 'write', 'delete']);
        return this.renderPage({
            icon: 'fa fa-hourglass-start',
            title: 'Tạo danh sách kéo dài công tác',
            breadcrumb: [<Link key={0} to='/user/tccb/qua-trinh/keo-dai-cong-tac'>Quá trình kéo dài công tác</Link>, 'Import'],
            content: <>
                <FormSelect style={{ width: '150px', marginBottom: '0' }} allowClear={true} placeholder='Năm' onChange={this.handleTime} data={yearSelector} />
                <div className='tile'>{this.tableList(listData, permission)}</div>
                <EditModal ref={e => this.modal = e} permission={permission} readOnly={!permission.write} update={this.update} />
            </>,
            onSave: (e) => this.save(e),
            backRoute: '/user/tccb/qua-trinh/keo-dai-cong-tac',
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = {
    createMultiQtKeoDaiCongTac, getListInYear
};
export default connect(mapStateToProps, mapActionsToProps)(CreateListYear);
