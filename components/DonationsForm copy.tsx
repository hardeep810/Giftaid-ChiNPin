import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { SelectList } from 'react-native-dropdown-select-list';
import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import config from "../config";

type FormData = {
    amount: string;
    password: string;
};

function DonationsForm(): React.JSX.Element {
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [selected, setSelected] = useState();
    const [readerConnected, setReaderConnected] = useState(false);

    const { initialize, discoverReaders, connectBluetoothReader, discoveredReaders, cancelDiscovering, retrievePaymentIntent, collectPaymentMethod } =
        useStripeTerminal({
            onUpdateDiscoveredReaders: (readers) => {
                // After the SDK discovers a reader, your app can connect to it.
                // Here, we're automatically connecting to the first discovered reader.
                console.log("*********** Discovered Readers *****************");
                console.log(readers);
                // Alert.alert("*********** Discovered Readers *****************", JSON.stringify(readers, null, 2));
                handleConnectBluetoothReader(readers);
            },
        });

    useEffect(() => {
        initialize()
            .then(() => {
                console.log("Stripe terminal initialized successfully.");
                //Alert.alert("Terminal Intilialized", "Stripe terminal initialized successfully.");
            })
            .catch((error) => {
                console.error("Error initializing Stripe terminal:", error);
                Alert.alert("Stripe Initialization Error", "There was an issue initializing the Stripe terminal.");
            });

    }, [initialize]);

    /*
    * Submit Donation Form and Process Payment
    */
    const onSubmit = async (data: FormData) => {
        // if (!readerConnected) {
        // Step 1, Connect To Reader
        handleDiscoverReaders();
        //  }

    };

    const handleDiscoverReaders = async () => {
        Alert.alert("Discover Reader", "Searching for device......");
        const { error } = await discoverReaders({
            discoveryMethod: 'bluetoothScan',
            simulated: true,
        });




        if (error) {
            // clearTimeout(timeout);
            if (error.code == 'USER_ERROR.CANCELED') {
                Alert.alert("Timeout", "No readers found within the set period.");
            } else {
                console.error(
                    'Discover readers error: ',
                    `${error.code}, ${error.message}`
                );
                Alert.alert(
                    'Discover readers error: ',
                    `${error.code}, ${error.message}`
                );
            }

        }

        // clearTimeout(timeout);

    };

    // const defaultLocationId = "tml_F0XT3AHZ0PHBmp";

    const handleConnectBluetoothReader = async (readersfound: any) => {
        Alert.alert("*********** Location ID *****************", readersfound[0].locationId);
        Alert.alert("*********** First Discovered Readers *****************", JSON.stringify(readersfound, null, 2));
        // if (!discoveredReaders || discoveredReaders.length === 0) {
        //     Alert.alert("No Readers Found", "Please ensure a reader is nearby and try again.");
        //     return;
        // }

        if (readersfound && readersfound.length > 0) {
            //const timeout = setTimeout(async () => {
                await cancelDiscovering(); // Stop discovery process if no readers found
                Alert.alert("Timeout", "No readers found within the set period.");

         //   }, 20000);
        }

        const { reader, error } = await connectBluetoothReader({
            reader: readersfound[0],
            locationId: readersfound[0].locationId
        });

        if (error) {
            console.log('connectBluetoothReader error', error);
            Alert.alert("*********** Reader not connected *****************", JSON.stringify(error, null, 2));
            //Alert.alert("Reader not connected", "Unable to connect to reader.");
            return;
        }

        console.log('Reader connected successfully', reader);
        Alert.alert("Reader connected", "Reader connected successfully");
        Alert.alert("Connected reader is: ", JSON.stringify(reader, null, 2));

        setReaderConnected(true);

        // Step 2: Create Payment Intent
        const response = await fetch(`${config.API_URL}create-payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: 1, currency: 'CAD' }), // Amount in cents
        });
        const responseData = await response.json();
        console.log('Fetched clientSecret:', responseData.clientSecret);
        Alert.alert("Payment Intent", "Payment intent created successfully.");

        // Step 3: Process Payment
        const { paymentIntent, error: retrievePaymentError } = await retrievePaymentIntent(responseData.clientSecret);

        if (retrievePaymentError) {
            console.error("Retrieve Payment Intent Error");
            console.error(retrievePaymentError.message);
            Alert.alert("Payment Intent Error", "Issues in retrieving payment intent.");

            return;
        }

        console.log('Payment Intent : ', paymentIntent);
        Alert.alert("Payment Intent Reterived", "Payment Intent reterived successfully.");


        const { paymentIntent: collectPaymentIntent, error: CollectPaymentError } = await collectPaymentMethod({ paymentIntent: paymentIntent });
        if (CollectPaymentError) {
            console.error("Retrieve Payment Intent Error");
            console.error(CollectPaymentError.message);
            Alert.alert("Collect Payment Method Error", "Error in collect Payment Method.");
            return;
        }


        console.log('collectPaymentMethod : ', collectPaymentIntent);
        Alert.alert("Collect Payment Method", "Collect Payment Method Processed successfully.");
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

            <SelectList
                setSelected={(val: any) => setSelected(val)}
                data={data}
                save="value"
                search={false}
                defaultOption={{ key: '1', value: 'Monthly' }}
                boxStyles={{ borderRadius: 5, marginBottom: 5 }}
            />
            <TextInput
                label="Email"
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
            />
            <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button} buttonColor="#4B5F71">
                Donate
            </Button>
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
});

export default DonationsForm;

