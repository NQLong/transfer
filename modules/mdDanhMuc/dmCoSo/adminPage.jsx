import React from 'react';
import { connect } from 'react-redux';
import { createDmCoSo, getDmCoSoAll, updateDmCoSo, deleteDmCoSo } from './redux';
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';

class EditModal extends React.Component {
    state = { active: true };
    modal = React.createRef();
    editorVi = React.createRef();
    editorEn = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => {
                $('a[href=\'#dmCoSoTabVi\']').tab('show');
                $('#dmCoSoNameVi').focus();
            });
        }, 250));
    }

    show = (item) => {
        const { ma, ten, diaChi, tenVietTat, moTa, kichHoat } = item ? item : { ma: null, ten: '', diaChi: '', tenVietTat: '', moTa: '', kichHoat: true };
        const name = T.language.parse(ten, true);
        const address = T.language.parse(diaChi, true);
        const abbreviation = T.language.parse(tenVietTat, true);
        const description = T.language.parse(moTa, true);

        $('#dmCoSoNameVi').val(name.vi);
        $('#dmCoSoNameEn').val(name.en);
        $('#dmCoSoAddressVi').val(address.vi);
        $('#dmCoSoAddressEn').val(address.en);
        $('#dmCoSoAbbreviationVi').val(abbreviation.vi);
        $('#dmCoSoAbbreviationEn').val(abbreviation.en);
        this.editorVi.current.html(description.vi);
        this.editorEn.current.html(description.en);
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    }
    hide = () => $(this.modal.current).modal('hide')

    save = (e) => {
        e.preventDefault();
        const maCoSo = $(this.modal.current).attr('data-ma'),
            changes = {
                ten: { vi: $('#dmCoSoNameVi').val().trim(), en: $('#dmCoSoNameEn').val().trim() },
                diaChi: { vi: $('#dmCoSoAddressVi').val().trim(), en: $('#dmCoSoAddressEn').val().trim() },
                tenVietTat: { vi: $('#dmCoSoAbbreviationVi').val().trim(), en: $('#dmCoSoAbbreviationEn').val().trim() },
                moTa: { vi: this.editorVi.current.html(), en: this.editorEn.current.html() },
                kichHoat: this.state.active ? '1' : '0',
            };

        if (changes.ten.vi == '') {
            T.notify('Tên cơ sở bị trống!', 'danger');
            $('a[href=\'#dmCoSoTabVi\']').tab('show');
            $('#dmCoSoNameVi').focus();
        } else if (changes.ten.en == '') {
            T.notify('Tên cơ sở bị trống!', 'danger');
            $('a[href=\'#dmCoSoTabEn\']').tab('show');
            $('#dmCoSoNameEn').focus();
        } else {
            changes.ten = JSON.stringify(changes.ten);
            changes.diaChi = JSON.stringify(changes.diaChi);
            changes.tenVietTat = JSON.stringify(changes.tenVietTat);
            changes.moTa = JSON.stringify(changes.moTa);
            if (maCoSo) {
                this.props.updateDmCoSo(maCoSo, changes);
            } else {
                this.props.createDmCoSo(changes);
            }
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Cơ sở</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#dmCoSoTabVi'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#dmCoSoTabEn'>English</a>
                                </li>

                                <div style={{ position: 'absolute', top: '16px', right: '8px' }}>
                                    <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                        <label htmlFor='dmCoSoActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                            <label>
                                                <input type='checkbox' id='dmCoSoActive' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
                                                <span className='button-indecator' />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </ul>
                            <div className='tab-content' style={{ marginTop: 8 }}>
                                <div id='dmCoSoTabVi' className='tab-pane fade show active'>
                                    <div className='form-group'>
                                        <label htmlFor='dmCoSoNameVi'>Tên cơ sở</label>
                                        <input className='form-control' id='dmCoSoNameVi' type='text' placeholder='Tên cơ sở' readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='dmCoSoAddressVi'>Địa chỉ</label>
                                        <input className='form-control' id='dmCoSoAddressVi' type='text' placeholder='Địa chỉ' readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='dmCoSoAbbreviationVi'>Tên viết tắt</label>
                                        <input className='form-control' id='dmCoSoAbbreviationVi' type='text' placeholder='Tên viết tắt' readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label>Mô tả</label>
                                        <Editor ref={this.editorVi} placeholder='Mô tả' readOnly={readOnly} />
                                    </div>
                                </div>

                                <div id='dmCoSoTabEn' className='tab-pane fade'>
                                    <div className='form-group'>
                                        <label htmlFor='dmCoSoNameEn'>Name</label>
                                        <input className='form-control' id='dmCoSoNameEn' type='text' placeholder='Name' readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='dmCoSoAddressEn'>Address</label>
                                        <input className='form-control' id='dmCoSoAddressEn' type='text' placeholder='Address' readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='dmCoSoAbbreviationEn'>Abbreviation</label>
                                        <input className='form-control' id='dmCoSoAbbreviationEn' type='text' placeholder='Abbreviation' readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label>Description</label>
                                        <Editor ref={this.editorEn} placeholder='Description' readOnly={readOnly} />
                                    </div>
                                </div>
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

class DmCoSoPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmCoSoAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => {
        this.props.updateDmCoSo(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục cơ sở', 'Bạn có chắc bạn muốn xóa cơ sở này?', true, isConfirm =>
            isConfirm && this.props.deleteDmCoSo(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmCoSo:write'),
            permissionDelete = currentPermissions.includes('dmCoSo:delete');
        let table = 'Không có danh sách cơ sở!',
            items = this.props.dmCoSo && this.props.dmCoSo.items ? this.props.dmCoSo.items : [];
        if (items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '40%' }}>Tên cơ sở</th>
                            <th style={{ width: '60%' }}>Địa chỉ</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{T.language.parse(item.ten, true).vi}</a></td>
                                <td>{T.language.parse(item.diaChi, true).vi}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat == '1' ? true : false} onChange={() => permissionWrite && this.changeActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permissionDelete &&
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-trash-o fa-lg' />
                                            </a>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Cơ sở</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Cơ sở
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    createDmCoSo={this.props.createDmCoSo} updateDmCoSo={this.props.updateDmCoSo} />
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmCoSo: state.dmCoSo });
const mapActionsToProps = { getDmCoSoAll, createDmCoSo, updateDmCoSo, deleteDmCoSo };
export default connect(mapStateToProps, mapActionsToProps)(DmCoSoPage);