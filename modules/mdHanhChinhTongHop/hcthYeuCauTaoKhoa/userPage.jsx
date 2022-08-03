import React from 'react';
import { AdminModal, AdminPage, FormTextBox, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { createRequest, getUserRequest, getKey } from './redux';
const { trangThaiRequest } = require('../constant');
class CreateModal extends AdminModal {

    onShow = () => {
        this.lyDo.value('');
    }

    onSubmit = () => {
        const data = {
            lyDo: this.lyDo.value()
        };
        if (!data.lyDo) {
            T.notify('Vui lòng nhập lý do', 'danger');
            return
        } else {
            this.props.create(data);
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo yêu cầu mới',
            size: 'small',
            body: <div className='row'>
                <FormTextBox ref={e => this.lyDo = e} label='Lý do' className='col-md-12' />
            </div>
        });
    }
}

class DownloadModal extends AdminModal {

    onShow = () => {
        this.passphrase.value('');
    }

    onSubmit = () => {
        const data = {
            passphrase: this.passphrase.value()
        };
        if (!data.passphrase) {
            T.notify('Vui lòng nhập lý do', 'danger');
            this.passphrase.focus();
        } else if (data.passphrase.length < 8) {
            T.notify('Mật khẩu phải có ít nhất 8 ký tự', 'danger');
            this.passphrase.focus();
        } else {
            this.props.create(data);
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo yêu cầu mới',
            size: 'small',
            body: <div className='row'>
                <FormTextBox ref={e => this.passphrase = e} label='Lý do' className='col-md-12' />
            </div>
        });
    }
}

export class UserYeuCauTaoKhoa extends AdminPage {
    state = { key: null }

    componentDidMount() {
        T.ready(this.pageConfig.ready, () => {
            this.props.getUserRequest(0, 100);
            this.props.getKey(key => this.setState({ key }, () => {

            }));
        });
    }

    renderKey = () => renderTable({
        getDataSource: () => {
            if (this.state.key) {
                const key = this.state.key;
                return key.yeuCau ? [key] : [];
            }
            return this.state.key
        },
        loadingOverlay: false,
        emptyTable: 'Chưa có yêu cầu tạo khóa',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày duyệt</th>
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Duyệt bởi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
        </tr>,
        renderRow: ({ yeuCau, khoa }, index) => {
            return <tr key={khoa.id}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={yeuCau.ngayCapNhat && T.dateToText(new Date(yeuCau.ngayCapNhat), 'HH:MM dd/mm/yyyy')} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={yeuCau.shccCanBoCapNhat ? `${yeuCau.shccCanBoCapNhat}: ` + `${yeuCau.hoCanBoCapNhat} ${yeuCau.tenCanBoCapNhat}`.trim().normalizedName() : ''} />
                <TableCell type='checkbox' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} onChange={() => this.onDisableKey(khoa)} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons' >
                    {!khoa.publicKey && <button className='btn btn-success' onClick={() => this.downloadModal.show()}>
                        <i className='fa fa-lg fa-download' />
                    </button>}
                </TableCell>
            </tr>
        }
    });

    renderTable = () => renderTable({
        getDataSource: () => this.props.hcthYeuCauTaoKhoa?.userPage?.list,
        loadingOverlay: false,
        emptyTable: 'Chưa có yêu cầu tạo khóa',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Lý do</th>
            {/* <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Người yêu cầu</th> */}
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày yêu cầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày cập nhật</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
            {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th> */}
        </tr>,
        renderRow: (item, index) => {
            return <tr key={item.id}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.R || index} />
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.shcc}: ` + `${item.ho} ${item.ten}`.trim().normalizedName()} /> */}
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lyDo} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayTao && T.dateToText(new Date(item.ngayTao), 'HH:MM dd/mm/yyyy')} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayCapNhat && T.dateToText(new Date(item.ngayCapNhat), 'HH:MM dd/mm/yyyy')} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.trangThai ? trangThaiRequest[item.trangThai]?.text : ''} />
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={''} /> */}
            </tr>
        }
    });

    pageConfig = {
        title: 'Yêu cầu tạo khóa',
        ready: '/user',
        icon: 'fa fa-key'
    }


    render() {
        const permissions = this.getCurrentPermissions();
        return this.renderPage({
            title: this.pageConfig.title,
            icon: this.pageConfig.icon,
            content: <>
                <div className='tile row'>
                    <h3 className='tile-header'>Khóa của bạn</h3>
                    <div className='col-md-12'>
                        {this.renderKey()}
                    </div>
                </div>
                <div className='tile row'>
                    <h3 className='tile-header'>Lịch sử yêu cầu tạo khóa</h3>
                    <div className='tile-body col-md-12'>
                        {this.renderTable({})}
                    </div>
                </div>
                <CreateModal ref={e => this.modal = e} create={this.props.createRequest} />
                <DownloadModal ref={e => this.downloadModal = e} download={() => { }} />
            </>,
            onCreate: permissions.some(item => ['rectors:login', 'persident:login', 'manager:write'].includes(item)) ? () => this.modal.show() : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthYeuCauTaoKhoa: state.hcth.hcthYeuCauTaoKhoa });
const mapActionsToProps = { createRequest, getUserRequest, getKey };
export default connect(mapStateToProps, mapActionsToProps)(UserYeuCauTaoKhoa);