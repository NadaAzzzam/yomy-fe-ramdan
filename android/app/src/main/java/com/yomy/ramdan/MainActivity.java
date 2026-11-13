package com.yomy.ramdan;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(AzanPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
