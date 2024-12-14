declare module 'mic' {
    import { Writable } from 'stream';

    interface MicOptions {
        rate?: number;
        channels?: string;
        fileType?: string;
        endian?: string;
        bitwidth?: number;
        encoding?: string;
        device?: string;
        exitOnSilence?: number;
        debug?: boolean;
        additionalParameters?: string[];
    }

    interface MicInstance {
        getAudioStream(): Writable;
        start(): void;
        stop(): void;
        pause(): void;
        resume(): void;
    }

    function mic(options?: MicOptions): MicInstance;

    export = mic;
}
