import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { SelectList } from 'react-native-dropdown-select-list';
import { PaymentIntent, useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import config from "../config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

type FormData = {
    amount: string;
    payment_type: string;
    email: string;
    fundraiser_id: string | null;
    trans_id: string | null;
    trans_res: string;
};

function DonationsForm(): React.JSX.Element {
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [showLoader, setShowLoader] = useState(false);
    const [loaderText, setLoaderText] = useState('');
    const [readerConnected, setReaderConnected] = useState(false);
    const [postData, setPostData] = useState<FormData>();
    const navigation = useNavigation();

    const { initialize, discoverReaders, connectBluetoothReader, discoveredReaders, cancelDiscovering, retrievePaymentIntent,
        collectPaymentMethod, confirmPaymentIntent, disconnectReader } =
        useStripeTerminal({
            onUpdateDiscoveredReaders: (readers) => {
                Alert.alert("Discovered Readers", JSON.stringify(readers, null, 2));
                handleConnectBluetoothReader(readers);
            },
        });

    useEffect(() => {
        initialize()
            .then(() => {
                console.log("Stripe terminal initialized successfully.");
            })
            .catch((error) => {
                console.error("Error initializing Stripe terminal:", error);
                Alert.alert("Stripe Initialization Error", "Unable to connect to Stripe.");
            });

    }, [initialize]);


    /*
    * Submit Donation Form and Process Payment
    */
    const onSubmit = async (data: FormData) => {
        setShowLoader(true);
        if (readerConnected) {
            handleDisconnectReader();
        }
        setPostData(data);
        handleDiscoverReaders();
    };

    const handleDiscoverReaders = async () => {
        setLoaderText("Searching for a device");
        const { error } = await discoverReaders({
            discoveryMethod: 'bluetoothScan',
            simulated: false,
        });




        if (error) {
            // console.error(
            //     'Discover readers error: ',
            //     `${error.code}, ${error.message}`
            // );

        }

        // clearTimeout(timeout);

    };

    const handleConnectBluetoothReader = async (readersfound: any) => {
        if (readersfound && readersfound.length > 0) {
            await cancelDiscovering();            
        } else {
            Alert.alert("No Readers Found", "Please ensure a reader is nearby and try again.");
            return;
        }

        //Alert.alert("Reader Location ID", JSON.stringify(readersfound[0].locationId, null, 2));

        const { reader, error } = await connectBluetoothReader({
            reader: readersfound[0],
           locationId: readersfound[0].locationId
        });

        if (error) {
            console.log('connectBluetoothReader error', error);
            return;
        }

        setLoaderText("Connected to device. Processing payment");

        setReaderConnected(true);

        // Step 2: Create Payment Intent
        const response = await fetch(`${config.API_URL}create-payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: postData.amount }),
        });
        const responseData = await response.json();
        
        // Step 3: Process Payment
        const { paymentIntent, error: retrievePaymentError } = await retrievePaymentIntent(responseData.clientSecret);

        if (retrievePaymentError) {
            console.error("Retrieve Payment Intent Error");
            console.error(retrievePaymentError.message);
            Alert.alert("Payment Intent Error", "Issues in retrieving payment.");

            return;
        }
       

        const { paymentIntent: collectPaymentIntent, error: CollectPaymentError } = await collectPaymentMethod({ paymentIntent: paymentIntent });
        if (CollectPaymentError) {
            console.error("Retrieve Payment Intent Error");
            console.error(CollectPaymentError.message);
            Alert.alert("Collect Payment Method Error", "Error in collecting Payment.");
            return;
        }
        

        const { paymentIntent: confirmPaymentIntentData, error: confirmPaymentIntentError } = await confirmPaymentIntent({ paymentIntent: collectPaymentIntent });

        if (confirmPaymentIntentError) {
            console.log('confirmPaymentIntent Error : ', confirmPaymentIntentError);
            Alert.alert("Confirm Payment Method Error", JSON.stringify(confirmPaymentIntentError, null, 2));
            return;
        }
        setLoaderText("Payment processed successfully. Please be patient for few minutes");
        
        // Save Payment Details
        const loggedIn = await AsyncStorage.getItem('AuthUserID');
        postData.fundraiser_id = loggedIn;
        postData.trans_id = paymentIntent.id;
        postData.trans_res = JSON.stringify(confirmPaymentIntentData, null, 2);
        
        const saveDonation = await axios.post(config.API_URL + 'donation', postData);
        if (saveDonation.data.success) {
            setShowLoader(false);
            handleDisconnectReader();
            navigation.reset({
                index: 0,
                routes: [{ name: 'ThankYou' }],
            });
        }

        
        
    };

    const handleDisconnectReader = async () => {
        try {
            const { error } = await disconnectReader();

            if (error) {
                console.error("Error disconnecting reader: ", error.message);
            } else {
                console.log("Reader disconnected successfully.");
                setReaderConnected(false);
            }
        } catch (err) {
            console.error("Unexpected error while disconnecting: ", err);
        }
    };


    const data = [
        { key: '1', value: 'Monthly' },
        { key: '2', value: 'Annually' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Collect Donation</Text>
            <Controller
                control={control}
                name="amount"
                rules={{ required: 'Please enter the amount.' }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        label="Amount"
                        mode="outlined"
                        style={styles.input}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        error={!!errors.amount}
                    />
                )}
            />
            {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}
            <Controller
                control={control}
                name="payment_type"
                defaultValue="1"
                rules={{ required: 'Please select a payment type.' }}
                render={({ field: { onChange, value } }) => (
                    <SelectList
                        setSelected={onChange}
                        data={data}
                        save="key"
                        search={false}
                        defaultOption={data.find((item) => item.key === value)}
                        boxStyles={{ borderRadius: 5, marginBottom: 5 }}
                    />
                )}
            />

            <Controller
                control={control}
                name="email"
                rules={{
                    pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email address.',
                    },
                }}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <>
                        <TextInput
                            label="Email"
                            mode="outlined"
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                        />
                        {error && <Text style={styles.errorText}>{error.message}</Text>}
                    </>
                )}
            />
            <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button} buttonColor="#4B5F71">
                Donate
            </Button>

            {
                showLoader ?
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" />
                        <Text style={styles.loadingText}>{ loaderText?loaderText:'Loading' }...</Text>
                    </View>
                    : ''
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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

export default DonationsForm;
