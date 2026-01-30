# TODO: AI-Generated Session Transcripts and Summaries

## Backend Tasks
- [x] Create `backend/models/transcript.model.js` to store transcripts and summaries linked to sessions.
- [x] Extend `backend/services/aiService.js` with methods to generate summaries from transcripts using Gemini.
- [x] Modify `backend/recording/services/recordingMerge.service.js` to extract audio from merged video and perform speech-to-text (using Google Cloud Speech-to-Text API).
- [x] Update `backend/recording/recording.controller.js` to trigger transcript generation and summary creation after merge completion.
- [x] Update `backend/services/email.service.js` to send emails with downloadable transcripts and summaries post-session.
- [x] Add backend routes in `backend/routes/recording.routes.js` for fetching transcripts/summaries.

## Frontend Tasks
- [x] Create a new frontend component `frontend/src/components/dashboard/SessionTranscripts.jsx` to display transcripts and summaries.
- [x] Update `frontend/src/services/transcriptService.js` to fetch real transcript data from backend API.

## Dependencies and Testing
- [x] Install necessary dependencies (e.g., @google-cloud/speech for STT).
- [ ] Test speech-to-text accuracy and AI summary generation.
- [ ] Ensure email attachments work for transcripts.
- [ ] Update frontend dashboard to integrate the new component.
