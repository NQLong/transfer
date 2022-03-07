import React from 'react';
import { connect } from 'react-redux';
import { homeGetAllCompanies, homeGetCompanies } from './reduxDoanhNghiep';
import { Link } from 'react-router-dom';

const texts = {
    vi: {
        companyInfo: 'Thông tin doanh nghiệp',
        nationInfo: 'Quốc gia',
        foundedYearInfo: 'Năm thành lập',
        phoneNumberInfo: 'Số điện thoại',
        addressInfo: 'Địa chỉ',
        statusUpdate: 'Chưa cập nhật',
        strengths: 'Thế mạnh',
        descriptionInfo: 'Mô tả về doanh nghiệp',
        noInfo: 'Không có thông tin',
        areaActivityInfo: 'Lĩnh vực hoạt động của doanh nghiệp',
        close: 'Đóng',
    }, en: {
        companyInfo: 'Company information',
        nationInfo: 'Nation',
        foundedYearInfo: 'Founded year',
        phoneNumberInfo: 'Phone number',
        addressInfo: 'Address',
        statusUpdate: 'Not updated',
        strengths: 'Strengths',
        descriptionInfo: 'Description about the company',
        noInfo: 'No informations',
        areaActivityInfo: 'Area of company activities',
        close: 'Close'
    }
};

class CompanyModal extends React.Component {
    state = { company: null };
    modal = React.createRef();

    show = (item) => {
        this.props.homeGetCompanies(item.id, (item) => {
            this.setState({ company: item }, () => {
                $(this.modal.current).modal('show');
            });
        });
    }

