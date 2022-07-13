import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        height: '100%'
    },
    mainArea: {
        flex: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 40
    },
    label: {
        fontFamily: 'Work Sans',
        color: '#999999',
        fontSize: 15
    },
    formInput: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#CCC',
        padding: 10,
        paddingBottom: Platform.OS === 'ios' ? 10 : 0
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#333333',
        fontSize: 20
    },
    errorMsg: {
        color: '#FF0000',
        fontSize: 14,
        marginBottom: 10
    },
    signIn: {
        height: 50,
        width: '70%',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo: {
        width: 1000,
        heith: 300
    },
    imageView: {
        backgroundColor: 'transparent', 
        justifyContent: 'center', 
        alignItems: 'center'
    },

    image: {
        width: '100%', 
        height: undefined, 
        aspectRatio: 255 / 177, 
        backgroundColor: 'transparent'
    },

    buttonView: {
        alignItems: 'center', 
        marginTop: 50
    },

    loginText: {
        fontFamily: 'Work Sans',
        fontSize: 19, 
        fontWeight: 'bold'
    }
})