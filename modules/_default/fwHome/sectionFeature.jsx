import React from 'react';
import { connect } from 'react-redux';
import { getTestimonyByUser } from './redux/reduxTestimony';
import { getFeatureByUser, getFeatureItemByUser } from './redux/reduxFeature';

class SectionFeature extends React.Component {
    state = {};

    componentDidMount() {
        if (this.props.featureId) {
            this.props.getFeatureByUser(this.props.featureId, feature => feature && this.setState({ feature }));
            this.props.getFeatureItemByUser(this.props.featureId, featureItem => { featureItem && this.setState({ featureItem }); });
        }
    }

    render() {
        let featureSection = <p></p>;
        if (this.state.feature && this.state.featureItem && this.state.featureItem.length > 0) {
            featureSection =
                <section className='my-3' style={{ backgroundImage: `url(${this.state.feature.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className='row p-3' style={{ backgroundColor: 'rgba(48, 53, 145, 0.95)' }}>
                        <div className='col-12 text-center pt-3'><h3 className='homeTitle' style={{ color: 'white' }}><b>{T.language.parse(this.state.feature.title)}</b></h3></div>
                        {this.state.featureItem.map((item, index) => (
                            <div key={index} className='col-lg-4 col-12 d-flex align-items-center py-3 py-lg-4'>
                                <img className='d-flex' src={item.image} alt={T.language.parse(item.content)} height='100vw' />
                                <h6 className='d-flex text-justify pl-2 m-0 homeBody' style={{ color: 'white' }}><b>{T.language.parse(item.content)}</b></h6>
                            </div>
                        ))}
                    </div>
                </section>;
        }
        return featureSection;
    }
}
const mapStateToProps = state => ({ state: state.system });

const mapActionsToProps = { getTestimonyByUser, getFeatureByUser, getFeatureItemByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionFeature);