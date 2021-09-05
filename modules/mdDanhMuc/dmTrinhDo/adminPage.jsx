import React from 'react';
import { connect } from 'react-redux';
import { getDmTrinhDoAll, createDmTrinhDo, updateDmTrinhDo, deleteDmTrinhDo } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    modal = React.createRef();
    state = { active: false }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmTrinhDoMa').focus());
        });
    }

    show = (item) => {
        let { ma, ten, tenTiengAnh, vietTat, vietTatTiengAnh, kichHoat } = item ? item : { ma: null, ten: '', tenTiengAnh: '', vietTat: '', vietTatTiengAnh: '', kichHoat: 1 };
        $('#dmTrinhDoMa').val(ma);
        $('#dmTrinhDoTen').val(ten);
        $('#dmTrinhDoTenTiengAnh').val(tenTiengAnh);
        $('#dmTrinhDoTenVietTat').val(vietTat);
        $('#dmTrinhDoTenVietTatTiengAnh').val(vietTatTiengAnh);
        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật trình độ' : 'Tạo mới trình độ');
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const maTrinhDo = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#dmTrinhDoMa').val().trim(),
                ten: $('#dmTrinhDoTen').val().trim(),
                tenTiengAnh: $('#dmTrinhDoTenTiengAnh').val().trim(),
                vietTat: $('#dmTrinhDoTenVietTat').val().trim(),
                vietTatTiengAnh: $('#dmTrinhDoTenVietTatTiengAnh').val().trim(),
                kichHoat: this.state.active ? 1 : 0,
            };
        if (changes.ma == '') {
            T.notify('Mã trình độ bị trống!', 'danger');
            $('#dmTrinhDoMa').focus();
        } else if (changes.ten == '') {
            T.notify('Tên trình độ bị trống!', 'danger');
            $('#dmTrinhDoTen').focus();
        } else if (changes.tenTiengAnh == '') {
            T.notify('Tên trình độ tiếng Anh bị trống!', 'danger');
            $('#dmTrinhDoTenTiengAnh').focus();
        } else {
            if (maTrinhDo) {
                if (typeof this.state.ImportIndex == 'number') changes.ImportIndex = this.state.ImportIndex;
                this.props.update(maTrinhDo, changes, () => {
                    T.notify('Cập nhật trình độ thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            } else {
                this.props.create(changes, () => {
                    T.notify('Tạo mới trình độ thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            }
        }
    };

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'></h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmTrinhDoMa'>Mã trình độ</label>
                                <input className='form-control' id='dmTrinhDoMa' placeholder='Mã trình độ' type='text' auto-focus='' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmTrinhDoTen'>Tên trình độ</label>
                                <input className='form-control' id='dmTrinhDoTen' placeholder='Tên trình độ' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmTrinhDoTenTiengAnh'>Tên trình độ tiếng Anh</label>
                                <input className='form-control' id='dmTrinhDoTenTiengAnh' placeholder='Tên trình độ tiếng Anh' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmTrinhDoTenVietTat'>Tên viết tắt</label>
                                <input className='form-control' id='dmTrinhDoTenVietTat' placeholder='Tên viết tắt' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmTrinhDoTenVietTatTiengAnh'>Tên viết tắt tiếng Anh</label>
                                <input className='form-control' id='dmTrinhDoTenVietTatTiengAnh' placeholder='Tên viết tắt tiếng Anh' type='text' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmTrinhDoKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmTrinhDoKichHoat' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
                                        <span className='button-indecator' />
                                    </label>
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

class AdminPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmTrinhDoAll();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Trình độ', 'Bạn có chắc bạn muốn xóa trình độ này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmTrinhDo(item.ma));
    };

    changeActive = item => this.props.updateDmTrinhDo(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmTrinhDo:write'),
            permissionDelete = currentPermissions.includes('dmTrinhDo:delete');
        let items = this.props.dmTrinhDo && this.props.dmTrinhDo.items ? this.props.dmTrinhDo.items : [];
        let table = 'Không có dữ liệu!';
        if (items && items.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                            <th style={{ width: '100%' }}>Tên</th>
                            <th style={{ width: '100%' }} nowrap='true'>Tên tiếng Anh</th>
                            <th style={{ width: '100%' }} nowrap='true'>Viết tắt</th>
                            <th style={{ width: '100%' }} nowrap='true'>Viết tắt tiếng Anh</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'center' }}>{item.ma}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ten}</a></td>
                                <td>{item.tenTiengAnh}</td>
                                <td>{item.vietTat}</td>
                                <td>{item.vietTatTiengAnh}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat == '1' ? true : false} onChange={e => permissionWrite && this.changeActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group' style={{ display: 'flex' }}>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permissionDelete &&
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Trình độ</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Trình độ
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    create={this.props.createDmTrinhDo} update={this.props.updateDmTrinhDo} />
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmTrinhDo: state.dmTrinhDo });
const mapActionsToProps = { getDmTrinhDoAll, createDmTrinhDo, updateDmTrinhDo, deleteDmTrinhDo };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);