declare const fs: {
    read(path: string): Promise<Blob>;
    readString(path: string): Promise<string>;
    readBuffer(path: string): Promise<ArrayBuffer>;
    readJSON(path: string): Promise<any>;

    write(path: string, content: Blob): Promise<void>;
    writeString(path: string, content: string): Promise<void>;
    writeBuffer(path: string, content: ArrayBuffer): Promise<void>;
    writeJSON(path: string, content: any): Promise<void>;

    append(path: string, content: Blob): Promise<void>;
    appendString(path: string, content: string): Promise<void>;
    appendBuffer(path: string, content: ArrayBuffer): Promise<void>;
    
    createDirectory(path: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    list(path: string): Promise<string[]>;
}