import React from 'react';
import { connect } from 'react-redux';
import { createDmChungChiTiengAnh, getDmChungChiTiengAnhAll, updateDmChungChiTiengAnh, deleteDmChungChiTiengAnh } from './redux';
import Editor from 'view/component/CkEditor4';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { kichHoat: true };
    modal = React.createRef();
    editorVi = React.createRef();
    editorEn = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => {
                $(`a[href='#dmChungChiTiengAnhTabVi']`).tab('show');
                $('#dmCCTATen').focus();
            });
        }, 250));
    }

    show = (item) => {
        let { ma, ten, moTa, kichHoat } = item ? item : { ma: '', ten: '', moTa: '', kichHoat: true };
        moTa = T.language.parse(moTa, true);

        $('#dmCCTATen').val(ten);
        this.editorVi.current.html(moTa.vi);
        this.editorEn.current.html(moTa.en);
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-id', ma).modal('show');
    }

    hide = () => $(this.modal.current).modal('hide')

    save = e => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ten: $('#dmCCTATen').val().trim(),
                moTa: JSON.stringify({ vi: this.editorVi.current.html(), en: this.editorEn.current.html() }),
                kichHoat: Number(this.state.kichHoat),
            }

        if (changes.ten == '') {
            T.notify('Tên chứng chỉ tiếng Anh bị trống!', 'danger');
            $('#dmCCTATen').focus();
        } else {
            if (ma) {
                this.props.updateDmChungChiTiengAnh(ma, changes);
            } else {
                this.props.createDmChungChiTiengAnh(changes);
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
                            <h5 className='modal-title'>Chứng chỉ tiếng Anh</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#dmChungChiTiengAnhTabVi'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#dmChungChiTiengAnhTabEn'>English</a>
                                </li>

                                <div style={{ position: 'absolute', top: '16px', right: '8px' }}>
                                    <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                        <label htmlFor='dmCCTAkichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                            <label>
                                                <input type='checkbox' id='dmCCTAkichHoat' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
                                                <span className='button-indecator' />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </ul>
                            <div className='tab-content' style={{ marginTop: 8 }}>
                                <div className='form-group row'>
                                    <div className='col-12 col-sm-12'>
                                        <label htmlFor='dmCCTATen'>Tên chứng chỉ</label>
                                        <input className='form-control' id='dmCCTATen' type='text' placeholder='Tên' readOnly={readOnly} />
                                    </div>
                                </div>
                                <div id='dmChungChiTiengAnhTabVi' className='tab-pane fade show active'>
                                    <div className='form-group'>
                                        <label>Mô tả</label>
                                        <Editor ref={this.editorVi} height='200px' placeholder='Mô tả' />
                                    </div>
                                </div>
                                <div id='dmChungChiTiengAnhTabEn' className='tab-pane fade'>
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

class DmChungChiTiengAnhPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmChungChiTiengAnhAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục chứng chỉ tiếng Anh', 'Bạn có chắc bạn muốn xóa chứng chỉ tiếng Anh này?', true, isConfirm =>
            isConfirm && this.props.deleteDmChungChiTiengAnh(item.ma));
    }

    changeKichHoat = item => this.props.updateDmChungChiTiengAnh(item.ma, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmChungChiTiengAnh:write'),
            permissionDelete = currentPermissions.includes('dmChungChiTiengAnh:delete');
        let table = 'Không có dữ liệu chứng chỉ tiếng Anh!',
            items = this.props.dmChungChiTiengAnh && this.props.dmChungChiTiengAnh.items;
        if (items && items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                            <th style={{ width: '100%' }} nowrap='true'>Chứng chỉ tiếng Anh</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ten}</a></td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={() => permissionWrite && this.changeKichHoat(item)} />
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Chứng chỉ tiếng Anh</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Chứng chỉ tiếng Anh
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} createDmChungChiTiengAnh={this.props.createDmChungChiTiengAnh} updateDmChungChiTiengAnh={this.props.updateDmChungChiTiengAnh} />
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmChungChiTiengAnh: state.dmChungChiTiengAnh });
const mapActionsToProps = { getDmChungChiTiengAnhAll, createDmChungChiTiengAnh, updateDmChungChiTiengAnh, deleteDmChungChiTiengAnh };
export default connect(mapStateToProps, mapActionsToProps)(DmChungChiTiengAnhPage);
