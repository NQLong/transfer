import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        padding: 10
    },
    cardItem: {
        borderRadius: 10,
        margin: 10,
        borderLeftWidth: 3
    },
    cardTitle: {
        fontSize: 14,
        color: 'black',
        textTransform: 'uppercase'
    },
    cardContent: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    statusLabel: {
        fontSize: 12,
        paddingLeft: 15,
        paddingRight: 15
    },
    rightSide: {
        display: 'flex',
        marginTop: -25,
        marginRight: 20,
        alignItems: 'flex-start',
    },
    dateLabel: {
        marginTop: 0,
        fontSize: 12,
    },

    // ** General Info Styles ** //

    generalInfoWrapper: {
        argin: 5, 
        borderRadius: 20
    },

    generalInfoItem: {
        alignSelf: 'center'
    },

    //** PhanHoi Styles */

    replyItem: {
        flex: 1, 
        paddingBottom: 0, 
        paddingTop: 0
    },

    replyTitleWrapper: {
        marginTop: 0, 
        paddingTop: 0
    },

    replyTitleText: {
        flexDirection: 'row', 
        alignItems: 'center', 
        flex: 1
    },

    replyInput: {
        flex: 1, 
        marginRight: 10
    },

    //** Conduct Styles */

    conductItem: {
        flex: 1, 
        paddingBottom: 0, 
        paddingTop: 0
    },
    conductTitleWrapper: {
        marginTop: 0, 
        paddingTop: 0
    },
    conductTitleText: {
        flexDirection: 'row', 
        alignItems: 'center', 
        flex: 1
    },
    conductInput: {
        flex: 1, marginRight: 10
    }
});