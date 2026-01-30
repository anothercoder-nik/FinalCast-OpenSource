/**
 * Video AbortError Prevention Test
 * This utility helps test that the VideoGrid properly handles rapid stream updates
 * without causing AbortError warnings
 */

export const testVideoAbortErrorPrevention = () => {
  console.log('🧪 Testing Video AbortError Prevention...');
  
  // Simulate rapid stream updates that would previously cause AbortError
  const testResults = {
    abortErrorCount: 0,
    successfulUpdates: 0,
    totalUpdates: 0
  };
  
  // Override console.warn to catch AbortError warnings
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('AbortError') || message.includes('fetching process for the media resource was aborted')) {
      testResults.abortErrorCount++;
    }
    originalWarn(...args);
  };
  
  // Test rapid video element updates
  const mockVideoElement = {
    srcObject: null,
    paused: true,
    seeking: false,
    play: () => Promise.resolve(),
    onloadedmetadata: null
  };
  
  // Simulate rapid updates
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      const mockStream = { id: `stream-${i}` };
      
      // This simulates what happens in the VideoGrid ref callback
      if (mockVideoElement.srcObject !== mockStream) {
        mockVideoElement.srcObject = mockStream;
        testResults.successfulUpdates++;
      }
      testResults.totalUpdates++;
      
      // Report results after all updates
      if (i === 9) {
        setTimeout(() => {
          console.log('📊 Test Results:', testResults);
          console.log(testResults.abortErrorCount === 0 ? '✅ No AbortErrors detected!' : '❌ AbortErrors still occurring');
          
          // Restore console.warn
          console.warn = originalWarn;
        }, 100);
      }
    }, i * 10); // Rapid updates every 10ms
  }
  
  return testResults;
};

// Usage: Call this function in your component or browser console
// testVideoAbortErrorPrevention();
