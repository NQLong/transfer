import React from 'react';
import { connect } from 'react-redux';
import { getDmTrinhDoNgoaiNguAll, createDmTrinhDoNgoaiNgu, updateDmTrinhDoNgoaiNgu, deleteDmTrinhDoNgoaiNgu } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    modal = React.createRef();
    state = { active: false }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmTrinhDoNgoaiNguMa').focus());
        })
    }

    show = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: 1 };
        $('#dmTrinhDoNgoaiNguMa').val(ma);
        $('#dmTrinhDoNgoaiNguTen').val(ten);
        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật trình độ ngoại ngữ' : 'Tạo mới trình độ ngoại ngữ');
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const maTrinhDoNgoaiNgu = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#dmTrinhDoNgoaiNguMa').val().trim(),
                ten: $('#dmTrinhDoNgoaiNguTen').val().trim(),
                kichHoat: this.state.active ? 1 : 0,
            };
        if (changes.ma == '') {
            T.notify('Mã trình độ ngoại ngữ bị trống!', 'danger');
            $('#dmTrinhDoNgoaiNguMa').focus();
        } else if (changes.tenQuocGia == '') {
            T.notify('Tên trình độ ngoại ngữ bị trống!', 'danger');
            $('#dmTrinhDoNgoaiNguTen').focus();
        } else {
            if (maTrinhDoNgoaiNgu) {
                if (typeof this.state.ImportIndex == 'number') changes.ImportIndex = this.state.ImportIndex;
                this.props.update(maTrinhDoNgoaiNgu, changes, () => {
                    T.notify('Cập nhật trình độ ngoại ngữ thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            } else {
                this.props.create(changes, () => {
                    T.notify('Tạo mới trình độ ngoại ngữ thành công!', 'success');
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
                                <label htmlFor='dmTrinhDoNgoaiNguMa'>Mã trình độ ngoại ngữ</label>
                                <input className='form-control' id='dmTrinhDoNgoaiNguMa' placeholder='Mã trình độ ngoại ngữ' type='text' auto-focus='' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmTrinhDoNgoaiNguTen'>Tên trình độ ngoại ngữ</label>
                                <input className='form-control' id='dmTrinhDoNgoaiNguTen' placeholder='Tên trình độ ngoại ngữh' type='text' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmTrinhDoNgoaiNguKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmTrinhDoNgoaiNguKichHoat' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
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
        )
    }
}

class AdminPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmTrinhDoNgoaiNguAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Trình độ ngoại ngữ', 'Bạn có chắc bạn muốn xóa trình độ ngoại ngữ này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmTrinhDoNgoaiNgu(item.ma));
    };

    changeActive = item => this.props.updateDmTrinhDoNgoaiNgu(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmTrinhDoNgoaiNgu:write'),
            permissionDelete = currentPermissions.includes('dmTrinhDoNgoaiNgu:delete');
        let table = 'Không có dữ liệu!',
            items = this.props.dmTrinhDoNgoaiNgu && this.props.dmTrinhDoNgoaiNgu.items;
        if (items && items.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>Mã</th>
                            <th style={{ width: '100%' }}>Tên</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ma}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ten}</a></td>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Trình độ ngoại ngữ</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Trình độ ngoại ngữ
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDmTrinhDoNgoaiNgu} update={this.props.updateDmTrinhDoNgoaiNgu} />
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmTrinhDoNgoaiNgu: state.dmTrinhDoNgoaiNgu });
const mapActionsToProps = { getDmTrinhDoNgoaiNguAll, createDmTrinhDoNgoaiNgu, updateDmTrinhDoNgoaiNgu, deleteDmTrinhDoNgoaiNgu };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);