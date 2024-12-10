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

// 스트리밍 방 정보 생성 함수
const generateStreamingRooms = (teams, studyUsers) => {
    const streamingRooms = [];
    const currentTimestamp = new Date();
    teams.forEach((team) => {
        studyUsers.forEach((studyUser) => {
            const startTimestamp = new Date(currentTimestamp.getTime() - Math.random() * 3600 * 1000); // 1시간 내 시작
            let endTimestamp = new Date(startTimestamp.getTime() + Math.random() * 7200 * 1000); // 최대 2시간 지속

            // start_At > end_At 방지
            if (startTimestamp.getTime() > endTimestamp.getTime()) {
                endTimestamp = new Date(startTimestamp.getTime() + 3600 * 1000); // 최소 1시간
            }

            // 스트리밍 방 데이터 생성
            streamingRooms.push({
                teamId: { S: team.PK.S },
                title: { S: studyUser.PK.S }, // 스트리밍 방의 제목은 스터디 ID
                start_At: { S: startTimestamp.toISOString() },
                end_At: { S: endTimestamp.toISOString() },
            });
        });
    });

    return streamingRooms;
};

// 스트리밍 참여자 데이터 생성 함수
const generateStreamingParticipants = (streamingRooms, studyUsers) => {
    const streamingParticipants = [];
    streamingRooms.forEach((room) => {
        // 스트리밍 방의 시간 범위에 맞춰 참여자 생성
        studyUsers.forEach((studyUser) => {
            const startTimestamp = new Date(room.start_At.S);
            const endTimestamp = new Date(room.end_At.S);
            const userStart = new Date(startTimestamp.getTime() + Math.random() * (endTimestamp.getTime() - startTimestamp.getTime())); // 참여자의 시작시간
            const userEnd = new Date(userStart.getTime() + Math.random() * (endTimestamp.getTime() - userStart.getTime())); // 참여자의 종료시간

            // 스트리밍 참여자 데이터 생성
            streamingParticipants.push({
                userEmail: { S: studyUser.SK.S }, // user의 이메일(PK와 동일)
                teamId: { S: room.teamId.S },
                streamingRoomTitle: { S: room.title.S }, // 스트리밍 방 제목 (스터디 ID)
                start_At: { S: userStart.toISOString() },
                end_At: { S: userEnd.toISOString() },
            });
        });
    });

    return streamingParticipants;
};

// 팀, 유저, 스터디, 스트리밍 데이터 생성 함수
const generateData = (userCount, teamCount, studyCount) => {
    console.log('유저데이터 생성중');
    const users = Array.from({ length: userCount }, () => ({
        email: { S: randomEmail() },
        createdAt: { S: new Date().toISOString() },
        name: { S: randomName() },
        nickname: { S: randomEmail().split('@')[0] },
        role: { S: 'user' },
    }));

    console.log('팀 데이터 생성중');
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

    console.log('팀 유저 생성중');
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

    console.log('스터디 데이터 생성중');
    const studies = Array.from({ length: studyCount }, (_, i) => {
        const studyId = `STUDY#${randomGuid()}`;
        return {
            PK: { S: studyId },
            SK: { S: studyId },
            createdAt: { S: new Date().toISOString() },
            description: { S: `Description for study ${i + 1}` },
            itemType: { S: 'Study' },
            studyName: { S: `Study Name ${i + 1}` },
            teamId: { S: teams[i % teamCount].PK.S },
            updatedAt: { S: new Date().toISOString() },
        };
    });

    console.log('스터디 유저데이터 생성중');
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

    console.log('스트리밍 데이터 생성중');
    const streamingRooms = generateStreamingRooms(teams, studyUsers);
    const streamingParticipants = generateStreamingParticipants(streamingRooms, studyUsers);

    return { users, teams, teamUsers, studies, studyUsers, streamingRooms, streamingParticipants };
};

const { users, teams, teamUsers, studies, studyUsers, streamingRooms, streamingParticipants } = generateData(10, 2, 7);

// 데이터 저장
fs.writeFileSync('user.json', JSON.stringify(users, null, 2));
fs.writeFileSync('teamuser.json', JSON.stringify(teamUsers, null, 2));
fs.writeFileSync('team.json', JSON.stringify(teams, null, 2));
fs.writeFileSync('study.json', JSON.stringify(studies, null, 2));
fs.writeFileSync('studyuser.json', JSON.stringify(studyUsers, null, 2));
fs.writeFileSync('streamingroom.json', JSON.stringify(streamingRooms, null, 2));
fs.writeFileSync('streamingparticipant.json', JSON.stringify(streamingParticipants, null, 2));

console.log('팀, 스터디, 스트리밍 방 및 참여자 데이터가 성공적으로 저장되었습니다.');
