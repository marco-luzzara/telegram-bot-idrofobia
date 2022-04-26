CREATE TABLE IF NOT EXISTS players (
    id SERIAL,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    address VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS idrofobia_players (
    id INT,
    telegram_id VARCHAR(100) NOT NULL,
    last_kill TIMESTAMP WITH TIME ZONE,
    profile_picture_url VARCHAR(2048) NOT NULL,
    target INT,
    PRIMARY KEY (id),
    UNIQUE (telegram_id),
    FOREIGN KEY (id) REFERENCES players(id),
    FOREIGN KEY (target) REFERENCES idrofobia_players(id)
);