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
        onMessage={handleMessage}
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
