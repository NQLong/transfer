import React from 'react';
import { connect } from 'react-redux';
import { getDmNgachLuongAll, createDmNgachLuong, deleteDmNgachLuong, updateDmNgachLuong } from './redux';
import { SelectAdapter_DmNgachCdnn } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { NumberInput, Select } from 'view/component/Input';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { vuotKhung: false }
    modal = React.createRef();
    maSoCdnn = React.createRef();
    bac = React.createRef();
    heSo = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => {
                this.state.vuotKhung ? this.heSo.current.focus() : this.bac.current.focus();
            });
        }, 250));
    }

    show = (item) => {
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

        this.maSoCdnn.current.setVal(idNgach);
        this.bac.current.setVal(bac);
        this.heSo.current.setVal(heSo);

        this.setState({ vuotKhung: bac === 0 }, () => {
            $(this.modal.current).attr('data-bac', bac).attr('data-idNgach', idNgach).modal('show');
        });
    }
    hide = () => $(this.modal.current).modal('hide')

    save = (e) => {
        e.preventDefault();
        const modal = $(this.modal.current),
            idNgach = modal.attr('data-idNgach'),
            bac = modal.attr('data-bac'),
            changes = {
                idNgach: Number(this.maSoCdnn.current.getVal()),
                bac: this.state.vuotKhung ? 0 : this.bac.current.getVal(),
                heSo: this.heSo.current.getVal(),
            }
        if (changes.idNgach == '') {
            T.notify('Vui lòng chọn ngạch!', 'danger');
            this.maSoCdnn.current.focus();
        } else if (this.state.vuotKhung == false && changes.bac == '') {
            T.notify('Bậc lương bị trống!', 'danger');
            this.bac.current.focus();
        } else if (changes.heSo == '') {
            T.notify('Hệ số lương bị trống!', 'danger');
            this.heSo.current.focus();
        } else {
            if (idNgach && bac) {
                this.props.update(idNgach, bac, changes);
            } else {
                this.props.create(changes);
            }
            modal.modal('hide');
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Ngạch lương hệ số</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <Select ref={this.maSoCdnn} required adapter={SelectAdapter_DmNgachCdnn} label='Chức danh nghề nghiệp' disabled={readOnly} />
                            </div>
                            <div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
                                <label htmlFor='dmNgachLuongVuotKhung'>Vượt khung: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmNgachLuongVuotKhung' checked={this.state.vuotKhung} onChange={() => !readOnly && this.setState({ vuotKhung: !this.state.vuotKhung })} />
                                        <span className='button-indecator' />
                                    </label>
                                </div>
                            </div>
                            <div className='form-group' style={{ display: this.state.vuotKhung ? 'none' : 'block' }}>
                                <NumberInput ref={this.bac} label='Bậc lương' disabled={readOnly} min={0} max={1000} step={1} />
                            </div>
                            <div className='form-group'>
                                <NumberInput ref={this.heSo} required label={this.state.vuotKhung ? 'Phần trăm vượt khung (%)' : 'Hệ số lương'} disabled={readOnly} min={0} max={1000} step='any' />
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

class AdminPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmNgachLuongAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    delete = (e, idNgach, bac) => {
        e.preventDefault();
        T.confirm('Xóa danh mục ngạch lương', 'Bạn có chắc bạn muốn xóa ngạch lương này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNgachLuong(idNgach, bac));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmNgachLuong:write'),
            permissionDelete = currentPermissions.includes('dmNgachLuong:delete');
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

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Ngạch lương</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Ngạch lương
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    create={this.props.createDmNgachLuong} update={this.props.updateDmNgachLuong} />
                {/* {permissionWrite && (
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>)} */}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmNgachLuong: state.dmNgachLuong });
const mapActionsToProps = { getDmNgachLuongAll, createDmNgachLuong, deleteDmNgachLuong, updateDmNgachLuong };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);