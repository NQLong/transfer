import React from 'react';
import { AdminModal, FormTextBox, FormSelect, FormDatePicker, renderTable } from 'view/component/AdminPage';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
export class CanBoKy extends React.Component {

};


export class CreateModal extends AdminModal {
    componentDidMount() {
        T.ready(() => this.onShown(() => { }));
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            congVan: this.congVan.value(),
            canBoKy: this.danhSachCaNBo.value()
        };
        if (!data.congVan) {
            T.notify('Công văn cần trình ký trống', 'danger');
            this.congVan.focus();
        } else if (!data.canBoKy || data.canBoKy.length == 0) {
            T.notify('Cán bộ ký công văn trống', 'danger');
        } else
            this.props.create(data, this.hide);
    };

    render = () => {
        return this.renderModal({
            title: 'Tạo công văn trình ký',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect ref={e => this.congVan = e} data={SelectAdapter_CongVanDi} label='Công văn đi' className='col-md-12' />
                <FormSelect ref={e => this.danhSachCaNBo = e} data={SelectAdapter_FwCanBo} label='Cán bộ kí' className='col-md-12' multiple={true} />
            </div>
        });
    }

}


export class YeuCauKyModal extends AdminModal {

    onShow = (item) => {
        const { id, ten, nguoiTao, thoiGian } = item;
        this.ten?.value(ten || '');
        this.nguoiTao?.value(nguoiTao || '');
        this.thoiGian?.value(thoiGian ? new Date(thoiGian) : '');
        this.canBoKy?.value('');
        this.setState({ id, ten });
    }

    onSubmit = () => {
        const data = {
            fileCongVan: this.state.id,
            canBoKy: this.canBoKy.value() || [],
        }
        console.log(data)
        if (!data.canBoKy || !data.canBoKy.length) {
            T.notify('Chưa có cán bộ ký văn bản được chọn!', 'danger');
            this.canBoKy.focus();
        } else {
            this.props.create(data, this.hide);
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo yêu cầu trình ký',
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox className='col-md-12' label='Tên văn bản' ref={e => this.ten = e} readOnly={true} />
                <FormSelect className='col-md-6' label='Người tải' data={SelectAdapter_FwCanBo} ref={e => this.nguoiTao = e} readOnly={true} />
                <FormDatePicker type='date' className='col-md-6' label='Ngày tải lên' ref={e => this.thoiGian = e} readOnly={true} />
                <FormSelect className='col-md-12' label='Cán bộ ký' data={SelectAdapter_FwCanBo} multiple={true} ref={e => this.canBoKy = e} />
            </div>
        });
    }
}


export class YeuCauKy extends React.Component {

    render() {
        const table = renderTable({
            getDataSource: () => this.props.hcthCongVanDi?.item?.yeuCauKy,
            emptyTable: 'Chưa có văn bản trình ký',
            renderHead: () => {
                return <tr>
                    <th>#</th>
                    <th>Tên văn bản</th>
                    <th>Thời gian tạo</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
            },
            renderRow: () => {
                return <tr>

                </tr>
            },
        });
        return <div className='tile'>
            <h3 className='tile-header'>Văn bản trình ký</h3>
            <div className='tile-body'>
                {table}
            </div>
        </div>
    }

}

