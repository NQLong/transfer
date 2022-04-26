import React from 'react';
import { connect } from 'react-redux';
import { getDmPhongAll, deleteDmPhong, createDmPhong, updateDmPhong } from './redux';
import { getDmToaNhaAll, SelectAdapter_DmToaNha } from 'modules/mdDanhMuc/dmToaNha/redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormSelect, FormRichTextBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: 1 };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, toaNha, moTa, kichHoat, sucChua } = item ? item : { ma: null, ten: '', toaNha: '', moTa: '', kichHoat: 1, sucChua: 0 };
        this.setState({ ma });
        this.toaNha.value(toaNha ? item.toaNha : '');
        this.ten.value(ten);
        this.sucChua.value(sucChua);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat);
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ten: this.ten.value().trim(),
                toaNha: this.toaNha.value(),
                moTa: this.moTa.value(),
                sucChua: this.sucChua.value(),
                kichHoat: Number(this.kichHoat.value()),
            };
        if (changes.ten == '') {
            T.notify('Tên phòng học bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.toaNha == null) {
            T.notify('Toà nhà chưa được chọn!', 'danger');
            this.toaNha.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật Phòng' : 'Tạo mới Phòng',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên phòng học' readOnly={readOnly} required />
                <FormSelect className='col-md-12' ref={e => this.toaNha = e} label='Tòa nhà' data={SelectAdapter_DmToaNha} />
                <FormRichTextBox className='col-md-12' ref={e => this.moTa = e} label='Mô tả' />
                <FormTextBox type='number' className='col-md-12' ref={e => this.sucChua = e} label='Sức chứa tối đa' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }));
    }
}

class DmPhongPage extends AdminPage {

    componentDidMount() {
        let route = T.routeMatcher('/user/:menu/phong').parse(window.location.pathname);
        this.menu = route.menu;
        T.ready(`/user/${this.menu}`);
        T.showSearchBox();
        this.props.getDmPhongAll();
        this.props.getDmToaNhaAll();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa phòng', 'Bạn có chắc bạn muốn xóa phòng này?', true, isConfirm =>
            isConfirm && this.props.deleteDmPhong(item.ma));
    }

    render() {
        const permission = this.getUserPermission('dmPhong', ['read', 'write', 'delete', 'upload']);
        let listToaNha = this.props.dmToaNha && this.props.dmToaNha.items ? this.props.dmToaNha.items : [],
            toaNhaMapper = {};
        listToaNha.forEach(item => toaNhaMapper[item.ma] = item.ten);

        let table = 'Không có phòng học!',
            items = this.props.dmPhong && this.props.dmPhong.items ? this.props.dmPhong.items : [];
        if (items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '20%' }}>Tên phòng</th>
                        <th style={{ width: '20%' }} nowrap='true'>Tòa nhà</th>
                        <th style={{ width: '60%' }} nowrap='true'>Ghi chú</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Sức chứa</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={toaNhaMapper[item.toaNha] || ''} />
                        <TableCell type='text' content={item.moTa} />
                        <TableCell style={{ textAlign: 'right' }} type='text' content={item.sucChua} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmPhong(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách Phòng học',
            breadcrumb: [
                <Link key={0} to={`/user/${this.menu}`}>{this.menu == 'dao-tao' ? 'Đào tạo' : 'Danh mục'}</Link>,
                'Phòng học'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createDmPhong} update={this.props.updateDmPhong} />
            </>,

            backRoute: `/user/${this.menu}`,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmPhong: state.danhMuc.dmPhong, dmToaNha: state.danhMuc.dmToaNha });
const mapActionsToProps = { getDmToaNhaAll, getDmPhongAll, deleteDmPhong, createDmPhong, updateDmPhong };
export default connect(mapStateToProps, mapActionsToProps)(DmPhongPage);