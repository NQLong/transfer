import React from 'react';
import { connect } from 'react-redux';
import { getDmNgachCdnnAll, createDmNgachCdnn, deleteDmNgachCdnn, updateDmNgachCdnn } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import T from 'view/js/common';

class EditModal extends AdminModal {
    state = {kichHoat: true };
    modal = React.createRef();

    onShow = (item) => {
        const { id, ma, maSoCdnn, ten, nhom, kichHoat } = item ? item : { id: null, ma: '', maSoCdnn: '', ten: '', nhom: '', kichHoat: true};
        
        this.ma.value(ma);
        this.maSoCdnn.value(maSoCdnn);
        this.ten.value(ten);
        this.nhom.value(nhom);
        this.kichHoat.value(kichHoat);

        this.setState({kichHoat});

        $(this.modal).attr('data-id', id).modal('show');
    }

    hide = () => $(this.modal).modal('hide')

    onSubmit = () => {
        const id = $(this.modal).attr('data-id'),
            changes = {
                ma: this.ma.value().trim(),
                maSoCdnn: this.maSoCdnn.value().trim(),
                ten: this.ten.value().trim(),
                nhom: this.nhom.value().trim(),
                kichHoat: Number(this.kichHoat.value())
            };
        if (changes.ten == '') {
            T.notify('Tên ngạch chức danh nghề nghiệp bị trống!', 'danger');
            this.ten.focus();
        }
        else if (changes.ma == '') {
            T.notify('Mã ngạch chức danh nghề nghiệp bị trống!', 'danger');
            this.ma.focus();
        }
        else if (changes.maSoCdnn == '') {
            T.notify('Mã số chức danh nghề nghiệp bị trống!', 'danger');
            this.maSoCdnn.focus();
        }
        else {
            if (id) {
                this.props.updateDmNgachCdnn(id, changes);
            } else {
                this.props.createDmNgachCdnn(changes);
            }
            $(this.modal).modal('hide');
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Cập nhật ngạch chức năng nghề nghiệp' : 'Tạo mới ngạch chức năng nghề nghiệp',
            size: 'large',
            body: <div className ='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={readOnly} placeholder='Mã' required />
                <FormTextBox type='text' className='col-12' ref={e => this.maSoCdnn = e} label='Mã số ngạch CDNN' readOnly={readOnly} placeholder='Mã số ngạch CDNN' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên ngạch' readOnly={readOnly} placeholder='Tên ngạch' required /> 
                <FormTextBox type='text' className='col-12' ref={e => this.nhom = e} label='Nhóm ngạch' readOnly={readOnly} placeholder='Nhóm ngạch'/>
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div> 
        }
        );
    }
}

class DmNgachCdnnPage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
       T.ready('/user/category', () =>  this.props.getDmNgachCdnnAll());
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
            permission = this.getUserPermission('dmNgachCdnn', ['write', 'delete']);

        let items = this.props.dmNgachCdnn && this.props.dmNgachCdnn.items ? this.props.dmNgachCdnn.items : [];

        const table = renderTable({
            getDataSource: () => items, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Mã</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Mã số CDNN</th>
                    <th style={{ width: '50%' }}>Tên ngạch</th>
                    <th style={{ width: '50%' }}>Nhóm ngạch</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} style={{ textAlign: 'right' }} />
                    <TableCell type='link' content={item.ma} style={{ textAlign: 'right' }} onClick={(e) => this.edit(e, item)} />
                    <TableCell type='text' content={item.maSoCdnn} />
                    <TableCell type='text' content={item.ten} />
                    <TableCell type='text' content={item.nhom} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });


        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Ngạch chức danh nghề nghiệp</h1>
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