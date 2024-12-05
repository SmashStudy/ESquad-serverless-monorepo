// studyHandler.mjs

import { StudyService } from "../services/studyService.mjs";
import { BookService } from "../services/bookService.mjs";
import {createResponse} from "../utils/responseHelper.mjs";

const studyService = new StudyService();
const bookService = new BookService();

export const createStudy = async (event) => {
    try {
        // 1. teamId 추출
        const teamId = event.pathParameters?.teamId;
        console.log('teamId:', teamId);
        
        // 2. request body 파싱
        const { bookDto, studyData } = JSON.parse(event.body);
        console.log('bookDto:', JSON.stringify(bookDto));
        console.log('studyData:', JSON.stringify(studyData));

        // 3. bookId 저장 처리
        const bookId = await bookService.saveBook(bookDto);
        console.log('bookId:', bookId);

        // 4. imgPath와 관련 데이터 로그
        const imgPath = bookDto.imgPath;
        console.log('imgPath:', imgPath);

        console.log('bookDto.imgPath:', JSON.stringify(bookDto.imgPath));
        console.log('bookDto.studyDate:', JSON.stringify(bookDto.studyDate));

        // 5. studyId 생성 처리
        const studyId = await studyService.createStudy(teamId, bookId, imgPath, studyData);
        console.log('studyId:', studyId);

        // 6. 생성된 study page의 응답 반환
        const studyPageId = studyId; // studyPageId로 가정
        console.log('studyPageId:', studyPageId);

        return createResponse(201, { message: "Study page created successfully", body: studyPageId });
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