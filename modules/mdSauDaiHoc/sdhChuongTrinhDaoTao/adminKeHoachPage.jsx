import React from 'react';
import { connect } from 'react-redux';
import { getSdhChuongTrinhDaoTao, updateSdhChuongTrinhDaoTao, getSdhKhungDaoTao, updateSdhChuongTrinhDaoTaoMulti, updateKhungDaoTao } from './redux';
import { AdminPage, renderTable, TableCell, FormSelect, AdminModal, FormTextBox } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';

const dataThu = [2, 3, 4, 5, 6, 7];

class EditMonModal extends AdminModal {
    onShow = (item) => {
        this.id = item.id;
        this.hocKy = item.hocKy;
        this.thu.value(item.thu);
        this.tietBatDau.value(item.tietBatDau);
    }
    onSubmit = (e) => {
        e.preventDefault();
        const id = this.id,
            hocKy = this.hocKy;
        const thu = this.thu.value(),
            tietBatDau = this.tietBatDau.value();
        const changes = { hocKy: hocKy, thu: thu, tietBatDau: tietBatDau };
        this.props.updateMonHoc(id, changes);
        this.hide();
    };

    render = () => {
        return this.renderModal({
            title: 'Chỉnh sửa thông tin môn học',
            submitText: 'Xác nhận',
            body: <div>
                <FormSelect ref={e => this.thu = e} label='Thứ' data={dataThu} allowClear />
                <FormTextBox type='number' ref={e => this.tietBatDau = e} label='Tiết bắt đầu' allowClear />
            </div>
        });
    }
}
class HocKyModal extends AdminModal {
    onShow = (item) => {
        $(`#mon${item.id}`).prop('checked', true);
        this.props.handleSelected(item, true);
        this.setState({ data: item });
        this.hocKy.value('');
    }
    onSubmit = (e) => {
        e.preventDefault();
        let idlist = this.props.id;
        this.props.updateMonHocMulti(idlist, { hocKy: this.hocKy.value() });
        this.hide();
    };

    render = () => {
        return this.renderModal({
            title: 'Chọn học kỳ',
            submitText: 'Xác nhận',
            body: <div>
                <FormSelect ref={e => this.hocKy = e} label='Học kỳ' data={this.props.dataHocKy} allowClear />
            </div>
        });
    }
}

class CreateModal extends AdminModal {
    onShow = (soHocKy) => {
        const route = T.routeMatcher('/user/sau-dai-hoc/ke-hoach-dao-tao/:ma'),
            ma = route.parse(window.location.pathname)?.ma;
        this.oldTerm = soHocKy;
        this.ma = ma;
        this.soHocKy.value('');
    }
    onSubmit = (e) => {
        e.preventDefault();
        const newTerm = this.soHocKy.value() + this.oldTerm;
        const maKhung = parseInt(this.ma);
        this.props.updateKhungDaoTao(maKhung, { soHocKy: newTerm }, () => this.props.getData(maKhung));
        this.hide();
    };

    render = () => {
        return this.renderModal({
            title: 'Thêm mới học kì',
            submitText: 'Xác nhận',
            body: <div>
                <FormTextBox type='number' ref={e => this.soHocKy = e} label='Số học kỳ' />
            </div>
        });
    }
}
class SdhKeHoachDaoTaoDetails extends AdminPage {
    state = {
        chuongTrinhDaoTao: {},
        ctsdh: [],
        freeList: [],
        dataHocKy: [],
        selected: []
    };
    rows = {};
    componentDidMount() {
        T.ready('/user/sau-dai-hoc');
        const route = T.routeMatcher('/user/sau-dai-hoc/ke-hoach-dao-tao/:ma'),
            ma = route.parse(window.location.pathname)?.ma;
        this.setState({ ma: parseInt(ma) });
        this.getData(parseInt(ma));
    }

    componentDidUpdate() {
        $('.draggable tbody, .droppable tbody').draggable({
            helper: 'clone',
            containment: 'body',
            cursor: 'grabbing',
            scroll: false,
            backgroundColor: null,
            zIndex: 99999,
        });

        $('.droppable').droppable({
            accept: 'tbody',
            drop: (event, ui) => {
                try {
                    const id = parseInt(ui.draggable.attr('idmon'));
                    const currHocKy = ui.draggable.attr('hocky');
                    const targetHocKy = parseInt(event.target.getAttribute('hocky'));
                    if (currHocKy && parseInt(currHocKy) != targetHocKy) {
                        this.updateMonHoc(id, { hocKy: targetHocKy });
                    }
                    else if (!currHocKy) {
                        let currSelected = this.state.selected;
                        const index = currSelected.indexOf(id);
                        index == -1 ? currSelected.push(id) : null;
                        this.setState({ selected: currSelected });
                        const idlist = [...this.state.selected];
                        this.updateMonHocMulti(idlist, { hocKy: targetHocKy });
                    }
                    else null;
                } catch (error) {
                    console.error(error);
                }

            }
        });
    }

