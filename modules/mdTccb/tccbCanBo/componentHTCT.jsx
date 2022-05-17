import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormCheckbox, FormRichTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import Pagination from 'view/component/Pagination';
import {
    getQtHocTapCongTacUserPage, updateQtHocTapCongTacUserPage, deleteQtHocTapCongTacUserPage,
    createQtHocTapCongTacUserPage
} from '../qtHocTapCongTac/redux';


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
        id: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    };

    onShow = (item) => {
        let { id, noiDung, batDau, batDauType, ketThuc, ketThucType } = item && item.item ? item.item : {
            id: '', noiDung: '', batDau: null, batDauType: '', ketThuc: null, ketThucType: ''
        };
        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc,
            shcc: item.shcc
        }, () => {
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.state.ketThuc != -1 && this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            if (this.state.ketThuc == -1) {
                this.setState({ denNay: true });
                this.denNayCheck.value(true);
                $('#ketThucDate').hide();
            } else {
                this.setState({ denNay: false });
                this.denNayCheck.value(false);
                $('#ketThucDate').show();
            }
            this.batDau.setVal(batDau ? batDau : '');
            this.state.ketThuc != -1 && this.ketThuc.setVal(ketThuc ? ketThuc : '');
            this.noiDung.value(noiDung ? noiDung : '');
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: !this.state.denNay ? this.state.ketThucType : '',
            ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1,
            noiDung: this.noiDung.value()
        };
        if (!this.noiDung.value()) {
            T.notify('Nội dung học tập, công tác trống', 'danger');
            this.noiDung.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu học tập, công tác trống', 'danger');
            this.batDau.focus();
        } else if (!this.state.denNay && !this.ketThuc.getVal()) {
            T.notify('Ngày kết thúc học tập, công tác trống', 'danger');
            this.ketThuc.focus();
        } else if (!this.state.denNay && this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày bắt đầu lớn hơn ngày kết thúc', 'danger');
            this.batDau.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

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
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật thông tin học tập công tác' : 'Tạo mới thông tin học tập công tác',
            size: 'large',
            body: <div className='row'>
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} readOnly={readOnly} label='Nội dung' placeholder='Nhập nội dung' required />

                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu:&nbsp;<Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <FormCheckbox ref={e => this.denNayCheck = e} label='Đến nay' onChange={this.handleKetThuc} className='form-group col-md-3' />
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc:&nbsp;<Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} /></div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
            </div>
        });
    }
}
export class ComponentHTCT extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { listShcc: shcc, listDv: '', fromYear: null, toYear: null, timeType: 0, tinhTrang: null } });
            this.getPage();
        });
    }
    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtHocTapCongTacUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.listShcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin học tập công tác', 'Bạn có chắc bạn muốn xóa thông tin học tập công tác này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHocTapCongTacUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin học tập công tác bị lỗi!', 'danger');
                else T.alert('Xoá thông tin học tập công tác thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        let permission = this.getUserPermission('staff', ['login']);
        if (permission.login == true) {
            permission = {
                write: true,
                delete: true
            };
        }

        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtHocTapCongTac && this.props.qtHocTapCongTac.userPage ? this.props.qtHocTapCongTac.userPage : { pageNumber: 1, pageSize: 25, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderTable({
            emptyTable: 'Chưa có dữ liệu học tập - công tác',
            getDataSource: () => list,
            stickyHead: false,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Nội dung</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' content={(<i>{item.noiDung ? item.noiDung : ''}</i>)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                        </>
                    )}
                    />
                    <TableCell type='text' content={(
                        <>
                            <span>{(item.ketThuc == -1 || item.ketThuc >= item.today) ? <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đang diễn ra</span> : <span style={{ color: 'grey', whiteSpace: 'nowrap' }}>Đã kết thúc</span>}</span>
                        </>
                    )} />
                    {
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ item, shcc: this.state.filter.listShcc })} onDelete={this.delete} />
                    }
                </tr>
            )
        });
        return (
            <div className='tile'>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 className='tile-title'>Quá trình học tập, công tác</h4>
                    <div><Pagination style={{ position: 'initial' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={e => e.preventDefault() || this.getPage()} /></div>
                </div>
                <div className='tile-body'>{table}</div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <Tooltip title='Thêm quá trình học tập - công tác' arrow>
                        <button className='btn btn-info' onClick={e => e.preventDefault() || this.modal.show({ shcc: this.state.filter.listShcc })}>
                            <i className='fa fa-lg fa-plus' /> Thêm thông tin học tập - công tác
                        </button>
                    </Tooltip>
                </div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createQtHocTapCongTacUserPage} update={this.props.updateQtHocTapCongTacUserPage}
                />
            </div>
        );
    }

}
const mapStateToProps = state => ({ qtHocTapCongTac: state.tccb.qtHocTapCongTac, system: state.system });
const mapActionsToProps = {
    getQtHocTapCongTacUserPage, updateQtHocTapCongTacUserPage, deleteQtHocTapCongTacUserPage,
    createQtHocTapCongTacUserPage
};
export default connect(mapStateToProps, mapActionsToProps)(ComponentHTCT);