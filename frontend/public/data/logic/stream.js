import fs from 'fs';

// 랜덤 GUID 생성 함수
const randomGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

// 랜덤 이메일 생성 함수
const randomEmail = () => {
    const domains = ['gmail.com', 'naver.com', 'daum.net', 'yahoo.com'];
    const randomPrefix = Math.random().toString(36).substring(2, 10);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${randomPrefix}@${domain}`;
};

// 랜덤 이름 생성 함수
const randomName = () => {
    const firstNames = ['정민', '수현', '지호', '하은', '윤호', '하림', '연수', '서준', '지민', '태양', '예지'];
    const lastNames = ['이', '김', '박', '최', '정', '강', '조', '황', '안', '송'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${lastName}${firstName}`;
};

const generateBooks = (bookCount) => {
    console.log('책 데이터 생성중')
    const authors = [
        '저자1', '저자2', '저자3', '저자4', '저자5', '저자6', '저자7', '저자8', '저자9', '저자10', 
        '저자11', '저자12', '저자13', '저자14', '저자15', '저자16', '저자17', '저자18', '저자19', '저자20',
        '저자21', '저자22', '저자23', '저자24', '저자25', '저자26', '저자27', '저자28', '저자29', '저자30',
        '저자31', '저자32', '저자33', '저자34', '저자35', '저자36', '저자37', '저자38', '저자39', '저자40',
        '저자41', '저자42', '저자43', '저자44', '저자45', '저자46', '저자47', '저자48', '저자49', '저자50',
        '저자51', '저자52', '저자53', '저자54', '저자55', '저자56', '저자57', '저자58', '저자59', '저자60',
        '저자61', '저자62', '저자63', '저자64', '저자65', '저자66', '저자67', '저자68', '저자69', '저자70',
        '저자71', '저자72', '저자73', '저자74', '저자75', '저자76', '저자77', '저자78', '저자79', '저자80',
        '저자81', '저자82', '저자83', '저자84', '저자85', '저자86', '저자87', '저자88', '저자89', '저자90',
        '저자91', '저자92', '저자93', '저자94', '저자95', '저자96', '저자97', '저자98', '저자99', '저자100'
    ];
    const books = Array.from({ length: bookCount }, (_, i) => {
        const bookId = `BOOK#${randomGuid()}`;
        const author = authors[Math.floor(Math.random() * authors.length)];
        const bookData = {
            PK: { S: bookId },
            SK: { S: bookId },
            authors: { S: author },
            imgPath: { S: `https://shopping-phinf.pstatic.net/main_3245629/32456297621.20231003084616.jpg` },
            isbn: { S: `${Math.floor(Math.random() * 1000000000000)}` },
            itemType: { S: 'Book' },
            publishedDate: { S: `2024년 ${Math.floor(Math.random() * 12) + 1}월 ${Math.floor(Math.random() * 30) + 1}일` },
            publisher: { S: `Publisher ${i + 1}` },
            title: { S: `Book Title ${i + 1}` }
        };
        return bookData;
    });
    return books;
};

