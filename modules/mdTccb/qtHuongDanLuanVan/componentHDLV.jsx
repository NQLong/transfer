// import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';


class ComponentHDLV extends AdminPage {

}
const mapStateToProps = state => ({ system: state.system, staff: state.staff });
const mapActionsToProps = {
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentHDLV);