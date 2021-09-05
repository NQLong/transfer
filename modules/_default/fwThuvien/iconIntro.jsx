import React from 'react';
import { getFeatureItemByUser } from 'modules/_default/fwHome/redux/reduxFeature';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class SectionIntro extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            featureItem: []
        };
    }
    componentDidMount() {
        this.props.getFeatureItemByUser(this.props.item.viewId, featureItem => { featureItem && this.setState({ featureItem }); });
    }
    onClick = (link) => {
        if (link && link.includes('http')) {
            window.open(link, '_blank');
        } else if (link) {
            this.props.history.push(link);
        }
    }

    render() {
        const a = this.state.featureItem.map((item, index) =>
            (<div className='col-lg-6 col-12'
                style={{ display: 'flex', flexDirection: 'row', paddingTop: 10, alignItems: 'center' }} key={index}>
                <img src={item.image} style={{ width: 25, height: 25 }} />
                <div onClick={() => this.onClick(item.link)}
                    style={{ fontWeight: '700', fontSize: 20, paddingLeft: 5, cursor: 'pointer' }}>
                    {T.language.parse(item.content, true).vi}
                </div>
            </div>));
        return (
            <section data-aos='fade-up' className='row p-3'>
                <div className='col-12 homeBorderLeft'>
                    <h3 className='homeTitle' style={{ color: '#0139A6', margin: 0, }}><strong>Truy cập CSDL trực tuyến</strong></h3>
                </div>
                <div className='row d-flex'>
                    {a}
                </div>
            </section>
        );
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getFeatureItemByUser };
export default withRouter(connect(mapStateToProps, mapActionsToProps)(SectionIntro));