    render() {
        const { company } = this.state;
        const language = T.language(texts);
        return (
            <div className='modal fade' tabIndex='-1' role='dialog' ref={this.modal}>
                <div className='modal-dialog' role='document' style={{ maxWidth: '90%' }}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>{language.companyInfo}</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='col-12'>
                                {company ? (
                                    <div className='course--content'>
                                        <div className='about-course mb-30'>
                                            <h4 className='text-center  text-uppercase' style={{ fontSize: '1.5rem', lineHeight: '1.3', color: 'rgba(0, 0, 0, 0.8)', fontWeight: '700' }}>{T.language.parse(company.tenDayDu)}</h4>
                                            <div className='row' style={{ marginBottom: '8px' }}>
                                                <div className='col-12 col-md-6'>
                                                    <h6 style={{ color: 'rgba(0, 0, 0, 0.8)', lineHeight: 1.3, fontWeight: 700 }}>{language.nationInfo}: &nbsp;
                                                        <span className='text-success'>{company.quocGia ? T.language.parse(company.tenQuocGia) : language.statusUpdate}</span></h6>
                                                </div>
                                                <div className='col-12 col-md-6'>
                                                    <h6 style={{ color: 'rgba(0, 0, 0, 0.8)', lineHeight: 1.3, fontWeight: 700 }}>{language.foundedYearInfo}:&nbsp;
                                                        <span className='text-success'>{company.namThanhLap || language.statusUpdate}</span></h6>
                                                </div>
                                            </div>
                                            <div className='row' style={{ marginBottom: '8px' }}>
                                                <div className='col-12 col-md-6'>
                                                    <h6 style={{ color: 'rgba(0, 0, 0, 0.8)', lineHeight: 1.3, fontWeight: 700 }}>{language.phoneNumberInfo}:&nbsp;
                                                        <span className='text-success'>{company.phone || language.statusUpdate}</span></h6>
                                                </div>
                                                <div className='col-12 col-md-6'>
                                                    <h6 style={{ color: 'rgba(0, 0, 0, 0.8)', lineHeight: 1.3, fontWeight: 700 }}>Email:&nbsp;
                                                        <span className='text-success'>{company.email || language.statusUpdate}</span></h6>
                                                </div>
                                            </div>

                                            <h6 style={{ color: 'rgba(0, 0, 0, 0.8)', lineHeight: 1.3, fontWeight: 700 }}>{language.addressInfo}:&nbsp;</h6>
                                            <p className='text-justify'>{T.language.parse(company.diaChi) || language.statusUpdate}</p>

                                            <h6 style={{ color: 'rgba(0, 0, 0, 0.8)', lineHeight: 1.3, fontWeight: 700 }}>{language.strengths}:&nbsp;</h6>
                                            <p className='text-justify'>{T.language.parse(company.theManh)}</p>

                                            {company.tenCacLinhVuc ? (
                                                <h6 style={{ color: 'rgba(0, 0, 0, 0.8)', lineHeight: 1.3, fontWeight: 700 }}>{language.areaActivityInfo}:&nbsp;
                                                    <span style={{ color: '#666', fontSize: '18px', fontWeight: '300', lineHeight: '1.8' }}>{company.tenCacLinhVuc.map(linhvuc => linhvuc.TEN).join(', ')}</span>
                                                </h6>
                                            ) : null}
                                            {company.moTa ? (
                                                <div>
                                                    <h6 style={{ color: 'rgba(0, 0, 0, 0.8)', lineHeight: 1.3, fontWeight: 700 }}>{language.descriptionInfo}:</h6>
                                                    <p className='text-justify' dangerouslySetInnerHTML={{ __html: T.language.parse(company.moTa) }} />
                                                </div>
                                            ) : null}
                                            <h6 style={{ color: 'rgba(0, 0, 0, 0.8)', lineHeight: 1.3, fontWeight: 700 }}>Website:&nbsp;
                                                {company.website ? (<a href={company.website} target='_blank' rel='noreferrer'><span type='primary' style={{ fontSize: '18px', fontWeight: '300', lineHeight: '1.8' }}>{company.website}</span></a>) : (<span style={{ color: '#666', fontSize: '18px', fontWeight: '300', lineHeight: '1.8' }}>{language.statusUpdate}</span>)}
                                            </h6>
                                        </div>
                                    </div>
                                ) : <p>{language.noInfo}</p>}
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>{language.close}</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class SectionCompany extends React.Component {
    state = { boxes: null, companies: [] };
    modal = React.createRef();

    over900 = null;
    logoBoxStyle = {
        width: 0, height: 0,
        borderRadius: this.props.padding + 'px',
        transition: '1.5s all'
    };

    componentDidMount() {
        $(document).ready(() => {
            this.props.homeGetAllCompanies(this.props.loai, items => {
                if (items) {
                    const indexes = Array.from(Array(items.length).keys()), companies = [];
                    for (let i = 0; i < items.length; i++) {
                        let j = Math.floor(Math.random() * indexes.length), company = Object.assign({}, items[indexes[j]]);
                        indexes.splice(j, 1);
                        company.wLevel = company.capDo || 1;
                        company.hLevel = company.capDo || 1;
                        companies.push(company);
                    }
                    this.setState({ companies });
                }
            });
            $(window).on('resize', this.onResize);
            $('footer').fadeOut();
        });
    }

    componentDidUpdate() {
        setTimeout(this.onResize, 250);
    }

    componentWillUnmount() {
        $('footer').fadeIn();
    }

    getCompanyDetail = (e, item) => {
        e.preventDefault();
        if (item.doiTac) {
            this.props.history.push('');
        } else {
            this.modal.current.show(item);
        }
    }

    generateBoxes = (companies) => {
        let matrix = [], maxColumn = this.getMaxColumn();
        const isEmptyCell = (row, col) => {
            if (matrix[row] === undefined) matrix[row] = new Array(maxColumn).fill(-1);
            return matrix[row][col] === -1;
        };
        const setRectangle = (id, row, col, width, height) => {
            for (let deltaRow = 0; deltaRow < height; deltaRow++) {
                for (let deltaCol = 0; deltaCol < width; deltaCol++) {
                    if (!isEmptyCell(row + deltaRow, col + deltaCol)) {
                        return false;
                    }
                }
            }

            for (let deltaRow = 0; deltaRow < height; deltaRow++) {
                for (let deltaCol = 0; deltaCol < width; deltaCol++) {
                    matrix[row + deltaRow][col + deltaCol] = id;
                }
            }
            return true;
        };
        const addCompany = (logo) => {
            let row = 0;
            while (true) {
                for (let col = 0; col <= maxColumn - logo.wLevel; col++) {
                    if (setRectangle(logo._id, row, col, logo.wLevel, logo.hLevel)) {
                        logo.displayWidth = logo.wLevel;
                        logo.displayHeight = logo.hLevel;
                        logo.displayX = col;
                        logo.displayY = row;
                        return;
                    }
                }
                row++;
            }
        };

        const boxLeft = window.innerWidth / 2, boxTop = window.innerHeight / 2, boxes = [];

        for (let i = 0; i < companies.length; i++) {
            let company = Object.assign({}, companies[i]);
            addCompany(company);

            const style = Object.assign({}, this.logoBoxStyle, {
                left: boxLeft, top: boxTop, transition: (Math.random() + 1).toString() + 's all',
                backgroundImage: `url('${company.image || '/img/bk.png'}')`,
                // backgroundImage: `url('/img/bk.png')`, cursor: 'pointer'
            });
            if (company.doiTac) {
                boxes.push(
                    <Link key={company.id} to={'/doanh-nghiep/' + company.hiddenShortName}>
                        <div className='logo-box' style={style}
                            data-x={company.displayX} data-y={company.displayY}
                            data-width={company.displayWidth} data-height={company.displayHeight}>
                            <figure data-id={company.id} style={{ margin: 0, padding: 0, height: '100%' }} />
                        </div>
                    </Link>
                );
            } else {
                boxes.push(
                    <div key={company.id} className='logo-box' style={style} onClick={e => this.getCompanyDetail(e, company)}
                        data-x={company.displayX} data-y={company.displayY}
                        data-width={company.displayWidth} data-height={company.displayHeight}>
                        <figure data-id={company.id} style={{ margin: 0, padding: 0, height: '100%' }} />
                    </div>
                );
            }
        }

        return boxes;
    }

    getMaxColumn = () => {
        return (this.over900 ? 0 : -6) + (this.props.maxColumn ? this.props.maxColumn : 16);
    }

    onResize = () => {
        const over900 = window.innerWidth > 900;
        if (this.over900 !== over900) {
            this.over900 = over900;
            this.setState({ boxes: this.generateBoxes(this.state.companies) });
        } else {
            const maxColumn = this.getMaxColumn(),
                padding = this.props.padding ? this.props.padding : 4,
                mainWidth = window.innerWidth - padding,
                elements = document.getElementsByClassName('logo-box');

            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                element.style.width = element.dataset.width / maxColumn * mainWidth - padding + 'px';
                element.style.height = element.dataset.height / maxColumn * mainWidth - padding + 'px';
                element.style.left = element.dataset.x / maxColumn * mainWidth + 'px';
                element.style.top = element.dataset.y / maxColumn * mainWidth + 'px';
            }
        }
    }

    render() {
        return (
            <div key='main-body' style={{ width: '100%', minHeight: 'auto', position: 'relative', display: 'block' }}>
                {this.state.boxes}
                <CompanyModal ref={this.modal} homeGetCompanies={this.props.homeGetCompanies} />
            </div>
        );
    }
}

const mapStateToProps = state => ({ doanhNghiep: state.doiNgoai.doanhNghiep });
const mapActionsToProps = { homeGetAllCompanies, homeGetCompanies };
export default connect(mapStateToProps, mapActionsToProps)(SectionCompany);