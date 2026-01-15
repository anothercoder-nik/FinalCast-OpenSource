
// Mock transcript data (approx 1 minute)
const MOCK_TRANSCRIPT = [
    { word: "Welcome", start: 0.0, end: 0.5 },
    { word: "to", start: 0.5, end: 0.7 },
    { word: "the", start: 0.7, end: 0.9 },
    { word: "Studio", start: 0.9, end: 1.4 },
    { word: "Room", start: 1.4, end: 1.8 },
    { word: "demonstration", start: 1.8, end: 2.5 },
    { word: ".", start: 2.5, end: 2.6 },
    { word: "Today", start: 3.0, end: 3.4 },
    { word: "we", start: 3.4, end: 3.6 },
    { word: "are", start: 3.6, end: 3.8 },
    { word: "going", start: 3.8, end: 4.1 },
    { word: "to", start: 4.1, end: 4.3 },
    { word: "show", start: 4.3, end: 4.6 },
    { word: "you", start: 4.6, end: 4.8 },
    { word: "how", start: 4.8, end: 5.1 },
    { word: "magic", start: 5.1, end: 5.6 },
    { word: "edit", start: 5.6, end: 6.0 },
    { word: "works", start: 6.0, end: 6.5 },
    { word: ".", start: 6.5, end: 6.6 },
    // Filler words to be deleted
    { word: "Um", start: 7.0, end: 7.5 },
    { word: ",", start: 7.5, end: 7.6 },
    { word: "basically", start: 7.8, end: 8.4 },
    { word: ",", start: 8.4, end: 8.5 },
    { word: "you", start: 8.6, end: 8.8 },
    { word: "know", start: 8.8, end: 9.1 },
    { word: ",", start: 9.1, end: 9.2 },
    // Core content
    { word: "if", start: 9.5, end: 9.7 },
    { word: "I", start: 9.7, end: 9.9 },
    { word: "delete", start: 9.9, end: 10.3 },
    { word: "these", start: 10.3, end: 10.6 },
    { word: "words", start: 10.6, end: 11.0 },
    { word: ",", start: 11.0, end: 11.1 },
    { word: "the", start: 11.2, end: 11.4 },
    { word: "video", start: 11.4, end: 11.8 },
    { word: "will", start: 11.8, end: 12.0 },
    { word: "automatically", start: 12.0, end: 12.8 },
    { word: "skip", start: 12.8, end: 13.2 },
    { word: "them", start: 13.2, end: 13.5 },
    { word: ".", start: 13.5, end: 13.6 }
];

export const getTranscript = async (sessionId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_TRANSCRIPT;
};
