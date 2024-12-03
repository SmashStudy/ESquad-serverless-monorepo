// studyHandler.mjs

import { StudyService } from "../services/studyService.mjs";

const studyService = new StudyService();

export const createStudyHandler = async (event) => {
    try {
        const { bookDto, teamId, studyInfo } = JSON.parse(event.body);
        const bookId = await bookService.saveBook(bookDto);
        const studyPageId = await studyService.createStudyPage(teamId, bookId, studyInfo);
        return createResponse(201, { message: "Study page created successfully", studyPageId });
    } catch (error) {
        console.error("Error in createStudyHandler:", error.message);
        return createResponse(500, { error: "Failed to create study page" });
    }
};