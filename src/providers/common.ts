import path from "path";

export class Common {
    async generateFileUniqueName(fileName: string): Promise<string> {
        const fileExtension = path.extname(fileName);
        const randomNumber = Math.floor(Math.random() * 1000000);
        const date = new Date();
        return `${date.getTime()}-${randomNumber}${fileExtension}`;
    }
}