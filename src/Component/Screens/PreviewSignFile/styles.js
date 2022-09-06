import { StyleSheet, Dimensions } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        // alignItems: 'center',
        // marginTop: 12
    },
    viewBar: {
        width: '100%',
        height: 50,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    prevBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    nextBtn: {
        flex: 1,
        textAlign: 'right',
        alignItems: 'center'
    },
    numOfPageText: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },  
    buttonContainer: {
        // justifyContent: 'flex-end',
        position: 'absolute',
        // bottom: 100,
        right: 10, 
        bottom: 30
    },
    buttonSign: {
        justifyContent: 'center',
        // textAlign: 'center',
        // width: 70,
        // height: 40,
        // backgroundColor: 'green',
        // borderRadius: 10,
        // margin: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowRadius: 10,
        shadowColor: '#000080',
        shadowOpacity: 0.3,
        shadowOffset: { height: 10 },
        backgroundColor: '#000080',
        margin: 20
    },
    textSign: {
        color: 'white',
        textAlign: 'center',
        margin: 10,
    },

    pdfBar: {
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    prevTouch: {
        padding: 10,
        flex: 0.33,
        alignItems: 'flex-start'
    },

    nextTouch: {
        flex: 0.33,
        padding: 10,
        alignItems: 'flex-end'
    },

    paging: {
        flex: 0.33,
        padding: 10
    }


})