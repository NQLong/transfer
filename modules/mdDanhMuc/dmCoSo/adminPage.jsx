import React from 'react';
import { connect } from 'react-redux';
import { createDmCoSo, getDmCoSoAll, updateDmCoSo, deleteDmCoSo } from './redux';
//import Editor from 'view/component/CkEditor4';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox} from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        const { ma, ten, diaChi, tenVietTat, moTa, kichHoat } = item ? item : { ma: '', ten: '', diaChi: '', tenVietTat: '', moTa: '', kichHoat: true };
        this.setState({ma, item});
        const name = T.language.parse(ten, true);
        const address = T.language.parse(diaChi, true);
        const abbreviation = T.language.parse(tenVietTat, true);
        const description = T.language.parse(moTa, true);

        this.ten.value(name.vi);
        this.tenTiengAnh.value(name.en);
        this.diaChi.value(address.vi);
        this.diaChiTiengAnh.value(address.en);
        this.tenVietTat.value(abbreviation.vi);
        this.tenVietTatTiengAnh.value(abbreviation.en);
        this.moTa.value(description.vi);
        this.moTaTiengAnh.value(description.en);
        // this.moTa.html(description.vi);  //not work, need fixed
        // this.moTaTiengAnh.html(description.en); //not work, need fixed
        this.kichHoat.value(kichHoat);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: {vi: this.ten.value(), en: this.tenTiengAnh.value()},
            diaChi: {vi: this.diaChi.value(), en: this.diaChiTiengAnh.value()},
            tenVietTat: {vi: this.tenVietTat.value(), en: this.tenVietTatTiengAnh.value()},
            moTa: {vi: this.moTa.value(), en: this.moTaTiengAnh.value()}, 
            // moTa: {vi: this.moTa.html(), en: this.moTaTiengAnh.html()}, not work, need fixed
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };

        if (changes.ten.vi == '') {
            T.notify('Tên cơ sở bị trống!', 'danger');
            //this.tabVi.show();
            $('a[href=\'#dmCoSoTabVi\']').tab('show'); //need fixed
            this.ten.focus();
            // $('#dmCoSoNameVi').focus();
        } else if (changes.ten.en == '') {
            T.notify('Tên cơ sở bị trống!', 'danger');
            //this.tabEn.show();
            $('a[href=\'#dmCoSoTabEn\']').tab('show'); //need fixed
            this.tenTiengAnh.focus();
            // $('#dmCoSoNameEn').focus();
        } else {
            changes.ten = JSON.stringify(changes.ten);
            changes.diaChi = JSON.stringify(changes.diaChi);
            changes.tenVietTat = JSON.stringify(changes.tenVietTat);
            changes.moTa = JSON.stringify(changes.moTa);
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật cơ sở' : 'Tạo mới cơ sở',
            body: <div className='row'> {/* need fixed */}
                <ul className = 'nav nav-tabs'> 
                    <li className='nav-item'>
                        <a className='nav-link active show' data-toggle='tab' href='#dmCoSoTabVi'>Việt Nam</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link' data-toggle='tab' href='#dmCoSoTabEn'>English</a>
                    </li>
                    {/* <FormTextBox type='text' className='col-md-6' ref={e => this.tabVi = e} label='Việt Nam' /> 
                    <FormTextBox type='text' className='col-md-6' ref={e => this.tabEn = e} label='English' />  */}
                    <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} 
                        readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                        onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                </ul>
                <div className='tab-content' style={{ marginTop: 8 }} > 
                    <div id='dmCoSoTabVi' className='tab-pane fade show active'>
                        <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} readOnly={readOnly} 
                            label='Tên cơ sở' /> 
                        <FormTextBox type='text' className='col-md-12' ref={e => this.diaChi = e} readOnly={readOnly} 
                            label='Địa chỉ' /> 
                        <FormTextBox type='text' className='col-md-12' ref={e => this.tenVietTat = e} readOnly={readOnly} 
                            label='Tên viết tắt' /> 
                        <FormTextBox type='text' className='col-md-12' ref={e => this.moTa = e} readOnly={readOnly} 
                            label='Mô tả' /> 
                    </div>
                    <div id='dmCoSoTabEn' className='tab-pane fade'>
                        <FormTextBox type='text' className='col-md-12' ref={e => this.tenTiengAnh = e} readOnly={readOnly} 
                            label='Name' /> 
                        <FormTextBox type='text' className='col-md-12' ref={e => this.diaChiTiengAnh = e} readOnly={readOnly} 
                            label='Address' /> 
                        <FormTextBox type='text' className='col-md-12' ref={e => this.tenVietTatTiengAnh = e} readOnly={readOnly} 
                            label='Abbreviation' /> 
                        <FormTextBox type='text' className='col-md-12' ref={e => this.moTaTiengAnh = e} readOnly={readOnly} 
                            label='Description' /> 
                    </div>
                </div>
            </div>
        });
    }
}

