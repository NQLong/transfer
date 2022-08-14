import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import T from 'view/js/common';
import { AdminPage, FormDatePicker, FormRichTextBox, FormSelect, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';
import { getHoSo, deleteVanBan, getVanBanDiSelector, addVanBan, getVanBan } from './redux';
import { ThemVanBanModal } from './component';

class HcthHoSoEdit extends AdminPage {
    state = { id: null, isLoading: true };

    componentDidMount() {
        T.ready('/user/hcth', () => {
            const params = T.routeMatcher('/user/hcth/ho-so/:id').parse(window.location.pathname);
            this.setState({
                id: params.id === 'new' ? null : params.id,
            }, () => this.getData());
        });
    }

    getData = () => {
        if (this.state.id) {
            this.props.getHoSo(Number(this.state.id), (item) => this.setState({ isLoading: false }, () => this.setData(item)));
        }
    }

    setData = (data = null) => {
        let { ngayTao, tieuDe, nguoiTao } = data ? data : { ngayTao: '', tieuDe: '', nguoiTao: '' };
        this.ngayTao.value(ngayTao);
        this.nguoiTao.value(nguoiTao);
        this.tieuDe.value(tieuDe);
    }

    deleteVanBan = (e, item) => {
        e.preventDefault();
        T.confirm('Xoá văn bản', 'Bạn có chắc muốn xoá văn bản này ra khỏi hồ sơ hay không?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteVanBan(this.state.id, item.id)
        );
    }

    tableList = (data) => renderTable({
        getDataSource: () => data,
        emptyTable: 'Chưa có văn bản',
        renderHead: () => {
            return <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >#</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }} >Văn bản</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }} >Thời gian tạo</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }} >Trích yếu</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Thao tác</th>

            </tr>;
        },
        renderRow: (item, index) => {
            return <tr key={item.id}>
                <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                <TableCell type='link' contentClassName='multiple-lines' content={`Văn bản đi: ${item.keyB}`} url={`/user/hcth/van-ban-di/${item.keyB}`} />
                <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayTaoDi, 'dd/mm/yyyy')} />
                <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: '100%' }} content={item.trichYeuDi} />
                <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={{ delete: true }} onDelete={e => this.deleteVanBan(e, item)} />
            </tr>;
        }
    });


    renderContent = () => {
        const item = this.props.hcthHoSo?.item;
        return <>
            <div className="tile">
                <h3 className='tile-title'>Chi tiết hồ sơ</h3>
                <div className="tile-body row">
                    <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayTao = e} label='Ngày tạo' readOnly={true} />
                    <FormSelect className='col-md-6' ref={e => this.nguoiTao = e} label='Người tạo' data={SelectAdapter_FwCanBo} readOnly={true} />
                    <FormRichTextBox type='text' className='col-md-12' ref={e => this.tieuDe = e} label='Tiêu đề' readOnly={true} />
                </div>
            </div>

            <div className="tile">
                <h3 className="tile-title">Danh sách văn bản</h3>
                <div className="tile-body row">
                    <div className="col-md-12 form-group">
                        {this.tableList(item?.vanBan)}
                        <div className="d-flex justify-content-end">
                            <button className='btn btn-primary' type='submit' onClick={e => { e.preventDefault(); this.themVanBanModal.show(); }}>
                                Thêm văn bản
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ThemVanBanModal ref={e => this.themVanBanModal = e} hoSoId={this.state.id} {...this.props} getData={this.getData} />
        </>;
    }

    render = () => {
        return this.renderPage({
            icon: 'fa fa-file-text',
            title: `Hồ sơ ${this.state.id}`,
            content: this.state.isLoading ? loadSpinner() : this.renderContent(),
            backRoute: '/user/hcth/ho-so'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthHoSo: state.hcth.hcthHoSo });
const mapActionsToProps = { getHoSo, deleteVanBan, getVanBanDiSelector, addVanBan, getVanBan };
export default connect(mapStateToProps, mapActionsToProps)(HcthHoSoEdit);