    getData = (ma) => {
        this.setState({ selected: [] });
        $(':checkbox').prop('checked', false);
        this.props.getSdhChuongTrinhDaoTao(ma, (ctsdh) => {
            let chuongTrinhDaoTao = {};
            let freeList = [];
            ctsdh.forEach((item, index) => {
                if (item.hocKy) {
                    if (!chuongTrinhDaoTao[item.hocKy]) {
                        chuongTrinhDaoTao[item.hocKy] = [];
                    }
                    chuongTrinhDaoTao[item.hocKy].push(item);
                }
                else {
                    item.idx = index;
                    freeList.push(item);
                }
            });
            this.setState({ ma, ctsdh, chuongTrinhDaoTao, freeList });
        });
        this.props.getSdhKhungDaoTao(ma, result => {
            const soHocKy = result.soHocKy;
            let data = [];
            for (let i = 1; i <= soHocKy; i++)
                data.push({ id: i, text: `Học kỳ ${i}` });
            this.setState({ dataHocKy: data });
        });
    }

    createHocKy = (e) => {
        e.preventDefault();
        this.createModal.show(this.state.dataHocKy.length);
    }

    updateMonHoc = (id, changes) => {
        this.props.updateSdhChuongTrinhDaoTao(id, { hocKy: changes.hocKy, thu: changes.thu, tietBatDau: changes.tietBatDau }, () => this.getData(this.state.ma));
    }
    updateMonHocMulti = (id, changes) => {
        this.props.updateSdhChuongTrinhDaoTaoMulti(id, changes, () => this.getData(this.state.ma));
    }

    handleSelected = (item, flag) => {
        let currSelected = this.state.selected;
        if (!item) {
            if (!flag) {
                $(':checkbox').prop('checked', false);
                currSelected = [];
                this.setState({ selected: currSelected });
            }
            else {
                $('.monselected').prop('checked', true);
                this.state.freeList.forEach(item => {
                    const index = currSelected.indexOf(item.id);
                    index == -1 && currSelected.push(item.id);
                });
                this.setState({ selected: currSelected });
            }
        }
        else {
            const id = item.id;
            const index = currSelected.indexOf(id);
            flag ? (index == -1 && currSelected.push(id)) : (index != -1 && currSelected.splice(index, 1));
            this.setState({ selected: currSelected });
            if (currSelected.length == this.state.freeList.length)
                $('#checkall').prop('checked', true);
            else
                $('#checkall').prop('checked', false);
        }

    }

    renderTable2 = (list) => {
        const permission = this.getUserPermission('sdhChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage']);
        return renderTable({
            getDataSource: () => list ? list : [],
            stickyHead: false,
            className: 'hocKy',
            header: 'thead-light',
            emptyTable: 'Chưa có môn học được xếp',
            renderHead: () => (
                <>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ width: '100%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Môn học</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Thứ</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Tiết bắt đầu</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', }}>Thao tác</th>
                    </tr>
                </>),
            multipleTbody: true,
            renderRow: (item, index) => {
                return (
                    <tbody idmon={item.id} hocky={item.hocKy}>
                        <tr>
                            <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                            <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }} content={
                                <Tooltip title={item.tenMonHoc} arrow placeholder='bottom'>
                                    <div>{item.maMonHoc}</div>
                                </Tooltip>} />
                            <TableCell style={{ textAlign: 'center', }} content={item.thu ? item.thu : ''} />
                            <TableCell style={{ textAlign: 'center', }} content={item.tietBatDau ? item.tietBatDau : ''} />
                            <TableCell style={{ textAlign: 'center', }} type='buttons' content={item} permission={permission}>
                                <Tooltip title='Chỉnh sửa' arrow placeholder='bottom' >
                                    <a className='btn btn-info' href='#' onClick={() => {
                                        this.monModal.show(item);
                                    }}><i className='fa fa-lg fa-pencil' /></a>
                                </Tooltip>
                                <Tooltip title='Xóa khỏi học kỳ' arrow placeholder='bottom' >
                                    <a className='btn btn-secondary' href='#' onClick={e => e.preventDefault() || this.updateMonHoc(item.id, { hocKy: '', thu: '', tietBatDau: '' })}><i className='fa fa-lg  fa-minus-circle' /></a>
                                </Tooltip >
                            </TableCell>

