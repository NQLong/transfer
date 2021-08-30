import React from 'react';
import { connect } from 'react-redux';
import { getDmLoaiHinhNghienCuuAll, deleteDmLoaiHinhNghienCuu, createDmLoaiHinhNghienCuu, updateDmLoaiHinhNghienCuu } from './redux';
import TextInput, { BooleanInput } from 'view/component/Input'
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = {};
    modal = React.createRef();
    ma = React.createRef();
    ten = React.createRef();
    kichHoat = React.createRef();
    saveBtn = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => this.ma.current.focus());
        }, 250));
    }

    show = (item = {}) => {
        $(this.modal.current).modal('show');
        this.ma.current.setVal(item.ma);
        this.ten.current.setVal(item.ten);
        this.kichHoat.current.setVal(item.kichHoat);

        let isUpdate = !$.isEmptyObject(item);
        this.setState({ isUpdate });
        this.ma.current.focus();
        this.saveBtn.current.disabled = false;
    };


    getValue = input => {
        const data = input.getVal();
        if (data) return data;
        if (input.required) throw { input };
        return data;
    };
    save = (e) => {
        e.preventDefault();
        try {
            const data = {
                ma: this.getValue(this.ma.current),
                ten: this.getValue(this.ten.current),
                kichHoat: this.getValue(this.kichHoat.current)
            }
            this.saveBtn.current.disabled = true;
            this.state.isUpdate ? this.props.update(data.ma, data) : this.props.create(data);
            $(this.modal.current).modal('hide');
        }
        catch (error) {
            if (error.input) {
                error.input.focus();
                T.notify('<b>' + (error.input.label || 'Dữ liệu') + '</b> bị trống!!', 'danger');
            }
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin danh mục nghiệm thu xếp loại KHCN</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <div className='form-group col-lg-12'><TextInput ref={this.ma} required label='Mã sở hữu trí tuệ' disabled={readOnly} /></div>
                            </div>
                            <div className='form-group'>
                                <div className='form-group col-lg-12'><TextInput ref={this.ten} label='Tên' disabled={readOnly} /></div>
                            </div>
                            <div className='form-group'>
                                <div className='form-group col-lg-4'><BooleanInput ref={this.kichHoat} label='Kích hoạt' disabled={readOnly} /></div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly && <button type='submit' ref={this.saveBtn} className='btn btn-primary' onClick={this.save}>Lưu</button>}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DmLoaiHinhNghienCuuPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmLoaiHinhNghienCuuAll()
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmLoaiHinhNghienCuu(item.ma, { kichHoat: Number(!item.kichHoat) })

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa loại hình nghiên cứu', 'Bạn có chắc bạn muốn xóa danh mục này?', true, isConfirm =>
            isConfirm && this.props.deleteDmLoaiHinhNghienCuu(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmLoaiHinhNghienCuu:write'),
            permissionDelete = currentPermissions.includes('dmLoaiHinhNghienCuu:delete');
        let table = 'Không có danh sách!',
            items = this.props.dmLoaiHinhNghienCuu && this.props.dmLoaiHinhNghienCuu.items ? this.props.dmLoaiHinhNghienCuu.items : [];
        if (items && items.length > 0) {
            items.sort((a, b) => a.ma < b.ma ? -1 : 1);
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Loại hình nghiên cứu</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Loại hình nghiên cứu
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} dmLoaiHinhNghienCuu={this.props.dmLoaiHinhNghienCuu}
                    create={this.props.createDmLoaiHinhNghienCuu} update={this.props.updateDmLoaiHinhNghienCuu} />
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

const mapStateToProps = state => ({ system: state.system, dmLoaiHinhNghienCuu: state.dmLoaiHinhNghienCuu });
const mapActionsToProps = { getDmLoaiHinhNghienCuuAll, deleteDmLoaiHinhNghienCuu, createDmLoaiHinhNghienCuu, updateDmLoaiHinhNghienCuu };
export default connect(mapStateToProps, mapActionsToProps)(DmLoaiHinhNghienCuuPage);