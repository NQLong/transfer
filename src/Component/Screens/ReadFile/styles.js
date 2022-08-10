import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        // alignItems: 'center',
        // marginTop: 12
    },
    buttonContainer: {
        flex: 1,
        // justifyContent: 'flex-end',
        position: 'absolute',
        // bottom: 100,
        right: 10, 
        bottom: 10
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
        shadowColor: '#F02A4B',
        shadowOpacity: 0.3,
        shadowOffset: { height: 10 },
        backgroundColor: '#F02A4B',
        margin: 20
    },
    textSign: {
        color: 'white',
        textAlign: 'center',
        margin: 10,
    },
})