                        </tr>
                    </tbody>

                );
            },
        });
    }

    renderTable = (list) => {
        return renderTable({
            getDataSource: () => list ? list : [],
            stickyHead: true,
            className: 'listMon',
            header: 'thead-light',
            emptyTable: 'Tất cả các môn học đã được xếp',
            renderHead: () => (
                <>
                    <tr>
                        <th style={{ width: 'auto', verticalAlign: 'middle', alignItems: 'center', whiteSpace: 'nowrap' }}><input className='selectall' id='checkall' type="checkbox" onChange={e => this.handleSelected(null, e.target.checked)} /> </th>
                        <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ width: '40%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Môn học</th>
                        <th style={{ width: '20%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Tự chọn</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>TH/TN</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', alignItems: 'center', whiteSpace: 'nowrap' }}>Gán </th>
                    </tr>
                </>),
            multipleTbody: true,
            renderRow: (item, index) => {

                return (
                    <tbody idmon={item.id}>
                        <tr>
                            <TableCell type='buttons' style={{ justifyContent: 'space-between', alignItems: 'center' }} content=''>
                                <input className='monselected' id={`mon${item.id}`} type="checkbox" onChange={e => this.handleSelected(item, e.target.checked)} />
                            </TableCell>
                            <TableCell type='text' style={{ textAlign: 'center' }} content={index + 1} />
                            <TableCell type='text' style={{ fontWeight: 'bold', textAlign: 'center' }} content={
                                <Tooltip title={item.tenMonHoc} arrow placeholder='bottom'>
                                    <div>{item.maMonHoc}</div>
                                </Tooltip>} />
                            <TableCell content={item.loaiMonHoc ? <i className='fa fa-check' aria-hidden='true'></i> : ''} style={{ textAlign: 'center' }} />
                            <TableCell type='number' style={{ textAlign: 'center', }} content={item.tinChiLyThuyet} />
                            <TableCell type='number' style={{ textAlign: 'center', }} content={item.tinChiThucHanh} />
                            <TableCell type='buttons' style={{ justifyContent: 'space-between', alignItems: 'center' }} content=''>
                                <a href='#' onClick={() => this.hocKyModal.show(item)}> <i className='fa fa-arrow-right' style={{ marginLeft: '50%' }} /></a>
                            </TableCell>

                        </tr>
                    </tbody>

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
                <div className='row'>
                    <div className={this.state.freeList.length ? 'tile col-md-6' : 'tile col-md-2'}  >
                        <h3 className='tile-title'>{this.state.freeList.length ? 'Tất cả môn học' : 'Môn học'}</h3>
                        <div className='tile-body draggable' style={{ overflowY: 'hidden', maxHeight: '95%', cursor: 'pointer' }} >
                            {this.renderTable(this.state.freeList)}
                        </div>
                    </div>
                    <div className={this.state.freeList.length ? 'col-md-6' : 'col-md-10'} >
                        {this.state.dataHocKy && this.state.dataHocKy.map((item, index) => (<>
                            <div id={`accordion-${index}`} className='mt-1 droppable' hocky={item.id} style={{ cursor: 'pointer' }} >
                                <div className='card' >
                                    <button className='btn btn-link collapsed' data-toggle='collapse' data-target={`#collapseOne-${index}`} aria-expanded="true" aria-controls={`collapseOne-${index}`}>
                                        <div className='card-header row' id={`heading-${index}`} style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <h6 className='mb-0'>
                                                {item.text}
                                            </h6>
                                        </div>
                                    </button>
                                    <div id={`collapseOne-${index}`} className='collapse' aria-labelledby={`heading-${index}`} data-parent={`#accordion-${index}`} >
                                        <div className='card-body' >
                                            <div className='tile-body'>
                                                {this.renderTable2(this.state.chuongTrinhDaoTao[item.id], item.id)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>))}

                    </div>
                </div>
                <EditMonModal ref={e => this.monModal = e} updateMonHoc={this.updateMonHoc} permission={permission} />
                <HocKyModal ref={e => this.hocKyModal = e} permission={permission} dataHocKy={this.state.dataHocKy} updateMonHocMulti={this.updateMonHocMulti} id={this.state.selected} handleSelected={this.handleSelected} />
                <CreateModal ref={e => this.createModal = e} permission={permission} updateKhungDaoTao={this.props.updateKhungDaoTao} getData={this.getData} />
            </>,
            backRoute: `/user/sau-dai-hoc/chuong-trinh-dao-tao/${this.state.ma}`,
            onCreate: !readOnly ? this.createHocKy : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhChuongTrinhDaoTao: state.daoTao.sdhChuongTrinhDaoTao });
const mapActionsToProps = { getSdhChuongTrinhDaoTao, updateSdhChuongTrinhDaoTao, getSdhKhungDaoTao, updateSdhChuongTrinhDaoTaoMulti, updateKhungDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(SdhKeHoachDaoTaoDetails);

