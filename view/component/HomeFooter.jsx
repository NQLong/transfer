import React from 'react';
import { connect } from 'react-redux';
import { getFooter } from 'modules/_default/_init/reduxSystem';
import { Link } from 'react-router-dom';

const texts = {
    vi: {
        contactUs: 'Thông tin liên hệ:',
        views: 'Lượt truy cập:',
        socialNetworks: 'Kết nối với chúng tôi:',
        allViews: 'Tổng truy cập: ',
        todayViews: 'Hôm nay: ',
        copyright: 'Copyright &copy;' + new Date().getFullYear() + '. Bản quyền thuộc về Trường Đại học Khoa học Xã hội và Nhân văn.',
        addressTitle: 'ĐỊA CHỈ',
        connect: 'KẾT NỐI VỚI USSH-VNUHCM'
    },
    en: {
        contactUs: 'Contact us:',
        views: 'Views:',
        socialNetworks: 'Let us be social:',
        allViews: 'All views: ',
        todayViews: 'Today views: ',
        copyright: 'Copyright &copy;' + new Date().getFullYear() + '. Department of Civil Engineering. All rights reserved.',
        addressTitle: 'ADDRESS',
        connect: 'CONNECT US'
    }
};

class Footer extends React.Component {
    state = { footerData: [] }
    componentDidMount() {
        T.ready(() => {
            this.props.getFooter(data => {
                let footerData = [];
                if (data.item && data.item.length > 0) {
                    data.item.filter(i => i.header == 1).map(v => footerData.push(Object.assign({}, v, { childData: [] })));
                    footerData.reverse();
                    data.item.filter(i => i.header == 0).map(v => footerData.filter(d => d.priority <= v.priority)[0].childData.push(v));
                    this.setState({ footerData: footerData.reverse() });
                }
            });
        });
    }

    componentDidUpdate() {
        $('.footer-link h3 i').click(function () {
            $(this).parents('.footer-link').find('ul').slideToggle();
        });
    }

