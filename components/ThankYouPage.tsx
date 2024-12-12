import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

function ThankYou(): React.JSX.Element {
    const navigation = useNavigation();
    const backToDonations = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    }

    return (
        <View style={styles.container}>
            
            <View style={styles.imageContainer}>
                <Image source={require('../assets/images/success.png')} style={styles.image} />
            </View>
            <Text style={styles.title}>Thank You for your donation!!</Text>

            <Button mode="contained" onPress={backToDonations} style={styles.button} buttonColor="#4B5F71">
                Go Back to Donations Screen
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginTop: 16,
    },
    errorText: {
        color: 'red',
        marginBottom: 8,
    },
    imageContainer: {
        alignItems: 'center', 
        marginBottom: 20,
      },
    image: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
});

export default ThankYou;
