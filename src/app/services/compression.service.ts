import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CompressionService {
  
  /**
   * Check if the browser supports gzip compression
   */
  supportsGzip(): boolean {
    return typeof window !== 'undefined' && 'gzip' in window;
  }

  /**
   * Compress data using gzip (if supported)
   */
  async compress(data: string): Promise<Uint8Array | string> {
    if (this.supportsGzip() && 'CompressionStream' in window) {
      try {
        const stream = new (window as any).CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        const encoder = new TextEncoder();
        const chunk = encoder.encode(data);
        
        await writer.write(chunk);
        await writer.close();
        
        const chunks: Uint8Array[] = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          if (value) {
            chunks.push(value);
          }
          done = readerDone;
        }
        
        // Combine all chunks
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        
        return result;
      } catch (error) {
        console.warn('Gzip compression failed, falling back to uncompressed:', error);
        return data;
      }
    }
    
    return data;
  }

  /**
   * Decompress gzip data (if supported)
   */
  async decompress(data: Uint8Array): Promise<string> {
    if (this.supportsGzip() && 'DecompressionStream' in window) {
      try {
        const stream = new (window as any).DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        await writer.write(data);
        await writer.close();
        
        const chunks: Uint8Array[] = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          if (value) {
            chunks.push(value);
          }
          done = readerDone;
        }
        
        // Combine all chunks
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        
        const decoder = new TextDecoder();
        return decoder.decode(result);
      } catch (error) {
        console.warn('Gzip decompression failed:', error);
        throw new Error('Failed to decompress data');
      }
    }
    
    throw new Error('Gzip decompression not supported');
  }

  /**
   * Get compression ratio
   */
  getCompressionRatio(original: string, compressed: Uint8Array | string): number {
    if (typeof compressed === 'string') {
      return 1; // No compression
    }
    
    const originalSize = new TextEncoder().encode(original).length;
    const compressedSize = compressed.length;
    
    return compressedSize / originalSize;
  }

  /**
   * Check if compression is beneficial
   */
  isCompressionBeneficial(original: string, compressed: Uint8Array | string): boolean {
    const ratio = this.getCompressionRatio(original, compressed);
    return ratio < 0.9; // Consider beneficial if compressed size is less than 90% of original
  }
}
