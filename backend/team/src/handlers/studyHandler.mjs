// studyHandler.mjs

import { StudyService } from "../services/studyService.mjs";
import { BookService } from "../services/bookService.mjs";

const studyService = new StudyService();
const bookService = new BookService();

export const createStudy = async (event) => {
    try {
        const teamId = event.pathParameters?.teamId;
        const { bookDto, studyData } = JSON.parse(event.body);
        const bookId = await bookService.saveBook(bookDto);
        const studyPageId = await studyService.createStudy(teamId, bookId, studyData);
        return createResponse(201, { message: "Study page created successfully", studyPageId });
    } catch (error) {
        console.error("Error in createStudyHandler:", error.message);
        return createResponse(500, { error: "Failed to create study page" });
    }
};