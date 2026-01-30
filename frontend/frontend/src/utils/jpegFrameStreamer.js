// JPEG Frame Streamer: captures a canvas (composited video grid) and sends JPEG frames to backend
import { getApiUrl } from './config';

class JPEGFrameStreamer {
	constructor() {
		this.running = false;
		this.canvas = null;
		this.ctx = null;
		this.interval = null;
		this.sessionId = null;
		this.frameIntervalMs = 133;
		this.targetFps = 24;
		this.width = 1280;
		this.height = 720;
		this.frameCount = 0;
		this.inFlight = false;
		this.jpegQuality = 0.8;
		this.lastSendTime = 0;
		this.statsCallback = null;
	}

	initCanvas(sourceElement) {
		if (!this.canvas) {
			this.canvas = document.createElement('canvas');
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			this.ctx = this.canvas.getContext('2d');
		}
		this.sourceElement = sourceElement; // expect a DOM node containing video elements
	}

	drawComposite() {
		if (!this.ctx) return;
		this.ctx.fillStyle = '#000';
		this.ctx.fillRect(0,0,this.width,this.height);
		// Simple: take first video element inside sourceElement
		if (!this.sourceElement) return;
		const vids = this.sourceElement.querySelectorAll('video');
		if (vids.length === 0) return;
		const v = vids[0];
		try {
			this.ctx.drawImage(v, 0, 0, this.width, this.height);
		} catch {}
	}

	async sendFrame(blob) {
		if (this.inFlight) return; // simple congestion control
		this.inFlight = true;
		try {
			const form = new FormData();
			form.append('sessionId', this.sessionId);
			form.append('timestamp', Date.now().toString());
			form.append('chunk', blob, `frame_${this.frameCount}.jpg`);
					const res = await fetch(`${getApiUrl()}/api/youtube/stream-chunk`, {
						method: 'POST',
						credentials: 'include', // send cookies for auth middleware
						body: form
					});
					if (!res.ok) {
						console.warn('⚠️ JPEG frame upload failed', res.status);
						if (res.status === 401) {
							this.authFailCount = (this.authFailCount || 0) + 1;
							if (this.authFailCount >= 5) {
								console.error('🚫 Stopping JPEG streamer due to repeated 401 (unauthorized).');
								this.stop();
								return;
							}
						}
			} else {
						this.authFailCount = 0;
				const json = await res.json().catch(()=>null);
				if (!json?.success) console.warn('⚠️ JPEG frame backend response issue', json);
			}
		} catch (e) {
			console.warn('⚠️ JPEG frame send error', e);
		} finally {
			this.inFlight = false;
		}
	}


	_startScheduler() {
		const frameInterval = 1000 / this.targetFps;
		let nextTs = performance.now();
		const loop = () => {
			if (!this.running) return;
			const now = performance.now();
			if (now >= nextTs - 1) {
				this._produceFrame();
				nextTs += frameInterval;
				// Drift correction
				if (now - nextTs > frameInterval) nextTs = now + frameInterval;
			}
			requestAnimationFrame(loop);
		};
		requestAnimationFrame(loop);
	}

	_produceFrame() {
		this.drawComposite();
		this.canvas.toBlob((blob)=>{
			if (!this.running) return;
			if (blob && blob.size > 800) {
				this.frameCount++;
				this.lastSendTime = performance.now();
				if (this.frameCount % 30 === 0 && this.statsCallback) {
					this.statsCallback({ frames: this.frameCount, quality: this.jpegQuality, lastSize: blob.size });
				}
				// Adaptive quality: if size consistently >70KB lower quality slightly; if <40KB raise a bit
				if (blob.size > 70000 && this.jpegQuality > 0.5) this.jpegQuality -= 0.02;
				else if (blob.size < 40000 && this.jpegQuality < 0.9) this.jpegQuality += 0.01;
				this.sendFrame(blob);
			} else {
				// Skip tiny
			}
		}, 'image/jpeg', this.jpegQuality);
	}

	async start({ sessionId, videoGridElement }) {
		if (this.running) return;
		if (!sessionId) throw new Error('sessionId required');
		this.sessionId = sessionId;
		this.initCanvas(videoGridElement);
		this.running = true;
		this.frameCount = 0;
		console.log('🚀 Starting JPEG frame streamer (image2 mode)');
			// Optional: ping status endpoint to ensure backend stream exists
			try {
				const statusRes = await fetch(`${getApiUrl()}/api/youtube/stream-status/${sessionId}`, { credentials: 'include' });
				const statusJson = await statusRes.json().catch(()=>null);
				if (!statusJson?.success || !statusJson?.data?.active) {
					console.warn('⚠️ Backend stream not active yet; delaying frame capture 2s');
					this.running = false;
					setTimeout(()=>{
						if (!this.running) {
							this.start({ sessionId, videoGridElement });
						}
					}, 2000);
					return;
				}
			} catch (e) {
				console.warn('⚠️ Could not verify backend stream status, proceeding anyway');
			}
		this._startScheduler();
	}

	stop() {
		if (!this.running) return;
		this.running = false;
		if (this.interval) clearTimeout(this.interval);
		this.interval = null;
		console.log('🛑 JPEG frame streamer stopped');
	}
}

// Singleton export
const instance = new JPEGFrameStreamer();
export default instance;