// class EditModal extends React.Component {
//     state = { active: true };
//     modal = React.createRef();
//     editorVi = React.createRef();
//     editorEn = React.createRef();

//     componentDidMount() {
//         $(document).ready(() => setTimeout(() => {
//             $(this.modal.current).on('shown.bs.modal', () => {
//                 $('a[href=\'#dmCoSoTabVi\']').tab('show');
//                 $('#dmCoSoNameVi').focus();
//             });
//         }, 250));
//     }

//     show = (item) => {
//         const { ma, ten, diaChi, tenVietTat, moTa, kichHoat } = item ? item : { ma: null, ten: '', diaChi: '', tenVietTat: '', moTa: '', kichHoat: true };
//         const name = T.language.parse(ten, true);
//         const address = T.language.parse(diaChi, true);
//         const abbreviation = T.language.parse(tenVietTat, true);
//         const description = T.language.parse(moTa, true);

//         $('#dmCoSoNameVi').val(name.vi);
//         $('#dmCoSoNameEn').val(name.en);
//         $('#dmCoSoAddressVi').val(address.vi);
//         $('#dmCoSoAddressEn').val(address.en);
//         $('#dmCoSoAbbreviationVi').val(abbreviation.vi);
//         $('#dmCoSoAbbreviationEn').val(abbreviation.en);
//         this.editorVi.current.html(description.vi);
//         this.editorEn.current.html(description.en);
//         this.setState({ active: kichHoat == 1 });

//         $(this.modal.current).attr('data-ma', ma).modal('show');
//     }
//     hide = () => $(this.modal.current).modal('hide')

//     onSubmit = (e) => {
//         e.preventDefault();
//         const maCoSo = $(this.modal.current).attr('data-ma'),
//             changes = {
//                 ten: { vi: $('#dmCoSoNameVi').val().trim(), en: $('#dmCoSoNameEn').val().trim() },
//                 diaChi: { vi: $('#dmCoSoAddressVi').val().trim(), en: $('#dmCoSoAddressEn').val().trim() },
//                 tenVietTat: { vi: $('#dmCoSoAbbreviationVi').val().trim(), en: $('#dmCoSoAbbreviationEn').val().trim() },
//                 moTa: { vi: this.editorVi.current.html(), en: this.editorEn.current.html() },
//                 kichHoat: this.state.active ? '1' : '0',
//             };

//         if (changes.ten.vi == '') {
//             T.notify('Tên cơ sở bị trống!', 'danger');
//             $('a[href=\'#dmCoSoTabVi\']').tab('show');
//             $('#dmCoSoNameVi').focus();
//         } else if (changes.ten.en == '') {
//             T.notify('Tên cơ sở bị trống!', 'danger');
//             $('a[href=\'#dmCoSoTabEn\']').tab('show');
//             $('#dmCoSoNameEn').focus();
//         } else {
//             changes.ten = JSON.stringify(changes.ten);
//             changes.diaChi = JSON.stringify(changes.diaChi);
//             changes.tenVietTat = JSON.stringify(changes.tenVietTat);
//             changes.moTa = JSON.stringify(changes.moTa);
//             if (maCoSo) {
//                 this.props.updateDmCoSo(maCoSo, changes);
//             } else {
//                 this.props.createDmCoSo(changes);
//             }
//             $(this.modal.current).modal('hide');
//         }
//     }

//     render() {
//         const readOnly = this.props.readOnly;
//         return (
//             <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
//                 <form className='modal-dialog modal-lg' role='document' onSubmit={this.onSubmit}>
//                     <div className='modal-content'>
//                         <div className='modal-header'>
//                             <h5 className='modal-title'>Cơ sở</h5>
//                             <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
//                                 <span aria-hidden='true'>&times;</span>
//                             </button>
//                         </div>
//                         <div className='modal-body'>
//                             <ul className='nav nav-tabs'>
//                                 <li className='nav-item'>
//                                     <a className='nav-link active show' data-toggle='tab' href='#dmCoSoTabVi'>Việt Nam</a>
//                                 </li>
//                                 <li className='nav-item'>
//                                     <a className='nav-link' data-toggle='tab' href='#dmCoSoTabEn'>English</a>
//                                 </li>

