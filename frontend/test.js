// 필요한 유틸리티 함수 직접 구현
const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

const fs = require('fs');
fs.writeFileSync('output.json', JSON.stringify(result, null, 2));
console.log('Data has been saved to output.json');

// 더미 데이터 생성
const teams = [];
const studies = [];
const books = Array.from({ length: 20 }, (_, i) => ({
    PK: `BOOK#9788955827${660 + i}`,
    authors: [`Author ${i + 1}`, `Co-author ${i + 1}`],
    imgPath: `https://dummyimage.com/300x400/000/fff&text=Book+${i + 1}`,
    isbn: 9788955827 + 660 + i,
    itemType: "Book",
    publishedDate: randomDate(new Date(2000, 0, 1), new Date(2023, 11, 31)).toISOString().split("T")[0],
    publisher: `Publisher ${i + 1}`,
    title: `Book Title ${i + 1}`,
    description: `Description for Book ${i + 1}`,
}));

const users = Array.from({ length: 60 }, (_, i) => `user${i + 1}@example.com`);

for (let i = 0; i < 10; i++) {
    const teamId = `TEAM#${randomGuid()}`;
    const teamMembers = Array.from({ length: randomInteger(4, 10) }).map(() => users.pop());
    teams.push({
        id: teamId,
        members: teamMembers,
    });

    for (let j = 0; j < randomInteger(2, 6); j++) {
        const studyId = `STUDY#${randomGuid()}`;
        const startAt = randomDate(new Date(), new Date(Date.now() + 24 * 60 * 60 * 1000));
        const endAt = new Date(startAt.getTime() + randomInteger(1, 24) * 60 * 60 * 1000);

        studies.push({
            team_Id: teamId,
            study_Id: studyId,
            book: books[randomInteger(0, 19)],
            join: Array.from({ length: randomInteger(2, 5) }).map((_, idx) => ({
                SK: `user${idx}@example.com`,
                createdAt: new Date().toISOString(),
                itemType: "StudyUser",
                role: idx === 0 ? "Manager" : "Member",
            })),
            start_At: startAt.toISOString(),
            end_At: endAt.toISOString(),
            status: false,
        });
    }
}

console.log({ teams, studies });
