export function formatProductResponse(responseText) {
    /**
     * Formats product information responses into a structured, readable format
     * @param {string} responseText - Raw response text containing product information
     * @returns {string} Formatted response with proper structure
     */
    const lines = responseText.split('\n');
    let formattedLines = [];
    let currentProduct = [];
    let inProductSection = false;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Detect product sections (may start with **Product, Product, or key-value pairs)
        if (trimmedLine.startsWith('**Product') || 
            trimmedLine.startsWith('Product') || 
            (trimmedLine.includes(':') && !inProductSection)) {
            
            if (currentProduct.length) {
                formattedLines.push(currentProduct.join('\n'));
                currentProduct = [];
            }
            
            inProductSection = true;
            if (trimmedLine.includes('**')) {
                // Handle markdown-style headers
                const parts = trimmedLine.split('**');
                const productHeader = parts[1].replace(/[: ]/g, '').trim();
                currentProduct.push(`**${productHeader}**`);
            } else {
                // Handle plain text headers
                currentProduct.push(trimmedLine.split(':')[0].trim());
            }
        } 
        else if (trimmedLine.includes(':') && inProductSection) {
            // Format key-value pairs
            let key, value;
            if (trimmedLine.includes('**')) {
                const parts = trimmedLine.split('**');
                key = parts[1].replace(':', '').trim();
                value = parts[2].trim();
            } else {
                [key, value] = trimmedLine.split(':').map(part => part.trim());
            }
            currentProduct.push(`  • ${key}: ${value}`);
        } 
        else {
            // Non-product lines (questions, follow-ups)
            if (currentProduct.length) {
                formattedLines.push(currentProduct.join('\n'));
                currentProduct = [];
                inProductSection = false;
            }
            formattedLines.push(trimmedLine);
        }
    }

    // Add any remaining product info
    if (currentProduct.length) {
        formattedLines.push(currentProduct.join('\n'));
    }

    return formattedLines.join('\n\n');
}