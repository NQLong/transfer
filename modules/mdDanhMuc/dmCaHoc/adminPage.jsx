import React from 'react';
import { connect } from 'react-redux';
import { createDmCaHoc, getDmCaHocAll, updateDmCaHoc, deleteDmCaHoc } from './redux';
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';
import { AdminPage, TableCell, renderTable, } from 'view/component/AdminPage';

class EditModal extends React.Component {
    state = { kichHoat: true };
    modal = React.createRef();
    editorVi = React.createRef();
    editorEn = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => {
                $('a[href=\'#dmCaHocTabVi\']').tab('show');
                $('#dmCaHocTen').focus();
            });
        }, 250));
    }

    show = (item) => {
        let { ma, ten, moTa, kichHoat, thoiGianBatDau, thoiGianKetThuc } = item ? item : { ma: '', ten: '', moTa: '', thoiGianBatDau: '', thoiGianKetThuc: '', kichHoat: true };

        $('#dmCaHocTen').val(ten);
        moTa = T.language.parse(moTa, true);
        $('#dmCaHocThoiGianBatDauHours').val(thoiGianBatDau.split(':')[0]);
        $('#dmCaHocThoiGianBatDauHours').select2({ minimumResultsForSearch: -1 }).trigger('change');
        $('#dmCaHocThoiGianBatDauMinutes').val(thoiGianBatDau.split(':')[1]);
        $('#dmCaHocThoiGianBatDauMinutes').select2({ minimumResultsForSearch: -1 }).trigger('change');
        $('#dmCaHocThoiGianKetThucHours').val(thoiGianKetThuc.split(':')[0]);
        $('#dmCaHocThoiGianKetThucHours').select2({ minimumResultsForSearch: -1 }).trigger('change');
        $('#dmCaHocThoiGianKetThucMinutes').val(thoiGianKetThuc.split(':')[1]);
        $('#dmCaHocThoiGianKetThucMinutes').select2({ minimumResultsForSearch: -1 }).trigger('change');
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
                ten: $('#dmCaHocTen').val(),
                moTa: JSON.stringify({ vi: this.editorVi.current.html(), en: this.editorEn.current.html() }),
                thoiGianBatDau: `${$('#dmCaHocThoiGianBatDauHours').val()}:${$('#dmCaHocThoiGianBatDauMinutes').val()}`,
                thoiGianKetThuc: `${$('#dmCaHocThoiGianKetThucHours').val()}:${$('#dmCaHocThoiGianKetThucMinutes').val()}`,
                kichHoat: Number(this.state.kichHoat),
            };

        if (changes.ten == '') {
            T.notify('Tên ca học bị trống!', 'danger');
            $('#dmctdtTenVi').focus();
        } else {
            if (ma) {
                this.props.updateDmCaHoc(ma, changes);
            } else {
                this.props.createDmCaHoc(changes);
            }
            $(this.modal.current).modal('hide');
        }
    }
    generateOption = limitList => {
        const array = Array(limitList);
        const result = [];
        for (let i = 0; i < array.length; i++) {
            result.push(<option key={i} value={i / 10 < 1 ? `0${i}` : i}>{i / 10 < 1 ? `0${i}` : i}</option>);
        }
        return result;
    }

    render() {
        const readOnly = this.props.readOnly;
        const hours = this.generateOption(24),
            minutes = this.generateOption(60);
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Giờ học</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#dmCaHocTabVi'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#dmCaHocTabEn'>English</a>
                                </li>

                                <div style={{ position: 'absolute', top: '16px', right: '8px' }}>
                                    <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                        <label htmlFor='dmCaHocKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                            <label>
                                                <input type='checkbox' id='dmCaHocKichHoat' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
                                                <span className='button-indecator' />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </ul>

                            <div className='tab-content' style={{ marginTop: 8 }}>
                                <div className='form-group'>
                                    <label htmlFor='dmCaHocTen'>Tên giờ học</label>
                                    <input className='form-control' id='dmCaHocTen' type='text' placeholder='Tên giờ học' readOnly={readOnly} />
                                </div>
                                <div id='dmCaHocTabVi' className='tab-pane fade show active'>
                                    <div className='form-group'>
                                        <label>Mô tả</label>
                                        <Editor ref={this.editorVi} placeholder='Mô tả' readOnly={readOnly} />
                                    </div>
                                </div>

                                <div id='dmCaHocTabEn' className='tab-pane fade'>
                                    <div className='form-group'>
                                        <label>Description</label>
                                        <Editor ref={this.editorEn} placeholder='Description' readOnly={readOnly} />
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <div className='col-md-6'>
                                        <label className='control-label'>Thời gian bắt đầu</label>
                                        <div className='row'>
                                            <div className='col-md-5'>
                                                <select className='form-control' id='dmCaHocThoiGianBatDauHours'>{hours}</select>
                                            </div>
                                            <div className='col-md-1'>:</div>
                                            <div className='col-md-6'>
                                                <select className='form-control' id='dmCaHocThoiGianBatDauMinutes'>{minutes}</select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-md-6'>
                                        <label className='control-label'>Thời gian kết thúc</label>
                                        <div className='row'>
                                            <div className='col-md-5'>
                                                <select className='form-control' id='dmCaHocThoiGianKetThucHours'>{hours}</select>
                                            </div>
                                            <div className='col-md-1'>:</div>
                                            <div className='col-md-6'>
                                                <select className='form-control' id='dmCaHocThoiGianKetThucMinutes'>{minutes}</select>
                                            </div>
                                        </div>
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

class dmCaHocAdminPage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmCaHocAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục ca học', 'Bạn có chắc bạn muốn xóa ca học này?', true, isConfirm =>
            isConfirm && this.props.deleteDmCaHoc(item.ma));
    }

    changeActive = item => this.props.updateDmCaHoc(item.ma, { kichHoat: Number(!item.kichHoat) })

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmCaHoc:write'),
            permission = this.getUserPermission('dmCaHoc', ['write', 'delete']);
        let table = 'Không có dữ liệu ca học!',
            items = this.props.dmCaHoc && this.props.dmCaHoc.items ? this.props.dmCaHoc.items : [];
        if (items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '40%' }}>Giờ học</th>
                        <th style={{ width: '60%' }}>Thời gian</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} style={{ textAlign: 'right' }} />
                        <TableCell type='link' onClick={e => this.edit(e, item)} content={item.ten} />
                        <TableCell type='text' content={`${item.thoiGianBatDau} - ${item.thoiGianKetThuc}`} dateFormat />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}></TableCell>
                    </tr>
                )
            });
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Giờ học</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Giờ học
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    createDmCaHoc={this.props.createDmCaHoc} updateDmCaHoc={this.props.updateDmCaHoc} />
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

const mapStateToProps = state => ({ system: state.system, dmCaHoc: state.dmCaHoc });
const mapActionsToProps = { getDmCaHocAll, createDmCaHoc, updateDmCaHoc, deleteDmCaHoc };
export default connect(mapStateToProps, mapActionsToProps)(dmCaHocAdminPage);
