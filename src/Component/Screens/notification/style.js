import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cardItem: {
        borderRadius: 10,
        margin: 10,
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
        fontSize: 14,
        marginRight: 10
    },
    dateLabel: {
        marginTop: 0,
        fontSize: 12,
    },
    checkbox: {
        alignSelf: "center",
    },
    label: {
        margin: 8,
    },
    box: {
        flex: 1,
        width: 50,
        height: 50,
    },
    searchContainer: {
        flex: 1, 
        flexDirection: 'row',
        padding: 10
    },
    searchItem: {
        marginRight: 10
    },
    cardItemWrapper: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    cardItemIcon: {
        flex: 0.2
    },
    cardItemContent: {
        flex: 0.8
    },
    cardItemTitleWrapper: {
        flex: 1, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginRight: 0
    },
    cardItemTitle: {
        fontSize: 16, 
        fontWeight: 'bold'
    },
    cardItemSubTitle: {
        marginBottom: 10
    },
    cardItemCreatedDate: {
        fontSize: 12, 
        color: '#696969'
    },
    emptyDataText: {
        margin: 12 
    }
})