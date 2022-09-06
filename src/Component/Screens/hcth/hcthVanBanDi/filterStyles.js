import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        margin: 5, padding: 5
    },
    textInput: {
        outlineColor: 'red'
    },
    searchView: {
        alignItems: 'center',
        marginTop: 20,
        flex: 1,
        marginBottom: 20
    },

    searchTouchable: {
        height: 50,
        width: '70%',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },

    searchText: {
        fontFamily: 'Work Sans',
        fontSize: 19,
        fontWeight: 'bold'
    }
});