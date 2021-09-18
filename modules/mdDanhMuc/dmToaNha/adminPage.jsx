import React from 'react';
import { connect } from 'react-redux';
import { getDmToaNhaAll, createDmToaNha, updateDmToaNha, deleteDmToaNha } from './redux';
import { getDmCoSoAll } from 'modules/mdDanhMuc/dmCoSo/redux';
import Editor from 'view/component/CkEditor4';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true };
    editorVi = '';
    editorEn = '';

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, moTa, coSo, kichHoat } = item ? item : { ma: null, ten: '', moTa: '', coSo: null, kichHoat: true };
        ten = T.language.parse(ten, true);
        moTa = T.language.parse(moTa, true);

        this.ma.value(ma);
        this.tenvi.value(ten.vi);
        this.tenen.value(ten.en);
        this.editorVi = moTa.vi;
        this.editorEn = moTa.en;
        this.coso.value(coSo ? item.coSo : '');
        this.setState({ active: kichHoat == 1 });
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const 
            changes = {
                ten: { vi: this.tenvi.value(), en: this.tenen.value() },
                moTa: { vi: this.editorVi, en: this.editorEn },
                coSo: this.coso.value(),
                kichHoat: this.state.active ? '1' : '0',
            };
        if (changes.ten.vi == '') {
            T.notify('Tên tòa nhà bị trống!', 'danger');
            this.tenvi.focus();
        } else if (changes.ten.en == '') {
            T.notify('Tên tòa nhà bị trống!', 'danger');
            this.tenen.focus();
        } else if (changes.coSo == null) {
            T.notify('Cơ sở chưa được chọn!', 'danger');
        } else {
            changes.ten = JSON.stringify(changes.ten);
            changes.moTa = JSON.stringify(changes.moTa);
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        let campuses = this.props.campuses, campusList = null;
        if (typeof (campuses) == 'object') { campuses = Object.values(campuses); }
        campusList = [];

        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.onSubmit}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin tòa nhà</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#dmToaNhaTabVi'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#dmToaNhaTabEn'>English</a>
                                </li>

                                <div style={{ position: 'absolute', top: '16px', right: '8px' }}>
                                    <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                        <label htmlFor='dmToaNhaActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                            <label>
                                                <input type='checkbox' id='dmToaNhaActive' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
                                                <span className='button-indecator' />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </ul>
                            <div className='tab-content' style={{ marginTop: 8 }}>
                                <div id='dmToaNhaTabVi' className='tab-pane fade show active'>
                                    <div className='form-group'>
                                        <label htmlFor='dmToaNhaNameVi'>Tên Tòa nhà</label>
                                        <input className='form-control' id='dmToaNhaNameVi' type='text' placeholder='Tên Tòa nhà' readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label>Mô tả</label>
                                        <Editor ref={this.editorVi} placeholder='Mô tả' readOnly={readOnly} />
                                    </div>
                                </div>

                                <div id='dmToaNhaTabEn' className='tab-pane fade'>
                                    <div className='form-group'>
                                        <label htmlFor='dmToaNhaNameEn'>Name</label>
                                        <input className='form-control' id='dmToaNhaNameEn' type='text' placeholder='Name' readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label>Description</label>
                                        <Editor ref={this.editorEn} placeholder='Description' readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>
                            <div className='form-group'>
                                <label className='control-label' htmlFor='dmToaNhaCampus'>Cơ sở trường đại học</label>
                                <select className='form-control' id='dmToaNhaCampus'>{campusList}</select>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly && <button type='submit' className='btn btn-primary'>Lưu</button>}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DmToaNhaPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmCoSoAll();
        this.props.getDmToaNhaAll();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmToaNha(item.ma, { kichHoat: item.kichHoat == '1' ? '0' : '1' });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa tòa nhà', 'Bạn có chắc bạn muốn xóa tòa nhà này?', true, isConfirm =>
            isConfirm && this.props.deleteDmToaNha(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmToaNha', ['read', 'write', 'delete']);
        let table = 'Không có tòa nhà!';
        let coSoList = this.props.categoryCampus && this.props.categoryCampus.items ? this.props.categoryCampus.items : [];
        if (typeof (coSoList) == 'object') { coSoList = Object.values(coSoList); }

        if (this.props.dmToaNha && this.props.dmToaNha.items && this.props.dmToaNha.items.length > 0) {
            table = renderTable({
                getDataSource: () => this.props.dmToaNha.items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '50%' }}>Tòa nhà</th>
                        <th style={{ width: '50%' }}>Cơ sở</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='link' content={item.tenvi} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={coSoList.find(coSo => coSo.ma == item.coSo) ? T.language.parse(coSoList.find(coSo => coSo.ma == item.coSo).ten, true).vi : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmToaNha(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Tòa nhà',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Tòa nhà'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmToaNha} update={this.props.updateDmToaNha} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmToaNha: state.dmToaNha, categoryCampus: state.dmCoSo });
const mapActionsToProps = { getDmCoSoAll, getDmToaNhaAll, createDmToaNha, updateDmToaNha, deleteDmToaNha };
export default connect(mapStateToProps, mapActionsToProps)(DmToaNhaPage);