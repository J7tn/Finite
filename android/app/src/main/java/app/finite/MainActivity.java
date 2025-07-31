package app.finite;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.activity.EdgeToEdge;
import androidx.core.view.ViewCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;
import androidx.appcompat.app.AppCompatDelegate;
import android.content.res.Configuration;
import android.view.View;
import android.graphics.Color;

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
            
            // Set transparent colors for older versions (deprecated in Android 15+)
            getWindow().setStatusBarColor(Color.TRANSPARENT);
            getWindow().setNavigationBarColor(Color.TRANSPARENT);
        }
        
        // Handle edge-to-edge insets for all Android versions
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (v, windowInsets) -> {
            Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
            
            // Apply padding to the root view to account for system bars
            v.setPadding(insets.left, insets.top, insets.right, insets.bottom);
            
            // Return the window insets
            return WindowInsetsCompat.CONSUMED;
        });
        
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