//                                 <div style={{ position: 'absolute', top: '16px', right: '8px' }}>
//                                     <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
//                                         <label htmlFor='dmCoSoActive'>Kích hoạt: </label>&nbsp;&nbsp;
//                                         <div className='toggle'>
//                                             <label>
//                                                 <input type='checkbox' id='dmCoSoActive' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
//                                                 <span className='button-indecator' />
//                                             </label>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </ul>
//                             <div className='tab-content' style={{ marginTop: 8 }}>
//                                 <div id='dmCoSoTabVi' className='tab-pane fade show active'>
//                                     <div className='form-group'>
//                                         <label htmlFor='dmCoSoNameVi'>Tên cơ sở</label>
//                                         <input className='form-control' id='dmCoSoNameVi' type='text' placeholder='Tên cơ sở' readOnly={readOnly} />
//                                     </div>
//                                     <div className='form-group'>
//                                         <label htmlFor='dmCoSoAddressVi'>Địa chỉ</label>
//                                         <input className='form-control' id='dmCoSoAddressVi' type='text' placeholder='Địa chỉ' readOnly={readOnly} />
//                                     </div>
//                                     <div className='form-group'>
//                                         <label htmlFor='dmCoSoAbbreviationVi'>Tên viết tắt</label>
//                                         <input className='form-control' id='dmCoSoAbbreviationVi' type='text' placeholder='Tên viết tắt' readOnly={readOnly} />
//                                     </div>
//                                     <div className='form-group'>
//                                         <label>Mô tả</label>
//                                         <Editor ref={this.editorVi} placeholder='Mô tả' readOnly={readOnly} />
//                                     </div>
//                                 </div>

//                                 <div id='dmCoSoTabEn' className='tab-pane fade'>
//                                     <div className='form-group'>
//                                         <label htmlFor='dmCoSoNameEn'>Name</label>
//                                         <input className='form-control' id='dmCoSoNameEn' type='text' placeholder='Name' readOnly={readOnly} />
//                                     </div>
//                                     <div className='form-group'>
//                                         <label htmlFor='dmCoSoAddressEn'>Address</label>
//                                         <input className='form-control' id='dmCoSoAddressEn' type='text' placeholder='Address' readOnly={readOnly} />
//                                     </div>
//                                     <div className='form-group'>
//                                         <label htmlFor='dmCoSoAbbreviationEn'>Abbreviation</label>
//                                         <input className='form-control' id='dmCoSoAbbreviationEn' type='text' placeholder='Abbreviation' readOnly={readOnly} />
//                                     </div>
//                                     <div className='form-group'>
//                                         <label>Description</label>
//                                         <Editor ref={this.editorEn} placeholder='Description' readOnly={readOnly} />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className='modal-footer'>
//                             <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
//                             {!readOnly && <button type='submit' className='btn btn-primary'>Lưu</button>}
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         );
//     }
// }

class DmCoSoPage extends AdminPage {
    state = { searching: false };

    // componentDidMount() {
    //     T.ready('/user/category', () => {
    //         T.onSearch = (searchText) => this.props.getDmDienChinhSachPage(undefined, undefined, searchText || '');
    //         T.showSearchBox();
    //         this.props.getDmDienChinhSachPage();
    //     });

    // }
    // searchBox = React.createRef();
    // modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmCoSoAll());
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => {
        this.props.updateDmCoSo(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục cơ sở', 'Bạn có chắc bạn muốn xóa cơ sở này?', true, isConfirm =>
            isConfirm && this.props.deleteDmCoSo(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmCoSo', ['read', 'write', 'delete']);
        let items = this.props.dmCoSo && this.props.dmCoSo.items ? this.props.dmCoSo.items : [];
        const table = renderTable({
            getDataSource: () => items, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '40%' }}>Tên cơ sở</th>
                    <th style={{ width: '60%' }}>Địa chỉ</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={T.language.parse(item.ten, true).vi} onClick={() => this.modal.show(item)} />
                    <TableCell type='text' content={T.language.parse(item.diaChi, true).vi} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission} 
                        onChanged={() => this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} 
                        onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)}></TableCell>
                </tr>)
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục cơ sở',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục cơ sở'
            ],
            content: <>
                <div className='tile'>{table}</div>
                {/* <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} 
                    getPage={this.props.getDmDienChinhSachPage} /> */}
                <EditModal ref={e => this.modal = e} permission={permission} 
                    create={this.props.createDmCoSo} update={this.props.updateDmCoSo} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }

}

const mapStateToProps = state => ({ system: state.system, dmCoSo: state.dmCoSo });
const mapActionsToProps = { getDmCoSoAll, createDmCoSo, updateDmCoSo, deleteDmCoSo };
export default connect(mapStateToProps, mapActionsToProps)(DmCoSoPage);