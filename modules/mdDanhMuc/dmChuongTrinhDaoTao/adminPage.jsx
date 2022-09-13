import React from 'react';
import { connect } from 'react-redux';
import { createDmChuongTrinhDaoTao, getDmChuongTrinhDaoTaoPage, updateDmChuongTrinhDaoTao, deleteDmChuongTrinhDaoTao } from './redux';
import Pagination from 'view/component/Pagination';
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
                $('a[href=\'#dmChuongTrinhDaoTaoTabVi\']').tab('show');
                $('#dmctdtTenVi').focus();
            });
        }, 250));
    }

    show = (item) => {
        let { ma, ten, moTa, kichHoat } = item ? item : { ma: '', ten: '', moTa: '', kichHoat: true };
        ten = T.language.parse(ten, true);
        moTa = T.language.parse(moTa, true);

        $('#dmctdtTenVi').val(ten.vi);
        $('#dmctdtTenEn').val(ten.en);
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
                ten: JSON.stringify({ vi: $('#dmctdtTenVi').val().trim(), en: $('#dmctdtTenEn').val().trim() }),
                moTa: JSON.stringify({ vi: this.editorVi.current.html(), en: this.editorEn.current.html() }),
                kichHoat: Number(this.state.kichHoat),
            };

        if (changes.ten.vi == '') {
            T.notify('Tên chương trình đào tạo bị trống!', 'danger');
            $('#dmctdtTenVi').focus();
        } else if (changes.ten.en == '') {
            T.notify('Tên chương trình đào tạo bị trống!', 'danger');
            $('#dmctdtTenEn').focus();
        } else {
            if (ma) {
                this.props.updateDmChuongTrinhDaoTao(ma, changes);
            } else {
                this.props.createDmChuongTrinhDaoTao(changes);
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
                            <h5 className='modal-title'>Chương trình đào tạo</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#dmChuongTrinhDaoTaoTabVi'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#dmChuongTrinhDaoTaoTabEn'>English</a>
                                </li>

                                <div style={{ position: 'absolute', top: '16px', right: '8px' }}>
                                    <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                        <label htmlFor='dmctdtkichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                            <label>
                                                <input type='checkbox' id='dmctdtkichHoat' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
                                                <span className='button-indecator' />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </ul>
                            <div className='tab-content' style={{ marginTop: 8 }}>
                                <div id='dmChuongTrinhDaoTaoTabVi' className='tab-pane fade show active'>
                                    <div className='form-group row'>
                                        <div className='col-12 col-sm-12'>
                                            <label htmlFor='dmctdtTenVi'>Tên</label>
                                            <input className='form-control' id='dmctdtTenVi' type='text' placeholder='Tên' readOnly={readOnly} />
                                        </div>
                                    </div>
                                    <div className='form-group'>
                                        <label>Mô tả</label>
                                        <Editor ref={this.editorVi} height='200px' placeholder='Mô tả' />
                                    </div>
                                </div>
                                <div id='dmChuongTrinhDaoTaoTabEn' className='tab-pane fade'>
                                    <div className='form-group row'>
                                        <div className='col-12 col-sm-12'>
                                            <label htmlFor='dmctdtTenEn'>Name</label>
                                            <input className='form-control' id='dmctdtTenEn' type='text' placeholder='Name' readOnly={readOnly} />
                                        </div>
                                    </div>
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

class DmChuongTrinhDaoTaoPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmChuongTrinhDaoTaoPage();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục chương trình đào tạo', 'Bạn có chắc bạn muốn xóa chương trình đào tạo này?', true, isConfirm =>
            isConfirm && this.props.deleteDmChuongTrinhDaoTao(item.ma));
    }
    changeActive = item => this.props.updateDmChuongTrinhDaoTao(item.ma, { kichHoat: Number(!item.kichHoat) })

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmChuongTrinhDaoTao:write'),
            permissionDelete = currentPermissions.includes('dmChuongTrinhDaoTao:delete');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.dmChuongTrinhDaoTao && this.props.dmChuongTrinhDaoTao.page ?
            this.props.dmChuongTrinhDaoTao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = 'Không có dữ liệu chương trình đào tạo!';
        if (this.props.dmChuongTrinhDaoTao && this.props.dmChuongTrinhDaoTao.page && this.props.dmChuongTrinhDaoTao.page.list && this.props.dmChuongTrinhDaoTao.page.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Chương trình đào tạo</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Kích hoạt</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.dmChuongTrinhDaoTao.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'center' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{T.language.parse(item.ten, true).vi}</a></td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={() => permissionWrite && this.changeActive(item)} />
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Chương trình đào tạo</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Chương trình đào tạo
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    createDmChuongTrinhDaoTao={this.props.createDmChuongTrinhDaoTao} updateDmChuongTrinhDaoTao={this.props.updateDmChuongTrinhDaoTao} />
                <Pagination name='pageDmChuongTrinhDaoTao' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getDmChuongTrinhDaoTaoPage} />
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

const mapStateToProps = state => ({ system: state.system, dmChuongTrinhDaoTao: state.danhMuc.dmChuongTrinhDaoTao });
const mapActionsToProps = { getDmChuongTrinhDaoTaoPage, createDmChuongTrinhDaoTao, updateDmChuongTrinhDaoTao, deleteDmChuongTrinhDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DmChuongTrinhDaoTaoPage);
