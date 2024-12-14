declare module "node-record-lpcm16" {
    
    interface RecordOptions {
        sampleRate?: number; // Sampling rate of the audio
        threshold?: number;       // Silence threshold
        verbose?: boolean;        // Enable logging
        recorder?: string;   // Recording tool to use (e.g., 'sox', 'arecord')
        device?: string | null;   // Specific audio input device
    }

    interface Recording {
        stream(): NodeJS.ReadableStream;
        stop(): void;
        start(): void;
    }

    export function record(options?: RecordOptions): Recording;
}
