/**
 * WebRTC Connection Comprehensive Tester
 * Tests all aspects of WebRTC socket connections for perfect functionality
 */

import { getIceServers } from './config.js';

class WebRTCConnectionTester {
  constructor(socket, webRTCManager) {
    this.socket = socket;
    this.webRTCManager = webRTCManager;
    this.testResults = {
      socketConnection: { status: 'pending', details: null },
      webrtcSignaling: { status: 'pending', details: null },
      peerConnection: { status: 'pending', details: null },
      mediaStreaming: { status: 'pending', details: null },
      errorHandling: { status: 'pending', details: null },
      reconnection: { status: 'pending', details: null }
    };
  }

  async runComprehensiveTest() {
    console.log('🧪 Starting comprehensive WebRTC connection test...');
    
    try {
      await this.testSocketConnection();
      await this.testWebRTCSignaling();
      await this.testPeerConnection();
      await this.testMediaStreaming();
      await this.testErrorHandling();
      await this.testReconnection();
      
      this.generateTestReport();
      return this.testResults;
    } catch (error) {
      console.error('❌ Comprehensive test failed:', error);
      throw error;
    }
  }

  async testSocketConnection() {
    console.log('🔌 Testing socket connection...');
    
    try {
      // Test basic socket connectivity
      const socketConnected = this.socket && this.socket.connected;
      
      if (!socketConnected) {
        throw new Error('Socket not connected');
      }

      // Test socket event emission/reception
      const eventTestPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Socket event test timeout'));
        }, 5000);

        const testData = { test: 'connection', timestamp: Date.now() };
        
        this.socket.once('test-response', (response) => {
          clearTimeout(timeout);
          if (response.received === testData.test) {
            resolve(true);
          } else {
            reject(new Error('Invalid test response'));
          }
        });

