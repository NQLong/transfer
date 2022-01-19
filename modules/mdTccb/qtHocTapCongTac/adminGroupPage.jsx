import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtHocTapCongTacGroupPageMa, deleteQtHocTapCongTacGroupPageMa,
    getQtHocTapCongTacPage,
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { DateInput } from 'view/component/Input';
import Dropdown from 'view/component/Dropdown';

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
    }

    onShow = (item) => {
        let { id, shcc, noiDung, batDau, batDauType, ketThuc, ketThucType } = item ? item : {
            id: '', ho: '', ten: '', shcc: '', noiDung: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: ''
        };
        this.setState({ id });
        setTimeout(() => {
            this.shcc.value(shcc);
            this.batDau.value(batDau);
            this.batDauType.value(batDauType);
            this.ketThuc.value(ketThuc);
            this.ketThucType.value(ketThucType);
            this.noiDung.value(noiDung);
        }, 500);
    }

    onSubmit = () => {
        const changes = {
            shcc: this.shcc.value(),
            batDau: Number(this.batDau.value()),
            batDauType: this.batDauType.value(),
            ketThuc: Number(this.ketThuc.value()),
            ketThucType: this.ketThucType.value(),
            noiDung: this.noiDung.value(),
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
            this.maCanBo.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide, false) : this.props.create(changes, this.hide, false);
        }
    }

    render = () => {
        // const readOnly = this.state.ma ? true : this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật thông tin học tập công tác' : 'Tạo mới thông tin học tập công tác',
            size: 'large',
            body: <div className='row'>
                <FormSelect type='text' className='col-md-12' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly={this.state.id ? true : false} />
                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} />
                </div>
                <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} />)</div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} />
                </div>
                <FormRichTextBox type='text' className='col-md-12' ref={e => this.noiDung = e} label={'Nội dung'} />
            </div>,
        });
    }
}

class QtHocTapCongTacGroupPage extends AdminPage {
    ma = ''; loaiDoiTuong = '-1';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/hoc-tap-cong-tac/:ma'),
                params = route.parse(window.location.pathname);
            this.ma = params.ma;
            T.onSearch = (searchText) => {
                this.props.getQtHocTapCongTacPage(undefined, undefined, searchText || '', this.ma);
            };
            T.showSearchBox();
            this.props.getQtHocTapCongTacPage(undefined, undefined, this.ma, () => {
                T.updatePage('pageQtHocTapCongTac', undefined, undefined, '');
            });
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin học tập công tác', 'Bạn có chắc bạn muốn xóa thông tin học tập công tác này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHocTapCongTacGroupPageMa(item.ma, item.shcc, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin học tập công tác bị lỗi!', 'danger');
                else T.alert('Xoá thông tin học tập công tác thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtHocTapCongTac', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtHocTapCongTac && this.props.qtHocTapCongTac.page ? this.props.qtHocTapCongTac.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian</th>
                        <th style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center' }}>Nội dung</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenC : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span><i>Bắt đầu: </i></span><span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span> <br />
                                <span><i>Kết thúc: </i></span><span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span> <br />
                            </>
                        )}
                        />
                        <TableCell type='text' content={item.noiDung} />
                        {
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Quá trình học tập công tác',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình học tập công tác'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtHocTapCongTacPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                    update={this.props.updateQtHocTapCongTacGroupPageMa}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/hoc-tap-cong-tac',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHocTapCongTac: state.qtHocTapCongTac });
const mapActionsToProps = {
    updateQtHocTapCongTacGroupPageMa, deleteQtHocTapCongTacGroupPageMa,
    getQtHocTapCongTacPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtHocTapCongTacGroupPage);