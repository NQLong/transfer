import React from 'react';
import { connect } from 'react-redux';
import { getSdhChuongTrinhDaoTao, SelectAdapter_CtDtFilterByKhungDt, updateSdhChuongTrinhDaoTao } from './redux';
import { AdminPage, renderTable, TableCell, FormSelect, AdminModal } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

const data = [
    { id: 1, text: 'Học kì 1'},
    { id: 2, text: 'Học kì 2'},
    { id: 3, text: 'Học kì 3'},
    { id: 4, text: 'Học kì 4'}
];

class HocKyModal extends AdminModal {
    onSubmit = (e) => {
        e.preventDefault();
        if (!this.hocKy.value()) {
            T.notify('Chưa chọn học kì', 'danger');
            this.hocKy.focus();
        } else {
            this.props.addNewHocKy(this.hocKy.value());
            this.hide();
        }
    };

    render = () => {
        return this.renderModal({
            title: 'Tạo mới học kì',
            submitText: 'Tạo mới',
            body: <div>
                <FormSelect ref={e => this.hocKy = e} label='Khóa đào tạo' data={data} required />
            </div>
        });
    }
}

class SdhKeHoachDaoTaoDetails extends AdminPage {
    state = {
        chuongTrinhDaoTao: {},
        ctsdh: []
    };
    rows = {};
    componentDidMount() {
        T.ready('/user/sau-dai-hoc/chuong-trinh-dao-tao', () => {
            const route = T.routeMatcher('/user/sau-dai-hoc/ke-hoach-dao-tao/:ma'),
                ma = route.parse(window.location.pathname)?.ma;
            this.getData(ma);
        });
    }

    getData = (ma) => {
        this.props.getSdhChuongTrinhDaoTao(ma, (ctsdh) => {
            let chuongTrinhDaoTao = {};
            ctsdh.forEach((item, index) => {
                if (item.hocKy) {
                    if (!chuongTrinhDaoTao[item.hocKy]) {
                        chuongTrinhDaoTao[item.hocKy] = [];
                    } 
                    item.isEdit = false;
                    item.isDelete = false;
                    item.idx = index;
                    chuongTrinhDaoTao[item.hocKy].push(item);
                } 
            });
            this.setState({ ma, ctsdh, chuongTrinhDaoTao });
        });
    }

    createHocKy = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    addHocKy = (hocKy) => {
        let chuongTrinhDaoTao = this.state.chuongTrinhDaoTao;
        if (chuongTrinhDaoTao[hocKy]) {
            T.notify('Đã có học kì ' + hocKy, 'danger');
        } else {
            chuongTrinhDaoTao[hocKy] = [];
            this.setState({ chuongTrinhDaoTao });
        }
    }

    findCtdtById = (id) => {
        let ctsdh = this.state.ctsdh,
            result = ctsdh.findIndex(v => v.id == id);
        return result;
    }

    addRow = (e, hocKy) => {
        e.preventDefault();
        let id = this.rows[`selectMh_${hocKy}`].value(),
            chuongTrinhDaoTao = this.state.chuongTrinhDaoTao,
            ctsdh = this.state.ctsdh;
        if (!id) {
            T.notify('Chưa chọn môn học!', 'danger');
            this.rows[`selectMh_${hocKy}`].focus();
        } else {
            let index = this.findCtdtById(id);
            if (ctsdh[index].hocKy) {
                T.notify(`Trùng môn học ${ctsdh[index].maMonHoc}:${ctsdh[index].tenMonHoc}!`, 'danger');
            } else this.props.updateSdhChuongTrinhDaoTao(id, { hocKy }, (item) => {
                item.isEdit = false;
                item.isDelete = false;
                chuongTrinhDaoTao[hocKy].push(item);
                if (index != -1) ctsdh[index].hocKy = Number(hocKy);
                this.setState({ chuongTrinhDaoTao, ctsdh });
            });
        } 
        
    }

    editRow = (e, hocKy, index) => {
        e.preventDefault();
        let chuongTrinhDaoTao = this.state.chuongTrinhDaoTao;
        chuongTrinhDaoTao[hocKy][index].isEdit = true;
        this.setState({ chuongTrinhDaoTao }, () => {
            let item = chuongTrinhDaoTao[hocKy][index];
            this.rows[`selectMh_${hocKy}_${index}`].value({ id: item.id, text: item.maMonHoc + ':' + item.tenMonHoc });
        });
    }

    updateRow = (e, hocKy, index) => {
        e.preventDefault();
        let chuongTrinhDaoTao = this.state.chuongTrinhDaoTao,
            ctsdh = this.state.ctsdh,
            oldItem = chuongTrinhDaoTao[hocKy][index],
            newId = this.rows[`selectMh_${hocKy}_${index}`].value();
        if (!newId) {
            T.notify('Chưa chọn môn học!', 'danger');
            this.this.rows[`selectMh_${hocKy}_${index}`].focus();
        } else {
            let ctIndex =  this.findCtdtById(newId);
            if (ctsdh[ctIndex].hocKy) {
                let hkIndex = chuongTrinhDaoTao[hocKy].findIndex(v => v.id == ctsdh[ctIndex].id);
                if (hkIndex != -1 && hkIndex == index) {
                    chuongTrinhDaoTao[hocKy][index].isEdit = false;
                    this.setState({ chuongTrinhDaoTao });
                } else T.notify(`Trùng môn học ${ctsdh[ctIndex].maMonHoc}:${ctsdh[ctIndex].tenMonHoc}!`, 'danger');
            } else {
                this.props.updateSdhChuongTrinhDaoTao(oldItem.id, {hocKy: null}, () => {
                    this.props.updateSdhChuongTrinhDaoTao(newId, { hocKy }, (item) => {
                        item.isEdit = false;
                        item.isDelete = false;
                        chuongTrinhDaoTao[hocKy][index] = item;
                        if (ctIndex != -1) ctsdh[ctIndex].hocKy = Number(hocKy);
                        this.setState({ chuongTrinhDaoTao, ctsdh });
                    });
                });
            }
        }
    }

    removeRow = (e, id, hocKy, index) => {
        e.preventDefault();
        let chuongTrinhDaoTao = this.state.chuongTrinhDaoTao,
            ctsdh = this.state.ctsdh;
        this.props.updateSdhChuongTrinhDaoTao(id, { hocKy: null }, () => {
            chuongTrinhDaoTao[hocKy].splice(index, 1);
            let ctIndex = this.findCtdtById(id);
            if (ctIndex != -1) ctsdh[ctIndex].hocKy = null;
            this.setState({ chuongTrinhDaoTao, ctsdh });
        });
    }

    selectMh = (item, hocKy, index) => {
        return (item && item.isEdit) || !item ? (
            <>
                <FormSelect ref={e => this.rows[`selectMh_${hocKy}${index != null ? '_' + index : ''}`] = e} data={SelectAdapter_CtDtFilterByKhungDt(this.state.ma)} style={{ marginBottom: 0 }} placeholder='Chọn môn học' readOnly={item ? !item.isEdit : false} />
            </>
        ) : <>{item.maMonHoc + ':' + item.tenMonHoc}</>;
    }