    render() {
        const language = T.language(texts), hostname = window.location.href,
            qrcode = 'https://hcmussh.edu.vn/static/document/qrcode-tuyensinh.png',
            width = $(window).width();

        let { facebook, youtube, mobile, address, address2, } =
            this.props.system ? this.props.system : { logo: '', todayViews: 0, allViews: 0, address2: '', youtube: '' },
            footerList = [];
        address = T.language.parse(address);
        address2 = address2 && T.language.parse(address2);
        if (this.state.footerData && this.state.footerData.length > 0) {
            footerList = this.state.footerData.map((item, index) => {
                const link = item.link.includes('http://') || item.link.includes('https://') ?
                    <a href={item.link}>{T.language.parse(item.title)}</a> : <Link to={item.link}>{T.language.parse(item.title)}</Link>;
                return (
                    <div key={index} className='col-sm'>
                        <div className='footer-link'>
                            <h3>{link} <i className='fa fa-angle-down d-md-none'></i></h3>
                            <ul className='list-unstyled' style={{ display: 'none' }}>
                                {item.childData.map((childItem, childIndex) => (
                                    <li key={childIndex}>
                                        {childItem.link ? childItem.link.includes('http://') || childItem.link.includes('https://') ?
                                            <a target='_blank' href={childItem.link} rel="noreferrer">{T.language.parse(childItem.title)}</a> : <Link target='_blank' to={childItem.link}>{T.language.parse(childItem.title)}</Link> : <a target='_blank' href='#'>{T.language.parse(childItem.title)}</a>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                );
            });
            if (hostname.includes('tuyensinh')) {
                footerList = [
                    <div className='col-sm' key={'13'}>
                        <div className='footer-link'>
                            <h3>{'QUÉT MÃ TƯ VẤN TUYỂN SINH'} <i className='fa fa-angle-down d-md-none'></i></h3>
                            <img src={qrcode} style={{ height: 'auto', width: '100%' }} />
                        </div>
                    </div>
                ];
            }
            footerList.push([
                <div className='col-sm' key={'13'}>
                    <div className='footer-link'>
                        <h3>{language.connect} <i className='fa fa-angle-down d-md-none'></i></h3>
                        <div className='list-unstyled' style={{ fontWeight: 'bold', fontSize: 16 }}>
                            <img src={'/img/logo-footer.png?t=2000'}
                                onClick={() => window.open('http://hcmussh.edu.vn/', '_blank')}
                                style={{ width: '100%', maxWidth: 450, cursor: 'pointer' }} />
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, maxWidth: 450 }}>
                                {mobile &&
                                    <a target='_blank' href={`tel:${mobile}`} rel="noreferrer">
                                        <img src={'/img/social-media-icon/1.png?t=1'} style={{ height: 50, cursor: 'pointer' }} />
                                    </a>}
                                {youtube && <a target='_blank' href={youtube} rel="noreferrer">
                                    <img src={'/img/social-media-icon/2.png?t=1'} style={{ height: 50, }} />
                                </a>}
                                <a target='_blank' href={'https://www.linkedin.com/company/ussh-vnuhcm/'} rel="noreferrer">
                                    <img src={'/img/social-media-icon/3.png?t=1'} style={{ height: 50, }} />
                                </a>
                                {facebook && <a target='_blank' href={facebook} rel="noreferrer">
                                    <img src={'/img/social-media-icon/4.png?t=1'} href={facebook} style={{ height: 50, cursor: 'pointer' }} />
                                </a>}
                            </div>
                        </div>
                    </div>
                    <div className='footer-link footer-address'>
                        <h3>{language.addressTitle} <i className='fa fa-angle-down d-md-none'></i></h3>
                        <div className='list-unstyled' style={{ fontWeight: 'bold', fontSize: 16 }}>
                            <li><i className='fa fa-map-marker'></i><span className='ml-1' style={{ paddingLeft: '10px', fontWeight: 'bold' }}>{address}</span></li>
                            <li><i className='fa fa-map-marker'></i><span className='ml-1' style={{ paddingLeft: '10px', fontWeight: 'bold' }}>{address2}</span></li>
                        </div>
                    </div>
                </div>,
                <div className='col-sm' key={'14'}>
                    <div className='footer-link'>
                        <h3>KẾT NỐI VỚI VNUHCM <i className='fa fa-angle-down d-md-none'></i></h3>
                        <div className='list-unstyled' style={{ fontWeight: 'bold', fontSize: 16 }}>
                            <a href={'https://vnuhcm.edu.vn/'} target='_blank' rel="noreferrer"> <img src={'/img/logo-vnu.png?t=2000'}
                                style={{
                                    width: width < 700 ? '90%' : '82%', paddingTop: 10, maxWidth: 450, cursor: 'pointer',
                                    paddingLeft: width < 700 ? '5%' : 0
                                }} /></a>
                        </div>
                    </div>
                </div>
            ]);

            if (hostname.includes('ctsv')) {
                footerList[0] = <div key={0} className='col-sm'>
                    <div className='footer-link'>
                        <h3>LIÊN KẾT <i className='fa fa-angle-down d-md-none'></i></h3>
                        <ul className='list-unstyled' style={{ display: 'none' }}>
                            {[
                                { title: 'Trường ĐH KHXH&NV', link: 'https://hcmussh.edu.vn/' },
                                { title: 'Phòng Đào tạo', link: 'https://dt.hcmussh.edu.vn' },
                                { title: 'Thư viện', link: 'https://lib.hcmussh.edu.vn/' },
                                { title: 'Sức trẻ nhân văn', link: 'https://suctrenhanvan.edu.vn/' },
                            ]
                                .map((childItem, childIndex) => (
                                    <li key={childIndex}>
                                        {childItem.link ? childItem.link.includes('http://') || childItem.link.includes('https://') ?
                                            <a target='_blank' href={childItem.link} rel="noreferrer">{T.language.parse(childItem.title)}</a> : <Link target='_blank' to={childItem.link}>{T.language.parse(childItem.title)}</Link> : <a target='_blank' href='#'>{T.language.parse(childItem.title)}</a>}
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>;
                footerList[2] = <div className='col-sm' key={'11'}>
                    <div className='footer-link'>
                        <h3>{language.addressTitle} <i className='fa fa-angle-down d-md-none'></i></h3>
                        <div className='list-unstyled'>
                            <li><i className='fa fa-map-marker'></i><span className='ml-1' style={{ paddingLeft: '10px', fontWeight: 'bold' }}>{'Cơ sở Đinh Tiên Hoàng: Phòng B.002, Số 10-12 đường Đinh Tiên Hoàng, phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'}</span></li>
                            <li><i className='fa fa-map-marker'></i><span className='ml-1' style={{ paddingLeft: '10px', fontWeight: 'bold' }}>{'Cơ sở Thủ Đức: Phòng P2-01, Nhà Điều hành, Khu phố 6, phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh'}</span></li>
                        </div>
                    </div>
                </div>;
                footerList[3] =
                    <div className='footer-link' key={4}>
                        <h3>{'KẾT NỐI'} <i className='fa fa-angle-down d-md-none'></i></h3>
                        <div className='list-unstyled' style={{ fontWeight: 'bold', fontSize: 16 }}>
                            <li><i className='fa fa fa-phone'></i>
                                <span target='_blank' className='ml-1' style={{ paddingLeft: '10px', fontSize: 16 }}>
                                    <a href={'tel:02838293828'}>{'Cơ sở Đinh Tiên Hoàng: 028 38293828, số nội bộ: 111'}</a>
                                </span></li>
                            <li><i className='fa fa fa-phone'></i>
                                <span target='_blank' className='ml-1' style={{ paddingLeft: '10px', fontSize: 16 }}>
                                    <a href={'tel:02837243302'}> {'Cơ sở Thủ Đức: 028 37243302, số nội bộ: 4201'}</a>
                                </span></li>
                            <li> <i className='fa fa fa-envelope'></i><span target='_blank' className='ml-1' style={{ paddingLeft: '10px', }}>
                                <a href='mailto:congtacsinhvien@hcmussh.edu.vn'>congtacsinhvien@hcmussh.edu.vn</a>
                            </span></li>
                            <li><i className='icon-facebook-square'></i><span className='ml-1' style={{ paddingLeft: '10px', }}>
                                <a href='https://www.facebook.com/ctsv.hcmussh' target='_blank' rel="noreferrer">https://www.facebook.com/ctsv.hcmussh</a>
                            </span></li>
                        </div>
                    </div>;
            }
            else if (hostname.includes('triethoc')) {
                footerList[2] =
                    [<div className='col-sm' key={2}>
                        <div className='footer-link'>
                            <h3>{language.addressTitle} <i className='fa fa-angle-down d-md-none'></i></h3>
                            <div className='list-unstyled' style={{ fontSize: 16, fontWeight: 'bold' }}>
                                <li><i className='fa fa-map-marker'></i><span className='ml-1' style={{ paddingLeft: '10px', fontWeight: 'bold' }}>{'Phòng A.207, Số 10-12 đường Đinh Tiên Hoàng, phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'}</span></li>
                            </div>
                        </div>
                    </div>
                    ];
            } else if (hostname.includes('era')) {
                footerList[0] = <div className='col-sm' key={'11'}>
                    <div className='footer-link'>
                        <h3>{'BỘ PHẬN ĐỐI NGOẠI'} <i className='fa fa-angle-down d-md-none'></i></h3>
                        <div className='list-unstyled' style={{ fontWeight: 'bold', fontSize: 16 }}>
                            <li><i className='fa fa-map-marker'></i><span className='ml-1' style={{ paddingLeft: '10px', fontWeight: 'bold' }}>{'Phòng B.005,Số 10 - 12 đường Đinh Tiên Hoàng, phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh'}</span></li>
                            <li><i className='fa fa fa-phone'></i>
                                <span target='_blank' className='ml-1' style={{ paddingLeft: '10px', }}>
                                    <a href={'tel:02838293828'}>{'028 38293828, số nội bộ: 114'}</a>
                                </span></li>
                            <li> <i className='fa fa fa-envelope'></i><span target='_blank' className='ml-1' style={{ paddingLeft: '10px', }}>
                                <a href='mailto:era@hcmussh.edu.vn'>era@hcmussh.edu.vn</a>
                            </span></li>
                            <li><i className='icon-facebook-square'></i><span className='ml-1' style={{ paddingLeft: '10px', }}>
                                <a href='https://www.facebook.com/232430870759910' target='_blank' rel="noreferrer">
                                    www.facebook.com/232430870759910
                                    </a>
                            </span>
                            </li>
                        </div>
                    </div>
                </div>;
                footerList[1] =
                    <div className='col-sm' key={'12'}>
                        <div className='footer-link'>
                            <h3>{'BỘ PHẬN QUẢN LÝ KHOA HỌC'} <i className='fa fa-angle-down d-md-none'></i></h3>
                            <div className='list-unstyled' style={{ fontWeight: 'bold', fontSize: 16 }}>
                                <li><i className='fa fa-map-marker'></i><span className='ml-1' style={{ paddingLeft: '10px', fontWeight: 'bold' }}>{'Phòng B.111,Số 10 - 12 đường Đinh Tiên Hoàng, phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh'}</span></li>
                                <li><i className='fa fa fa-phone'></i>
                                    <span target='_blank' className='ml-1' style={{ paddingLeft: '10px', }}>
                                        <a href={'tel:02838293828'}> {'028 38293828, số nội bộ: 122'}</a>
                                    </span></li>
                                <li> <i className='fa fa fa-envelope'></i><span target='_blank' className='ml-1' style={{ paddingLeft: '10px', }}>
                                    <a href='mailto:qlkh_da@hcmussh.edu.vn'>qlkh_da@hcmussh.edu.vn</a>
                                </span></li>
                                <li><i className='icon-facebook-square'></i><span className='ml-1' style={{ paddingLeft: '10px', }}>
                                    <a href='https://www.facebook.com/232430870759910' target='_blank' rel="noreferrer">
                                        www.facebook.com/232430870759910
                                    </a>
                                </span>
                                </li>
                            </div>
                        </div>
                    </div>;
                delete footerList[2];
            } else if (hostname.includes('thuvien')) {
                footerList[1] = <div className='col-sm' key={'12'}>
                    <div className='footer-link'>
                        <h3>{'LIÊN HỆ'} <i className='fa fa-angle-down d-md-none'></i></h3>
                        <ul className='list-unstyled' style={{ display: 'none' }}>
                            <li>
                                <a target='_blank' href='https://www.facebook.com/Libussh' rel="noreferrer">Fanpage Thư viện</a>
                            </li>
                            <li>
                                <a target='_blank' href='https://hcmussh.edu.vn/tin-tuc/lien-lac' rel="noreferrer">Thông tin liên lạc</a>
                            </li>
                            <li>
                                <a target='_blank' href='https://hcmussh.edu.vn/tin-tuc/vi-tri-tv' rel="noreferrer">Đường đến Thư viện</a>
                            </li>
                        </ul>
                    </div>
                </div>;
            } else if (hostname.includes('/en')) {
                footerList[0] = <div className='col-sm' key={'1'}>
                    <div className='footer-link'>
                        <h3>{'Study at USSH VNUHCM'} <i className='fa fa-angle-down d-md-none'></i></h3>
                        <ul className='list-unstyled' style={{ display: 'none' }}>
                            <li>
                                <a target='_blank' href='https://www.facebook.com/Libussh' rel="noreferrer">Undergraduate Programs</a>
                            </li>
                            <li>
                                <a target='_blank' href='https://hcmussh.edu.vn/tin-tuc/lien-lac' rel="noreferrer">Postgraduate Programs</a>
                            </li>
                            <li>
                                <a target='_blank' href='https://hcmussh.edu.vn/tin-tuc/vi-tri-tv' rel="noreferrer">PhD Programs</a>
                            </li>
                            <li>
                                <a target='_blank' href='https://hcmussh.edu.vn/tin-tuc/vi-tri-tv' rel="noreferrer">Short term Courses</a>
                            </li>
                        </ul>
                    </div>
                </div>;
                footerList[1] = <div className='col-sm' key={'2'}>
                    <div className='footer-link'>
                        <h3>{'Student Life'} <i className='fa fa-angle-down d-md-none'></i></h3>
                        <ul className='list-unstyled' style={{ display: 'none' }}>
                            <li>
                                <a target='_blank' href='https://www.facebook.com/Libussh' rel="noreferrer">Future Students</a>
                            </li>
                            <li>
                                <a target='_blank' href='https://hcmussh.edu.vn/tin-tuc/lien-lac' rel="noreferrer">Student Community</a>
                            </li>
                            <li>
                                <a target='_blank' href='https://hcmussh.edu.vn/tin-tuc/vi-tri-tv' rel="noreferrer">International Students</a>
                            </li>
                            <li>
                                <a target='_blank' href='https://hcmussh.edu.vn/tin-tuc/vi-tri-tv' rel="noreferrer">Social Clubs</a>
                            </li>
                        </ul>
                    </div>
                </div>;
                footerList[2] = <div className='col-sm' key={'3'}>
                    <div className='footer-link'>
                        <h3>{'About'} <i className='fa fa-angle-down d-md-none'></i></h3>
                        <ul className='list-unstyled' style={{ display: 'none' }}>
                            <li>
                                <a target='_blank' href='https://www.facebook.com/Libussh' rel="noreferrer">Offices</a>
                            </li>
                            <li>
                                <a target='_blank' href='https://hcmussh.edu.vn/tin-tuc/lien-lac' rel="noreferrer">Faculties</a>
                            </li>
                            <li>
                                <a target='_blank' href='https://hcmussh.edu.vn/tin-tuc/vi-tri-tv' rel="noreferrer">Centers</a>
                            </li>
                            <li>
                                <a target='_blank' href='https://hcmussh.edu.vn/tin-tuc/vi-tri-tv' rel="noreferrer">Partners</a>
                            </li>
                        </ul>
                    </div>
                </div>;
                footerList[3] = <div className='col-sm' key={'4'}>
                    <div className='footer-link'>
                        <h3>Get in touch<i className='fa fa-angle-down d-md-none'></i></h3>
                        <div className='list-unstyled' style={{ fontWeight: 'bold', fontSize: 16 }}>
                            <img src={'/img/logo-footer.png?t=2000'}
                                onClick={() => window.open('http://hcmussh.edu.vn/', '_blank')}
                                style={{ width: '100%', maxWidth: 450, cursor: 'pointer' }} />
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, maxWidth: 450 }}>
                                {mobile &&
                                    <a target='_blank' href={`tel:${mobile}`} rel="noreferrer">
                                        <img src={'/img/social-media-icon/1.png?t=1'} style={{ height: 50, cursor: 'pointer' }} />
                                    </a>}
                                {youtube && <a target='_blank' href={youtube} rel="noreferrer">
                                    <img src={'/img/social-media-icon/2.png?t=1'} style={{ height: 50, }} />
                                </a>}
                                <a target='_blank' href={'https://www.linkedin.com/company/ussh-vnuhcm/'} rel="noreferrer">
                                    <img src={'/img/social-media-icon/3.png?t=1'} style={{ height: 50, }} />
                                </a>
                                {facebook && <a target='_blank' href={facebook} rel="noreferrer">
                                    <img src={'/img/social-media-icon/4.png?t=1'} href={facebook} style={{ height: 50, cursor: 'pointer' }} />
                                </a>}
                            </div>
                        </div>
                    </div>
                </div>;
                //  ;
                // console.log(footerList);
            }
        }
        return (
            <footer className='ftco-footer ftco-section img footer' style={{ paddingBottom: '30px', paddingTop: '30px', backgroundColor: '#0139A6', color: 'white' }}>
                <div className='container-fluid' >
                    <div className='row justify-content-center'>
                        {footerList}
                    </div>
                    {hostname.includes('thuvien') ? <div>
                        <div id="fb-root"></div>
                        <div id="fb-customer-chat" className="fb-customerchat">
                        </div>
                    </div> : null}

                </div>
            </footer>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getFooter };
export default connect(mapStateToProps, mapActionsToProps)(Footer);