// 팀, 유저, 스터디, 스트리밍 데이터 생성 함수
const generateData = (userCount, teamCount, studyCount) => {
    console.log('유저데이터 생성중')
    // 유저 데이터 생성
    const users = Array.from({ length: userCount }, () => ({
        email: { S: randomEmail() },
        createdAt: { S: new Date().toISOString() },
        name: { S: randomName() },
        nickname: { S: randomEmail().split('@')[0] },
        role: { S: 'user' },
    }));
    console.log('팀 데이터 생성중')

    // 팀 데이터 생성
    const teams = Array.from({ length: teamCount }, (_, i) => {
        const teamId = `TEAM#${randomGuid()}`;
        return {
            PK: { S: teamId },
            SK: { S: teamId },
            createdAt: { S: new Date().toISOString() },
            description: { S: `Description for team ${i + 1}` },
            itemType: { S: 'Team' },
            teamName: { S: `team${i + 1}` },
            updatedAt: { S: new Date().toISOString() },
        };
    });
    console.log('팀 유저 생성중')

    // 팀에 유저 연결
    const teamUsers = teams.flatMap((team) => {
        const teamId = team.PK.S;
        const numTeamMembers = Math.floor(Math.random() * 9) + 4; // 4명에서 12명 사이
        const teamMembers = Array.from({ length: numTeamMembers }, () => users[Math.floor(Math.random() * users.length)]);
        return teamMembers.map((user) => ({
            PK: { S: teamId },
            SK: { S: user.email.S },
            createdAt: { S: new Date().toISOString() },
            inviteState: { S: 'complete' },
            itemType: { S: 'TeamUser' },
            role: { S: 'Member' },
        }));
    });

    console.log('스터디 데이터 생성중')

    // 스터디 데이터 생성
    const studies = Array.from({ length: studyCount }, (_, i) => {
        const studyId = `STUDY#${randomGuid()}`;        
        const randomBookIndex = Math.floor(Math.random() * bookData.length);
        const bookId = bookData[randomBookIndex].PK.S; // 선택된 책의 PK를 bookId로 사용

        return {
            PK: { S: studyId },
            SK: { S: studyId },
            bookId: { S: bookId },
            createdAt: { S: new Date().toISOString() },
            description: { S: `Description for study ${i + 1}` },
            endDate: { S: new Date(Date.now() + (Math.random() * 10 + 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            imgPath: { S: `https://shopping-phinf.pstatic.net/main_3245629/32456297621.20231003084616.jpg` },
            itemType: { S: 'Study' },
            startDate: { S: new Date(Date.now() - (Math.random() * 10 + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            studyName: { S: `Study Name ${i + 1}` },
            teamId: { S: teams[i % teamCount].PK.S },
            updatedAt: { S: new Date().toISOString() },
        };
    });
    console.log('스터디 유저데이터 생성중')

    // 스터디에 유저 연결
    const studyUsers = studies.flatMap((study) => {
        const studyId = study.PK.S;
        const numStudyMembers = Math.floor(Math.random() * 8) + 2; // 최소 2명, 최대 10명
        const studyMembers = Array.from({ length: numStudyMembers }, () => teamUsers[Math.floor(Math.random() * teamUsers.length)]);
        return studyMembers.map((member) => ({
            PK: { S: studyId },
            SK: { S: member.SK.S },
            createdAt: { S: new Date().toISOString() },
            itemType: { S: 'StudyUser' },
            role: { S: 'Member' },
        }));
    });

    console.log('스트리밍 데이터 생성중')

    // 스트리밍 데이터 생성
    const streamingData = [];
    teams.forEach((team) => {
        studyUsers.forEach((studyUser) => {
            const currentTimestamp = new Date();
            const startTimestamp = new Date(currentTimestamp.getTime() - Math.random() * 3600 * 1000); // 1시간 내 시작
            const endTimestamp = new Date(startTimestamp.getTime() + Math.random() * 7200 * 1000); // 최대 2시간 지속

            streamingData.push({
                userEmail: { S: studyUser.SK.S },
                teamId: { S: team.PK.S },
                title: { S: studyUser.PK.S },
                start_At: { S: startTimestamp.toISOString() },
                end_At: { S: endTimestamp.toISOString() },
            });
        });
    });

    return { users, teams, teamUsers, studies, studyUsers, streamingData };
};
const bookData = generateBooks(300);

// 데이터 생성 및 파일 저장
const { users, teams, teamUsers, studies, studyUsers, streamingData } = generateData(1000, 200, 700, bookData); // 유저 수, 팀 수, 스터디 수, 스트리밍 수
// const result = { users, teams, teamUsers, studies, studyUsers, streamingData };
fs.writeFileSync('user.json', JSON.stringify(users, null, 2));
fs.writeFileSync('team.json', JSON.stringify(teams, null, 2));
fs.writeFileSync('teamuser.json', JSON.stringify(teamUsers, null, 2));
fs.writeFileSync('study.json', JSON.stringify(studies, null, 2));
fs.writeFileSync('studyuser.json', JSON.stringify(studyUsers, null, 2));
fs.writeFileSync('streaming.json', JSON.stringify(streamingData, null, 2));
fs.writeFileSync('book.json', JSON.stringify(bookData, null, 2));
console.log('팀, 스터디, 스트리밍 데이터가 성공적으로 저장되었습니다.');
