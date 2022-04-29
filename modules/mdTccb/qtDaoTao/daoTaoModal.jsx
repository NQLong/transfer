import { AdminModal, FormCheckbox, FormFileBox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import React from 'react';
import { SelectApdater_DmBangDaoTao } from 'modules/mdDanhMuc/dmBangDaoTao/redux';
import { SelectApdaterDmTrinhDoDaoTaoFilter } from 'modules/mdDanhMuc/dmTrinhDoDaoTao/redux';
import { SelectAdapter_DmHinhThucDaoTaoV2 } from 'modules/mdDanhMuc/dmHinhThucDaoTao/redux';
import { DateInput } from 'view/component/Input';
import Dropdown from 'view/component/Dropdown';

const EnumDateType = {
    0: { text: '' },
    1: { text: 'dd/mm/yyyy' },
    2: { text: 'mm/yyyy' },
    3: { text: 'yyyy' },
}, typeMapper = {
    'yyyy': 'year',
    'mm/yyyy': 'month',
    'dd/mm/yyyy': 'date'
};

const chuyenNganhSupportText = {
    5: 'Ngoại ngữ',
    6: 'Tin học',
    7: 'Lý luận chính trị',
    8: 'Quản lý nhà nước'
};
export class DaoTaoModal extends AdminModal {
    state = {
        id: null,
        item: null,
        shcc: '',
        email: '',
        batDau: '',
        ketThuc: '',
        loaiBangCap: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        listFile: []
    }

    onShow = (item) => {
        let { id, batDauType, ketThucType, batDau, ketThuc, trinhDo, chuyenNganh, tenCoSoDaoTao, hinhThuc, loaiBangCap, minhChung }
            = item && item.item ? item.item :
                {
                    id: null, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, chuyenNganh: '',
                    tenCoSoDaoTao: '', kinhPhi: '', hinhThuc: '', loaiBangCap: '', trinhDo: '', minhChung: '[]'
                };
        let listFile = T.parse(minhChung || '[]');
        this.setState({
            batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThuc ? ketThucType : 'dd/mm/yyyy',
            listFile,
            shcc: item.shcc, id, batDau, ketThuc, loaiBangCap: loaiBangCap ? loaiBangCap : (item.loaiBangCap ? item.loaiBangCap : ''),
            item: item.item, denNay: item.ketThuc == -1 ? true : false
        }, () => {
            this.loaiBangCap.value(this.state.loaiBangCap);
            this.trinhDo?.value(trinhDo ? trinhDo : (item.trinhDo ? item.trinhDo : ''));
            this.chuyenNganh?.value(chuyenNganh ? chuyenNganh : (chuyenNganhSupportText[this.state.loaiBangCap] || ''));
            this.tenCoSoDaoTao?.value(tenCoSoDaoTao ? tenCoSoDaoTao : '');
            this.hinhThuc?.value(hinhThuc ? hinhThuc : '');
            if (this.state.ketThuc == -1) {
                this.setState({ denNay: true });
                this.denNayCheck.value(true);
                $('#ketThucDate').hide();
                $('#denNayCheck').show();
            }
            this.batDauType?.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType?.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.batDau?.setVal(batDau ? batDau : '');
            this.ketThuc?.setVal(ketThuc ? ketThuc : '');
            this.fileBox.setData('minhChungHocVi:' + this.props.shcc);
        });
    }

    onSubmit = () => {
        const changes = {
            shcc: this.props.shcc,
            batDau: this.batDau.getVal(),
            ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1,
            batDauType: this.state.batDauType,
            ketThucType: this.state.ketThucType,
            tenTruong: this.tenCoSoDaoTao.value(),
            chuyenNganh: this.chuyenNganh.value(),
            hinhThuc: this.hinhThuc.value(),
            loaiBangCap: this.loaiBangCap.value(),
            trinhDo: this.trinhDo.value(),
            minhChung: T.stringify(this.state.listFile, '[]')
        };

        if (!changes.loaiBangCap) {
            T.notify('Loại bằng cấp bị trống!', 'danger');
            this.loaiBangCap.focus();
        } else if (!changes.chuyenNganh) {
            T.notify('Nội dung bị trống!', 'danger');
            this.chuyenNganh.focus();
        } else this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
    }

    handleBang = (value) => {
        this.setState({ loaiBangCap: value.id }, () => {
            this.trinhDo?.value(this.state.item?.trinhDo ? this.state.item?.trinhDo : '');
            this.chuyenNganh?.value(this.state.item?.chuyenNganh ? this.state.item?.chuyenNganh : chuyenNganhSupportText[value.id]);
        });
    }

    checkBang = (loaiBangCap) => {
        return (loaiBangCap != '' && loaiBangCap != '1' && loaiBangCap != '2' && loaiBangCap != '9');
    };

    handleKetThuc = (value) => {
        console.log($('#ketThucDate'));
        value ? $('#ketThucDate').hide() : $('#ketThucDate').show();
        this.setState({ denNay: value });
        if (!value) {
            this.ketThucType?.setText({ text: this.state.ketThucType ? this.state.ketThucType : 'dd/mm/yyyy' });
        } else {
            this.ketThucType?.setText({ text: '' });
        }
    }


    deleteFile = (e, index) => {
        e.preventDefault();
        T.confirm('Xóa dữ liệu', 'Bạn có muốn xóa tập tin này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                let listFile = this.state.listFile;
                listFile.splice(index, 1);
                this.setState({ listFile },
                    () => T.notify('Xóa dữ liệu thành công', 'success'));
            }
        });
    };

    onSuccess = (response) => {
        if (response.data) {
            let listFile = [...this.state.listFile];
            listFile.push(response.data);
            this.setState({ listFile });
        } else if (response.error) T.notify(response.error, 'danger');
    }

    split = (input) => {
        let arr = input.split('/');
        let shcc = arr[1];
        let suffix = arr[2];
        let date = suffix.split('_')[0];
        let name = suffix.substring(date.length + 1);
        return { shcc, date, name };
    };

    tableListFile = (data, permission) => {
        return renderTable({
            getDataSource: () => data,
            stickyHead: false,
            emptyTable: 'Chưa có file minh chứng nào!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '100%' }}>Tên tập tin</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày upload</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                let { date, name } = this.split(item);
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{ wordBreak: 'break-all' }} content={<>
                            <a href={'/api/qua-trinh/dao-tao/download' + item} download>{name}</a>
                        </>
                        } />
                        <TableCell style={{ textAlign: 'center' }} content={T.dateToText(parseInt(date), 'dd/mm/yyyy HH:MM')}></TableCell>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={{ delete: permission }} onDelete={e => this.deleteFile(e, index)}>
                            <a className='btn btn-warning' href={'/api/qua-trinh/dao-tao/download' + item} download>
                                <i className='fa fa-lg fa-download' />
                            </a>
                        </TableCell>
                    </tr>
                );
            }
        });
    }

    render = () => {
        let readOnly = this.props.isCanBo || true;
        const displayElement = this.state.loaiBangCap == '' ? 'none' : 'block';
        return this.renderModal({
            title: `Thông tin quá trình đào tạo ${this.props.title}`,
            size: 'elarge',
            body: <div className='row'>
                <FormSelect className='form-group col-md-12' ref={e => this.loaiBangCap = e} label='Loại bằng cấp' data={SelectApdater_DmBangDaoTao} onChange={this.handleBang} required />
                {
                    (this.state.loaiBangCap != '5' && this.state.loaiBangCap != '9') ?
                        <FormSelect ref={e => this.trinhDo = e} data={SelectApdaterDmTrinhDoDaoTaoFilter(this.state.loaiBangCap)}
                            className='col-md-6' style={{ display: this.checkBang(this.state.loaiBangCap) ? 'block' : 'none' }} label='Trình độ' />
                        :
                        <FormTextBox ref={e => this.trinhDo = e} className='form-group col-md-6' label='Trình độ/Kết quả' required />
                }
                <FormSelect ref={e => this.hinhThuc = e} className='form-group col-md-6' label='Hình thức' data={SelectAdapter_DmHinhThucDaoTaoV2} style={{ display: displayElement }} />
                <FormTextBox ref={e => this.chuyenNganh = e} className='form-group col-md-12' label='Chuyên ngành/Nội dung' style={{ display: displayElement }} required readOnly={!!chuyenNganhSupportText[this.state.loaiBangCap]} />
                <FormTextBox ref={e => this.tenCoSoDaoTao = e} className='form-group col-md-12' label='Tên cơ sở bồi dưỡng, đào tạo' style={{ display: displayElement }} />
                <div className='form-group col-md-6' style={{ display: displayElement }}><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (<Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>

                <div id='denNayCheck' style={{ display: displayElement }} className='form-group col-md-6' >
                    <FormCheckbox ref={e => this.denNayCheck = e} label='Đang diễn ra' onChange={this.handleKetThuc} />
                </div>

                <div id='ketThucDate' className='form-group col-md-6' style={{ display: displayElement }}><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (<Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={this.state.denNay} />)</div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} readOnly={this.state.denNay} />
                </div>
                <div className='form-group col-12'>
                    <p>Danh sách minh chứng</p>
                    <div className='tile-body row'>
                        <div className='form-group col-md-7'>
                            {this.tableListFile(this.state.listFile || [], readOnly)}
                        </div>
                        <FormFileBox className='col-md-5' ref={e => this.fileBox = e} label={'Tải lên file minh chứng (word, hình ảnh, pdf)'} postUrl='/user/upload' uploadType='minhChungHocVi' userData='minhChungHocVi' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.onSuccess} />
                    </div>
                </div>

            </div>
        });
    }
}