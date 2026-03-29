/**
 * Converts an array of objects to CSV string
 */
export function generateCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','), // Header row
        ...data.map(row => 
            headers.map(fieldName => {
                const value = row[fieldName];
                const stringValue = value === null || value === undefined ? '' : String(value);
                // Escape double quotes and wrap in double quotes if it contains comma or newline
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            }).join(',')
        )
    ];

    return csvRows.join('\r\n');
}
