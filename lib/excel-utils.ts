import * as XLSX from 'xlsx';

export interface ParsedExcel {
    headers: string[];
    data: any[];
}

export async function parseExcelFile(file: File): Promise<ParsedExcel> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Get headers (first row)
                const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
                const headers: string[] = [];
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
                    // Trim headers to avoid invisible whitespace issues
                    headers.push(cell ? cell.v.toString().trim() : `Column ${C + 1}`);
                }

                // Get data - skip first row and use headers as keys for consistency
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: headers,
                    range: 1 // Skip the header row
                });

                resolve({
                    headers,
                    data: jsonData,
                });
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}
