import React from 'react';
import { connect } from 'react-redux';
import { getDmPhongAll, deleteDmPhong, createDmPhong, updateDmPhong } from './redux';
import { getDmCoSoAll } from 'modules/mdDanhMuc/dmCoSo/redux';
import { getDmToaNhaAll } from 'modules/mdDanhMuc/dmToaNha/redux';
import Editor from 'view/component/CkEditor4';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { kichHoat: 1 };
    modal = React.createRef();
    editorVi = React.createRef();
    editorEn = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => {
                $('a[href=\'#dmPhongTabVi\']').tab('show');
                $('#dmPhongNameVi').focus();
            });
            $('#categoryBuilding').select2({ minimumResultsForSearch: -1 });
        }, 250));
    }

    show = (item) => {
        let { ma, ten, toaNha, moTa, kichHoat } = item ? item : { ma: '', ten: '', toaNha: '', moTa: '', kichHoat: 1 };
        ten = T.language.parse(ten, true);
        moTa = T.language.parse(moTa, true);

        $('#categoryRoomBuilding').val(toaNha ? item.toaNha : '');
        $('#categoryRoomBuilding').select2({ minimumResultsForSearch: -1 }).trigger('change');

        $('#dmPhongName').val(ten.vi);
        this.editorVi.current.html(moTa.vi);
        this.editorEn.current.html(moTa.en);
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-id', ma).modal('show');
    }

    hide = () => $(this.modal.current).modal('hide');

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ten: JSON.stringify({ vi: $('#dmPhongName').val().trim(), en: $('#dmPhongName').val().trim() }),
                toaNha: $('#categoryRoomBuilding').val(),
                moTa: JSON.stringify({ vi: this.editorVi.current.html(), en: this.editorEn.current.html() }),
                kichHoat: this.state.kichHoat,
            };
        if (changes.ten == '') {
            T.notify('Tên phòng học bị trống!', 'danger');
            $('a[href=\'#dmPhongTabVi\']').tab('show');
            $('#dmPhongName').focus();
        } else if (changes.toaNha == null) {
            T.notify('Toà nhà chưa được chọn!', 'danger');
        } else {
            if (ma) {
                this.props.updateDmPhong(ma, changes);
            } else {
                this.props.createDmPhong(changes);
            }
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        let listToaNha = this.props.building;
        if (typeof listToaNha == 'object') listToaNha = Object.values(listToaNha);
        const listToaNhaOption = listToaNha.map(item => <option key={item.ma} value={item.ma}>{T.language.parse(item.ten, true).vi}</option>);

        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Phòng học</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#dmPhongTabVi'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#dmPhongTabEn'>English</a>
                                </li>

                                <div style={{ position: 'absolute', top: '16px', right: '8px' }}>
                                    <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                        <label htmlFor='dmPhongActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                            <label>
                                                <input type='checkbox' id='dmPhongActive' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
                                                <span className='button-indecator' />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </ul>
                            <div className='tab-content' style={{ marginTop: 8 }}>
                                <div className='form-group row'>
                                    <div className='col-12 col-sm-6'>
                                        <label htmlFor='dmPhongName'>Tên phòng học</label>
                                        <input className='form-control' id='dmPhongName' type='text' placeholder='Tên phòng học' />
                                    </div>
                                    <div className='col-12 col-sm-6'>
                                        <label className='control-label' htmlFor='dmPhongBuilding'>Toà nhà</label>
                                        <select className='form-control' id='categoryRoomBuilding'>{listToaNhaOption}</select>
                                    </div>
                                </div>

                                <div id='dmPhongTabVi' className='tab-pane fade show active'>
                                    <div className='form-group'>
                                        <label>Mô tả</label>
                                        <Editor ref={this.editorVi} height='200px' placeholder='Mô tả' />
                                    </div>
                                </div>
                                <div id='dmPhongTabEn' className='tab-pane fade'>
                                    <div className='form-group'>
                                        <label>Description</label>
                                        <Editor ref={this.editorEn} height='200px' placeholder='Description' />
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

class DmPhongPage extends React.Component {
    modal = React.createRef();
    uploadDmPhongModal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmPhongAll();
        this.props.getDmToaNhaAll();
        this.props.getDmCoSoAll();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    changeActive = item => this.props.updateDmPhong(item.ma, { kichHoat: Number(!item.kichHoat) });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa phòng', 'Bạn có chắc bạn muốn xóa phòng này?', true, isConfirm =>
            isConfirm && this.props.deleteDmPhong(item.ma));
    }

    uploadDmPhong = (e) => {
        e.preventDefault();
        this.uploadDmPhongModal.current.show();
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmPhong:write'),
            permissionDelete = currentPermissions.includes('dmPhong:delete'),
            permissionUpload = currentPermissions.includes('dmPhong:upload');
        let listToaNha = this.props.dmToaNha && this.props.dmToaNha.items ? this.props.dmToaNha.items : [],
            toaNhaMapper = {};
        listToaNha.forEach(item => toaNhaMapper[item.ma] = item.ten);

        let table = 'Không có phòng học!',
            items = this.props.dmPhong && this.props.dmPhong.items ? this.props.dmPhong.items : [];
        if (items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '50%' }}>Tên phòng</th>
                            <td style={{ width: '50%' }}>Tòa nhà</td>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <a href='#' onClick={e => this.edit(e, item)}>{item.ten ? T.language.parse(item.ten, true).vi : ''}</a>
                                </td>
                                <td>{toaNhaMapper[item.toaNha] ? T.language.parse(toaNhaMapper[item.toaNha], true).vi : ''}</td>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Phòng</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Phòng
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} building={listToaNha}
                    createDmPhong={this.props.createDmPhong} updateDmPhong={this.props.updateDmPhong} categoryCampuses={this.props.categoryCampus} />
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {permissionUpload &&
                    <Link to='/user/danh-muc/phong/upload' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
                        <i className='fa fa-lg fa-cloud-upload' />
                    </Link>}
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmPhong: state.dmPhong, categoryCampus: state.dmCoSo, dmToaNha: state.dmToaNha });
const mapActionsToProps = { getDmCoSoAll, getDmToaNhaAll, getDmPhongAll, deleteDmPhong, createDmPhong, updateDmPhong };
export default connect(mapStateToProps, mapActionsToProps)(DmPhongPage);