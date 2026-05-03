// TypeScript declaration for the youtube-transcript package
declare module "youtube-transcript" {
    export const YoutubeTranscript: {
        fetchTranscript: (url: string) => Promise<Array<{ text: string; start?: number; duration?: number }>>;
    };
}
