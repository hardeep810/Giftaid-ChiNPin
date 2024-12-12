import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from "../config";

type FormData = {
    email: string;
    password: string;
};

function Login(): React.JSX.Element {
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
    const navigation = useNavigation();
    const [showLoader, setShowLoader] = useState(false);
    const [hideLogin, setHideLogin] = useState(false);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const userToken = await AsyncStorage.getItem("AuthToken");
            if (userToken) {
                setHideLogin(true);
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                });
                
            } else {
                setHideLogin(false);
            }
        }
        checkLoginStatus();
    }, [navigation]);

    const onSubmit = async (data: FormData) => {
        try {
            setShowLoader(true);
            const response = await axios.post(config.API_URL + 'login', data);
            if (response.data.success) {console.log(response.data.result);
                await AsyncStorage.setItem('AuthToken', response.data.login_token);
                await AsyncStorage.setItem('AuthUserID', response.data.result.reference_id);
                await AsyncStorage.setItem('AuthUserDetails', JSON.stringify(response.data.result));
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
            } else {
                Alert.alert('Login Failed', response.data.message);
            }

        } catch (error) {
            console.error('Login Error:', error);
        }
        setShowLoader(false);
    };

    if (hideLogin) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        )
    } else {
        return (
            <View style={styles.container}>

                <View style={styles.imageContainer}>
                    <Image source={require('../assets/images/giftaid-logo.png')} style={styles.image} />
                </View>
                <Text style={styles.title}>Login</Text>

                <Controller
                    control={control}
                    name="email"
                    rules={{ required: 'Email is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="Email"
                            mode="outlined"
                            style={styles.input}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={!!errors.email}
                        />
                    )}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

                <Controller
                    control={control}
                    name="password"
                    rules={{ required: 'Password is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="Password"
                            mode="outlined"
                            style={styles.input}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            secureTextEntry
                            error={!!errors.password}
                        />
                    )}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

                <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button} buttonColor="#4B5F71">
                    Login
                </Button>
                {
                    showLoader ?
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" />
                            <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                        : ''
                }

            </View>
        );
    }
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
    loaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    loadingText: {
        fontSize: 18,
        color: '#26B99A',
        marginLeft: 10,
        fontWeight: "700"
    },
});

export default Login;
