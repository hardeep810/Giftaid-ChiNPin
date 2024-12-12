import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from "react-native-vector-icons/MaterialIcons";


function UserProfile(): React.JSX.Element {
    const navigation = useNavigation();
    const [profileData, setProfileData] = useState(Object);

    useEffect(() => {
        const fetchUserData = async () => {
            const userDetails = await AsyncStorage.getItem("AuthUserDetails");
            console.log('userDetails');
            console.log(userDetails);
            const user = JSON.parse(userDetails);
            setProfileData(user);
        }
        fetchUserData();
    }, [])

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('AuthToken');
            await AsyncStorage.removeItem('AuthUserID');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error("Logout Error:", error);
            Alert.alert('Error', 'Something went wrong during logout');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={require('../assets/images/user.png')} style={styles.image} />
            </View>
            <Text style={styles.title}>{profileData.firstname} {profileData.surname}</Text>
            <Text style={styles.profile}>Code: {profileData.code}</Text>
            <Text style={styles.profile}>{profileData.email}</Text>

            <TouchableOpacity style={styles.logoutContainer} onPress={logout}>
                <Icon name="logout" size={24} color="#ff0000" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 16,
        paddingRight: 16,
        marginTop: 30
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 9,
    },
    profile: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    button: {
        marginTop: 16,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    logoutContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 32,
        marginLeft: 32,
    },
    logoutText: {
        fontSize: 18,
        color: "#ff0000",
        marginLeft: 8,
    },
})


export default UserProfile;