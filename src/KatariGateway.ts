import axios, { AxiosResponse } from 'axios';
export class KatariGateway {
    public async lintCode(editor_file_name: string, data: string) {        
        try {
            const encodedFileName = encodeURIComponent(editor_file_name);
            let url = `http://0.0.0.0:8000/code?filename=${encodedFileName}`;
            const response: AxiosResponse<string> = await axios.post(url, data, {
                headers: {
                    'Content-Type': 'text/plain',
                },
            });
            return response.data;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed lint code: ${editor_file_name}`);            
        }
    }
    public async testCode(editor_file_name: string, target_code: string, existing_code: string){
        try {
            const encodedFileName = encodeURIComponent(editor_file_name);
            let url = `http://0.0.0.0:8000/test?filename=${encodedFileName}`;
            const mark = "*".repeat(55);
            const data = `${target_code}\n${mark}\n${existing_code}`;
            const response: AxiosResponse<string> = await axios.post(url, data, {
                headers: {
                    'Content-Type': 'text/plain',
                },
            });
            return response.data;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed lint code: ${editor_file_name}`);            
        }
    }
}