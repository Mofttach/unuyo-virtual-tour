/**
 * Epic Intro Animation - Zoom from Sky/Globe to Campus
 * 
 * Sequence:
 * 1. Show logo in clouds (loading screen)
 * 2. Initialize with "Little Planet" effect (extreme FOV)
 * 3. Zoom in from sky → ground level
 * 4. Transition to normal panorama view
 */

class IntroAnimation {
    constructor(viewer, config = {}) {
        this.viewer = viewer;
        this.config = {
            duration: 3000,              // Total animation duration (ms)
            startFOV: 180,               // Little planet effect (extreme wide)
            endFOV: 100,                 // Normal view
            startPitch: 90,              // Looking straight up (sky)
            endPitch: 0,                 // Horizontal view
            startYaw: 0,                 // Initial rotation
            endYaw: 0,                   // Final rotation
            easing: 'easeInOutCubic',    // Smooth acceleration/deceleration
            autoStart: true,             // Auto-start after load
            delay: 500,                  // Delay before animation starts
            ...config
        };
        
        this.isPlaying = false;
        this.startTime = null;
    }
    
    /**
     * Easing functions for smooth animation
     */
    easing = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInOutBack: t => {
            const c1 = 1.70158;
            const c2 = c1 * 1.525;
            return t < 0.5
                ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
                : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
        }
    };
    
    /**
     * Interpolate between two values with easing
     */
    lerp(start, end, progress, easingFunc = 'easeInOutCubic') {
        const easedProgress = this.easing[easingFunc](progress);
        return start + (end - start) * easedProgress;
    }
    
    /**
     * Animation frame update
     */
    animate(timestamp) {
        if (!this.isPlaying) return;
        
        if (!this.startTime) {
            this.startTime = timestamp;
        }
        
        const elapsed = timestamp - this.startTime;
        const progress = Math.min(elapsed / this.config.duration, 1);
        
        // Calculate current values with easing
        const currentFOV = this.lerp(
            this.config.startFOV,
            this.config.endFOV,
            progress,
            this.config.easing
        );
        
        const currentPitch = this.lerp(
            this.config.startPitch,
            this.config.endPitch,
            progress,
            this.config.easing
        );
        
        const currentYaw = this.lerp(
            this.config.startYaw,
            this.config.endYaw,
            progress,
            'linear' // Constant rotation speed
        );
        
        // Apply to viewer
        this.viewer.setHfov(currentFOV);
        this.viewer.setPitch(currentPitch);
        this.viewer.setYaw(currentYaw);
        
        // Continue animation or finish
        if (progress < 1) {
            requestAnimationFrame(this.animate.bind(this));
        } else {
            this.finish();
        }
    }
    
    /**
     * Start the intro animation
     */
    start() {
        if (this.isPlaying) return;
        
        console.log('🎬 Starting intro animation...');
        
        // Set initial state (little planet view in sky)
        this.viewer.setHfov(this.config.startFOV);
        this.viewer.setPitch(this.config.startPitch);
        this.viewer.setYaw(this.config.startYaw);
        
        // Disable auto-rotate during animation
        const wasAutoRotating = this.viewer.isAutoRotating();
        if (wasAutoRotating) {
            this.viewer.stopAutoRotate();
        }
        
        this.isPlaying = true;
        this.startTime = null;
        
        // Start animation with delay
        setTimeout(() => {
            requestAnimationFrame(this.animate.bind(this));
        }, this.config.delay);
        
        // Store auto-rotate state to restore later
        this._wasAutoRotating = wasAutoRotating;
    }
    
    /**
     * Stop animation
     */
    stop() {
        this.isPlaying = false;
        this.startTime = null;
    }
    
    /**
     * Animation finished callback
     */
    finish() {
        console.log('✅ Intro animation complete!');
        this.isPlaying = false;
        this.startTime = null;
        
        // Restore auto-rotate if it was enabled
        if (this._wasAutoRotating) {
            setTimeout(() => {
                this.viewer.startAutoRotate();
            }, 1000);
        }
        
        // Trigger completion event
        if (this.config.onComplete) {
            this.config.onComplete();
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('introAnimationComplete'));
    }
    
    /**
     * Skip animation (jump to end state)
     */
    skip() {
        if (!this.isPlaying) return;
        
        this.stop();
        this.viewer.setHfov(this.config.endFOV);
        this.viewer.setPitch(this.config.endPitch);
        this.viewer.setYaw(this.config.endYaw);
        this.finish();
    }
}

/**
 * Create and auto-start intro animation
 */
function createIntroAnimation(viewer, config = {}) {
    const animation = new IntroAnimation(viewer, config);
    
    if (config.autoStart !== false) {
        animation.start();
    }
    
    return animation;
}

// Export for use in main app
window.IntroAnimation = IntroAnimation;
window.createIntroAnimation = createIntroAnimation;
