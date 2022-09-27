import React from 'react';
import { AdminModal, AdminPage, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_TcNhom, createNhom } from './redux';
import { connect } from 'react-redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';

class EditModal extends AdminModal {
    onShow = () => {
        this.ten.value('');
        this.nhomCha.value('');
        this.nganh.value([]);
    }
    onSubmit = () => {
        const data = {
            ten: this.ten.value(),
            nhomCha: this.nhomCha.value() || null,
            nganh: this.nganh.value()
        };
        this.props.create(data, () => this.hide());
    }
    render = () => {
        return this.renderModal({
            title: 'Thêm nhóm',
            body: <div className='row' >
                <FormTextBox className='col-md-12' label='Tên nhóm' ref={e => this.ten = e} />
                <FormSelect data={SelectAdapter_TcNhom} className='col-md-12' label='Nhóm cha' ref={e => this.nhomCha = e} />
                <FormSelect data={SelectAdapter_DtNganhDaoTao} className='col-md-12' label='Ngành' ref={e => this.nganh = e} multiple />
            </div>
        });
    }
}


export class TcNhom extends AdminPage {
    render() {
        return this.renderPage({
            title: 'Nhóm ngành',
            content: <div>
                <EditModal ref={e => this.editModal = e} create={this.props.createNhom} />
            </div>,
            onCreate: () => this.editModal.show()

        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createNhom };
export default connect(mapStateToProps, mapActionsToProps)(TcNhom);
