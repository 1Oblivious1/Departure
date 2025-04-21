-- Удаление типов ENUM, если они уже существуют
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'taskdifficulty') THEN
        DROP TYPE TaskDifficulty;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasksubmissionstatus') THEN
        DROP TYPE TaskSubmissionStatus;
    END IF;
END$$;

-- Создание ENUM-типов для статусов и сложности задач
CREATE TYPE TaskDifficulty AS ENUM ('Easy', 'Medium', 'Hard');
CREATE TYPE TaskSubmissionStatus AS ENUM ('Pending', 'Completed', 'Failed');

-- Удаление таблиц, если они уже существуют
DROP TABLE IF EXISTS Comment CASCADE;
DROP TABLE IF EXISTS NewsFeed CASCADE;
DROP TABLE IF EXISTS TaskSubmission CASCADE;
DROP TABLE IF EXISTS Task CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS UserProfilePublic_has_UserAchievement CASCADE;
DROP TABLE IF EXISTS UserAchievement CASCADE;
DROP TABLE IF EXISTS UserProfilePrivate CASCADE;
DROP TABLE IF EXISTS UserProfilePublic CASCADE;

-- Таблица публичного профиля пользователя
CREATE TABLE UserProfilePublic (
    idUserProfilePublic SERIAL PRIMARY KEY,
    name VARCHAR(45) NOT NULL,
    points INT DEFAULT 0,
    created_at DATE NOT NULL
);

-- Таблица приватного профиля пользователя
CREATE TABLE UserProfilePrivate (
    idUserProfilePrivate SERIAL PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    mail VARCHAR(45) UNIQUE NOT NULL
);

-- Таблица достижений пользователя
CREATE TABLE UserAchievement (
    idUserAchievement SERIAL PRIMARY KEY,
    name VARCHAR(45) NOT NULL,
    points INT NOT NULL
);

-- Связующая таблица между публичным профилем и достижениями
CREATE TABLE UserProfilePublic_has_UserAchievement (
    idUserProfilePublic INT REFERENCES UserProfilePublic(idUserProfilePublic) ON DELETE CASCADE,
    idUserAchievement INT REFERENCES UserAchievement(idUserAchievement) ON DELETE CASCADE,
    PRIMARY KEY (idUserProfilePublic, idUserAchievement)
);

-- Таблица пользователя, соединяет публичный и приватный профили
CREATE TABLE "User" (
    idUser SERIAL PRIMARY KEY,
    idUserProfilePublic INT REFERENCES UserProfilePublic(idUserProfilePublic) ON DELETE SET NULL,
    idUserProfilePrivate INT REFERENCES UserProfilePrivate(idUserProfilePrivate) ON DELETE SET NULL
);

-- Таблица задач с координатами
CREATE TABLE Task (
    idTask SERIAL PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    description VARCHAR(200),
    difficulty TaskDifficulty NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL
);

-- Таблица выполнения задач пользователями
CREATE TABLE TaskSubmission (
    idTaskSubmission SERIAL PRIMARY KEY,
    status TaskSubmissionStatus NOT NULL,
    started_at DATE NOT NULL,
    ended_at DATE,
    idUser INT REFERENCES "User"(idUser) ON DELETE CASCADE,
    idTask INT REFERENCES Task(idTask) ON DELETE CASCADE
);

-- Таблица новостной ленты, связана с выполнением задач
CREATE TABLE NewsFeed (
    idNewsFeed SERIAL PRIMARY KEY,
    likes INT DEFAULT 0,
    description TEXT NOT NULL,
    idTaskSubmission INT REFERENCES TaskSubmission(idTaskSubmission) ON DELETE CASCADE
);

-- Таблица комментариев к записям в новостной ленте
CREATE TABLE Comment (
    idComments SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    submitted_at DATE NOT NULL,
    idNewsFeed INT REFERENCES NewsFeed(idNewsFeed) ON DELETE CASCADE,
    author INT REFERENCES "User"(idUser) ON DELETE SET NULL
); 