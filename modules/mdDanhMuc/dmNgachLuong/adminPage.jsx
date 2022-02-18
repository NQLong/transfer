import React from 'react';
import { connect } from 'react-redux';
import { getDmNgachLuongAll, createDmNgachLuong, deleteDmNgachLuong, updateDmNgachLuong } from './redux';
import { SelectAdapter_DmNgachCdnn } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { vuotKhung: false }
    maSoCdnn = '';
    bac = '';
    heSo = '';

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.state.vuotKhung ? this.heSo.focus() : this.bac.focus();
        }));
    }

    onShow = (item) => {
        // const { idNgach, bac, heSo } = item ? item : { idNgach: '', bac: 1, heSo: 0 };
        let idNgach = '', bac = '', heSo = '';
        if (item) {
            if (typeof item == 'object') {
                idNgach = item.idNgach;
                bac = item.bac;
                heSo = item.heSo;
            } else {
                idNgach = item;
            }
        }

        this.maSoCdnn.value(idNgach);
        this.bac.value(bac);
        this.heSo.value(heSo);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const
            idNgach = this.idNgach,
            bac = this.bac,
            changes = {
                idNgach: Number(this.maSoCdnn.getVal()),
                bac: this.state.vuotKhung ? 0 : this.bac.getVal(),
                heSo: this.heSo.getVal(),
            };
        if (changes.idNgach == '') {
            T.notify('Vui lòng chọn ngạch!', 'danger');
            this.maSoCdnn.focus();
        } else if (this.state.vuotKhung == false && changes.bac == '') {
            T.notify('Bậc lương bị trống!', 'danger');
            this.bac.focus();
        } else if (changes.heSo == '') {
            T.notify('Hệ số lương bị trống!', 'danger');
            this.heSo.focus();
        } else {
            idNgach && bac ? this.props.update(idNgach, bac, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return (this.renderModal({
            title: this.state.ma ? 'Cập nhật Ngạch lương' : 'Tạo mới Ngạch lương',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={this.maSoCdnn} required adapter={SelectAdapter_DmNgachCdnn} label='Chức danh nghề nghiệp' disabled={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.state.vuotKhung = e} label='Vượt khung' isSwitch={true} readOnly={readOnly} onChange={() => !readOnly && this.setState({ vuotKhung: !this.state.vuotKhung })} />
                <FormTextBox type='number' className='col-md-12' ref={this.bac} label='Bậc lương' disabled={readOnly} min={0} max={1000} step={1} />
                <FormTextBox type='number' className='col-md-12' ref={this.heSo} required label={this.state.vuotKhung ? 'Phần trăm vượt khung (%)' : 'Hệ số lương'} disabled={readOnly} min={0} max={1000} step='any' />
            </div>
        }));
    }
}

class DmNgachLuongPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmNgachLuongAll(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmNgachLuongAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, idNgach, bac) => {
        e.preventDefault();
        T.confirm('Xóa danh mục ngạch lương', 'Bạn có chắc bạn muốn xóa ngạch lương này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNgachLuong(idNgach, bac));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmNgachLuong:write'),
            permissionDelete = currentPermissions.includes('dmNgachLuong:delete'),
            permission = this.getUserPermission('dmNgachLuong', ['read', 'write', 'delete']);
        let table = 'Không có danh sách ngạch lương!',
            items = this.props.dmNgachLuong && this.props.dmNgachLuong.items ? this.props.dmNgachLuong.items : [];
        if (items.length > 0) {
            const rows = [];
            items.forEach((item, index) => {
                let luongs = item.luongs || [],
                    rowSpan = luongs.length;
                if (rowSpan) {
                    for (let i = 0; i < rowSpan; i++) {
                        const luong = luongs[i],
                            heSoLuong = luong.bac == 0 ? `VK ${luong.heSo}%` : luong.heSo.toFixed(2),
                            bacLuong = luong.bac == 0 ? 'VK' : luong.bac;
                        if (i == 0) {
                            rows.push(
                                <tr key={rows.length}>
                                    <td style={{ textAlign: 'right' }} rowSpan={rowSpan}>{index + 1}</td>
                                    <td style={{ textAlign: 'center' }} rowSpan={rowSpan}>{item.ma}</td>
                                    <td rowSpan={rowSpan}>{item.maSoCdnn}</td>
                                    <td rowSpan={rowSpan}>{item.ten}</td>
                                    <td rowSpan={rowSpan}>{item.nhom}</td>
                                    <td style={{ textAlign: 'center' }}>{bacLuong}</td>
                                    <td style={{ textAlign: 'center' }}>{heSoLuong}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className='btn-group'>
                                            {permissionWrite ?
                                                <a className='btn btn-success' href='#' onClick={e => this.edit(e, item.id)}>
                                                    <i className='fa fa-lg fa-plus' />
                                                </a> : null}
                                            <a className='btn btn-primary' href='#' onClick={e => this.edit(e, luong)}>
                                                <i className='fa fa-lg fa-edit' />
                                            </a>
                                            {permissionDelete ?
                                                <a className='btn btn-danger' href='#' onClick={e => this.delete(e, luong.idNgach, luong.bac)}>
                                                    <i className='fa fa-trash-o fa-lg' />
                                                </a> : null}
                                        </div>
                                    </td>
                                </tr>
                            );
                        } else {
                            rows.push(
                                <tr key={rows.length}>
                                    <td style={{ textAlign: 'center' }}>{bacLuong}</td>
                                    <td style={{ textAlign: 'center' }}>{heSoLuong}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className='btn-group'>
                                            {permissionWrite ?
                                                <a className='btn btn-success' href='#' onClick={e => this.edit(e, item.id)}>
                                                    <i className='fa fa-lg fa-plus' />
                                                </a> : null}
                                            <a className='btn btn-primary' href='#' onClick={e => this.edit(e, luong)}>
                                                <i className='fa fa-lg fa-edit' />
                                            </a>
                                            {permissionDelete ?
                                                <a className='btn btn-danger' href='#' onClick={e => this.delete(e, luong.idNgach, luong.bac)}>
                                                    <i className='fa fa-trash-o fa-lg' />
                                                </a> : null}
                                        </div>
                                    </td>
                                </tr>
                            );
                        }
                    }
                } else {
                    rows.push(
                        <tr key={rows.length}>
                            <td style={{ textAlign: 'right' }}>{index + 1}</td>
                            <td style={{ textAlign: 'center' }}>{item.ma}</td>
                            <td>{item.maSoCdnn}</td>
                            <td>{item.ten}</td>
                            <td>{item.nhom}</td>
                            <td></td>
                            <td></td>
                            <td>
                                <div className='btn-group'>
                                    {permissionWrite ?
                                        <a className='btn btn-success' href='#' onClick={e => this.edit(e, item.id)}>
                                            <i className='fa fa-lg fa-plus' />
                                        </a> : null}
                                </div>
                            </td>
                        </tr>
                    );
                }
            });

            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã ngạch</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã số CDNN</th>
                            <th style={{ width: '60%' }} nowrap='true'>Tên ngạch CDNN</th>
                            <th style={{ width: '40%' }} nowrap='true'>Nhóm ngạch CDNN</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Bậc lương</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Hệ số lương</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
            );
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Ngạch Lương',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Ngạch Lương'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmNgachLuong} update={this.props.updateDmNgachLuong} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNgachLuong: state.danhMuc.dmNgachLuong });
const mapActionsToProps = { getDmNgachLuongAll, createDmNgachLuong, deleteDmNgachLuong, updateDmNgachLuong };
export default connect(mapStateToProps, mapActionsToProps)(DmNgachLuongPage);