    renderTable = (list, hocKy, isAddMonHoc) => {
        const permission = this.getUserPermission('sdhChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage']),
            readOnly = !(permission.write || permission.manage);
        if (isAddMonHoc && list.length == 0) list.push('new');
        return renderTable({
            getDataSource: () => list.sort((a, b) => a.id - b.id),
            stickyHead: false,
            header: 'thead-light',
            emptyTable:'Không có dữ liệu',
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>STT</th>
                        <th rowSpan='2' style={{ width: '100%', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Môn học</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Tự chọn</th>
                        <th rowSpan='1' colSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Tín chỉ</th>
                        {isAddMonHoc && !readOnly && <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>}
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TH/TN</th>
                    </tr>
                </>),
            renderRow: (item, index) => {
                return (
                    <React.Fragment key={index}>
                        {item != 'new' && <tr>
                            <TableCell type='text' style={{ textAlign: 'center' }} content={index+1} />
                            <TableCell type='text' style={{ fontWeight: 'bold' }} content={isAddMonHoc ? this.selectMh(item, hocKy, index) : item.maMonHoc + ':' + item.tenMonHoc}/>
                            <TableCell content={item.loaiMonHoc ? <i className='fa fa-check' aria-hidden='true'></i> : ''} style={{ textAlign: 'center' }} />
                            <TableCell type='number' style={{ textAlign: 'center',}} content={item.tinChiLyThuyet} />
                            <TableCell type='number' style={{ textAlign: 'center',}} content={item.tinChiThucHanh} />
                            {isAddMonHoc && <td style={{ textAlign: 'center' }}>
                                <div className='btn-group'>
                                    {
                                        (!readOnly) ?
                                            <>
                                                <a className='btn btn-primary' href='#' title={!item.isEdit ? 'Chỉnh sửa' : 'Xong'} onClick={(e) => !item.isEdit ?  this.editRow(e, hocKy, index) : this.updateRow(e, hocKy, index)}><i className={'fa fa-lg ' + (!item.isEdit ? 'fa-edit' : 'fa-check')} /></a>
                                                {!item.isEdit && <a className='btn btn-danger' href='#' title='Xóa' onClick={(e) => this.removeRow(e, item.id, hocKy, index )}><i className='fa fa-lg fa-trash' /></a>}
                                            </> : ''
                                    }
                                </div>
                            </td>}
                        </tr>}
                        {isAddMonHoc && index == list.length - 1 &&
                            <tr>
                                <TableCell type='text' style={{ textAlign: 'center' }} content={''} />
                                <TableCell type='text' style={{ fontWeight: 'bold' }} content={this.selectMh(null, hocKy)}/>
                                <TableCell content={''} style={{ textAlign: 'center' }} />
                                <TableCell type='number' style={{ textAlign: 'center',}} content={0} />
                                <TableCell type='number' style={{ textAlign: 'center',}} content={0} />
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        {
                                            (!readOnly) ?
                                                <>
                                                    <a className='btn btn-primary' href='#' title='Xong' onClick={(e) => this.addRow(e, hocKy)}><i className='fa fa-lg fa-check' /></a>
                                                </> : ''
                                        }
                                    </div>
                                </td>
                            </tr>}
                    </React.Fragment>
                );
            },
        });


    }

    render() {
        const permission = this.getUserPermission('sdhChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage']),
            readOnly = !(permission.write || permission.manage);

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Chỉnh sửa kế hoạch đào tạo',
            breadcrumb: [
                <Link key={1} to='/user/sau-dai-hoc/chuong-trinh-dao-tao'>Chương trình đào tạo</Link>,
                <Link key={2} to={`/user/sau-dai-hoc/chuong-trinh-dao-tao/${this.state.ma}`}>Chỉnh sửa chương trình đào tạo</Link>,
                'Chỉnh sửa kế hoạch đào tạo',
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Tất cả môn học</h3>
                    <div className='tile-body'>
                        {this.renderTable(this.state.ctsdh)}
                    </div>
                </div>
                {this.state.chuongTrinhDaoTao && Object.keys(this.state.chuongTrinhDaoTao).map((item, index) => (
                    <div key={index} className='tile'>
                        <h3 className='tile-title'>Học kỳ {item}</h3>
                        <div className='tile-body'>
                            {this.renderTable(this.state.chuongTrinhDaoTao[item], item, true)}
                        </div>
                    </div>
                ))}
                <HocKyModal ref={e => this.modal = e} addNewHocKy={this.addHocKy} />
            </>,
            backRoute: `/user/sau-dai-hoc/chuong-trinh-dao-tao/${this.state.ma}`,
            onCreate: !readOnly ? this.createHocKy : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhChuongTrinhDaoTao: state.daoTao.sdhChuongTrinhDaoTao });
const mapActionsToProps = { getSdhChuongTrinhDaoTao, updateSdhChuongTrinhDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(SdhKeHoachDaoTaoDetails);

