import React from 'react';
import { connect } from 'react-redux';
import { getDmTrinhDoTinHocAll, deleteDmTrinhDoTinHoc, createDmTrinhDoTinHoc, updateDmTrinhDoTinHoc } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { kichHoat: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmTrinhDoTinHocMa').focus());
        }, 250));
    }

    show = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };
        $('#dmTrinhDoTinHocMa').val(ma);
        $('#dmTrinhDoTinHocTen').val(ten);
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-id', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ma: $('#dmTrinhDoTinHocMa').val().trim(),
                ten: $('#dmTrinhDoTinHocTen').val().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống');
            $('#dmTrinhDoTinHocMa').focus();
        } else {
            if (ma) {
                this.props.updateDmTrinhDoTinHoc(ma, changes);
            } else {
                this.props.createDmTrinhDoTinHoc(changes);
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
                            <h5 className='modal-title'>Thông tin danh mục Trình độ Tin học</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmTrinhDoTinHocMa'>Mã</label>
                                <input className='form-control' id='dmTrinhDoTinHocMa' type='text' placeholder='Mã danh mục' maxLength={2} readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmTrinhDoTinHocTen'>Tên</label>
                                <input className='form-control' id='dmTrinhDoTinHocTen' type='text' placeholder='Tên' readOnly={readOnly} />
                            </div>
                            <div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
                                <label htmlFor='dmTrinhDoTinHocActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmTrinhDoTinHocActive' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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

class DmTrinhDoTinHocPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmTrinhDoTinHocAll();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmTrinhDoTinHoc(item.ma, { kichHoat: Number(!item.kichHoat) });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa trình đọ tin học', 'Bạn có chắc bạn muốn xóa mục đích này?', true, isConfirm =>
            isConfirm && this.props.deleteDmTrinhDoTinHoc(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmTrinhDoTinHoc:write'),
            permissionDelete = currentPermissions.includes('dmTrinhDoTinHoc:delete');
        // const { pageNumber, pageSize, pageTotal, totalItem } = this.props.dmTrinhDoTinHoc && this.props.dmTrinhDoTinHoc.page ?
        //     this.props.dmTrinhDoTinHoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = 'Không có danh sách!',
            items = this.props.dmTrinhDoTinHoc && this.props.dmTrinhDoTinHoc.items ? this.props.dmTrinhDoTinHoc.items : [];
        if (items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: 'auto' }}>Mã</th>
                            <th style={{ width: '100%' }}>Tên</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ma}</a></td>
                                <td>{item.ten}</td>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Trình độ Tin học</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Trình độ tin học
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    dmTrinhDoTinHoc={this.props.dmTrinhDoTinHoc}
                    createDmTrinhDoTinHoc={this.props.createDmTrinhDoTinHoc} updateDmTrinhDoTinHoc={this.props.updateDmTrinhDoTinHoc} />
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

const mapStateToProps = state => ({ system: state.system, dmTrinhDoTinHoc: state.dmTrinhDoTinHoc });
const mapActionsToProps = { getDmTrinhDoTinHocAll, deleteDmTrinhDoTinHoc, createDmTrinhDoTinHoc, updateDmTrinhDoTinHoc };
export default connect(mapStateToProps, mapActionsToProps)(DmTrinhDoTinHocPage);