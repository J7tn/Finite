package app.finite;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import androidx.appcompat.app.AppCompatDelegate;
import android.content.res.Configuration;
import android.graphics.Color;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Set the app to draw behind the system bars for edge-to-edge
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        // Control bar icon appearance (light/dark) based on theme
        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        int currentNightMode = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        if (currentNightMode == Configuration.UI_MODE_NIGHT_YES) {
            // Dark mode: use light icons, transparent status bar
            insetsController.setAppearanceLightStatusBars(false);
            insetsController.setAppearanceLightNavigationBars(false);
            // Only set status bar color on Android < 15 (API < 35)
            if (android.os.Build.VERSION.SDK_INT < 35) {
                getWindow().setStatusBarColor(Color.TRANSPARENT);
            }
        } else {
            // Light mode: use dark icons, white status bar
            insetsController.setAppearanceLightStatusBars(true);
            insetsController.setAppearanceLightNavigationBars(true);
            // Only set status bar color on Android < 15 (API < 35)
            if (android.os.Build.VERSION.SDK_INT < 35) {
                getWindow().setStatusBarColor(Color.WHITE);
            }
        }
    }
}
