import { SelectApdater_DmBangDaoTao } from 'modules/mdDanhMuc/dmBangDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, renderTable, TableCell, FormSelect } from 'view/component/AdminPage';
import { createQtDaoTao, updateQtDaoTao, deleteQtDaoTao, createQtDaoTaoStaffUser, updateQtDaoTaoStaffUser, deleteQtDaoTaoStaffUser } from './redux';

class EditModal extends AdminModal {
    state = {
        id: null,
        shcc: '',
        email: '',
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    }

    // onShow = (item) => {
    //     let { id, batDauType, ketThucType, batDau, ketThuc, chuyenNganh, tenCoSoDaoTao, kinhPhi, hinhThuc, ketQua, loaiBangCap }
    //         = item && item.item ? item.item :
    //             {
    //                 id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, chuyenNganh: '',
    //                 tenCoSoDaoTao: '', kinhPhi: '', hinhThuc: '', ketQua: '', loaiBangCap: ''
    //             };
    //     this.setState({
    //         email: item.email,
    //         batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
    //         ketThucType: ketThuc ? ketThucType : 'dd/mm/yyyy',
    //         shcc: item.shcc, id, batDau, ketThuc
    //     });
    //     setTimeout(() => {
    //         this.loaiBangCap.value(loaiBangCap ? loaiBangCap : '');
    //         // this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
    //         // this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
    //         // this.batDau.setVal(batDau ? batDau : '');
    //         // this.ketThuc.setVal(ketThuc ? ketThuc : '');
    //         // this.chuyenNganh.value(chuyenNganh);
    //         // this.tenCoSoDaoTao.value(tenCoSoDaoTao ? tenCoSoDaoTao : '');
    //         // this.kinhPhi.value(kinhPhi ? kinhPhi : '');
    //         // this.hinhThuc.value(hinhThuc ? hinhThuc : '');
    //         // this.ketQua.value(ketQua ? ketQua : '');
    //     }, 500);
    // }

    render = () => this.renderModal({
        title: 'Thông tin quá trình đào tạo',
        size: 'large',
        body: <div className='row'>
            <FormSelect className='col-md-12' ref={e => this.loaiBangCap = e} label='Loại bằng cấp' data={SelectApdater_DmBangDaoTao} required/>
        </div>
    });
}


class ComponentDaoTao extends AdminPage {

    state = { shcc: '', email: '' };
    value = (shcc, email) => {
        this.setState({ shcc: shcc, email: email });
    }

    showModal = (e, item, shcc, email) => {
        e.preventDefault();
        this.modal.show({ item: item, shcc: shcc, email: email });
    }

    showModalUpload = (e) => {
        e.preventDefault();
        this.modalUpload.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin quá trình đào tạo', 'Bạn có chắc bạn muốn xóa quá trình này?', true, isConfirm =>
            isConfirm && (this.props.userEdit ? this.props.deleteQtDaoTaoStaffUser(item.id, this.state.email) : this.props.deleteQtDaoTao(item.id, this.state.shcc, true)));
        e.preventDefault();
    }

    render = () => {
        let dataDT = !this.props.userEdit ? this.props.staff?.selectedItem?.daoTao : this.props.staff?.userItem?.daoTao;
        const permission = {
            write: true,
            read: true,
            delete: true
        };

        const renderTableDT = (items) => (
            renderTable({
                getDataSource: () => items,
                stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung bồi dưỡng</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Tên cơ sở</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hình thức</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Kết quả</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{}} content={item.chuyenNganh} />
                        <TableCell type='text' style={{}} content={item.tenCoSoDaoTao} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hinhThuc ? item.tenHinhThuc : ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                            {item.batDau && <span>Từ: <span style={{ color: 'blue' }}>{T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')}</span><br /></span>}
                            {item.ketThuc && <span>Đến: <span style={{ color: 'blue' }}>{T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')}</span></span>}
                        </>} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.kinhPhi ? item.kinhPhi : ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                            {item.loaiBangCap && <span style={{ color: 'blue' }}>{item.tenLoaiBangCap}<br /></span>}
                            {item.trinhTro && <span>Trình độ: <span style={{ color: 'blue' }}>{item.tenLoaiBangCap}<br /></span></span>}
                        </>} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show({ email: this.state.email, item: item, shcc: this.state.shcc })}
                            onDelete={this.delete}></TableCell>
                    </tr>
                )
            })
        );

        return (
            <div className='tile'>
                <h3 className='tile-title'>Quá trình đào tạo</h3>
                <div className='tile-body'>
                    {
                        dataDT && renderTableDT(dataDT)
                    }
                    {<div className='tile-footer' style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className='btn btn-success' type='button' onClick={e => this.showModalUpload(e)}>
                            <i className='fa fa-fw fa-lg fa-upload' />Upload dữ liệu
                        </button>
                        <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null, this.state.shcc, this.state.email)}>
                            <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin đào tạo
                        </button>
                    </div>
                    }
                    <EditModal ref={e => this.modal = e} userEdit={this.props.userEdit}
                        create={this.props.userEdit ? this.props.createQtDaoTaoStaffUser : this.props.createQtDaoTao}
                        update={this.props.userEdit ? this.props.updateQtDaoTaoStaffUser : this.props.updateQtDaoTao}
                    />
                    {/* <UploadData ref={e => this.modalUpload = e}
                        shcc={this.state.shcc} email={this.state.email} userEdit={this.props.userEdit}
                        create={this.props.userEdit ? this.props.createQtNckhStaffUser : this.props.createQtNckhStaff}
                        renderTable={renderTableNCKH} /> */}
                </div>
            </div>
        );

    }
}

const mapStateToProps = state => ({ system: state.system, staff: state.staff });
const mapActionsToProps = {
    createQtDaoTao, updateQtDaoTao, deleteQtDaoTao, createQtDaoTaoStaffUser, updateQtDaoTaoStaffUser, deleteQtDaoTaoStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentDaoTao);