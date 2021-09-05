import React from 'react';
import { connect } from 'react-redux';
import { getDmTinhTrangDeTaiNckhAll, deleteDmTinhTrangDeTaiNckh, createDmTinhTrangDeTaiNckh, updateDmTinhTrangDeTaiNckh } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { kichHoat: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmTinhTrangDeTaiNckhMa').focus());
        }, 250));
    }

    show = (item) => {
        let { ma, ten, stt, ghiChu, kichHoat } = item ? item : { ma: '', ten: '', stt: null, ghiChu: '', kichHoat: true };
        $('#dmTinhTrangDeTaiNckhMa').val(ma);
        $('#dmTinhTrangDeTaiNckhTen').val(ten);
        $('#dmTinhTrangDeTaiNckhStt').val(stt);
        $('#dmTinhTrangDeTaiNckhGhiChu').val(ghiChu);
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-id', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ma: $('#dmTinhTrangDeTaiNckhMa').val().trim(),
                ten: $('#dmTinhTrangDeTaiNckhTen').val().trim(),
                stt: Number($('#dmTinhTrangDeTaiNckhStt').val().trim()),
                ghiChu: $('#dmTinhTrangDeTaiNckhGhiChu').val().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống!');
            $('#dmTinhTrangDeTaiNckhMa').focus();
        } else if (changes.ma != ma && this.props.dmTinhTrangDeTaiNckh.items.find(item => item.ma == changes.ma)) {
            T.notify('Mã danh mục đã tồn tại!');
            $('#dmTinhTrangDeTaiNckhMa').focus();
        }
        else {
            if (ma) {
                this.props.updateDmTinhTrangDeTaiNckh(ma, changes);
            } else {
                this.props.createDmTinhTrangDeTaiNckh(changes);
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
                            <h5 className='modal-title'>Thông tin danh mục tình trạng đề tài NCKH</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>

                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmTinhTrangDeTaiNckhMa'>Mã</label>
                                <input className='form-control' id='dmTinhTrangDeTaiNckhMa' type='text' placeholder='Mã danh mục' maxLength={3} readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmTinhTrangDeTaiNckhTen'>Tên</label>
                                <input className='form-control' id='dmTinhTrangDeTaiNckhTen' type='text' placeholder='Tên' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmTinhTrangDeTaiNckhStt'>Số thứ tự</label>
                                <input className='form-control' id='dmTinhTrangDeTaiNckhStt' type='text' placeholder='Số thứ tự' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmTinhTrangDeTaiNckhGhiChu'>Ghi chú</label>
                                <input className='form-control' id='dmTinhTrangDeTaiNckhGhiChu' type='text' placeholder='Ghi chú' readOnly={readOnly} />
                            </div>
                            <div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
                                <label htmlFor='dmTinhTrangDeTaiNckhActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmTinhTrangDeTaiNckhActive' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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

class DmTinhTrangDeTaiNckhPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmTinhTrangDeTaiNckhAll();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmTinhTrangDeTaiNckh(item.ma, { kichHoat: Number(!item.kichHoat) })

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa tình trạng đề tài', 'Bạn có chắc bạn muốn xóa danh mục này?', true, isConfirm =>
            isConfirm && this.props.deleteDmTinhTrangDeTaiNckh(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmTinhTrangDeTaiNckh:write'),
            permissionDelete = currentPermissions.includes('dmTinhTrangDeTaiNckh:delete');
        let table = 'Không có danh sách!',
            items = this.props.dmTinhTrangDeTaiNckh && this.props.dmTinhTrangDeTaiNckh.items ? this.props.dmTinhTrangDeTaiNckh.items : [];
        if (items && items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>Mã</th>
                            <th style={{ width: '30%' }}>Tên</th>
                            <th style={{ width: 'auto' }}>STT</th>
                            <th style={{ width: '70%' }}>Ghi chú</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ma}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ten}</a></td>
                                <td style={{ textAlign: 'center' }}>{item.stt}</td>
                                <td>{item.ghiChu}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={e => permissionWrite && this.changeActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' data-toggle='tooltip' title='Chỉnh sửa' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permissionDelete &&
                                            <a className='btn btn-danger' data-toggle='tooltip' title='Xóa' href='#' onClick={e => this.delete(e, item)}>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Tình trạng đề tài NCKH</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>&nbsp;/&nbsp;
                        Tình trạng đề tài NCKH
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} dmTinhTrangDeTaiNckh={this.props.dmTinhTrangDeTaiNckh}
                    createDmTinhTrangDeTaiNckh={this.props.createDmTinhTrangDeTaiNckh} updateDmTinhTrangDeTaiNckh={this.props.updateDmTinhTrangDeTaiNckh} />
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' data-toggle='tooltip' title='Tạo' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmTinhTrangDeTaiNckh: state.dmTinhTrangDeTaiNckh });
const mapActionsToProps = { getDmTinhTrangDeTaiNckhAll, deleteDmTinhTrangDeTaiNckh, createDmTinhTrangDeTaiNckh, updateDmTinhTrangDeTaiNckh };
export default connect(mapStateToProps, mapActionsToProps)(DmTinhTrangDeTaiNckhPage);