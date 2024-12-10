import fs from 'fs';
import zlib from 'zlib';

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

// 책 생성 함수
const generateBooks = (bookCount) => {
    console.log('책 데이터 생성중');

    // 실제 저자와 출판사 데이터 (예시)
    const authors = [
        '김영하', '하루키', '이상', '조정래', '정유정', '윤고은', '백석', '강경애', '김훈', '박민규',
        '홍세화', '김수영', '이태준', '김연수', '박완서', '배수아', '장강명', '김종광', '이희영', '고은정'
    ];

    const publishers = [
        '문학동네', '창비', '한겨레출판', '알에이치코리아', '문학과지성사', '민음사', '웅진지식하우스', '길벗', '씨네21', '마이클이펙트',
        '삼성출판사', '교보문고', '디지털북스', '랜덤하우스코리아', '소설과시', '우리가꿈꾸는책', '다산북스', '미디어창비', '북하우스', '계명문화사'
    ];

    // 날짜를 랜덤으로 생성하는 함수
    const randomDate = () => {
        const startYear = 1960;
        const endYear = 2024;
        const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
        const month = Math.floor(Math.random() * 12) + 1; // 1-12월
        const day = Math.floor(Math.random() * 28) + 1; // 1-28일 (날짜가 많지 않도록 제한)

        return `${year}년 ${month}월 ${day}일`;
    };
    // 제목 길이를 랜덤으로 생성하는 함수
    const randomTitle = () => {
        const titleLength = Math.floor(Math.random() * 10) + 5; // 제목 길이를 5자에서 14자 사이로 설정
        const characters = '가나다라마바사아자차카타파하ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let title = '';

        for (let i = 0; i < titleLength; i++) {
            title += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return title;
    };
    const books = Array.from({ length: bookCount }, (_, i) => {
        const bookId = `BOOK#${randomGuid()}`;
        const author = authors[Math.floor(Math.random() * authors.length)];
        const publisher = publishers[Math.floor(Math.random() * publishers.length)];
        const publishedDate = randomDate(); // 무작위 출판일 생성
        const title = randomTitle(); // 무작위 제목 생성

        const bookData = {
            PK: { S: bookId },
            SK: { S: bookId },
            authors: { S: author },
            imgPath: { S: `https://shopping-phinf.pstatic.net/main_3245629/32456297621.20231003084616.jpg` },
            isbn: { S: `${Math.floor(Math.random() * 1000000000000)}` },
            itemType: { S: 'Book' },
            publishedDate: { S: publishedDate },
            publisher: { S: publisher },
            title: { S: title } // 제목 길이를 랜덤하게 생성
        };
        return bookData;
    });

    return books;
};

const generateStreamingRooms = (teams, study, studyUsers) => {
    const streamingRooms = [];
    const currentTimestamp = new Date();

    teams.forEach((team) => {
        study.forEach((study) => {
            if (study.teamId.S == team.PK.S) {
                studyUsers.forEach((studyUser) => {
                    if (study.PK.S == studyUser.PK.S) {
                        const startTimestamp = new Date(currentTimestamp.getTime() - Math.random() * 3600 * 1000); // 1시간 내 시작
                        let endTimestamp;
                        if (Math.random() < 0.8) {
                            endTimestamp = new Date(startTimestamp.getTime() + Math.random() * 7200 * 1000); // 최대 2시간 지속
                            if (startTimestamp.getTime() > endTimestamp.getTime()) {
                                endTimestamp = new Date(startTimestamp.getTime() + 3600 * 1000); // 최소 1시간
                            }
                            streamingRooms.push({
                                teamId: { S: team.PK.S },
                                title: { S: studyUser.PK.S }, // 스트리밍 방의 제목은 스터디 ID
                                start_At: { S: startTimestamp.toISOString() },
                                end_At: { S: endTimestamp.toISOString() },
                                user_Email: {
                                    S: studyUser.SK.S
                                }
                            });
                        } else {
                            // end_At이 없는 경우
                            streamingRooms.push({
                                teamId: { S: team.PK.S },
                                title: { S: studyUser.PK.S }, // 스트리밍 방의 제목은 스터디 ID
                                start_At: { S: startTimestamp.toISOString() },
                                user_Email: { S: studyUser.SK.S }
                            });
                        }
                        return;
                    }
                })
            }
        });
    });

    return streamingRooms;
};


// 스트리밍 참여자 데이터 생성 함수
const generateStreamingParticipants = (streamingRooms, studyUsers) => {
    const streamingParticipants = [];


    streamingRooms.forEach((room) => {
        studyUsers.forEach((user) => {
            if (user.PK.S === room.title.S) {
                console.log(user.SK.S);
                console.log(room);

                const minDuration = 1000 * 60 * 10; // 최소 10분
                const userStart = new Date(
                    new Date(room.start_At).getTime() + Math.random() * (new Date(room.end_At).getTime() - new Date(room.start_At).getTime() - minDuration)
                );
                const userEnd = userStart.getTime() + minDuration + Math.random() * (new Date(room.end_At).getTime() - userStart.getTime() - minDuration);

                console.log(userStart)
                if (room.end_At !== undefined) {
                    if (user.SK.S === room.user_Email.S) {
                        streamingParticipants.push({
                            teamId: { S: room.teamId.S },
                            title: { S: room.title.S },
                            start_At: { S: room.start_At.S },
                            end_At: { S: room.end_At.S },
                            user_Email: { S: room.user_Email.S }
                        });
                    } else {
                        streamingParticipants.push({
                            teamId: { S: room.teamId.S },
                            title: { S: room.title.S },
                            start_At: { S: userStart },
                            end_At: { S: userEnd },
                            user_Email: { S: user.SK.S }
                        });
                    }
                } else {
                    if (user.SK.S === room.user_Email.S) {
                        streamingParticipants.push({
                            teamId: { S: room.teamId.S },
                            title: { S: room.title.S },
                            start_At: { S: room.start_At.S },
                            user_Email: { S: room.user_Email.S }
                        });
                    } else {
                        streamingParticipants.push({
                            teamId: { S: room.teamId.S },
                            title: { S: room.title.S },
                            start_At: { S: userStart },
                            user_Email: { S: user.SK.S }
                        });
                    }
                }
            }
        })
    });
    return streamingParticipants;
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
        const numStudyMembers = Math.floor(Math.random() * 8) + 4; // 최소 2명, 최대 10명

        // teamuser 배열과 관련된 조건을 확인하여 studyMembers를 설정
        const studyMembers = Array.from({ length: numStudyMembers }, () => {
            // 팀 ID가 맞는 사용자를 랜덤으로 선택
            const member = teamUsers.find((teamuser) => teamuser.PK.S === study.teamId);
            if (member) {
                return member; // teamId가 일치하는 사용자를 반환
            } else {
                // 일치하는 사용자가 없으면 랜덤한 팀원 반환
                return teamUsers[Math.floor(Math.random() * teamUsers.length)];
            }
        });

        return studyMembers.map((member) => ({
            PK: { S: studyId },
            SK: { S: member.SK.S },
            createdAt: { S: new Date().toISOString() },
            itemType: { S: 'StudyUser' },
            role: { S: 'Member' },
        }));
    });

    console.log('스트리밍 데이터 생성중')

    const streamingRooms = generateStreamingRooms(teams, studies, studyUsers);
    const streamingParticipants = generateStreamingParticipants(streamingRooms, studyUsers);

    return { users, teams, teamUsers, studies, studyUsers, streamingRooms, streamingParticipants };
};
const bookData = generateBooks(30);

