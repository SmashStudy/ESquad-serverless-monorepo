// studyHandler.mjs

import { StudyService } from "../services/studyService.mjs";
import { BookService } from "../services/bookService.mjs";
import {createResponse} from "../utils/responseHelper.mjs";

const studyService = new StudyService();
const bookService = new BookService();

export const createStudy = async (event) => {
    try {
        const teamId = event.pathParameters?.teamId;
        const { bookDto, studyData } = JSON.parse(event.body);
        const bookId = await bookService.saveBook(bookDto);
        const imgPath =bookDto.imgPath;
        const studyPageId = await studyService.createStudy(teamId, bookId, imgPath, studyData);
        return createResponse(201, { message: "Study page created successfully", body:studyPageId });
    } catch (error) {
        console.error("Error in createStudyHandler:", error.message);
        return createResponse(500, { error: "Failed to create study page" });
    }
};

// 팀의 Study 페이지 목록 조회
export const getStudyList = async (event) => {
    const { teamId } = event.pathParameters || {};

    if (!teamId) {
        throw new Error("Missing required parameters: teamId and studyId");
    }

    try {
        const studyList = await studyService.getStudyList(teamId);
        return createResponse(200, studyList );
    } catch (error) {
        console.error("Error fetching study pages:", error);
        return createResponse(500, { error: "Failed to fetch study pages" });
    }
};