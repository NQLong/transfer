import React from 'react';
import { connect } from 'react-redux';
import { getDmToaNhaAll, createDmToaNha, updateDmToaNha, deleteDmToaNha } from './redux';
import { getDmCoSoAll } from 'modules/mdDanhMuc/dmCoSo/redux';
import Editor from 'view/component/CkEditor4';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { active: true };
    modal = React.createRef();
    editorVi = React.createRef();
    editorEn = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => {
                $('a[href=\'#dmToaNhaTabVi\']').tab('show');
                $('#dmToaNhaNameVi').focus();
            });
            $('#categoryCampus').select2({ minimumResultsForSearch: -1 });
        }, 250));
    }

    show = (item) => {
        let { ma, ten, moTa, coSo, kichHoat } = item ? item : { ma: null, ten: '', moTa: '', coSo: null, kichHoat: true };
        ten = T.language.parse(ten, true);
        moTa = T.language.parse(moTa, true);

        $('#dmToaNhaNameVi').val(ten.vi);
        $('#dmToaNhaNameEn').val(ten.en);
        this.editorVi.current.html(moTa.vi);
        this.editorEn.current.html(moTa.en);
        $('#dmToaNhaCampus').val(coSo ? item.coSo : '');
        $('#dmToaNhaCampus').select2({ minimumResultsForSearch: -1 }).trigger('change');
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-id', ma).modal('show');
    };

    save = e => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ten: { vi: $('#dmToaNhaNameVi').val().trim(), en: $('#dmToaNhaNameEn').val().trim() },
                moTa: { vi: this.editorVi.current.html(), en: this.editorEn.current.html() },
                coSo: $('#dmToaNhaCampus').val(),
                kichHoat: this.state.active ? '1' : '0',
            };
        if (changes.ten.vi == '') {
            T.notify('Tên tòa nhà bị trống!', 'danger');
            $('a[href=\'#dmToaNhaTabVi\']').tab('show');
            $('#dmToaNhaNameVi').focus();
        } else if (changes.ten.en == '') {
            T.notify('Tên tòa nhà bị trống!', 'danger');
            $('a[href=\'#dmToaNhaTabEn\']').tab('show');
            $('#dmToaNhaNameEn').focus();
        } else if (changes.coSo == null) {
            T.notify('Cơ sở chưa được chọn!', 'danger');
        } else {
            changes.ten = JSON.stringify(changes.ten);
            changes.moTa = JSON.stringify(changes.moTa);
            if (ma) {
                this.props.updateDmToaNha(ma, changes);
            } else {
                this.props.createDmToaNha(changes);
            }
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        let campuses = this.props.campuses, campusList = null;
        if (typeof (campuses) == 'object') { campuses = Object.values(campuses); }
        campusList = campuses.map(item => <option key={item.ma} value={item.ma}>{T.language.parse(item.ten, true).vi}</option>);

        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
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

class DmToaNhaPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmCoSoAll();
        this.props.getDmToaNhaAll();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmToaNha(item.ma, { kichHoat: item.kichHoat == '1' ? '0' : '1' });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa tòa nhà', 'Bạn có chắc bạn muốn xóa tòa nhà này?', true, isConfirm =>
            isConfirm && this.props.deleteDmToaNha(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmToaNha:write'),
            permissionDelete = currentPermissions.includes('dmToaNha:delete');
        let table = 'Không có tòa nhà!';
        let coSoList = this.props.categoryCampus && this.props.categoryCampus.items ? this.props.categoryCampus.items : [];
        if (typeof (coSoList) == 'object') { coSoList = Object.values(coSoList); }

        if (this.props.dmToaNha && this.props.dmToaNha.items && this.props.dmToaNha.items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '50%' }}>Tòa nhà</th>
                            <th style={{ width: '50%' }}>Cơ sở</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.dmToaNha.items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{T.language.parse(item.ten, true).vi}</a></td>
                                <td>{coSoList.find(coSo => coSo.ma == item.coSo) ? T.language.parse(coSoList.find(coSo => coSo.ma == item.coSo).ten, true).vi : ''}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat == '1' ? true : false} onChange={e => permissionWrite && this.changeActive(item)} />
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Tòa nhà</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Tòa nhà
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} campuses={this.props.categoryCampus && this.props.categoryCampus.items ? this.props.categoryCampus.items : []}
                    createDmToaNha={this.props.createDmToaNha} updateDmToaNha={this.props.updateDmToaNha} />
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

const mapStateToProps = state => ({ system: state.system, dmToaNha: state.dmToaNha, categoryCampus: state.dmCoSo });
const mapActionsToProps = { getDmCoSoAll, getDmToaNhaAll, createDmToaNha, updateDmToaNha, deleteDmToaNha };
export default connect(mapStateToProps, mapActionsToProps)(DmToaNhaPage);