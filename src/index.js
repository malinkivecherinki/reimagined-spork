// HTTPClient - Advanced HTTP client with retry and timeout support
const https = require('https');
const http = require('http');

class HTTPClient {
    constructor(options = {}) {
        this.timeout = options.timeout || 5000;
        this.retries = options.retries || 3;
    }
    
    request(url, options = {}) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            const req = protocol.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, data }));
            });
            
            req.setTimeout(this.timeout, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.on('error', reject);
        });
    }
    
    async requestWithRetry(url, options = {}) {
        let lastError;
        for (let i = 0; i < this.retries; i++) {
            try {
                return await this.request(url, options);
            } catch (error) {
                lastError = error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
        throw lastError;
    }
}

module.exports = HTTPClient;
