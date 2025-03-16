import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

const handleMessage = (event) => {
    const message = event.nativeEvent.data;
    if (message === 'print-command') {
      console.log("Received print command");

      // Sending a confirmation back to the web app
      this.webview.injectJavaScript(`
        window.onPrintConfirmed && window.onPrintConfirmed();
      `);
    }
}

const WebViewScreen = () => {
  return (
    <View style={styles.container}>
      <WebView 
        source={{ uri: "http://jayesh00041.github.io/POS/" }}
        style={styles.webview}
        onMessage={(event) => {
                      try {
                        const receivedData = JSON.parse(event.nativeEvent.data);
                        console.log("Received from WebView:", receivedData);

                        if (receivedData.type === "print-command") {
                          console.log("Message:", receivedData.payload.message);
                          console.log("Timestamp:", receivedData.payload.timestamp);
                        }
                      } catch (error) {
                        console.error("Error parsing message from WebView:", error);
                      }
                    }
                }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default WebViewScreen;