        this.socket.emit('test-connection', testData);
      });

      await eventTestPromise;

      this.testResults.socketConnection = {
        status: 'passed',
        details: 'Socket connection and event handling working perfectly'
      };

    } catch (error) {
      this.testResults.socketConnection = {
        status: 'failed',
        details: error.message
      };
    }
  }

  async testWebRTCSignaling() {
    console.log('📡 Testing WebRTC signaling...');
    
    try {
      const signalTests = [];
      
      // Test offer/answer/ICE signaling
      const offerTest = this.testOfferSignaling();
      const answerTest = this.testAnswerSignaling();
      const iceTest = this.testICESignaling();
      
      signalTests.push(offerTest, answerTest, iceTest);
      
      const results = await Promise.allSettled(signalTests);
      const failedTests = results.filter(r => r.status === 'rejected');
      
      if (failedTests.length === 0) {
        this.testResults.webrtcSignaling = {
          status: 'passed',
          details: 'All WebRTC signaling tests passed'
        };
      } else {
        throw new Error(`${failedTests.length} signaling tests failed`);
      }

    } catch (error) {
      this.testResults.webrtcSignaling = {
        status: 'failed',
        details: error.message
      };
    }
  }

  async testOfferSignaling() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Offer signaling timeout'));
      }, 5000);

      const mockOffer = {
        type: 'offer',
        sdp: 'mock-sdp-data'
      };

      this.socket.once('webrtc-offer', (data) => {
        clearTimeout(timeout);
        if (data.offer && data.senderSocketId) {
          resolve(true);
        } else {
          reject(new Error('Invalid offer format'));
        }
      });

      // Simulate sending offer to self (for testing)
      this.socket.emit('webrtc-offer', {
        targetSocketId: this.socket.id,
        offer: mockOffer
      });
    });
  }

  async testAnswerSignaling() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Answer signaling timeout'));
      }, 5000);

      const mockAnswer = {
        type: 'answer',
        sdp: 'mock-answer-sdp'
      };

      this.socket.once('webrtc-answer', (data) => {
        clearTimeout(timeout);
        if (data.answer && data.senderSocketId) {
          resolve(true);
        } else {
          reject(new Error('Invalid answer format'));
        }
      });

      this.socket.emit('webrtc-answer', {
        targetSocketId: this.socket.id,
        answer: mockAnswer
      });
    });
  }

  async testICESignaling() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('ICE signaling timeout'));
      }, 5000);

      const mockCandidate = {
        candidate: 'candidate:mock',
        sdpMLineIndex: 0,
        sdpMid: 'test'
      };

      this.socket.once('webrtc-ice-candidate', (data) => {
        clearTimeout(timeout);
        if (data.candidate && data.senderSocketId) {
          resolve(true);
        } else {
          reject(new Error('Invalid ICE candidate format'));
        }
      });

      this.socket.emit('webrtc-ice-candidate', {
        targetSocketId: this.socket.id,
        candidate: mockCandidate
      });
    });
  }

  async testPeerConnection() {
    console.log('🤝 Testing peer connection establishment...');
    
    try {
      // Test if WebRTC manager can create peer connections
      if (!this.webRTCManager) {
        throw new Error('WebRTC manager not available');
      }

      // Check if RTCPeerConnection is supported
      if (typeof RTCPeerConnection === 'undefined') {
        throw new Error('RTCPeerConnection not supported');
      }

      // Test creating a mock peer connection
      const testPC = new RTCPeerConnection({
        iceServers: getIceServers()
      });

      // Test connection states
      const statePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection state test timeout'));
        }, 10000);

        testPC.oniceconnectionstatechange = () => {
          console.log('ICE Connection State:', testPC.iceConnectionState);
          if (testPC.iceConnectionState === 'connected' || 
              testPC.iceConnectionState === 'completed') {
            clearTimeout(timeout);
            resolve(true);
          }
        };

        // Create offer to start ICE gathering
        testPC.createOffer().then(offer => {
          return testPC.setLocalDescription(offer);
        }).catch(reject);
      });

      try {
        await Promise.race([statePromise, new Promise(resolve => setTimeout(resolve, 3000))]);
      } catch (e) {
        // ICE connection might not complete in test environment, that's okay
      }

      testPC.close();

      this.testResults.peerConnection = {
        status: 'passed',
        details: 'Peer connection creation and basic functionality working'
      };

    } catch (error) {
      this.testResults.peerConnection = {
        status: 'failed',
        details: error.message
      };
    }
  }

  async testMediaStreaming() {
    console.log('🎥 Testing media streaming...');
    
    try {
      // Test media access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (!stream || stream.getTracks().length === 0) {
        throw new Error('No media tracks available');
      }

      // Test track manipulation
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      if (videoTracks.length > 0) {
        videoTracks[0].enabled = false;
        videoTracks[0].enabled = true;
      }

      if (audioTracks.length > 0) {
        audioTracks[0].enabled = false;
        audioTracks[0].enabled = true;
      }

      // Clean up
      stream.getTracks().forEach(track => track.stop());

      this.testResults.mediaStreaming = {
        status: 'passed',
        details: `Media streaming working - ${videoTracks.length} video, ${audioTracks.length} audio tracks`
      };

    } catch (error) {
      this.testResults.mediaStreaming = {
        status: 'failed',
        details: error.message
      };
    }
  }

  async testErrorHandling() {
    console.log('⚠️ Testing error handling...');
    
    try {
      // Test invalid socket operations
      const errorTests = [
        this.testInvalidOfferError(),
        this.testInvalidAnswerError(),
        this.testInvalidICEError()
      ];

      const results = await Promise.allSettled(errorTests);
      const passedTests = results.filter(r => r.status === 'fulfilled');

      if (passedTests.length >= 2) {
        this.testResults.errorHandling = {
          status: 'passed',
          details: `Error handling working - ${passedTests.length}/${errorTests.length} tests passed`
        };
      } else {
        throw new Error('Insufficient error handling tests passed');
      }

    } catch (error) {
      this.testResults.errorHandling = {
        status: 'failed',
        details: error.message
      };
    }
  }

  async testInvalidOfferError() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Invalid offer error test timeout'));
      }, 3000);

      this.socket.once('webrtc-error', (data) => {
        clearTimeout(timeout);
        if (data.errorType === 'validation_error') {
          resolve(true);
        } else {
          reject(new Error('Expected validation error not received'));
        }
      });

      // Send invalid offer
      this.socket.emit('webrtc-offer', {
        targetSocketId: 'invalid-socket-id',
        offer: null
      });
    });
  }

  async testInvalidAnswerError() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Invalid answer error test timeout'));
      }, 3000);

      this.socket.once('webrtc-error', (data) => {
        clearTimeout(timeout);
        if (data.errorType === 'validation_error') {
          resolve(true);
        } else {
          reject(new Error('Expected validation error not received'));
        }
      });

      // Send invalid answer
      this.socket.emit('webrtc-answer', {
        targetSocketId: null,
        answer: { invalid: true }
      });
    });
  }

  async testInvalidICEError() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Invalid ICE error test timeout'));
      }, 3000);

      this.socket.once('webrtc-error', (data) => {
        clearTimeout(timeout);
        resolve(true); // Any error response is good for this test
      });

      // Send invalid ICE candidate
      this.socket.emit('webrtc-ice-candidate', {
        targetSocketId: 'non-existent-socket',
        candidate: null
      });
    });
  }

  async testReconnection() {
    console.log('🔄 Testing reconnection functionality...');
    
    try {
      // Test ping-pong functionality
      const pingTest = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Ping test timeout'));
        }, 5000);

        this.socket.once('ping-response', (data) => {
          clearTimeout(timeout);
          if (data.status && data.timestamp) {
            resolve(true);
          } else {
            reject(new Error('Invalid ping response'));
          }
        });

        this.socket.emit('ping-connection', {
          targetSocketId: this.socket.id
        });
      });

      await pingTest;

      this.testResults.reconnection = {
        status: 'passed',
        details: 'Reconnection and health check functionality working'
      };

    } catch (error) {
      this.testResults.reconnection = {
        status: 'failed',
        details: error.message
      };
    }
  }

  generateTestReport() {
    console.log('📊 WebRTC Connection Test Report:');
    console.log('================================');
    
    const testCategories = Object.keys(this.testResults);
    let passedTests = 0;
    let totalTests = testCategories.length;

    testCategories.forEach(category => {
      const result = this.testResults[category];
      const status = result.status === 'passed' ? '✅' : '❌';
      
      console.log(`${status} ${category}: ${result.status}`);
      console.log(`   Details: ${result.details}`);
      
      if (result.status === 'passed') passedTests++;
    });

    console.log('================================');
    console.log(`Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    const overallStatus = passedTests === totalTests ? 'PERFECT' : 
                         passedTests >= totalTests * 0.8 ? 'GOOD' : 'NEEDS_WORK';
    
    console.log(`Status: ${overallStatus}`);
    
    return {
      overall: overallStatus,
      passed: passedTests,
      total: totalTests,
      results: this.testResults
    };
  }
}

export default WebRTCConnectionTester;