// 데이터 생성 및 파일 저장
const { users, teams, teamUsers, studies, studyUsers, streamingRooms, streamingParticipants } = generateData(100, 20, 70, bookData); // 유저 수, 팀 수, 스터디 수, 스트리밍 수


// JSON.stringify를 조각별로 처리
// const chunkArray = (array, size) => {
//     const chunks = [];
//     for (let i = 0; i < array.length; i += size) {
//         chunks.push(array.slice(i, i + size));
//     }
//     return chunks;
// };

// 각 데이터를 JSON으로 변환하고 압축하여 저장
const usersData = JSON.stringify(users, null, 2);
const teamsData = JSON.stringify(teams, null, 2);
const teamUsersData = JSON.stringify(teamUsers, null, 2);
const studiesData = JSON.stringify(studies, null, 2);
const studyUsersData = JSON.stringify(studyUsers, null, 2);
const bookDataJSON = JSON.stringify(bookData, null, 2);
const streamingRoomsData = JSON.stringify(streamingRooms, null, 2);
const streamingParticipantsData = JSON.stringify(streamingParticipants, null, 2);


// const streamingParticipantsData = (participants) => {
//     const chunkSize = 10000; // 적절한 크기로 설정
//     const chunks = chunkArray(participants, chunkSize);

//     chunks.forEach((chunk, index) => {
//         const jsonData = JSON.stringify(chunk, null, 2);
//         fs.writeFileSync(`streamingParticipants_part${index + 1}.json`, jsonData);
//     });
//     console.log(`${chunks.length}개의 JSON 파일로 분할 저장 완료`);
// };
// // 압축
// const compressedUsers = zlib.gzipSync(usersData);
// const compressedTeams = zlib.gzipSync(teamsData);
// const compressedTeamUsers = zlib.gzipSync(teamUsersData);
// const compressedStudies = zlib.gzipSync(studiesData);
// const compressedStudyUsers = zlib.gzipSync(studyUsersData);
// const compressedBookData = zlib.gzipSync(bookDataJSON);
// const compressedStreamingRooms = zlib.gzipSync(streamingRoomsData);
// // 압축된 파일 저장
// fs.writeFileSync('user.json.gz', compressedUsers);
// fs.writeFileSync('team.json.gz', compressedTeams);
// fs.writeFileSync('teamuser.json.gz', compressedTeamUsers);
// fs.writeFileSync('study.json.gz', compressedStudies);
// fs.writeFileSync('studyuser.json.gz', compressedStudyUsers);
// fs.writeFileSync('book.json.gz', compressedBookData);
// fs.writeFileSync('streamingRooms.json.gz', compressedStreamingRooms);
// // fs.writeFileSync('streamingParticipants.json.gz', compressedStreamingParticipants);

// 압축된 파일 저장
fs.writeFileSync('user.json', usersData);
fs.writeFileSync('team.json', teamsData);
fs.writeFileSync('teamuser.json', teamUsersData);
fs.writeFileSync('study.json', studiesData);
fs.writeFileSync('studyuser.json', studyUsersData);
fs.writeFileSync('book.json', bookDataJSON);
fs.writeFileSync('streamingroom.json', streamingRoomsData);
fs.writeFileSync('streamingparticipant.json', streamingParticipantsData);

// streamingParticipantsData(streamingParticipants);

console.log('팀, 스터디, 스트리밍 데이터가 성공적으로 저장되었습니다.');
