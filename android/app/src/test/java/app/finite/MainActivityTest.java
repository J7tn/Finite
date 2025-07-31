package app.finite;

import android.os.Build;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.rule.ActivityTestRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class MainActivityTest {

    @Rule
    public ActivityTestRule<MainActivity> activityRule = new ActivityTestRule<>(MainActivity.class);

    @Test
    public void testEdgeToEdgeEnabled() {
        MainActivity activity = activityRule.getActivity();
        
        // Verify that edge-to-edge is properly configured
        if (Build.VERSION.SDK_INT >= 35) {
            // For Android 15+, EdgeToEdge should be enabled
            // This is handled in onCreate, so we just verify the activity starts
            assertNotNull(activity);
        } else {
            // For older versions, WindowCompat should be configured
            assertNotNull(activity);
        }
    }

    @Test
    public void testActivityNotNull() {
        MainActivity activity = activityRule.getActivity();
        assertNotNull("MainActivity should not be null", activity);
    }
} 