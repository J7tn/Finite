package app.finite;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;
import androidx.appcompat.app.AppCompatDelegate;
import android.content.res.Configuration;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Enable edge-to-edge for Android 15+ (API 35+)
        if (android.os.Build.VERSION.SDK_INT >= 35) {
            EdgeToEdge.enable(this);
        }
        
        super.onCreate(savedInstanceState);
        
        // Legacy edge-to-edge support for older versions
        if (android.os.Build.VERSION.SDK_INT < 35) {
            // Set the app to draw behind the system bars for edge-to-edge
            WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        }
        
        // Control bar icon appearance (light/dark) based on theme
        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        int currentNightMode = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        if (currentNightMode == Configuration.UI_MODE_NIGHT_YES) {
            // Dark mode: use light icons
            insetsController.setAppearanceLightStatusBars(false);
            insetsController.setAppearanceLightNavigationBars(false);
        } else {
            // Light mode: use dark icons
            insetsController.setAppearanceLightStatusBars(true);
            insetsController.setAppearanceLightNavigationBars(true);
        }
    }
}
