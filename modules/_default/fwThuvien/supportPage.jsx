import React from 'react';
import { connect } from 'react-redux';
import { getFeatureItemByUser } from 'modules/_default/fwHome/redux/reduxFeature';
import { withRouter } from 'react-router-dom';

class SectionSupport extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            featureItem: []
        };
        this.language = React.createRef();
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
        const detail = JSON.parse(this.props?.item?.detail || {});
        const a = this.state.featureItem.map((item, index) =>
            (<div className='col-lg-6 col-12'
                style={{ display: 'flex', flexDirection: 'row', paddingTop: 10, alignItems: 'center' }} key={index}>
                <div style={{ fontWeight: '700', fontSize: 20, paddingLeft: 5 }}>
                    <i className="fa fa-circle" />
                    <span onClick={() => this.onClick(item.link)}
                        style={{ paddingLeft: 8, cursor: 'pointer' }}>{T.language.parse(item.content, true).vi}</span>
                </div>
            </div>));
        return (
            <section data-aos='fade-up' className='row p-3'>
                <div className='col-12 homeBorderLeft'>
                    <h3 className='homeTitle' style={{ color: '#0139A6', margin: 0, }}><strong>{detail.valueTitleCom || 'Hỗ trợ người sử dụng'}</strong></h3>
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
export default withRouter(connect(mapStateToProps, mapActionsToProps)(SectionSupport));
