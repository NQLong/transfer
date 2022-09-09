import React from 'react';
import { AdminPage, renderComment, FormRichTextBox, renderTimeline } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { createPhanHoi } from '../redux';
import { action } from 'modules/mdHanhChinhTongHop/constant';


const actionToText = (value) => {
    switch (value) {
        case action.CREATE:
            return 'tạo';
        case action.UPDATE:
            return 'cập nhật';
        case action.RETURN:
            return 'trả lại';
        case action.APPROVE:
            return 'duyệt';
        case action.ACCEPT:
            return 'chấp nhận';
        case action.READ:
            return 'đọc';
        case action.SEND:
            return 'gửi';
        case action.VIEW:
            return 'xem';
        case action.ADD_SIGN_REQUEST:
            return 'thêm 1 yêu cầu trình ký ở';
        case action.REMOVE_SIGN_REQUEST:
            return 'xoá 1 yêu cầu trình ký ở';
        case action.UPDATE_SIGN_REQUEST:
            return 'cập nhật 1 yêu cầu trình ký ở';
        case action.WAIT_SIGN:
            return 'chuyển trạng thái sang chờ ký tại';
        case action.DISTRIBUTE:
            return 'đã phân phối';
        default:
            return '';
    }
};

const actionColor = (value) => {
    switch (value) {
        case action.CREATE:
        case action.ACCEPT:
        case action.APPROVE:
        case action.UPDATE_SIGN_REQUEST:
            return '#00a65a';
        case action.RETURN:
        case action.REMOVE_SIGN_REQUEST:
            return 'red';
        case action.ADD_SIGN_REQUEST:
        case action.VIEW:
            return '#28a745';
        default:
            return 'blue';
    }
};

class LichSu extends AdminPage {


    renderHistory = (history) => renderTimeline({
        getDataSource: () => history,
        handleItem: (item) => ({
            className: item.hanhDong == action.RETURN ? 'danger' : '',
            component: <>
                <span className='time'>{T.dateToText(item.thoiGian, 'dd/mm/yyyy HH:MM')}</span>
                <p><b style={{ color: 'blue' }}>{(item.ho?.normalizedName() || '') + ' '} {item.ten?.normalizedName() || ' '}</b> đã <b style={{ color: actionColor(item.hanhDong) }}> {actionToText(item.hanhDong)} </b> văn bản này. </p>
            </>
        })
    })

    render() {
        return <React.Fragment>
            <div className='tile'>
                <h3 className='tile-title'><i className={`btn fa fa-sort-amount-${this.props.historySortType == 'DESC' ? 'desc' : 'asc'}`} onClick={this.props.onChangeSort} /> Lịch sử</h3>
                <div className='tile-body row'>
                    <div className='col-md-12' style={{ maxHeight: '60vh', overflowY: 'auto' }} >
                        {this.renderHistory(this.props.hcthCongVanDi?.item?.history)}
                    </div>
                </div>
            </div>
        </React.Fragment>
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi, phanHoi: state.hcth.hcthPhanHoi });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(LichSu);