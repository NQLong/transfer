import React from 'react';
import { connect } from 'react-redux';
import { getDmNgonNguAll, createDmNgonNgu, updateDmNgonNgu, deleteDmNgonNgu } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, getValue, FormImageBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { maCode: '' };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.tenNgonNgu.focus()));
    }

    onShow = (item) => {
        let { maCode, tenNgonNgu } = item ? item : { maCode: '', tenNgonNgu: '' };
        this.setState({ maCode, item });
        this.maCode.value(maCode);
        this.tenNgonNgu.value(tenNgonNgu || '');
        maCode && this.imageBox.setData('nationFlag:' + maCode);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            maCode: getValue(this.maCode).toLowerCase(),
            tenNgonNgu: getValue(this.tenNgonNgu)
        };

        if (changes.maCode == '') {
            T.notify('Mã ngô ngữ bị trống!', 'danger');
            this.maCode.focus();
        } else {
            this.state.maCode ? this.props.update(this.state.maCode, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        const maCode = this.state.maCode;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật danh mục ngoại ngữ' : 'Tạo mới danh mục ngoại ngữ',
            body: <div className='row'>
                <FormTextBox className='col-md-6' ref={e => this.maCode = e} label='Mã ngôn ngữ' readOnly={this.state.maCode ? true : readOnly} required />
                <FormTextBox className='col-md-12' ref={e => this.tenNgonNgu = e} label='Tên ngôn ngữ' readOnly={readOnly} />
                {/*<FormImageBox ref={e => this.imageBox = e} className='col-md-12' readOnly={readOnly} style={{ display: maCode ? '' : 'none' }} uploadType='NationFlag' onSuccess={() => this.props.getAll('')} />*/}
                <FormImageBox ref={e => this.imageBox = e} className='col-md-12' readOnly={readOnly} style={{ display: maCode ? '' : 'none' }} uploadType='NationFlag' />
            </div>
        });
    }
}

class DmNgonNguPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmNgonNguAll(searchText || '');
            T.showSearchBox();
            this.props.getDmNgonNguAll();
        });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin', 'Bạn có chắc bạn muốn xóa ngoại ngữ này?', true, isConfirm => isConfirm && this.props.deleteDmNgonNgu(item.maCode));
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('dmNgonNgu');
        const items = this.props.ngonNgu && this.props.ngonNgu.items ? this.props.ngonNgu.items : [];

        const table = renderTable({
            getDataSource: () => items,
            emptyTable: 'Không có ngôn ngữ!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '30%' }}>Mã</th>
                    <th style={{ width: '50%' }}>Tên ngoại ngữ</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Logo</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.maCode || ''} />
                    <TableCell type='link' nowrap='true' content={item.tenNgonNgu || ''} onClick={() => this.modal.show(item)} />
                    <TableCell type='image'  content={`/img/flag/${item.maCode}.png`} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục ngôn ngữ',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục ngôn ngữ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDmNgonNgu} update={this.props.updateDmNgonNgu} getAll={this.props.getDmNgonNguAll} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? () => this.modal.show() : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, ngonNgu: state.danhMuc.ngonNgu });
const mapActionsToProps = { getDmNgonNguAll, createDmNgonNgu, updateDmNgonNgu, deleteDmNgonNgu };
export default connect(mapStateToProps, mapActionsToProps)(DmNgonNguPage);