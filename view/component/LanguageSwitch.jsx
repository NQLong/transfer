import React from 'react';
import { connect } from 'react-redux';
import { updateSystemState } from 'modules/_default/_init/reduxSystem';

class LanguageSwitch extends React.Component {

    change = () => {
        let url = this.props.address ? this.props.address : T.language() == 'vi' ? '/en' : '/';
        window.open(url, '_self');
    }
    render() {
        return <img src={`/img/flag/${T.language.next()}.png`} style={{ height: '1.4vw', cursor: 'pointer' }}
            onClick={this.change} />;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateSystemState };
export default connect(mapStateToProps, mapActionsToProps)(LanguageSwitch);