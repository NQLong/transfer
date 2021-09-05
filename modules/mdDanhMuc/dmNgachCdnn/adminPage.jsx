import React from 'react';
import { connect } from 'react-redux';
import { getDmNgachCdnnAll, createDmNgachCdnn, deleteDmNgachCdnn, updateDmNgachCdnn } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { active: true };
    modal = React.createRef();
    editor = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => {
                $('a[href=\'#dmNgachCdnnTiengViet\']').tab('show');
                $('#dmNgachCdnnMa').focus();
            });
        }, 250));
    }

    show = (item) => {
        const { id, ma, maSoCdnn, ten, nhom } = item ? item : { id: null, ma: '', maSoCdnn: '', ten: '', nhom: '' };
        $('#dmNgachCdnnMa').val(ma);
        $('#dmNgachCdnnMasoCdnn').val(maSoCdnn);
        $('#dmNgachCdnnTen').val(ten);
        $('#dmNgachCdnnNhom').val(nhom);

        $(this.modal.current).attr('data-id', id).modal('show');
    }
    hide = () => $(this.modal.current).modal('hide')

    save = (e) => {
        e.preventDefault();
        const id = $(this.modal.current).attr('data-id'),
            changes = {
                ma: $('#dmNgachCdnnMa').val().trim(),
                maSoCdnn: $('#dmNgachCdnnMasoCdnn').val().trim(),
                ten: $('#dmNgachCdnnTen').val().trim(),
                nhom: $('#dmNgachCdnnNhom').val().trim(),
            };
        if (changes.ten == '') {
            T.notify('Tên ngạch cdnn bị trống!', 'danger');
            $('a[href=\'#dmNgachCdnnTiengViet\']').tab('show');
            $('#dmNgachCdnnTen').focus();
        } else {
            if (id) {
                this.props.updateDmNgachCdnn(id, changes);
            } else {
                this.props.createDmNgachCdnn(changes);
            }
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Ngạch chức danh nghề nghiệp</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmNgachCdnnMa'>Mã</label>
                                <input className='form-control' id='dmNgachCdnnMa' type='text' placeholder='Mã' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmNgachCdnnMasoCdnn'>Mã số</label>
                                <input className='form-control' id='dmNgachCdnnMasoCdnn' type='text' placeholder='Mã Số' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmNgachCdnnTen'>Tên ngạch</label>
                                <input className='form-control' id='dmNgachCdnnTen' type='text' placeholder='Tên Ngạch chức danh nghề nghiệp' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmNgachCdnnNhom'>Nhóm ngạch</label>
                                <input className='form-control' id='dmNgachCdnnNhom' type='text' placeholder='Nhóm' readOnly={readOnly} />
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

class DmNgachCdnnPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmNgachCdnnAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục ngạch chức danh nghề nghiệp', 'Bạn có chắc bạn muốn xóa ngạch chức danh nghề nghiệp này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNgachCdnn(item.id));
    }

    changeKichHoat = item => this.props.updateDmNgachCdnn(item.id, { kichHoat: Number(!item.kichHoat) })

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmNgachCdnn:write'),
            permissionDelete = currentPermissions.includes('dmNgachCdnn:delete');
        let table = 'Không có danh sách ngạch chức danh nghề nghiệp!',
            items = this.props.dmNgachCdnn && this.props.dmNgachCdnn.items ? this.props.dmNgachCdnn.items : [];
        if (items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Mã</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Mã số CDNN</th>
                            <th style={{ width: '50%' }}>Tên ngạch</th>
                            <th style={{ width: '50%' }}>Nhóm ngạch</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td style={{ textAlign: 'right' }} nowrap='true'><a href='#' onClick={e => this.edit(e, item)}>{item.ma}</a></td>
                                <td>{item.maSoCdnn}</td>
                                <td>{item.ten}</td>
                                <td>{item.nhom}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={e => permissionWrite && this.changeKichHoat(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permissionDelete ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-trash-o fa-lg' />
                                            </a> : null}
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Ngạch chức danh nghề nghiệp</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp; Ngạch chức danh nghề nghiệp
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    createDmNgachCdnn={this.props.createDmNgachCdnn} updateDmNgachCdnn={this.props.updateDmNgachCdnn} />
                {permissionWrite && (
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>)}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmNgachCdnn: state.dmNgachCdnn });
const mapActionsToProps = { getDmNgachCdnnAll, createDmNgachCdnn, deleteDmNgachCdnn, updateDmNgachCdnn };
export default connect(mapStateToProps, mapActionsToProps)(DmNgachCdnnPage);