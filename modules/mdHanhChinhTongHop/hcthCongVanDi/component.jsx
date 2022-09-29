import React from 'react';
import { AdminModal, renderTimeline } from 'view/component/AdminPage';
export class FileHistoryModal extends AdminModal {

    state = {
        historySortType: true
    }

    onShow = (item) => {
        const { id } = item;
        this.setState({ id, item });
    }

    renderHistory = (history) => renderTimeline({
        getDataSource: () => history,
        handleItem: (item) => ({
            component: <>
                <span className="time">{T.dateToText(item.thoiGian, 'dd/mm/yyyy HH:MM:ss')}</span>
                <p style={{ display: 'flex', justifyContent: 'space-between', color: 'blue' }}>
                    <a href={`/api/hcth/van-ban-di/download/${item.ma}/${item.tenFile}`} download>{item.ten}</a>
                    <span>{(item.hoNguoiTao ? item.hoNguoiTao.normalizedName() : ' ') + ' ' + (item.tenNguoiTao ? item.tenNguoiTao.normalizedName() : ' ')}</span>
                </p>
            </>
        })
    });

    onChangeHistorySort = () => {
        this.setState(state => ({
            historySortType: !state.historySortType,
            item: { ...state.item, danhSachCapNhat: state.item.danhSachCapNhat.reverse() }
        }));
    }

    render = () => {
        let listHistoryFile = this.state.item?.danhSachCapNhat || [];

        return this.renderModal({
            title: <span><i className={`btn fa fa-sort-amount-${this.state.historySortType ? 'desc' : 'asc'}`} onClick={this.onChangeHistorySort} /> Lịch sử văn bản</span>,
            body: <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 16, maxHeight: 400, overflowY: 'scroll' }}>
                    {this.renderHistory(listHistoryFile)}
                </div>
            </div>
        });
    }
}