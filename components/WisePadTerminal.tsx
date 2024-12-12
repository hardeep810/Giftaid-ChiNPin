import React, { useEffect, useState } from "react";
import { View, Text, Alert, Button } from 'react-native';
import { StripeTerminalProvider, requestNeededAndroidPermissions  } from '@stripe/stripe-terminal-react-native';
import config from "../config";
import DonationsForm from "./DonationsForm";

function WisePadTerminal(): React.JSX.Element {
    const fetchTokenProvider = async () => {
        try {
            const response = await fetch(`${config.API_URL}connection_token`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error("Failed to fetch connection token, status:", response.status);
                return;
            }

            const { secret } = await response.json();
            return secret;
        } catch (error) {
            console.error("Error fetching connection token:", error);
        }
    };

    useEffect(() => {
        const requestPermissions = async () => {
            try {
                const granted = await requestNeededAndroidPermissions({
                    accessFineLocation: {
                        title: 'Location Permission',
                        message: 'Stripe Terminal needs access to your location',
                        buttonPositive: 'Accept',
                    },
                });
                if (granted) {
                    // Initialize the SDK
                } else {
                    console.error(
                        'Location and BT services are required in order to connect to a reader.'
                    );
                }
            } catch (e) {
                console.error(e);
            }
        };
    
        requestPermissions();
    }, []);

    

    return (
        <StripeTerminalProvider
            logLevel="verbose"
            tokenProvider={fetchTokenProvider} 
        >
            <DonationsForm />
        </StripeTerminalProvider>
    );
}

export default WisePadTerminal;
